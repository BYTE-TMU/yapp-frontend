import { useState, useEffect, useCallback, useRef } from 'react';
import PostItem from './posts/PostItem';
import EventItem from './events/EventItem';
import EventItemModal from './events/EventItemModal';
import HomepageActivities from './activities/HomepageActivities';
import RefreshAnimation from '@/components/common/RefreshAnimation';
import LoadingDots from '@/components/common/LoadingDots';
import { FeedSkeleton } from '@/components/common/Skeleton';
import { API_BASE_URL } from '@/services/config';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [feedType, setFeedType] = useState('recent'); // 'recent', 'following', or 'trending'
  const [trendingPeriod, setTrendingPeriod] = useState('week'); // 'today', 'week', 'month'
  const [refreshing, setRefreshing] = useState(false); // For smooth feed type changes
  const mainContentRef = useRef(null);

  // Get current user info
  useEffect(() => {
    const getUserData = () => {
      // Try to get from sessionStorage first
      const sessionUser = sessionStorage.getItem('currentUser');
      if (sessionUser) {
        try {
          return JSON.parse(sessionUser);
        } catch (e) {
          console.error('Error parsing session user:', e);
        }
      }

      // Fallback to token decoding
      const token = localStorage.getItem('token');
      if (token) {
        try {
          /* 
                    token.split('.') splits jwt into 3 parts
                    [ header, payload, signature ]
                    [1] gets the second elemtn which is payload
                    atob() decodes bthe payload
                    JSON.parse() converts json to javascript obj
                    */
          const payload = JSON.parse(atob(token.split('.')[1]));
          sessionStorage.setItem('currentUser', JSON.stringify(payload));
          return payload;
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
      return null;
    };

    const userData = getUserData();
    setCurrentUser(userData);
  }, []);

  const fetchPosts = async (
    pageNum = 1,
    reset = false,
    feedTypeOverride = null,
    isRefreshingFeed = false,
    periodOverride = null,
  ) => {
    try {
      setError('');
      if (isRefreshingFeed) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const currentFeedType = feedTypeOverride || feedType;
      let url = `${API_BASE_URL}/posts/feed?page=${pageNum}&limit=20`;

      if (currentFeedType === 'following') {
        url = `${API_BASE_URL}/posts/following-feed?page=${pageNum}&limit=20`;
      } else if (currentFeedType === 'trending') {
        const period = periodOverride || trendingPeriod;
        url = `${API_BASE_URL}/posts/trending?page=1&limit=3&period=${period}`;
      }

      const headers = {};
      if (currentFeedType === 'following') {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(url, { headers });
      const data = await response.json();

      if (response.ok) {
        if (reset) {
          setPosts(data.posts);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...data.posts]);
        }

        // check if there are more posts to load
        // Trending on Home is a fixed top-3 snapshot — no pagination
        setHasMore(currentFeedType !== 'trending' && data.posts.length === 20);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      // Keep refreshing state for a minimum duration for smooth animation
      if (isRefreshingFeed) {
        setTimeout(() => setRefreshing(false), 400);
      }
    }
  };

  // Updated scroll handler to use main content container instead of document
  const handleScroll = useCallback(() => {
    // No infinite scroll for trending — it's a fixed top-3 snapshot
    if (feedType === 'trending' || loadingMore || !hasMore || !mainContentRef.current) return;

    const container = mainContentRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, false, feedType);
    }
  }, [loadingMore, hasMore, page, feedType]);

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  // Handle feed type changes
  const handleFeedTypeChange = (newFeedType) => {
    if (newFeedType === feedType) return; // Prevent unnecessary refreshes
    setFeedType(newFeedType);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true, newFeedType, true);
  };

  const handleTrendingPeriodChange = (newPeriod) => {
    if (newPeriod === trendingPeriod) return;
    setTrendingPeriod(newPeriod);
    setPage(1);
    fetchPosts(1, true, 'trending', true, newPeriod);
  };

  useEffect(() => {
    const container = mainContentRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const loadMorePosts = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, false);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="">
        <div className="page-container">
          <FeedSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div ref={mainContentRef} className="page-container">
        {/* Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Events</h2>
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              View All Events
            </button>
          </div>
          <div className="rounded-lg p-2 bg-card border border-border">
            {/* Pass currentUser to EventItem */}
            <EventItem currentUser={currentUser} />
          </div>
        </div>

        {/* Main Content Section - Posts and Activities */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Posts Section - 60% width */}
          <div className="w-full lg:w-3/5">
            <div className="flex items-center justify-between w-full mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-3">
                <h2 className="text-xl font-bold text-foreground">Posts</h2>
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => handleFeedTypeChange('recent')}
                    className={`transition-colors ${
                      feedType === 'recent'
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Recent
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={() => handleFeedTypeChange('following')}
                    className={`transition-colors ${
                      feedType === 'following'
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Following
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={() => handleFeedTypeChange('trending')}
                    className={`flex items-center gap-1 transition-colors ${
                      feedType === 'trending'
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Trending
                  </button>
                </div>
              </div>
            </div>

            {feedType === 'trending' && (
              <div className="flex items-center gap-2 mb-4">
                {['today', 'week', 'month'].map((period) => (
                  <button
                    key={period}
                    onClick={() => handleTrendingPeriodChange(period)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      trendingPeriod === period
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                {error}
              </div>
            )}

            {/* Wrap posts in RefreshAnimation for smooth transitions */}
            <RefreshAnimation isRefreshing={refreshing}>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No posts yet. Be the first to create one!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post, index) =>
                    feedType === 'trending' ? (
                      <div key={post._id} className="relative">
                        <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/30">
                          <Flame className="w-3 h-3" />
                          <span>#{index + 1}</span>
                        </div>
                        <PostItem post={post} />
                      </div>
                    ) : (
                      <PostItem key={post._id} post={post} />
                    ),
                  )}
                </div>
              )}

              {hasMore && !loadingMore && posts.length > 0 && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMorePosts}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold transition-colors"
                  >
                    Load More Posts
                  </button>
                </div>
              )}

              {loadingMore && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <LoadingDots size={10} />
                    <p className="text-muted-foreground text-sm">
                      Loading more posts...
                    </p>
                  </div>
                </div>
              )}
            </RefreshAnimation>
          </div>

          {/* Activities Section - 40% width */}
          <div className="w-full lg:w-2/5 md:mb-20">
            <h2 className="text-xl font-bold mb-6 text-foreground">
              Activities
            </h2>
            <HomepageActivities />
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventItemModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />
    </div>
  );
}

export default Home;
