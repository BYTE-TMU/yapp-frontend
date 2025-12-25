# API Integration Guide

## Overview

The Yap frontend communicates with the backend API for data operations and uses Socket.IO for real-time messaging. This document explains how API integration works, available endpoints, authentication patterns, and error handling strategies.

## API Configuration

### Dynamic Backend URL Detection

The frontend automatically detects the backend URL based on the environment using `src/services/config.js`:

```javascript
const getBackendUrl = () => {
    // 1. Check environment variable first (highest priority)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // 2. Network access detection (for mobile testing)
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
        return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    
    // 3. Default to localhost for development
    return 'http://localhost:5000';
};

export const API_BASE_URL = getBackendUrl();
export const SOCKET_URL = getBackendUrl();
```

### Environment Configuration

Create `.env` file in project root:

```bash
# Development
VITE_API_URL=http://localhost:5000

# Production
VITE_API_URL=https://yap-backend.up.railway.app
```

**Note:** Vite requires `VITE_` prefix for environment variables to be exposed to the client.

## Authentication System

### Token-Based Authentication

The application uses JWT (JSON Web Token) for authentication:

**1. Login Flow:**
```javascript
// User submits credentials
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const data = await response.json();

// Store token in localStorage
localStorage.setItem('token', data.token);
```

**2. Token Structure:**
```javascript
// JWT token format: header.payload.signature
// Decode payload to extract user information
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));

// Payload contains:
{
  userId: "user_id",
  email: "user@example.com",
  username: "username",
  exp: 1234567890  // Expiration timestamp
}
```

**3. Authenticated API Requests:**
```javascript
const token = localStorage.getItem('token');

const response = await fetch(`${API_BASE_URL}/endpoint`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Protected Routes

The `PrivateRoute` component in `AuthRoutes.jsx` validates tokens before rendering protected pages:

```javascript
function PrivateRoute({ element }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Check token expiration
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
  
  return element;
}
```

## API Endpoints

### Authentication Endpoints

**POST /auth/login**
- **Purpose:** User login
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "token": "jwt_token_string",
    "user": {
      "id": "user_id",
      "username": "username",
      "email": "email@example.com"
    }
  }
  ```
- **Error Response (403 - Email Not Verified):**
  ```json
  {
    "requires_verification": true,
    "username": "username",
    "error": "Email not verified"
  }
  ```
- **Error Response (401 - Invalid Credentials):**
  ```json
  {
    "error": "Invalid credentials"
  }
  ```

**POST /auth/register**
- **Purpose:** User registration
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "program": "string"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "message": "User created successfully. Please verify your email.",
    "userId": "user_id"
  }
  ```

**POST /auth/forgot-password**
- **Purpose:** Request password reset
- **Request Body:**
  ```json
  {
    "email": "email@example.com"
  }
  ```

**POST /auth/reset-password**
- **Purpose:** Complete password reset
- **Request Body:**
  ```json
  {
    "token": "reset_token",
    "new_password": "new_password"
  }
  ```

### User Endpoints

**GET /users/search?q={query}**
- **Purpose:** Search users by username or email
- **Authentication:** Required
- **Query Parameters:**
  - `q` - Search query string
- **Response:**
  ```json
  [
    {
      "id": "user_id",
      "username": "username",
      "email": "email",
      "profile_picture": "url",
      "program": "program_name"
    }
  ]
  ```

**GET /users/{userId}**
- **Purpose:** Get user profile data
- **Authentication:** Required
- **Response:**
  ```json
  {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "profile_picture": "url",
    "bio": "user bio",
    "program": "program_name",
    "followers_count": 0,
    "following_count": 0,
    "posts_count": 0
  }
  ```

**PUT /users/profile**
- **Purpose:** Update user profile
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "bio": "updated bio",
    "program": "program_name"
  }
  ```

**POST /users/profile-picture**
- **Purpose:** Upload profile picture
- **Authentication:** Required
- **Request:** `multipart/form-data` with `profile_picture` field
- **Response:**
  ```json
  {
    "profile_picture": "s3_url_or_path"
  }
  ```

### Post Endpoints

**GET /posts/feed?page={page}&limit={limit}**
- **Purpose:** Get recent posts feed (public)
- **Query Parameters:**
  - `page` - Page number (default: 1)
  - `limit` - Posts per page (default: 20)
- **Response:**
  ```json
  {
    "posts": [
      {
        "id": "post_id",
        "user_id": "user_id",
        "content": "post content",
        "image_url": "url",
        "likes_count": 0,
        "comments_count": 0,
        "created_at": "ISO_timestamp",
        "user": {
          "username": "username",
          "profile_picture": "url"
        }
      }
    ],
    "has_more": true
  }
  ```

**GET /posts/following-feed?page={page}&limit={limit}**
- **Purpose:** Get posts from followed users
- **Authentication:** Required
- **Same response format as /posts/feed**

