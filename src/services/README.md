# Services

## Overview

This folder contains service classes and configuration files that handle external integrations including API configuration and Socket.IO-based real-time messaging. Services abstract complex third-party interactions, providing clean interfaces for components to use.

## Files

### config.js

**Purpose:** Centralized API and WebSocket URL configuration with environment-aware detection

**Functionality:**

The config automatically determines the backend URL based on the environment:

1. **Environment Variable (Highest Priority):**
   ```javascript
   VITE_API_URL=https://yap-backend.up.railway.app
   ```

2. **Network IP Detection:**
   - If accessing via network IP (not localhost), constructs URL using same hostname with port 5000
   - Useful for mobile testing on local network

3. **Default Localhost:**
   - Falls back to `http://localhost:5000` for local development

**Exports:**
```javascript
export const API_BASE_URL = getBackendUrl();
export const SOCKET_URL = getBackendUrl();

export default {
  API_BASE_URL,
  SOCKET_URL
};
```

**Usage:**
```javascript
import { API_BASE_URL } from '../../services/config';

const response = await fetch(`${API_BASE_URL}/posts`);
```

**Why Separate SOCKET_URL:**
While currently using the same URL, Socket.IO could be hosted separately in the future for scalability.

---

### messageService.js (677 lines)

**Purpose:** Singleton service managing Socket.IO WebSocket connection for real-time messaging

This is the most complex service in the application, handling all real-time communication between clients.

## MessageService Architecture

### Singleton Pattern

Only one instance of messageService exists throughout the app:

```javascript
class MessageService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }
}

export default new MessageService();  // Singleton instance
```

### Connection Management

**connect() Method:**
- Establishes Socket.IO connection to backend
- Includes JWT token for authentication
- Sets up reconnection logic
- Registers connection event handlers

```javascript
connect() {
  const token = localStorage.getItem('token');
  
  this.socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000
  });

  this.socket.on('connect', () => {
    this.isConnected = true;
    console.log('Socket connected:', this.socket.id);
  });

  this.socket.on('disconnect', (reason) => {
    this.isConnected = false;
    console.log('Socket disconnected:', reason);
  });
}
```

**forceReconnect() Method:**
- Disconnects existing connection
- Clears all event listeners
- Establishes new connection with updated token
- Critical after login to ensure correct user context

```javascript
forceReconnect() {
  if (this.socket) {
    this.socket.disconnect();
    this.socket.removeAllListeners();
  }
  this.listeners.clear();
  this.connect();
}
```

**disconnect() Method:**
- Cleanly closes Socket.IO connection
- Clears all listeners
- Called on logout or component unmount

### Event System

**on(event, callback) Method:**
- Registers event listener
- Stores callback in Map for cleanup
- Supports multiple listeners per event

```javascript
on(event, callback) {
  if (!this.socket) return;
  
  // Store for cleanup
  if (!this.listeners.has(event)) {
    this.listeners.set(event, []);
  }
  this.listeners.get(event).push(callback);
  
  // Register with socket
  this.socket.on(event, callback);
}
```

**off(event, callback) Method:**
- Removes specific event listener
- Cleans up from tracking Map
- Prevents memory leaks

```javascript
off(event, callback) {
  if (!this.socket) return;
  
  this.socket.off(event, callback);
  
  // Remove from tracking
  const callbacks = this.listeners.get(event);
  if (callbacks) {
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }
}
```

**emit(event, data) Method:**
- Sends events to server
- Queues if not connected

```javascript
emit(event, data) {
  if (this.socket && this.isConnected) {
    this.socket.emit(event, data);
  } else {
    console.warn('Socket not connected. Event queued:', event);
  }
}
```

## Socket.IO Events

### Client → Server (Emit)

**send_message:**
```javascript
messageService.emit('send_message', {
  recipient_id: 'user_id',
  content: 'Message text',
  attachment: 'optional_url'
});
```

**typing_start:**
```javascript
messageService.emit('typing_start', {
  recipient_id: 'user_id'
});
```

