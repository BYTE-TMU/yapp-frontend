import { useState, useRef, useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { searchAddress } from '../../services/locationiqService';

/**
 * LocationSearchBar — an address search overlay rendered inside a Leaflet MapContainer.
 *
 * Must be placed as a child of <MapContainer> so it can access the map via useMap().
 *
 * Props:
 *   onSelect({ lat, lng, address }) — optional callback fired when the user picks a result.
 *                                     If omitted the bar only navigates the map (no pin).
 */
function LocationSearchBar({ onSelect }) {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const selectingRef = useRef(false); // Guard: true while a result tap/click is in progress

  // Stop Leaflet from swallowing mouse/touch/scroll events on the search widget
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      L.DomEvent.disableClickPropagation(el);
      L.DomEvent.disableScrollPropagation(el);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchAddress(value);
        setResults(data);
        setOpen(data.length > 0);
      } catch (err) {
        console.warn('Location search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Use mouseDown so the click fires before the blur event closes the dropdown
  const handleSelect = useCallback((result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const address = result.display_name;

    map.flyTo([lat, lng], 18, { duration: 1.0, easeLinearity: 0.05 });

    // Show the short place name in the input after selection
    const shortName =
      result.display_place ||
      (result.display_name ? result.display_name.split(',')[0] : '');
    setQuery(shortName);
    setResults([]);
    setOpen(false);

    if (onSelect) {
      onSelect({ lat, lng, address });
    }
  }, [map, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[0]);
    }
  }, [results, handleSelect]);

  const handleBlur = useCallback(() => {
    // Don't close if user is tapping/clicking a result — handleSelect will close instead
    setTimeout(() => {
      if (!selectingRef.current) setOpen(false);
      selectingRef.current = false;
    }, 300);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '10px',
        left: '50px',          // Sits to the right of Leaflet's zoom controls
        zIndex: 1100,
        width: '280px',
        maxWidth: 'calc(100% - 70px)',
        pointerEvents: 'auto',
        fontFamily: 'inherit',
      }}
    >
      {/* Input */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '14px',
          pointerEvents: 'none',
          color: '#888',
        }}>
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search address…"
          style={{
            width: '100%',
            padding: '8px 36px',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '8px',
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(18, 18, 18, 0.96)',
            color: '#e5e5e5',
            boxShadow: '0 2px 10px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
          }}
        />
        {loading && (
          <span style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666',
            fontSize: '11px',
            letterSpacing: '1px',
          }}>
            ···
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <ul style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          backgroundColor: 'rgba(18, 18, 18, 0.97)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          marginTop: '4px',
          maxHeight: '220px',
          overflowY: 'auto',
          boxShadow: '0 6px 16px rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
        }}>
          {results.map((result, i) => {
            const placeName =
              result.display_place ||
              (result.display_name ? result.display_name.split(',')[0] : '');
            const placeAddress =
              result.display_address ||
              (result.display_name
                ? result.display_name.split(',').slice(1, 3).join(',').trim()
                : '');
            return (
              <li
                key={i}
                onPointerDown={() => { selectingRef.current = true; }}
                onClick={() => handleSelect(result)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom:
                    i < results.length - 1
                      ? '1px solid rgba(255,255,255,0.06)'
                      : 'none',
                  transition: 'background-color 0.12s',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    'rgba(255,255,255,0.08)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <div style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#e5e5e5',
                  marginBottom: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {placeName}
                </div>
                {placeAddress && (
                  <div style={{
                    fontSize: '11px',
                    color: '#888',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {placeAddress}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default LocationSearchBar;
