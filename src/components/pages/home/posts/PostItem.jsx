import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/services/config';
import { useTheme } from '@/contexts/ThemeContext';
import UserAvatar from '@/components/badges/UserAvatar';
import {
  showLoginRequired,
  showPostDeletedSuccess,
  showPostDeleteError,
  showPostLikeError,
  showNetworkError,
} from '@/utils/toastNotifications';

function PostItem({ post, onPostDeleted }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme(); // Add this hook

  // Get current user info on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.profile || data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Check if user has liked this post when component mounts
  useEffect(() => {
    checkLikeStatus();
  }, [post._id]);

  const checkLikeStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return; // User not logged in

    try {
      const response = await fetch(
        `${API_BASE_URL}/posts/${post._id}/like-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      showLoginRequired('like posts');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setLiked(data.liked);
        setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1));
      } else {
        showPostLikeError();
      }
    } catch (error) {
      console.error('Network error:', error);
      showNetworkError();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      showLoginRequired('delete posts');
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Call the parent component's callback to remove this post from the list
        if (onPostDeleted) {
          onPostDeleted(post._id);
        }
        showPostDeletedSuccess();
      } else {
        showPostDeleteError(data.error);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showNetworkError();
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setShowMenu(false);
    }
  };

  const handleCommentClick = () => {
    navigate(`/post/${post._id}/comments`);
  };

  const handleUsernameClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${post.user_id}`);
  };

  const handleProfilePhotoClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${post.user_id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Use centralized profile picture utility

  const renderPostImages = () => {
    if (!post.images || post.images.length === 0) return null;

    const imageCount = post.images.length;

    if (imageCount === 1) {
      return (
        <div className="mt-3">
          <img
            src={post.images[0]}
            alt="Post image"
            className={`max-w-full max-h-96 object-contain rounded-lg border ${
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            }`}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className={`max-w-full max-h-48 object-contain rounded-lg border ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              }`}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ))}
        </div>
      );
    }

    if (imageCount === 3) {
      return (
        <div className="mt-3 space-y-2">
          <img
            src={post.images[0]}
            alt="Post image 1"
            className={`max-w-full max-h-48 object-contain rounded-lg border ${
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            }`}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="grid grid-cols-2 gap-2">
            {post.images.slice(1).map((image, index) => (
              <img
                key={index + 1}
                src={image}
                alt={`Post image ${index + 2}`}
                className={`max-w-full max-h-32 object-contain rounded-lg border ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                }`}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
        </div>
      );
    }

    if (imageCount === 4) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className={`max-w-full max-h-32 object-contain rounded-lg border ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              }`}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  // Check if current user owns this post
  const isOwnPost = currentUser && currentUser._id === post.user_id;

  return (
    <div
      className={`rounded-lg p-4 md:p-6 font-bold mb-4 transition-all duration-200 hover:shadow-sm hover:scale-101 cursor-pointer relative  border hover:bg-card `}
      style={{
        fontFamily: 'Albert Sans',
      }}
    >
      <div className="flex items-start space-x-3">
        {/* Profile Picture */}
        <UserAvatar
          user={post}
          size="sm"
          redirectOnClick={true}
          className="border-0"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col md:flex-row items-start md:items-center space-x-2">
              <strong
                onClick={handleUsernameClick}
                className={`cursor-pointer transition-colors hover:text-muted-foreground`}
              >
                @{post.username}
              </strong>
              <div
                className={`text-xs md:text-sm font-extralight text-muted-foreground`}
              >
                {formatDate(post.created_at)}
              </div>
            </div>

            {/* More options menu (only for own posts) */}
            {isOwnPost && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* Dropdown menu */}
                {showMenu && (
                  <div
                    className={`absolute right-0 top-full mt-1 rounded-lg shadow-lg z-10 min-w-[120px] ${
                      isDarkMode
                        ? 'bg-[#1c1c1c] border border-gray-600'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                        setShowMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-red-400 flex items-center space-x-2 rounded-lg ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post Content */}
          {post.content && <p className={`leading-relaxed `}>{post.content}</p>}

          {/* Post Images */}
          {renderPostImages()}

          {/* Action Buttons */}
          <div className="flex items-center space-x-6 mt-4">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center space-x-1 transition-colors disabled:opacity-50 text-muted-foreground hover:text-destructive`}
            >
              <Heart
                className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`}
              />
              <span className="text-sm font-bold">{likesCount}</span>
            </button>

            <button
              onClick={handleCommentClick}
              className={`flex items-center space-x-1 transition-colors text-muted-foreground hover:text-primary`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-bold">{post.comments_count}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal - Fixed to viewport */}
      {showDeleteConfirm && (
        <>
          {/* Modal Portal - Fixed to entire viewport */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-9999"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className={`rounded-lg p-4 w-64 shadow-xl bg-card`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <Trash2 className="w-5 h-5 text-destructive mx-auto mb-2" />

                <h3 className={`text-base font-semibold mb-2 `}>Delete Post</h3>

                <p className={`text-xs mb-4 text-muted-foreground`}>
                  This action cannot be undone.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div className="fixed inset-0 z-5" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}

export default PostItem;