**POST /posts**
- **Purpose:** Create new post
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "content": "post content",
    "image_url": "optional_image_url"
  }
  ```

**POST /posts/{postId}/like**
- **Purpose:** Like/unlike a post
- **Authentication:** Required
- **Response:**
  ```json
  {
    "liked": true,
    "likes_count": 1
  }
  ```

**GET /posts/{postId}/comments**
- **Purpose:** Get post comments
- **Authentication:** Required

**POST /posts/{postId}/comments**
- **Purpose:** Add comment to post
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "content": "comment text"
  }
  ```

### Event Endpoints

**GET /events**
- **Purpose:** Get all events
- **Authentication:** Required
- **Response:**
  ```json
  [
    {
      "id": "event_id",
      "title": "event title",
      "description": "description",
      "location": "location",
      "start_time": "ISO_timestamp",
      "end_time": "ISO_timestamp",
      "organizer_id": "user_id",
      "attendees_count": 0
    }
  ]
  ```

**POST /events**
- **Purpose:** Create new event
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "location": "string",
    "latitude": 0.0,
    "longitude": 0.0,
    "start_time": "ISO_timestamp",
    "end_time": "ISO_timestamp"
  }
  ```

**POST /events/{eventId}/attend**
- **Purpose:** RSVP to event
- **Authentication:** Required

**GET /events/{eventId}/threads**
- **Purpose:** Get event discussion threads
- **Authentication:** Required

### Message Endpoints

**GET /messages/conversations**
- **Purpose:** Get user's message conversations
- **Authentication:** Required
- **Response:**
  ```json
  [
    {
      "conversation_id": "id",
      "other_user": {
        "id": "user_id",
        "username": "username",
        "profile_picture": "url"
      },
      "last_message": {
        "content": "message text",
        "created_at": "ISO_timestamp"
      },
      "unread_count": 0
    }
  ]
  ```

**GET /messages/{userId}**
- **Purpose:** Get messages with specific user
- **Authentication:** Required

**POST /messages**
- **Purpose:** Send message (typically handled via Socket.IO)
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "recipient_id": "user_id",
    "content": "message text"
  }
  ```

### Waypoint Endpoints

**GET /waypoints**
- **Purpose:** Get all waypoints (campus locations)
- **Authentication:** Required
- **Response:**
  ```json
  [
    {
      "id": "waypoint_id",
      "name": "location name",
      "description": "description",
      "latitude": 0.0,
      "longitude": 0.0,
      "category": "study|dining|event|other",
      "created_by": "user_id"
    }
  ]
  ```

**POST /waypoints**
- **Purpose:** Create new waypoint
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "latitude": 0.0,
    "longitude": 0.0,
    "category": "string"
  }
  ```

**POST /waypoints/{waypointId}/save**
- **Purpose:** Save waypoint to user's favorites
- **Authentication:** Required

### Follow System Endpoints

**POST /users/{userId}/follow**
- **Purpose:** Follow/unfollow a user
- **Authentication:** Required
- **Response:**
  ```json
  {
    "following": true
  }
  ```

**GET /users/{userId}/followers**
- **Purpose:** Get user's followers list
- **Authentication:** Required

**GET /users/{userId}/following**
- **Purpose:** Get users that user follows
- **Authentication:** Required

## Real-Time Communication (Socket.IO)

### Connection Management

The `messageService` handles Socket.IO connections in `src/services/messageService.js`:

```javascript
import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';

class MessageService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    const token = localStorage.getItem('token');
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export default new MessageService();
```

### Socket Events

**Client → Server Events:**

1. **send_message**
   ```javascript
   messageService.emit('send_message', {
     recipient_id: 'user_id',
     content: 'message text'
   });
   ```

2. **typing_start**
   ```javascript
   messageService.emit('typing_start', {
     recipient_id: 'user_id'
   });
   ```

3. **typing_stop**
   ```javascript
   messageService.emit('typing_stop', {
     recipient_id: 'user_id'
   });
   ```

4. **mark_as_read**
   ```javascript
   messageService.emit('mark_as_read', {
     message_id: 'message_id'
   });
   ```

**Server → Client Events:**

1. **new_message**
   ```javascript
   messageService.on('new_message', (message) => {
     console.log('Received message:', message);
     // message structure:
     {
       id: 'message_id',
       sender_id: 'user_id',
       recipient_id: 'user_id',
       content: 'message text',
       created_at: 'ISO_timestamp',
       sender: {
         username: 'username',
         profile_picture: 'url'
       }
     }
   });
   ```

2. **user_typing**
   ```javascript
   messageService.on('user_typing', (data) => {
     console.log('User typing:', data);
     // data: { user_id: 'user_id', username: 'username' }
   });
   ```

3. **user_stopped_typing**
   ```javascript
   messageService.on('user_stopped_typing', (data) => {
     console.log('User stopped typing:', data);
   });
   ```

4. **message_read**
   ```javascript
   messageService.on('message_read', (data) => {
     // data: { message_id: 'message_id', read_at: 'ISO_timestamp' }
   });
   ```

### Component Integration Example

```javascript
import { useEffect, useState } from 'react';
import messageService from '../../services/messageService';