**typing_stop:**
```javascript
messageService.emit('typing_stop', {
  recipient_id: 'user_id'
});
```

**mark_as_read:**
```javascript
messageService.emit('mark_as_read', {
  message_id: 'message_id'
});
```

### Server → Client (Listen)

**new_message:**
```javascript
messageService.on('new_message', (message) => {
  // message structure:
  {
    id: 'message_id',
    sender_id: 'user_id',
    recipient_id: 'user_id',
    content: 'text',
    created_at: 'ISO_timestamp',
    sender: {
      username: 'username',
      profile_picture: 'url'
    }
  }
});
```

**user_typing:**
```javascript
messageService.on('user_typing', (data) => {
  // { user_id: 'id', username: 'name' }
});
```

**user_stopped_typing:**
```javascript
messageService.on('user_stopped_typing', (data) => {
  // { user_id: 'id' }
});
```

**message_read:**
```javascript
messageService.on('message_read', (data) => {
  // { message_id: 'id', read_at: 'timestamp' }
});
```

**connect_error:**
```javascript
messageService.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

## Component Integration

### Messages Page Setup

```javascript
import messageService from '../../services/messageService';

function Messages() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    // Connect on mount
    messageService.connect();

    // Register listeners
    const handleNewMessage = (message) => {
      // Update conversations list
      setConversations(prev => {
        // Update logic
      });
    };

    messageService.on('new_message', handleNewMessage);

    // Cleanup on unmount
    return () => {
      messageService.off('new_message', handleNewMessage);
      messageService.disconnect();
    };
  }, []);

  return <div>{/* UI */}</div>;
}
```

### Chat Component Setup

```javascript
function MessageChat({ recipientId }) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    // Fetch existing messages via API
    fetchMessages(recipientId);

    // Listen for new messages
    const handleNewMessage = (message) => {
      if (message.sender_id === recipientId || message.recipient_id === recipientId) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleTyping = (data) => {
      if (data.user_id === recipientId) {
        setTyping(true);
        // Clear after timeout
        setTimeout(() => setTyping(false), 3000);
      }
    };

    messageService.on('new_message', handleNewMessage);
    messageService.on('user_typing', handleTyping);

    return () => {
      messageService.off('new_message', handleNewMessage);
      messageService.off('user_typing', handleTyping);
    };
  }, [recipientId]);

  const sendMessage = (content) => {
    messageService.emit('send_message', {
      recipient_id: recipientId,
      content
    });
  };

  const handleTyping = () => {
    messageService.emit('typing_start', {
      recipient_id: recipientId
    });

    // Stop typing after 3 seconds
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      messageService.emit('typing_stop', {
        recipient_id: recipientId
      });
    }, 3000);
  };

  return (
    <div>
      <MessageList messages={messages} />
      {typing && <TypingIndicator />}
      <MessageInput onSend={sendMessage} onTyping={handleTyping} />
    </div>
  );
}
```

## Connection Lifecycle

### Application Startup

1. User logs in → Token stored in localStorage
2. Navigate to home or messages page
3. Component calls `messageService.connect()`
4. Socket establishes connection with token auth
5. Server validates token and associates socket with user
6. Connection successful → `isConnected = true`

### During Usage

1. User sends message → `emit('send_message')`
2. Server receives, processes, and broadcasts
3. Recipient receives via `'new_message'` event
4. UI updates in real-time

### Connection Loss

1. Network interruption detected
2. Socket.IO automatically attempts reconnection
3. Reconnects with exponential backoff (1s, 2s, 4s...)
4. Up to 5 reconnection attempts
5. On success, resumes normal operation
6. If all attempts fail, shows offline indicator

### Logout

1. User clicks logout
2. Call `messageService.disconnect()`
3. Socket connection closed gracefully
4. All listeners removed
5. Token removed from localStorage

## Error Handling

### Connection Errors

```javascript
messageService.on('connect_error', (error) => {
  console.error('Socket connection failed:', error);
  // Show user notification
  showNotification('Unable to connect to messaging service');
});
```

### Reconnection Handling

```javascript
messageService.socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  // Refresh messages or conversations
});

