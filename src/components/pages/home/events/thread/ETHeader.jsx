import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, MessageCircle, Calendar, UserMinus, AlertTriangle, Bell, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../../contexts/ThemeContext';

const ETHeader = ({ threadInfo, onLeaveEvent, notifications = [], getProfilePictureUrl, formatTime }) => {
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {threadInfo.event.title}
              </h1>
              {threadInfo.event.description && (
                <p className={`mt-2 mb-3 whitespace-pre-wrap ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {threadInfo.event.description}
                </p>
              )}
              <div className={`flex items-center space-x-4 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{threadInfo.thread_stats.total_attendees} attending</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{threadInfo.thread_stats.total_posts} posts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(threadInfo.event.event_datetime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <Bell className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length > 99 ? '99+' : notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-20 ${
                  isDarkMode ? 'bg-[#1c1c1c] border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className={`px-4 py-3 border-b font-bold ${
                    isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                  }`}>
                    Activity ({notifications.length})
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className={`px-4 py-6 text-center text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        No activity yet
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isJoin = notif.post_type === 'join_notification';
                        return (
                          <div
                            key={notif._id}
                            className={`px-4 py-3 border-b last:border-b-0 ${
                              isDarkMode ? 'border-gray-700' : 'border-gray-100'
                            }`}
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
                                  <span className={`block text-xs mt-0.5 ${
                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
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
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <UserMinus className="w-4 h-4" />
              <span>Leave Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${
            isDarkMode ? 'bg-[#1c1c1c]' : 'bg-white'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-600 rounded-full">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Leave Event
              </h3>
            </div>
            
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to leave "{threadInfo.event.title}"? You'll no longer be able to access the event thread and will need to rejoin to participate.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmLeave}
                disabled={isLeaving}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isLeaving ? 'Leaving...' : 'Yes, Leave Event'}
              </button>
              <button
                onClick={handleCancelLeave}
                disabled={isLeaving}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
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