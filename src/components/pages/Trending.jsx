import { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, Flame } from 'lucide-react';
import PostItem from './home/posts/PostItem';
import LoadingDots from '@/components/common/LoadingDots';
import { API_BASE_URL } from '@/services/config';

function Trending() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const mainContentRef = useRef(null);

  const fetchTrendingPosts = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `${API_BASE_URL}/posts/trending?page=${pageNum}&limit=20`,
      );
      const data = await response.json();

      if (response.ok) {
        if (reset) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setHasMore(data.posts.length === 20);
      } else {
        setError(data.error || 'Failed to fetch trending posts');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTrendingPosts(1, true);
  }, []);

  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore || !mainContentRef.current) return;

    const container = mainContentRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTrendingPosts(nextPage, false);
    }
  }, [loadingMore, hasMore, page]);

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
    fetchTrendingPosts(nextPage, false);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="h-screen overflow-hidden bg-background">
        <div className="md:ml-64 h-full overflow-y-auto p-6 pb-20 md:pb-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <LoadingDots size={14} />
            <p className="text-muted-foreground text-sm">Loading trending posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={mainContentRef} className="page-container">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trending</h1>
            <p className="text-sm text-muted-foreground">Top posts from the last 7 days</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <p className="mb-3">{error}</p>
            <button
              onClick={() => fetchTrendingPosts(1, true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-bold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Nothing trending yet</h2>
            <p className="text-muted-foreground">Check back soon for popular posts</p>
          </div>
        )}

        {posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div key={post._id} className="relative">
                {/* Rank badge */}
                <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/30">
                  <Flame className="w-3 h-3" />
                  <span>#{index + 1}</span>
                </div>
                <PostItem post={post} />
              </div>
            ))}

            {hasMore && !loadingMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMorePosts}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold transition-colors"
                >
                  Load More
                </button>
              </div>
            )}

            {loadingMore && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <LoadingDots size={10} />
                  <p className="text-muted-foreground text-sm">Loading more posts...</p>
                </div>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-muted-foreground text-sm">You've seen all trending posts</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Trending;