messageService.socket.on('reconnect_failed', () => {
  console.error('Failed to reconnect after maximum attempts');
  // Show error to user, suggest refresh
});
```

## Best Practices

### 1. Always Cleanup Listeners

```javascript
// ✅ Good
useEffect(() => {
  const handler = (data) => console.log(data);
  messageService.on('event', handler);
  
  return () => {
    messageService.off('event', handler);
  };
}, []);

// ❌ Bad - Memory leak
useEffect(() => {
  messageService.on('event', (data) => console.log(data));
}, []);
```

### 2. Use Named Functions for Handlers

```javascript
// ✅ Good - Can be removed later
const handleNewMessage = (message) => {
  setMessages(prev => [...prev, message]);
};

messageService.on('new_message', handleNewMessage);
// Later: messageService.off('new_message', handleNewMessage);

// ❌ Bad - Anonymous function can't be removed
messageService.on('new_message', (message) => {
  setMessages(prev => [...prev, message]);
});
```

### 3. Check Connection Before Emitting

```javascript
// ✅ Good
if (messageService.isConnected) {
  messageService.emit('send_message', data);
} else {
  // Queue or show error
  console.warn('Not connected, message not sent');
}
```

### 4. Handle Reconnection in Components

```javascript
useEffect(() => {
  const handleReconnect = () => {
    // Refresh data after reconnection
    fetchMessages();
  };

  messageService.socket?.on('reconnect', handleReconnect);

  return () => {
    messageService.socket?.off('reconnect', handleReconnect);
  };
}, []);
```

## Debugging

### Enable Debug Logging

Socket.IO provides debug logs via localStorage:

```javascript
// In browser console:
localStorage.setItem('debug', 'socket.io-client:*');
// Reload page to see detailed connection logs
```

### RealtimeDebugger Component

The codebase includes a `RealtimeDebugger.jsx` component for development:

```jsx
import RealtimeDebugger from './messages/RealtimeDebugger';

function App() {
  return (
    <>
      {process.env.NODE_ENV === 'development' && <RealtimeDebugger />}
      {/* Rest of app */}
    </>
  );
}
```

Shows:
- Connection status
- Recent events
- Emit history
- Error logs

## Performance Considerations

### Event Listener Optimization

- Remove listeners when components unmount
- Use specific event handlers, not catch-all listeners
- Debounce high-frequency events (typing indicators)

### Message Batching

Consider batching message updates for high-volume scenarios:

```javascript
let messageBuffer = [];
let bufferTimeout;

const handleNewMessage = (message) => {
  messageBuffer.push(message);
  
  clearTimeout(bufferTimeout);
  bufferTimeout = setTimeout(() => {
    setMessages(prev => [...prev, ...messageBuffer]);
    messageBuffer = [];
  }, 100);
};
```

## Security

### Token Authentication

- Token included in Socket.IO auth handshake
- Server validates token before accepting connection
- Invalid tokens rejected with error

### Message Validation

- Server validates sender ID matches authenticated user
- Client never trusts client-provided sender info
- All messages validated server-side

## Future Enhancements

1. **Presence System:** Online/offline user status
2. **Read Receipts:** Track when messages are read
3. **Message Reactions:** Like/react to messages
4. **File Upload:** Send images/files via Socket.IO
5. **Group Messaging:** Multi-user conversations
6. **Voice/Video:** WebRTC integration
7. **Push Notifications:** Desktop/mobile notifications
8. **Message Encryption:** End-to-end encryption

## Related Documentation

- [API_INTEGRATION.md](/API_INTEGRATION.md) - Socket.IO event details
- [src/components/messages/](/src/components/messages/) - Message components
- [ARCHITECTURE.md](/ARCHITECTURE.md) - Real-time architecture overview
