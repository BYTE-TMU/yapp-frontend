import {
  MapPin,
  X,
  Target,
  RefreshCw,
  AlertCircle,
  Bookmark,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { cn } from '@/utils/cnUtils';
import { Button } from '@/components/ui/button';

function WaypointHeader({
  placementMode,
  onTogglePlacementMode,
  onRefresh,
  refreshing,
  waypointCount,
  error,
  onClearError,
  onOpenSavedWaypoints,
  isNavigatingSaved = false,
  currentSavedIndex = -1,
  savedWaypointsCount = 0,
  onPreviousSaved,
  onNextSaved,
  onExitSavedNavigation,
}) {
  const { isDarkMode } = useTheme();

  return (
    <div className="mb-2 md:mb-4 shrink-0">
      <div className="flex flex-row items-center justify-between gap-2">
        {/* Left: title */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-6 h-6 md:w-8 md:h-8 text-orange-400 shrink-0" />
          <div>
            <h1 className="text-xl md:text-3xl font-bold leading-tight">Waypoint</h1>
            <p className="text-xs font-normal text-muted-foreground hidden sm:block">
              Real-time campus community map
            </p>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex flex-row flex-wrap items-center justify-end gap-2">
          {isNavigatingSaved ? (
            <>
              <div className="flex items-center space-x-1 px-2 py-1.5 md:px-4 md:py-2 bg-purple-600 rounded-lg text-white text-xs md:text-sm">
                <Bookmark className="w-3 h-3 md:w-4 md:h-4" />
                <span className="font-semibold">
                  {currentSavedIndex + 1}/{savedWaypointsCount}
                  <span className="hidden sm:inline"> saved</span>
                </span>
              </div>
              <button
                onClick={onExitSavedNavigation}
                className="flex items-center space-x-1 px-2 py-1.5 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs md:text-sm"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Exit</span>
                <span className="sm:hidden">✕</span>
              </button>
            </>
          ) : (
            <>
              <Button onClick={onOpenSavedWaypoints} variant="outline" size="sm" className="h-8 px-2 md:px-3">
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline ml-1">Saved</span>
              </Button>
              <Button
                onClick={onRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="h-8 px-2 md:px-3"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-1">Refresh</span>
              </Button>
              <Button
                onClick={onTogglePlacementMode}
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 px-2 md:px-3 font-bold transition-all',
                  placementMode
                    ? 'bg-primary shadow-lg shadow-primary/25'
                    : 'hover:bg-primary bg-primary',
                )}
              >
                {placementMode ? (
                  <><X className="w-3.5 h-3.5" /><span className="hidden sm:inline ml-1">Cancel</span></>
                ) : (
                  <><Target className="w-3.5 h-3.5" /><span className="ml-1">Place</span></>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status text */}
      <div className={`hidden sm:flex sm:items-center sm:gap-3 mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {isNavigatingSaved ? (
          <span className="text-purple-400 font-semibold">🔖 Navigating saved waypoints · use ← → keys or buttons</span>
        ) : placementMode ? (
          <span className="text-primary font-semibold">🎯 Click anywhere on the map to place a waypoint</span>
        ) : (
          <span>📍 Enable placement mode to add waypoints · 🗺️ {waypointCount} active</span>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className={`mt-4 p-3 border rounded-lg ${
            isDarkMode
              ? 'bg-red-900 border-red-600'
              : 'bg-red-100 border-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle
              className={`w-5 h-5 ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`}
            />
            <span className={isDarkMode ? 'text-red-200' : 'text-red-800'}>
              {error}
            </span>
            <button
              onClick={onClearError}
              className={`ml-auto transition-colors ${
                isDarkMode
                  ? 'text-red-400 hover:text-red-300'
                  : 'text-red-600 hover:text-red-700'
              }`}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WaypointHeader;
