import L from 'leaflet';

// Type configuration with colors, emojis, and shadow colors
const typeConfig = {
    food: { color: '#f59e0b', colorLight: '#fbbf24', emoji: '🍕', shadowColor: 'rgba(245, 158, 11, 0.4)' },
    study: { color: '#3b82f6', colorLight: '#60a5fa', emoji: '📚', shadowColor: 'rgba(59, 130, 246, 0.4)' },
    group: { color: '#10b981', colorLight: '#34d399', emoji: '👥', shadowColor: 'rgba(16, 185, 129, 0.4)' },
    social: { color: '#8b5cf6', colorLight: '#a78bfa', emoji: '🎉', shadowColor: 'rgba(139, 92, 246, 0.4)' },
    event: { color: '#ef4444', colorLight: '#f87171', emoji: '📅', shadowColor: 'rgba(239, 68, 68, 0.4)' },
    other: { color: '#6b7280', colorLight: '#9ca3af', emoji: '📍', shadowColor: 'rgba(107, 114, 128, 0.4)' }
};

// Custom icons for different waypoint types
export const createCustomIcon = (type, isActive = false) => {
    const config = typeConfig[type] || typeConfig.other;
    const scale = isActive ? 1.15 : 1;
    const size = Math.round(32 * scale);
    const fontSize = Math.round(15 * scale);

    return L.divIcon({
        className: `custom-waypoint-marker ${isActive ? 'waypoint-active' : ''}`,
        html: `
            <div style="
                position: relative;
                width: ${size}px;
                height: ${size + 8}px;
            ">
                ${isActive ? `
                    <div class="pulse-ring" style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: ${size + 16}px;
                        height: ${size + 16}px;
                        transform: translate(-50%, -50%);
                        border-radius: 50%;
                        background: ${config.shadowColor};
                    "></div>
                ` : ''}
                <div class="marker-body" style="
                    position: relative;
                    z-index: 2;
                    background: linear-gradient(135deg, ${config.color}, ${config.colorLight});
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50% 50% 50% 0;
                    border: 3px solid white;
                    transform: rotate(-45deg);
                    box-shadow: 0 4px 12px ${config.shadowColor}, 0 2px 4px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                ">
                    <span style="
                        transform: rotate(45deg);
                        font-size: ${fontSize}px;
                        line-height: 1;
                        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
                    ">${config.emoji}</span>
                </div>
            </div>
        `,
        iconSize: [size, size + 8],
        iconAnchor: [size / 2, size + 4],
        popupAnchor: [0, -size]
    });
};

// Enhanced campus marker icon with label
export const campusIcon = L.divIcon({
    className: 'campus-marker',
    html: `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        ">
            <div style="
                background-color: #dc2626;
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: 4px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                margin-bottom: 2px;
            ">🏫</div>
            <div style="
                background-color: rgba(220, 38, 38, 0.95);
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-family: 'Albert Sans', sans-serif;
                font-size: 12px;
                font-weight: bold;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                border: 2px solid white;
            ">TMU Campus</div>
        </div>
    `,
    iconSize: [60, 70],
    iconAnchor: [30, 35],
    popupAnchor: [0, -35]
});

// Student Learning Centre (SLC) marker icon
export const slcIcon = L.divIcon({
    className: 'slc-marker',
    html: `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        ">
            <div style="
                background-color: #2563eb;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 3px 6px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                margin-bottom: 2px;
            ">📚</div>
            <div style="
                background-color: rgba(37, 99, 235, 0.95);
                color: white;
                padding: 3px 6px;
                border-radius: 10px;
                font-family: 'Albert Sans', sans-serif;
                font-size: 11px;
                font-weight: bold;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                border: 2px solid white;
            ">SLC</div>
        </div>
    `,
    iconSize: [55, 60],
    iconAnchor: [27, 30],
    popupAnchor: [0, -30]
});

// Search-result "create waypoint here" marker — pulsing green "+" pin
export const searchCreateIcon = L.divIcon({
    className: 'search-create-marker',
    html: `
        <div style="
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <!-- Pulse ring -->
            <div class="search-create-ring"></div>
            <!-- Inner circle with + -->
            <div style="
                position: relative;
                z-index: 2;
                background-color: #22c55e;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 3px 8px rgba(0,0,0,0.45);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
                font-weight: 700;
                color: white;
                cursor: pointer;
                line-height: 1;
            ">+</div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22]
});