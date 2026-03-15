import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import { createCustomIcon, campusIcon, slcIcon, searchCreateIcon } from './waypointIcons.js';
import WaypointPopup from './WaypointPopup.jsx';
import WaypointLegend from './WaypointLegend.jsx';
import WaypointStats from './WaypointStats.jsx';
import WaypointNavigationOverlay from './WaypointNavigationOverlay.jsx';
import LocationSearchBar from '../../common/LocationSearchBar.jsx';

const FILTER_TYPES = [
    { id: 'food',   emoji: '🍕', label: 'Food',   color: '#f59e0b' },
    { id: 'study',  emoji: '📚', label: 'Study',  color: '#3b82f6' },
    { id: 'group',  emoji: '👥', label: 'Groups', color: '#10b981' },
    { id: 'social', emoji: '🎉', label: 'Social', color: '#8b5cf6' },
    { id: 'event',  emoji: '📅', label: 'Events', color: '#ef4444' },
    { id: 'other',  emoji: '📍', label: 'Other',  color: '#6b7280' },
];

function FilterOverlay({ activeFilters, onToggleFilter, onClearFilters }) {
    const [open, setOpen] = useState(false);
    const hasActiveFilter = activeFilters && activeFilters.size < FILTER_TYPES.length;

    return (
        <div
            style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1100,
                fontFamily: 'Albert Sans, sans-serif',
            }}
        >
            {/* Toggle button */}
            <button
                onClick={() => setOpen((o) => !o)}
                title="Filter waypoints"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 11px',
                    borderRadius: '8px',
                    border: hasActiveFilter ? '1px solid rgba(251,146,60,0.6)' : '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(18,18,18,0.96)',
                    color: hasActiveFilter ? '#fb923c' : '#e5e5e5',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                }}
            >
                <span style={{ fontSize: '14px' }}>🔍</span>
                <span>Filter</span>
                {hasActiveFilter && (
                    <span style={{
                        background: '#fb923c',
                        color: '#000',
                        fontSize: '10px',
                        fontWeight: '700',
                        borderRadius: '999px',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {activeFilters.size}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '6px',
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.10)',
                    backgroundColor: 'rgba(18,18,18,0.97)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(6px)',
                    minWidth: '180px',
                    width: 'max-content',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Show types</span>
                        <button
                            onClick={() => { onClearFilters(); }}
                            style={{ fontSize: '11px', color: '#fb923c', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            {hasActiveFilter ? 'Reset' : 'All shown'}
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {FILTER_TYPES.map(({ id, emoji, label, color }) => {
                            const active = activeFilters?.has(id) ?? true;
                            return (
                                <button
                                    key={id}
                                    onClick={() => onToggleFilter(id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 8px',
                                        borderRadius: '8px',
                                        border: active ? `1px solid ${color}66` : '1px solid rgba(255,255,255,0.08)',
                                        backgroundColor: active ? `${color}22` : 'transparent',
                                        color: active ? '#e5e5e5' : 'rgba(255,255,255,0.25)',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.12s',
                                        fontFamily: 'Albert Sans, sans-serif',
                                    }}
                                >
                                    <span>{emoji}</span>
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// Component to handle map clicks
function MapClickHandler({ placementMode, onMapClick }) {
    useMapEvents({
        click: (e) => {
            // Only allow waypoint creation if in placement mode
            if (placementMode) {
                onMapClick(e.latlng);
            }
        }
    });
    return null;
}

// Component to handle map navigation
function MapNavigator({ targetWaypoint, shouldOpenPopup }) {
    const map = useMap();

    useEffect(() => {
        if (targetWaypoint) {
            // Always use flyTo for precise centering and smooth movement
            map.flyTo(targetWaypoint.coords, 18, {
                duration: 1.0,
                easeLinearity: 0.05,
                animate: true
            });

            // If we should open the popup, do it much faster
            if (shouldOpenPopup) {
                setTimeout(() => {
                    // Find the marker and open its popup
                    map.eachLayer((layer) => {
                        if (layer.options && layer.options.waypointId === targetWaypoint.id) {
                            layer.openPopup();
                        }
                    });
                }, 400); // Much faster popup opening
            }
        }
    }, [targetWaypoint, shouldOpenPopup, map]);

    return null;
}

function WaypointMap({
    waypoints,
    placementMode,
    refreshing,
    onMapClick,
    onJoinWaypoint,
    onDeleteWaypoint,
    onLikeWaypoint,
    onBookmarkWaypoint,
    onJoinEvent,
    getCurrentUser,
    TMU_COORDS = [42.6577, -79.3788],
    ZOOM_LEVEL = 16,
    targetWaypoint = null,
    shouldOpenPopup = false,
    // Navigation overlay props
    isNavigatingSaved = false,
    currentSavedWaypoint = null,
    currentSavedIndex = -1,
    savedWaypointsCount = 0,
    onPreviousSaved,
    onNextSaved,
    onSearchSelect = null,
    searchedPinLocation = null,
    activeFilters = null,
    onToggleFilter = null,
    onClearFilters = null,
}) {
    // Get both current username and user ID
    const currentUsername = getCurrentUser();
    const markerRefs = useRef({});

    // SLC coordinates (at the Library Building location)
    const SLC_COORDS = [43.6578, -79.3805];

    // Get current user ID from JWT token
    const getCurrentUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.user_id || null;
        } catch (err) {
            console.error('Error decoding token:', err);
            return null;
        }
    };

    const currentUserId = getCurrentUserId();

    return (
        <div className="flex-1 relative md:rounded-lg overflow-hidden" style={{ backgroundColor: '#171717', minHeight: '300px' }}>
            <MapContainer
                center={TMU_COORDS}
                zoom={ZOOM_LEVEL}
                style={{
                    height: '100%',
                    width: '100%',
                    minHeight: '300px',
                    cursor: placementMode ? 'crosshair' : 'grab'
                }}
                zoomControl={true}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url={`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${import.meta.env.VITE_LOCATIONIQ_API_KEY}`}
                    attribution='© <a href="https://locationiq.com/?ref=maps" target="_blank" rel="noopener">LocationIQ</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
                    maxZoom={19}
                />

                {/* Address search bar — navigate + optional waypoint placement */}
                <LocationSearchBar onSelect={onSearchSelect} />

                {/* Campus Marker */}
                <Marker position={TMU_COORDS} icon={campusIcon}>
                    <Popup>
                        <div style={{ textAlign: 'center', fontFamily: 'Albert Sans, sans-serif' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>TMU Campus</h3>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                                Toronto Metropolitan University
                            </p>
                        </div>
                    </Popup>
                </Marker>

                {/* Student Learning Centre (SLC) Marker */}
                <Marker position={SLC_COORDS} icon={slcIcon}>
                    <Popup>
                        <div style={{ textAlign: 'center', fontFamily: 'Albert Sans, sans-serif' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Student Learning Centre</h3>
                            <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                                📚 Study spaces, tutoring, and academic support
                            </p>
                            <p style={{ margin: 0, color: '#2563eb', fontSize: '12px', fontWeight: 'bold' }}>
                                SLC Building
                            </p>
                        </div>
                    </Popup>
                </Marker>

                {/* Waypoint Markers */}
                {waypoints.map((waypoint) => {
                    return (
                        <Marker
                            key={waypoint.id}
                            position={waypoint.coords}
                            icon={createCustomIcon(waypoint.type)}
                            ref={(ref) => {
                                if (ref) {
                                    markerRefs.current[waypoint.id] = ref;
                                    // Add waypoint ID to marker options for identification
                                    ref.options.waypointId = waypoint.id;
                                }
                            }}
                        >
                            {/* Tooltip for hover */}
                            <Tooltip
                                direction="top"
                                offset={[0, -20]}
                                opacity={0.9}
                                permanent={false}
                                interactive={false}
                                sticky={false}
                            >
                                <div style={{
                                    fontFamily: 'Albert Sans, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    padding: '2px 4px'
                                }}>
                                    {waypoint.title}
                                </div>
                            </Tooltip>

                            {/* Popup for click (detailed info) */}
                            <Popup maxWidth={250} maxHeight={450} autoPan={true} autoPanPaddingBottomRight={[10, 80]}>
                                <WaypointPopup
                                    waypoint={waypoint}
                                    isOwner={waypoint.isOwner}
                                    currentUserId={currentUserId}
                                    onJoin={onJoinWaypoint}
                                    onDelete={onDeleteWaypoint}
                                    onLike={onLikeWaypoint}
                                    onBookmark={onBookmarkWaypoint}
                                    onJoinEvent={onJoinEvent}
                                />
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Search-result "create waypoint here" marker */}
                {searchedPinLocation && (
                    <Marker
                        position={[searchedPinLocation.lat, searchedPinLocation.lng]}
                        icon={searchCreateIcon}
                        eventHandlers={{
                            click: () => {
                                onMapClick({
                                    lat: searchedPinLocation.lat,
                                    lng: searchedPinLocation.lng,
                                    address: searchedPinLocation.address,
                                });
                            }
                        }}
                    >
                        <Tooltip
                            direction="top"
                            offset={[0, -24]}
                            opacity={1}
                            permanent={true}
                            interactive={false}
                        >
                            <div style={{
                                fontFamily: 'Albert Sans, sans-serif',
                                fontSize: '13px',
                                fontWeight: '600',
                                textAlign: 'center',
                                padding: '2px 4px',
                            }}>
                                📍 Click to drop a waypoint here
                            </div>
                        </Tooltip>
                    </Marker>
                )}

                {/* Handle map clicks */}
                <MapClickHandler
                    placementMode={placementMode}
                    onMapClick={onMapClick}
                />

                {/* Handle navigation to target waypoint */}
                <MapNavigator
                    targetWaypoint={targetWaypoint}
                    shouldOpenPopup={shouldOpenPopup}
                />
            </MapContainer>

            {/* Map Legend */}
            <WaypointLegend />

            {/* Filter overlay — top-right of the map */}
            {onToggleFilter && (
                <FilterOverlay
                    activeFilters={activeFilters}
                    onToggleFilter={onToggleFilter}
                    onClearFilters={onClearFilters}
                />
            )}


            {/* Live Stats */}
            <WaypointStats
                waypointCount={waypoints.length}
                placementMode={placementMode}
                refreshing={refreshing}
            />

            {/* Navigation Overlay for Saved Waypoints */}
            <WaypointNavigationOverlay
                isVisible={isNavigatingSaved}
                currentWaypoint={currentSavedWaypoint}
                currentIndex={currentSavedIndex}
                totalCount={savedWaypointsCount}
                onPrevious={onPreviousSaved}
                onNext={onNextSaved}
            />
        </div>
    );
}

export default WaypointMap;