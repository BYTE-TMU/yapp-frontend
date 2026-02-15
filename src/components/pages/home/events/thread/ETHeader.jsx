import React, { useState } from 'react';
import { ArrowLeft, Users, MessageCircle, Calendar, UserMinus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../../contexts/ThemeContext';

const ETHeader = ({ threadInfo, onLeaveEvent }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

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
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className={`text-lg md:text-2xl font-bold break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {threadInfo.event.title}
              </h1>
              {threadInfo.event.description && (
                <p className={`mt-1 md:mt-2 mb-2 md:mb-3 whitespace-pre-wrap text-sm md:text-base break-words ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {threadInfo.event.description}
                </p>
              )}
              <div className={`flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{threadInfo.thread_stats.total_attendees} attending</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{threadInfo.thread_stats.total_posts} posts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="truncate">{new Date(threadInfo.event.event_datetime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Button */}
          <button
            onClick={handleLeaveClick}
            className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs md:text-sm font-medium transition-colors flex-shrink-0"
          >
            <UserMinus className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Leave Event</span>
            <span className="md:hidden">Leave</span>
          </button>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className={`rounded-lg p-4 md:p-6 max-w-md w-full ${
            isDarkMode ? 'bg-[#1c1c1c]' : 'bg-white'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-600 rounded-full">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h3 className={`text-base md:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Leave Event
              </h3>
            </div>
            
            <p className={`mb-4 md:mb-6 text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to leave "{threadInfo.event.title}"? You'll no longer be able to access the event thread and will need to rejoin to participate.
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