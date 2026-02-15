import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE_URL } from '../../services/config';
import { Calendar, Users, MapPin, MessageCircle } from 'lucide-react';

function EventsList({ loading: externalLoading }) {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    const fetchUserEvents = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${API_BASE_URL}/events/attending?limit=50&include_past=false`,
                {
                    method: 'GET',
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch events');
            }

            const data = await response.json();
            setEvents(data.events || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching user events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserEvents();
    }, []);

    const handleEventClick = (event) => {
        navigate(`/events/${event._id}/thread`);
    };

    const formatEventDate = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));

            if (diffInDays === 0) {
                return 'Today';
            } else if (diffInDays === 1) {
                return 'Tomorrow';
            } else if (diffInDays > 1 && diffInDays <= 7) {
                return date.toLocaleDateString('en-US', { weekday: 'long' });
            } else {
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            }
        } catch {
            return '';
        }
    };

    const formatEventTime = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return '';
        }
    };

    const isLoading = externalLoading || loading;

    if (isLoading) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center pb-20 md:pb-0">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            Loading events...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-4 pb-20 md:pb-4 text-center">
                    <p className={`mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        Error: {error}
                    </p>
                    <button
                        onClick={fetchUserEvents}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-4 pb-20 md:pb-4 text-center">
                    <div className="mb-4">
                        <Calendar className={`w-16 h-16 mx-auto ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    </div>
                    <p className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No event discussions yet
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Join events to access their discussion threads.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto pb-20 md:pb-0" style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
            }}>
                {events.map((event) => (
                    <div
                        key={event._id}
                        onClick={() => handleEventClick(event)}
                        className={`p-4 cursor-pointer transition-colors border-b ${
                            isDarkMode
                                ? 'border-gray-700 hover:bg-gray-800'
                                : 'border-gray-100 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-start space-x-3">
                            {/* Event Icon */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                                isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                            }`}>
                                <Calendar className={`w-6 h-6 ${
                                    isDarkMode ? 'text-orange-400' : 'text-orange-600'
                                }`} />
                            </div>

                            {/* Event Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-semibold truncate ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {event.title}
                                    </h3>
                                    <span className={`text-xs flex-shrink-0 ml-2 ${
                                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                        {formatEventDate(event.event_datetime)}
                                    </span>
                                </div>

                                {/* Event Time */}
                                <p className={`text-sm ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    {formatEventTime(event.event_datetime)}
                                </p>

                                {/* Event Meta */}
                                <div className="flex items-center mt-1 space-x-3">
                                    {event.location && (
                                        <div className={`flex items-center text-xs ${
                                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                        }`}>
                                            <MapPin className="w-3 h-3 mr-1" />
                                            <span className="truncate max-w-[100px]">
                                                {event.location}
                                            </span>
                                        </div>
                                    )}
                                    {event.attendees_count !== undefined && (
                                        <div className={`flex items-center text-xs ${
                                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                        }`}>
                                            <Users className="w-3 h-3 mr-1" />
                                            <span>{event.attendees_count}</span>
                                        </div>
                                    )}
                                    <div className={`flex items-center text-xs ${
                                        isDarkMode ? 'text-orange-400' : 'text-orange-500'
                                    }`}>
                                        <MessageCircle className="w-3 h-3 mr-1" />
                                        <span>Discussion</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EventsList;
