import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Header from '../header/Header';
import Sidebar from '../sidebar/Sidebar';
import PostItem from './home/posts/PostItem';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE_URL } from '../../services/config';

function CommentsPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    console.log('PostId from params:', postId); // Debug log
    fetchPostAndComments();
  }, [postId]);

  const fetchPostAndComments = async () => {
    try {
      setLoading(true);
      console.log('Fetching comments for postId:', postId); // Debug log

      // fetch the posts and comments
      const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
      console.log('Response status:', response.status); // Debug log

      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (response.ok) {
        setPost(data.post);
        setComments(data.comments);
        setError(''); // Clear any previous errors
      } else {
        console.error('Error response:', data);
        setError(data.error || 'Failed to fetch post');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/comments/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: postId,
          content: newComment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // add the new comment to list
        setComments((prev) => [...prev, data.comment]);
        setNewComment('');

        // update post comment count
        setPost((prev) => ({
          ...prev,
          comments_count: prev.comments_count + 1,
        }));
      } else {
        setError(data.error || 'Failed to create comment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // remove comment from list
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentId),
        );

        // update post comment count
        setPost((prev) => ({
          ...prev,
          comments_count: prev.comments_count - 1,
        }));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete comment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getProfilePictureUrl = (profilePicture) => {
    if (profilePicture && profilePicture.trim() !== '') {
      if (profilePicture.startsWith('http')) {
        return profilePicture;
      }
      return `${API_BASE_URL}/uploads/profile_pictures/${profilePicture}`;
    }
    // Return a data URL for a simple default avatar
    return "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e0e0e0'/%3E%3Ccircle cx='20' cy='15' r='6' fill='%23bdbdbd'/%3E%3Cellipse cx='20' cy='35' rx='12' ry='8' fill='%23bdbdbd'/%3E%3C/svg%3E";
  };

  if (loading) {
    return (
      <div
        className="min-h-screen font-bold"
        style={{
          fontFamily: 'Albert Sans',
        }}
      >
        <Header />
        <Sidebar />
        <div className="ml-64 p-6">
          <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div
        className="min-h-screen font-bold"
        style={{
          fontFamily: 'Albert Sans',
        }}
      >
        <Header />
        <Sidebar />
        <div className="ml-64 p-6">
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6>
              Post ID: {postId}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={fetchPostAndComments}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className="min-h-screen font-bold"
        style={{
          fontFamily: 'Albert Sans',
        }}
      >
        <Header />
        <Sidebar />
        <div className="ml-64 p-6">
          <div className="text-center py-12">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6>
              Post not found
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-bold"
      style={{
        fontFamily: 'Albert Sans',
      }}
    >
      <Header />
      <Sidebar />
      <div className="md:ml-64 p-6">
        {/* Animated Background */}
        <div className="fixed inset-0 md:ml-64 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-primary/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-orange-600/20 to-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 mb-6 px-4 py-2 rounded-lg font-bold transition-colors hover:bg-accent hover:cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className={`text-2xl font-bold mb-6 `}>Post</h1>

        {/* Use PostItem component instead of recreating the post */}
        {post && <PostItem post={post} />}

        {/* comment form */}
        <div className="rounded-lg p-6 mb-6 border">
          <h3 className={`text-lg font-bold mb-4`}>Add a Comment</h3>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              maxLength={500}
              disabled={submitting}
              className={`w-full p-3 border rounded-lg focus:outline-none resize-none h-24 placeholder:text-muted-foreground focus:border-primary`}
            />

            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">
                {newComment.length}/500
              </span>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-bold transition-colors"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-900 border border-red-700 text-red-300 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Comments List with profile pictures */}
        <div className="rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">
            Comments ({comments.length})
          </h3>

          {comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="border-b pb-4 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={getProfilePictureUrl(comment.profile_picture)}
                      alt={`${comment.username}'s profile`}
                      onClick={() => navigate(`/profile/${comment.user_id}`)}
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23e0e0e0'/%3E%3Ccircle cx='16' cy='12' r='5' fill='%23bdbdbd'/%3E%3Cellipse cx='16' cy='28' rx='10' ry='6' fill='%23bdbdbd'/%3E%3C/svg%3E";
                      }}
                      className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 mb-2">
                          <strong
                            onClick={() =>
                              navigate(`/profile/${comment.user_id}`)
                            }
                            className="hover:text-muted-foreground cursor-pointer transition-colors"
                          >
                            @{comment.username}
                          </strong>
                          <span className="text-muted-foreground text-sm">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>

                        {/* show delete button if user owns the comment */}
                        {localStorage.getItem('token') && (
                          <button
                            onClick={() => deleteComment(comment._id)}
                            className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <p>{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentsPage;
