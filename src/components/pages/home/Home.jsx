import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../../sidebar/Sidebar';
import PostItem from './posts/PostItem';
import Header from '../../header/Header';
import EventItem from './events/EventItem';
import EventItemModal from './events/EventItemModal';
import HomepageActivities from './activities/HomepageActivities';
import { API_BASE_URL } from '../../../services/config';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [feedType, setFeedType] = useState('recent'); // 'recent' or 'following'
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
    console.log('Home - currentUser loaded:', userData); // Debug log
  }, []);

  const fetchPosts = async (
    pageNum = 1,
    reset = false,
    feedTypeOverride = null,
  ) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const currentFeedType = feedTypeOverride || feedType;
      let url = `${API_BASE_URL}/posts/feed?page=${pageNum}&limit=20`;

      // For following feed, add filter parameter and include auth token
      if (currentFeedType === 'following') {
        url = `${API_BASE_URL}/posts/following-feed?page=${pageNum}&limit=20`;
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
        setHasMore(data.posts.length === 20);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Updated scroll handler to use main content container instead of document
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore || !mainContentRef.current) return;

    const container = mainContentRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, false);
    }
  }, [loadingMore, hasMore, page]);

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  // Handle feed type changes
  const handleFeedTypeChange = (newFeedType) => {
    setFeedType(newFeedType);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true, newFeedType);
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

  const refreshPosts = () => {
    setPage(1);
    fetchPosts(1, true);
  };

  if (loading && posts.length === 0) {
    return (
      <div
        className="h-screen overflow-hidden font-bold bg-background"
        style={{
          fontFamily: 'Albert Sans',
        }}
      >
        <Header />
        {/* <Sidebar /> */}
        <div className="md:ml-64 h-full overflow-y-auto p-6 pb-20 md:pb-6">
          <p className="text-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen overflow-hidden font-bold bg-background"
      style={{
        fontFamily: 'Albert Sans',
      }}
    >
      <Header />
      <Sidebar />
      <div
        ref={mainContentRef}
        className="h-full w-fill md:ml-64 overflow-y-auto p-6 pb-20 md:pb-6 scrollbar-custom"
      >
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-foreground">
          Home Feed
        </h1>

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
                </div>
              </div>
              <button
                onClick={refreshPosts}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold transition-colors"
              >
                Refresh
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                {error}
              </div>
            )}

            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No posts yet. Be the first to create one!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostItem key={post._id} post={post} />
                ))}
              </div>
            )}

            {hasMore && !loadingMore && (
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
              <p className="text-center mt-8 text-muted-foreground">
                Loading more posts...
              </p>
            )}
          </div>

          {/* Activities Section - 40% width */}
          <div className="w-full lg:w-2/5 mb-20">
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
