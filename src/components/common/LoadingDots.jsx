/**
 * LoadingDots — three orange bouncing dots used as a loading indicator
 * throughout the app, replacing the old spinning ring.
 *
 * Props:
 *   size  — dot diameter in px (default 8)
 *   color — Tailwind bg class (default 'bg-orange-500')
 */
function LoadingDots({ size = 9, color = 'bg-orange-500' }) {
    const dotStyle = `rounded-full ${color} animate-bounce`;
    const dim = `${size}px`;

    return (
        <div className="flex items-center gap-1.5" role="status" aria-label="Loading">
            <div
                className={dotStyle}
                style={{ width: dim, height: dim, animationDelay: '0ms' }}
            />
            <div
                className={dotStyle}
                style={{ width: dim, height: dim, animationDelay: '150ms' }}
            />
            <div
                className={dotStyle}
                style={{ width: dim, height: dim, animationDelay: '300ms' }}
            />
        </div>
    );
}

export default LoadingDots;
