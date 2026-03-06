import React, { useEffect, useState } from 'react';

/**
 * RefreshAnimation - A smooth, minimal refresh animation overlay
 * Shows a brief animation when content is being refreshed
 * 
 * @param {boolean} isRefreshing - Whether the refresh animation should be shown
 * @param {React.ReactNode} children - Content to animate
 */
const RefreshAnimation = ({ isRefreshing, children }) => {
  const [showContent, setShowContent] = useState(!isRefreshing);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isRefreshing) {
      setShowContent(false);
      setAnimating(true);
    } else {
      // Show content with a slight delay after refresh completes
      const timer = setTimeout(() => {
        setShowContent(true);
        setAnimating(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing]);

  return (
    <div className="relative">
      {/* Loading State */}
      <div 
        className={`w-full transition-all duration-200 ${
          isRefreshing 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-2 pointer-events-none absolute inset-x-0'
        }`}
      >
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Refreshing...</p>
          </div>
        </div>
      </div>

      {/* Content State */}
      <div 
        className={`w-full transition-all duration-300 ${
          showContent && !isRefreshing
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-2'
        } ${isRefreshing ? 'pointer-events-none absolute inset-x-0' : ''}`}
      >
        {children}
      </div>
    </div>
  );
};

export default RefreshAnimation;
