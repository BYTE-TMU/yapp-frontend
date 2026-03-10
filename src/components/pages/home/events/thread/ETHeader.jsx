import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Calendar,
  UserMinus,
  AlertTriangle,
  Bell,
  UserPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../../contexts/ThemeContext';

const ETHeader = ({ threadInfo, onLeaveEvent, notifications = [], chatPostCount, getProfilePictureUrl, formatTime }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleLeaveClick = () => {
    setShowLeaveModal(true);
  };

  const handleConfirmLeave = async () => {
    setIsLeaving(true);
    try {
      const success = await onLeaveEvent();
      if (success) {
        navigate('/Home');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
    } finally {
      setIsLeaving(false);
      setShowLeaveModal(false);
    }
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
  };

  return (
    <>
      <div className="mb-4 md:mb-6">
        <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
          <div className="flex items-start space-x-2 md:space-x-4 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-full transition-colors shrink-0 hover:bg-accent  `}
            >
              <ArrowLeft className={`w-5 h-5 `} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className={`text-lg md:text-2xl font-bold wrap-break-word `}>
                {threadInfo.event.title}
              </h1>
              {threadInfo.event.description && (
                <p
                  className={`mt-1 md:mt-2 mb-2 md:mb-3 whitespace-pre-wrap text-sm md:text-base wrap-break-word font-normal`}
                >
                  {threadInfo.event.description}
                </p>
              )}
              <div
                className={`flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm`}
              >
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-normal">
                    {threadInfo.thread_stats.total_attendees} attending
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-normal">
                    {chatPostCount ?? threadInfo.thread_stats.total_posts} posts
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-normal truncate">
                    {new Date(
                      threadInfo.event.event_datetime,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full transition-colors hover:bg-accent"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length > 99 ? '99+' : notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 md:w-80 rounded-lg shadow-lg border z-20 bg-accent border-border">
                  <div className="px-4 py-3 border-b border-border font-bold">
                    Activity ({notifications.length})
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No activity yet
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isJoin = notif.post_type === 'join_notification';
                        return (
                          <div
                            key={notif._id}
                            className="px-4 py-3 border-b last:border-b-0 border-border cursor-pointer hover:bg-background/50 transition-colors"
                            onClick={() => navigate(`/profile/${notif.user_id}`)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-1.5 rounded-full ${isJoin ? 'bg-green-600' : 'bg-red-600'}`}>
                                {isJoin
                                  ? <UserPlus className="w-3 h-3 text-white" />
                                  : <UserMinus className="w-3 h-3 text-white" />
                                }
                              </div>
                              {getProfilePictureUrl && (
                                <img
                                  src={getProfilePictureUrl(notif.profile_picture)}
                                  alt={notif.username}
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <span className={`font-medium text-sm ${isJoin ? 'text-green-400' : 'text-red-400'}`}>
                                  {notif.user_full_name || notif.username}
                                </span>
                                <span className={`text-sm ${isJoin ? 'text-green-300' : 'text-red-300'}`}>
                                  {' '}{isJoin ? 'joined' : 'left'}
                                </span>
                                {formatTime && (
                                  <span className="block text-xs mt-0.5 text-muted-foreground">
                                    {formatTime(notif.created_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Leave Button */}
            <button
              onClick={handleLeaveClick}
              className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs md:text-sm font-medium transition-colors shrink-0"
            >
              <UserMinus className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Leave Event</span>
              <span className="md:hidden">Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div
            className={`rounded-lg p-4 md:p-6 max-w-md w-full border bg-accent border-border`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-600 rounded-full">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h3 className={`text-base md:text-lg font-bold`}>Leave Event</h3>
            </div>

            <p className={`mb-4 md:mb-6 text-sm md:text-base font-normal`}>
              Are you sure you want to leave "{threadInfo.event.title}"? You'll
              no longer be able to access the event thread and will need to
              rejoin to participate.
            </p>

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
              <button
                onClick={handleConfirmLeave}
                disabled={isLeaving}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors"
              >
                {isLeaving ? 'Leaving...' : 'Yes, Leave Event'}
              </button>
              <button
                onClick={handleCancelLeave}
                disabled={isLeaving}
                className={`flex-1 px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-600 hover:bg-gray-700 disabled:bg-[#1c1c1c] text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-700'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ETHeader;
