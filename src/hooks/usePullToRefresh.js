import { useState, useRef, useCallback, useEffect } from 'react';

export function usePullToRefresh(onRefresh, options = {}) {
  const { threshold = 80, resistance = 2.5 } = options;

  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!pulling) return;

      const currentY = e.touches[0].clientY;
      const diff = (currentY - startY.current) / resistance;

      if (diff > 0) {
        e.preventDefault();
        setPullDistance(Math.min(diff, threshold * 1.5));
      }
    },
    [pulling, threshold, resistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    pullDistance,
    refreshing,
    isPulling: pulling && pullDistance > 0,
    progress: Math.min(pullDistance / threshold, 1),
  };
}

export default usePullToRefresh;
