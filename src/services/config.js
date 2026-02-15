// Configuration - dynamic URLs based on environment
const getBackendUrl = () => {
    // Use environment variable if set
    if (import.meta.env.VITE_API_URL) {
        console.log('🔧 Using VITE_API_URL from env:', import.meta.env.VITE_API_URL);
        return import.meta.env.VITE_API_URL;
    }
    
    // Check if we're on Vercel production
    const hostname = window.location.hostname;
    console.log('🔍 Current hostname:', hostname);
    
    if (hostname.includes('.vercel.app')) {
        // On Vercel - use Railway backend URL
        const railwayUrl = 'https://web-production-b77b8.up.railway.app';
        console.log('✅ Detected Vercel domain, using Railway backend:', railwayUrl);
        return railwayUrl;
    }
    
    // Check if we're accessing via local network IP (192.168.x.x, 10.x.x.x, etc.)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        const isLocalIP = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname);
        if (isLocalIP) {
            // Local network development - use same host with backend port
            const localUrl = `${window.location.protocol}//${hostname}:5001`;
            console.log('✅ Detected local network IP, using:', localUrl);
            return localUrl;
        }
    }
    
    // Default to localhost:5001 for development
    console.log('✅ Using localhost development backend');
    return 'http://localhost:5001';
};

export const API_BASE_URL = getBackendUrl();
export const SOCKET_URL = getBackendUrl();

console.log('📡 Socket.io will connect to:', SOCKET_URL);

// Export as default for easy importing
export default {
  API_BASE_URL,
  SOCKET_URL
};