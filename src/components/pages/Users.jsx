import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  User,
  UserPlus,
  Users as UsersIcon,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE_URL } from '../../services/config';
import UserAvatar from '../badges/UserAvatar';

function Users() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const isLoggedIn = () => !!localStorage.getItem('token');

  // ─── Fetch recommendations ──────────────────────────────────────────────────
  const fetchRecommendations = useCallback(async () => {
    if (!isLoggedIn()) {
      setRecLoading(false);
      return;
    }
    try {
      setRecLoading(true);
      const res = await fetch(`${API_BASE_URL}/users/recommendations?limit=8`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (e) {
      console.warn('Could not load recommendations', e);
    } finally {
      setRecLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // ─── Follow / unfollow ──────────────────────────────────────────────────────
  const handleFollow = async (userId, e) => {
    e.stopPropagation();
    if (!isLoggedIn()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.following) {
          setFollowingIds((prev) => new Set([...prev, userId]));
        } else {
          setFollowingIds((prev) => {
            const s = new Set(prev);
            s.delete(userId);
            return s;
          });
        }
        // Refresh recommendations after a short delay
        setTimeout(fetchRecommendations, 400);
      }
    } catch (e) {
      console.warn('Follow action failed', e);
    }
  };

  // ─── User search (unchanged) ────────────────────────────────────────────────
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setUsers([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}&limit=20`,
        );
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
        } else {
          setError(data.error || 'Failed to search users');
          setUsers([]);
        }
      } catch (err) {
        setError('Network error. Please try again.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleInputChange = (e) => setSearchQuery(e.target.value);

  const handleUserClick = (userId) => navigate(`/profile/${userId}`);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  // ─── Theme tokens ───────────────────────────────────────────────────────────
  const cardBg = isDarkMode ? '#262626' : '#ffffff';
  const skeletonBg = isDarkMode ? '#1c1c1c' : '#f3f4f6';
  const skeletonEl = isDarkMode ? '#374151' : '#d1d5db';
  const borderColor = isDarkMode
    ? 'rgba(255,255,255,0.07)'
    : 'rgba(0,0,0,0.08)';

  const showRecommendations = searchQuery.length === 0 && isLoggedIn();

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold mb-6">Search Users</h1>
      {/* Search bar */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search for users..."
            autoComplete="off"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none transition-colors placeholder:text-muted-foreground focus:border-primary`}
            style={{
              backgroundColor: isDarkMode ? '#262626' : '#f3f4f6',
              color: isDarkMode ? '#f3f4f6' : '#111827',
            }}
          />
        </div>
      </div>

      {/* ── RECOMMENDATIONS ──────────────────────────────────────────────── */}
      {showRecommendations && (
        <div className="mb-10">
          {/* Section header */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-orange-400" />
            <h2
              className={`text-lg font-bold ${isDarkMode ? 'text-gray-300' : 'text-white-900'}`}
            >
              People You Might Know
            </h2>
          </div>

          {recLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 animate-pulse"
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-full"
                      style={{ backgroundColor: skeletonEl }}
                    />
                    <div
                      className="h-3 w-24 rounded"
                      style={{ backgroundColor: skeletonEl }}
                    />
                    <div
                      className="h-3 w-16 rounded"
                      style={{ backgroundColor: skeletonBg }}
                    />
                    <div
                      className="h-8 w-full rounded-lg"
                      style={{ backgroundColor: skeletonBg }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-2xl p-6 flex flex-col items-center gap-2 border bg-accent">
              <UsersIcon className="w-10 h-10 text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                Follow more people to get recommendations
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {recommendations.map((rec) => {
                const isFollowing = followingIds.has(rec._id);
                return (
                  <div
                    key={rec._id}
                    onClick={() => handleUserClick(rec._id)}
                    className="rounded-2xl p-4 cursor-pointer transition-all duration-200 group"
                    style={{
                      backgroundColor: cardBg,
                      border: `1px solid ${borderColor}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = isDarkMode
                        ? '0 8px 24px rgba(0,0,0,0.4)'
                        : '0 8px 24px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = `1px solid ${borderColor}`;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      {/* Avatar */}
                      <div className="mb-1">
                        <UserAvatar user={rec} size="lg" />
                      </div>

                      {/* Name & username */}
                      <div>
                        {rec.full_name && (
                          <p
                            className={`text-sm font-bold truncate max-w-[140px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                          >
                            {rec.full_name}
                          </p>
                        )}
                        <p
                          className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          @{rec.username}
                        </p>
                      </div>

                      {/* Mutual badge */}
                      {rec.mutual_count > 0 && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: isDarkMode
                              ? 'rgba(251,146,60,0.15)'
                              : 'rgba(251,146,60,0.12)',
                            color: '#f97316',
                          }}
                        >
                          {rec.mutual_count} mutual{' '}
                          {rec.mutual_count === 1
                            ? 'connection'
                            : 'connections'}
                        </span>
                      )}

                      {/* Follow button */}
                      <button
                        onClick={(e) => handleFollow(rec._id, e)}
                        className={`mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                          isFollowing
                            ? isDarkMode
                              ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        <UserPlus size={14} />
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SEARCH STATES ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-4">
          <h3
            className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Searching...
          </h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 animate-pulse ${isDarkMode ? '' : 'border border-gray-200'}`}
                style={{ backgroundColor: cardBg }}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-12 h-12 rounded-full"
                    style={{ backgroundColor: skeletonEl }}
                  />
                  <div className="flex-1">
                    <div
                      className="h-4 rounded w-32 mb-2"
                      style={{ backgroundColor: skeletonEl }}
                    />
                    <div
                      className="h-3 rounded w-48 mb-1"
                      style={{ backgroundColor: skeletonBg }}
                    />
                    <div
                      className="h-3 rounded w-24"
                      style={{ backgroundColor: skeletonBg }}
                    />
                  </div>
                  <div
                    className="w-24 h-8 rounded"
                    style={{ backgroundColor: skeletonEl }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div
          className={`rounded-lg p-4 mb-6 ${isDarkMode ? '' : 'border border-red-200'}`}
          style={{ backgroundColor: cardBg }}
        >
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <div
          className={`rounded-lg p-4 mb-6 ${isDarkMode ? '' : 'border border-gray-200'}`}
          style={{ backgroundColor: cardBg }}
        >
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Type at least 2 characters to search
          </p>
        </div>
      )}

      {users.length === 0 && searchQuery.length >= 2 && !loading && (
        <div className="text-center py-8">
          <div
            className={`rounded-lg p-6 ${isDarkMode ? '' : 'border border-gray-200'}`}
            style={{ backgroundColor: cardBg }}
          >
            <User
              className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
            />
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No users found for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        </div>
      )}

      {users.length > 0 && (
        <div className="space-y-4">
          <h3
            className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Search Results ({users.length})
          </h3>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user._id)}
                className={`rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  isDarkMode
                    ? 'hover:bg-zinc-800'
                    : 'hover:bg-gray-50 border border-gray-200'
                }`}
                style={{ backgroundColor: cardBg }}
              >
                <div className="flex items-center space-x-4">
                  <UserAvatar user={user} size="sm" />
                  <div className="flex-1">
                    <h4
                      className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      @{user.username}
                    </h4>
                    {user.email && (
                      <p
                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        {user.email}
                      </p>
                    )}
                    <p
                      className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}
                    >
                      Joined: {formatDate(user.created_at)}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick(user._id);
                      }}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg font-bold transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default Users;