function MessageChat({ recipientId }) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    // Connect on mount
    messageService.connect();

    // Register listeners
    messageService.on('new_message', handleNewMessage);
    messageService.on('user_typing', handleUserTyping);
    messageService.on('user_stopped_typing', handleStoppedTyping);

    // Cleanup on unmount
    return () => {
      messageService.off('new_message', handleNewMessage);
      messageService.off('user_typing', handleUserTyping);
      messageService.off('user_stopped_typing', handleStoppedTyping);
    };
  }, []);

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleUserTyping = (data) => {
    if (data.user_id === recipientId) {
      setTyping(true);
    }
  };

  const handleStoppedTyping = (data) => {
    if (data.user_id === recipientId) {
      setTyping(false);
    }
  };

  const sendMessage = (content) => {
    messageService.emit('send_message', {
      recipient_id: recipientId,
      content
    });
  };

  return (
    <div>
      {/* Message display */}
      {typing && <div>User is typing...</div>}
    </div>
  );
}
```

## Error Handling

### HTTP Error Handling Pattern

```javascript
async function fetchData() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/endpoint`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Check HTTP status
    if (!response.ok) {
      // Handle specific status codes
      if (response.status === 401) {
        // Unauthorized - invalid/expired token
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden');
      }
      
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      
      throw new Error('Request failed');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('API Error:', error);
    
    // Network error (server unreachable)
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    
    throw error;
  }
}
```

### Component-Level Error Handling

```javascript
function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} />;
}
```

### Socket.IO Error Handling

```javascript
messageService.socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  // Handle connection failure (e.g., show offline indicator)
});

messageService.socket.on('error', (error) => {
  console.error('Socket error:', error);
  // Handle general socket errors
});
```

## File Upload Pattern

### Image Upload Example

```javascript
async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append('profile_picture', file);

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Do NOT set Content-Type for FormData - browser sets it automatically
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.profile_picture; // Returns URL

  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Usage in component
function ProfileEdit() {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    // Validate file
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('File too large');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select an image');
      return;
    }

    try {
      const url = await uploadProfilePicture(file);
      console.log('Uploaded successfully:', url);
      // Update UI with new profile picture
    } catch (error) {
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <input 
      type="file" 
      accept="image/*" 
      onChange={handleFileChange} 
    />
  );
}
```

## API Best Practices

### 1. Always Use API_BASE_URL from Config
```javascript
// ✅ Good
import { API_BASE_URL } from '../../services/config';
const response = await fetch(`${API_BASE_URL}/posts`);

// ❌ Bad - Hardcoded URL
const response = await fetch('http://localhost:5000/posts');
```

### 2. Include Authentication Header
```javascript
// ✅ Good - Always include token for protected endpoints
const token = localStorage.getItem('token');
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. Handle Loading and Error States
```javascript
// ✅ Good - Comprehensive state management
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Always update states appropriately
setLoading(true);
try {
  const data = await fetchData();
  setData(data);
  setError(null);
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

### 4. Cleanup Socket Listeners
```javascript
// ✅ Good - Always cleanup in useEffect
useEffect(() => {
  const handler = (data) => console.log(data);
  messageService.on('event', handler);

  return () => {
    messageService.off('event', handler);
  };
}, []);
```

### 5. Validate Responses
```javascript
// ✅ Good - Check response structure
const data = await response.json();
if (!data || !data.posts) {
  throw new Error('Invalid response format');
}
```

## Common Integration Patterns

### Infinite Scroll Pattern
```javascript
function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    const newPosts = await fetch(
      `${API_BASE_URL}/posts/feed?page=${page}&limit=20`
    ).then(r => r.json());

    setPosts(prev => [...prev, ...newPosts.posts]);
    setHasMore(newPosts.has_more);
    setPage(prev => prev + 1);
  };

  // Attach to scroll event or use IntersectionObserver
}
```

### Debounced Search Pattern
```javascript
function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const data = await fetch(
        `${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`
      ).then(r => r.json());
      
      setResults(data);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <input 
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

## Troubleshooting

### Issue: CORS Errors
**Solution:** Ensure backend has proper CORS configuration allowing the frontend origin.

### Issue: 401 Unauthorized Errors
**Solution:** Check that token exists in localStorage and hasn't expired. Token expires after backend-configured duration.

### Issue: Socket Connection Failures
**Solution:** Verify backend WebSocket server is running, SOCKET_URL is correct, and authentication token is valid.

### Issue: Requests Timing Out
**Solution:** Check network connection, verify backend is running, and check backend logs for errors.

## Security Considerations

1. **Token Storage:** Currently uses localStorage (vulnerable to XSS). Consider httpOnly cookies for production.
2. **Token Expiration:** Check token expiration before API calls to avoid unnecessary failed requests.
3. **Input Validation:** Always validate user input before sending to API.
4. **HTTPS:** Use HTTPS in production to prevent man-in-the-middle attacks.
5. **Environment Variables:** Never commit `.env` file with sensitive data.

## Conclusion

This integration guide covers the core patterns used throughout the Yap frontend for API communication. All components should follow these patterns for consistency and maintainability. When adding new API integrations, refer to existing implementations and maintain the established patterns.
