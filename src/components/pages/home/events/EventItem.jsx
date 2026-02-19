import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, MapPin, X } from 'lucide-react';
import EventModal from './EventModal';
import { API_BASE_URL } from '@/services/config';
import { useTheme } from '@/contexts/ThemeContext';
import { formatEventTime } from '@/utils/dateTimeUtils';

import {
  showDeleteConfirmation,
  showEventDeletedSuccess,
  showEventDeleteError,
  showLoginRequired,
  showNetworkError,
} from '@/utils/toastNotifications';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserBadge from '@/components/badges/UserBadge';
import LikeBadge from '@/components/badges/LikeBadge';
import DateBadge from '@/components/badges/DateBadge';
import AtendeesBadge from '@/components/badges/AtendeesBadge';

function EventItem() {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isDarkMode } = useTheme();

  // Get current user ID from token
  useEffect(() => {
    const getCurrentUserId = () => {
      const token = localStorage.getItem('token');

      if (!token) {
        return null;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId =
          payload.sub || payload._id || payload.id || payload.user_id;
        return userId;
      } catch (e) {
        console.error('Error parsing token:', e);
        return null;
      }
    };

    const userId = getCurrentUserId();
    setCurrentUserId(userId);
  }, []);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      return {
        'Content-Type': 'application/json',
      };
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  // Get current user object for EventModal
  const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      console.error('Error getting current user:', e);
      return null;
    }
  };

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching events from API...');
      const response = await fetch(
        `${API_BASE_URL}/events/feed?limit=10&include_past=false`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.events && Array.isArray(data.events)) {
        setEvents(data.events);

        if (data.debug_info) {
          console.log('Database stats:', data.debug_info);
        }
      } else {
        console.error('Invalid data structure:', data);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(`Failed to fetch events: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Use centralized profile picture utility

  const getVisibleEvents = () => {
    const maxVisible = 7; // Show more events for better navigation
    const totalEvents = events.length;

    if (totalEvents <= maxVisible) {
      return events;
    }

    let startIndex = Math.max(0, currentIndex - 2);
    let endIndex = Math.min(totalEvents, startIndex + maxVisible);

    if (endIndex - startIndex < maxVisible) {
      startIndex = Math.max(0, endIndex - maxVisible);
    }

    return events.slice(startIndex, endIndex);
  };

  const getEventImage = (event, index) => {
    // Use event image if available, otherwise use random picsum photo
    if (event.image) {
      return event.image;
    }
    // Use a consistent seed based on event ID to get the same random image each time
    const seed = event._id
      ? event._id.slice(-6)
      : index.toString().padStart(6, '0');
    return `https://picsum.photos/seed/${seed}/400/300`;
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = await showDeleteConfirmation('event');
    if (!confirmed) {
      return;
    }

    if (!currentUserId) {
      showLoginRequired('delete events');
      return;
    }

    setDeletingEvent(eventId);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event._id !== eventId),
        );
        if (currentIndex > 0 && currentIndex >= events.length - 4) {
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
        if (selectedEvent && selectedEvent._id === eventId) {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }
        showEventDeletedSuccess();
      } else {
        showEventDeleteError(data.error);
      }
    } catch (err) {
      console.error('Error cancelling event:', err);
      showNetworkError();
    } finally {
      setDeletingEvent(null);
    }
  };

  const handleEventClick = (event, isExpanded) => {
    if (isExpanded) {
      setSelectedEvent(event);
      setIsModalOpen(true);
    } else {
      const originalIndex = events.findIndex((e) => e._id === event._id);
      const newIndex = Math.max(
        0,
        Math.min(originalIndex - 1, events.length - 3),
      );
      setCurrentIndex(newIndex);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Check if current user can delete the event
  const canDeleteEvent = (event) => {
    if (!currentUserId || !event) {
      return false;
    }

    const eventUserId = String(event.user_id || '');
    const currentUserIdStr = String(currentUserId || '');

    return currentUserIdStr === eventUserId && currentUserIdStr !== '';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div
            className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
              isDarkMode ? 'border-blue-400' : 'border-blue-600'
            }`}
          ></div>
          <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Loading events...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div
            className={`mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}
          >
            {error}
          </div>
          <button
            onClick={fetchEvents}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (events.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            No events found
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full p-4">
        {/* Events Container */}
        <Carousel opts={{ align: 'start', loop: true }}>
          <CarouselContent>
            {getVisibleEvents().map((event, visibleIndex) => {
              const originalIndex = events.findIndex(
                (e) => e._id === event._id,
              );
              const isExpanded =
                originalIndex >= currentIndex &&
                originalIndex < currentIndex + 3;

              return (
                <CarouselItem className="sm:basis-1/2 lg:basis-1/3">
                  <Card
                    key={event._id}
                    className={`transition-all duration-500 ease-in-out cursor-pointer p-0`}
                    onClick={() => handleEventClick(event, isExpanded)}
                  >
                    {/* Event Image */}
                    <CardContent className="relative h-40 overflow-hidden w-full rounded-lg p-0">
                      <img
                        src={getEventImage(event, originalIndex)}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://picsum.photos/400/300?random=${originalIndex}`;
                        }}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                      {/* Delete Button for Event Owner */}
                      {canDeleteEvent(event) && (
                        // <div className="absolute top-3 right-3 z-10">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event._id);
                          }}
                          variant="default"
                          size="icon"
                          disabled={deletingEvent === event._id}
                          className="hover:bg-destructive disabled:bg-gray-500 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110 absolute top-3 right-3 z-10 cursor-pointer"
                          title="Delete Event"
                        >
                          {deletingEvent === event._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                        // </div>
                      )}

                      {/* Date Badge */}
                      <DateBadge event={event} />

                      {/* Attendees Count */}
                      <AtendeesBadge event={event} />
                    </CardContent>

                    {/* Event Content */}
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="flex flex-col gap-1">
                        {event.description}
                        <div className="flex gap-2">
                          {/* Time */}
                          <div className={`flex gap-2 items-center text-xs`}>
                            <Clock className="size-3" />
                            <span>{formatEventTime(event.event_datetime)}</span>
                          </div>

                          {/* Location */}
                          {event.location && (
                            <div
                              className={`flex gap-2 items-center text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              <MapPin className="size-3 " />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center  w-full justify-between">
                          <UserBadge
                            user={event}
                            username={event.username}
                            isDarkMode={isDarkMode}
                          />
                          <LikeBadge event={event} isDarkMode={isDarkMode} />
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="items-center justify-center">
                      <Button
                        className={`px-2 py-1 rounded-full text-xs transition-all duration-200`}
                        variant="ghost"
                      >
                        Click to view details
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="flex justify-center mt-6 p-0">
            <CarouselPrevious className="relative" />
            <CarouselNext className="relative" />
          </div>
        </Carousel>
      </div>

      {/* Event Modal */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 backdrop-blur-sm transition-all duration-300"
            style={{
              backgroundColor: 'rgba(18, 18, 18, 0.85)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={closeModal}
          >
            <EventModal
              event={selectedEvent}
              isOpen={isModalOpen}
              onClose={closeModal}
              currentUser={getCurrentUser()}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

export default EventItem;
