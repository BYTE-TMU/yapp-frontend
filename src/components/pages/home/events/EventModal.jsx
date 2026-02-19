import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Heart,
  Share2,
  UserPlus,
  Map,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../../services/config';
import { formatEventDateTime } from '../../../../utils/dateTimeUtils';
import UserBadge from '@/components/badges/UserBadge';
import {
  showAttendanceUpdateError,
  showEventLikeError,
  showNetworkError,
  showLocationNotAvailableError,
} from '@/utils/toastNotifications';

const EventModal = ({ event, isOpen, onClose, currentUser }) => {
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [attendingFriends, setAttendingFriends] = useState([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [actionLoading, setActionLoading] = useState({
    like: false,
    attend: false,
  });
  const [isPastEvent, setIsPastEvent] = useState(false);

  const navigate = useNavigate();

  // Check if event is in the past
  const checkIfEventPast = (eventDateTime) => {
    if (!eventDateTime) return false;

    const eventDate = new Date(eventDateTime);
    const now = new Date();

    return eventDate <= now;
  };

  const fetchEventDetails = async () => {
    if (!event || !isOpen || !currentUser) return;

    setLoading(true);
    try {
      // Check if event is past
      const pastCheck = checkIfEventPast(event.event_datetime);
      setIsPastEvent(pastCheck);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/events/${event._id}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setEventDetails(data.event);
        setIsAttending(data.is_attending || false);
        setIsLiked(data.is_liked || false);
        setAttendingFriends(data.attending_friends || []);
        setTotalAttendees(data.total_attendees || event.attendees_count || 0);
        setLikesCount(data.event?.likes_count || event.likes_count || 0);
      } else {
        // Fallback to basic event data if details endpoint fails
        setEventDetails(event);
        setTotalAttendees(event.attendees_count || 0);
        setLikesCount(event.likes_count || 0);

        // Fetch attendance and like status separately
        await Promise.all([fetchAttendanceStatus(), fetchLikeStatus()]);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      // Fallback to basic event data
      setEventDetails(event);
      setTotalAttendees(event.attendees_count || 0);
      setLikesCount(event.likes_count || 0);

      // Try to fetch attendance and like status separately
      await Promise.all([fetchAttendanceStatus(), fetchLikeStatus()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/events/${event._id}/attend-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setIsAttending(data.attending || false);
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/events/${event._id}/like-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked || false);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const refreshFriendsAttending = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/events/${event._id}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setAttendingFriends(data.attending_friends || []);
      }
    } catch (error) {
      console.error('Error refreshing friends attending:', error);
    }
  };

  const toggleAttendance = async () => {
    if (actionLoading.attend || isPastEvent) return;

    setActionLoading((prev) => ({ ...prev, attend: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/events/${event._id}/attend`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setIsAttending(data.attending);
        setTotalAttendees((prev) =>
          data.attending ? prev + 1 : Math.max(0, prev - 1),
        );

        // Refresh friends attending list since attendance changed
        await refreshFriendsAttending();

        // If user just joined the event, navigate to the thread
        if (data.attending) {
          // Close modal first
          onClose();
          // Navigate to the event thread
          navigate(`/events/${event._id}/thread`);
        }
      } else {
        const errorData = await response.json();
        showAttendanceUpdateError();
      }
    } catch (error) {
      console.error('Error toggling attendance:', error);
      showNetworkError();
    } finally {
      setActionLoading((prev) => ({ ...prev, attend: false }));
    }
  };

  const toggleLike = async () => {
    if (actionLoading.like) return;

    setActionLoading((prev) => ({ ...prev, like: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events/${event._id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikesCount((prev) =>
          data.liked ? prev + 1 : Math.max(0, prev - 1),
        );
      } else {
        const errorData = await response.json();
        showEventLikeError();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showNetworkError();
    } finally {
      setActionLoading((prev) => ({ ...prev, like: false }));
    }
  };

  // Handle viewing event thread (for users already attending)
  const handleViewThread = () => {
    onClose();
    navigate(`/events/${event._id}/thread`);
  };

  const handleViewOnMap = () => {
    const coordinates = getEventCoordinates();

    if (!coordinates) {
      showLocationNotAvailableError();
      return;
    }

    // Store event data in sessionStorage to pass to waypoint map
    const eventMapData = {
      eventId: event._id,
      title: event.title.trim(), // Make sure title is clean
      description: event.description,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      eventDate: event.event_date || event.event_datetime?.split('T')[0],
      eventTime:
        event.event_time ||
        event.event_datetime?.split('T')[1]?.substring(0, 5),
      location: event.location,
      navigateToEvent: true,
      // Add some debug info
      debug: {
        originalTitle: event.title,
        cleanTitle: event.title.trim(),
        coordinates: coordinates,
      },
    };

    console.log('Storing event map data:', eventMapData);
    sessionStorage.setItem('navigateToEvent', JSON.stringify(eventMapData));

    // Close modal and navigate to waypoint map
    onClose();
    navigate('/waypoint');
  };

  const getProfilePictureUrl = (profilePicture) => {
    if (profilePicture?.trim()) {
      return profilePicture.startsWith('http')
        ? profilePicture
        : `${API_BASE_URL}/uploads/profile_pictures/${profilePicture}`;
    }
    return "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23bdbdbd'/%3E%3Cellipse cx='50' cy='85' rx='25' ry='20' fill='%23bdbdbd'/%3E%3C/svg%3E";
  };

  const getEventIcon = (index) => {
    const icons = ['🎉', '🎵', '🎨', '🏃', '🍕', '📚', '🎬', '🎪', '🎯', '🎮'];
    return icons[index % icons.length];
  };

  // Check if event has location coordinates - UPDATED FUNCTION
  const hasLocationCoordinates = () => {
    const currentEvent = eventDetails || event;

    console.log('Checking coordinates for event:', currentEvent);

    // Check for direct latitude/longitude properties (primary method now)
    if (
      currentEvent.latitude !== null &&
      currentEvent.latitude !== undefined &&
      currentEvent.longitude !== null &&
      currentEvent.longitude !== undefined
    ) {
      console.log(
        'Found direct lat/lng:',
        currentEvent.latitude,
        currentEvent.longitude,
      );
      return true;
    }

    // Check for alternative lat/lng properties (fallback)
    if (currentEvent.lat && currentEvent.lng) {
      console.log('Found alt lat/lng:', currentEvent.lat, currentEvent.lng);
      return true;
    }

    // Check if location string contains coordinates (lat, lng format) - legacy fallback
    if (currentEvent.location && typeof currentEvent.location === 'string') {
      const coordMatch = currentEvent.location.match(
        /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
      );
      if (coordMatch) {
        console.log(
          'Found coordinates in location string:',
          coordMatch[1],
          coordMatch[2],
        );
        return true;
      }
    }

    console.log('No coordinates found');
    return false;
  };

  // Get coordinates from various possible formats - UPDATED FUNCTION
  const getEventCoordinates = () => {
    const currentEvent = eventDetails || event;

    console.log('Getting coordinates from event:', currentEvent);

    // Direct latitude/longitude properties (primary method now)
    if (
      currentEvent.latitude !== null &&
      currentEvent.latitude !== undefined &&
      currentEvent.longitude !== null &&
      currentEvent.longitude !== undefined
    ) {
      const coords = {
        lat: parseFloat(currentEvent.latitude),
        lng: parseFloat(currentEvent.longitude),
      };
      console.log('Returning direct coordinates:', coords);
      return coords;
    }

    // Alternative lat/lng properties (fallback)
    if (currentEvent.lat && currentEvent.lng) {
      const coords = {
        lat: parseFloat(currentEvent.lat),
        lng: parseFloat(currentEvent.lng),
      };
      console.log('Returning alt coordinates:', coords);
      return coords;
    }

    // Parse from location string if it contains coordinates (legacy fallback)
    if (currentEvent.location && typeof currentEvent.location === 'string') {
      const coordMatch = currentEvent.location.match(
        /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
      );
      if (coordMatch) {
        const coords = {
          lat: parseFloat(coordMatch[1]),
          lng: parseFloat(coordMatch[2]),
        };
        console.log('Returning parsed coordinates:', coords);
        return coords;
      }
    }

    console.log('No coordinates could be extracted');
    return null;
  };

  // Reset state when modal opens with a new event
  useEffect(() => {
    if (isOpen && event) {
      // Reset state for new event
      setEventDetails(null);
      setIsAttending(false);
      setIsLiked(false);
      setAttendingFriends([]);
      setTotalAttendees(0);
      setLikesCount(0);
      setActionLoading({ like: false, attend: false });
      setIsPastEvent(false);

      // Fetch new data
      fetchEventDetails();
    }
  }, [isOpen, event?._id]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const dateTime = formatEventDateTime(event.event_datetime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="bg-card rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl relative border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">{getEventIcon(0)}</div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {event.title}
                </h2>
                {isPastEvent && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    Past Event
                  </span>
                )}
              </div>
              <p className="flex gap-2 text-muted-foreground items-center">
                Hosted by{' '}
                <UserBadge
                  user={event}
                  username={event.username}
                  withImage={false}
                />
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p
                      className={`font-semibold ${isPastEvent ? 'text-muted-foreground' : 'text-foreground'}`}
                    >
                      {dateTime.date}
                    </p>
                    <p
                      className={`${isPastEvent ? 'text-muted-foreground' : 'text-muted-foreground'}`}
                    >
                      {dateTime.time}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Location</p>
                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">
                          {event.location}
                        </p>
                        {hasLocationCoordinates() && (
                          <button
                            onClick={handleViewOnMap}
                            className="flex items-center space-x-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
                          >
                            <Map className="w-4 h-4" />
                            <span>View on Map</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {totalAttendees}{' '}
                      {totalAttendees === 1 ? 'person' : 'people'}{' '}
                      {isPastEvent ? 'attended' : 'attending'}
                    </p>
                  </div>
                </div>
              </div>

              {event.description && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    About this event
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {attendingFriends.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Friends {isPastEvent ? 'who attended' : 'attending'} (
                    {attendingFriends.length})
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {attendingFriends.slice(0, 8).map((friend) => (
                      <div
                        key={friend._id}
                        className="flex items-center space-x-2 bg-muted rounded-full pr-3 py-1"
                      >
                        <img
                          src={getProfilePictureUrl(friend.profile_picture)}
                          alt={friend.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-foreground">
                          {friend.full_name || friend.username}
                        </span>
                      </div>
                    ))}
                    {attendingFriends.length > 8 && (
                      <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                        <span className="text-xs font-medium text-muted-foreground">
                          +{attendingFriends.length - 8}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons - only show if user is logged in */}
              {currentUser && (
                <div className="space-y-3 pt-4 border-t border-border">
                  {/* Main action button - Join/Attending (disabled for past events) */}
                  {!isPastEvent ? (
                    <button
                      onClick={toggleAttendance}
                      disabled={actionLoading.attend}
                      className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                        isAttending
                          ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {actionLoading.attend ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <UserPlus className="w-5 h-5" />
                      )}
                      <span>{isAttending ? 'Attending' : 'Join Event'}</span>
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-muted text-muted-foreground rounded-lg font-semibold">
                      <Clock className="w-5 h-5" />
                      <span>Event has ended</span>
                    </div>
                  )}

                  {/* If already attending, show thread access button */}
                  {isAttending && (
                    <button
                      onClick={handleViewThread}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-medium transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>View Event Discussion</span>
                    </button>
                  )}

                  {/* Secondary action buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={toggleLike}
                      disabled={actionLoading.like}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                        isLiked
                          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {actionLoading.like ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Heart
                          className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
                        />
                      )}
                      <span>{likesCount}</span>
                    </button>

                    <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg font-semibold transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {totalAttendees}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isPastEvent ? 'Attended' : 'Attending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {likesCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Likes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {attendingFriends.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Friends</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
