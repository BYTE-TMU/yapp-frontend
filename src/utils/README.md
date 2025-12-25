# Utility Functions

## Overview

This folder contains reusable utility functions that provide common functionality across the application. Utilities are pure functions (no side effects) that transform data, format values, or provide helper logic used by multiple components.

## Files

### dateTimeUtils.js (144 lines)

**Purpose:** Date and time formatting utilities for consistent datetime display across the application

**Key Principle:** All datetime utilities work with **local time without timezone conversion**. The application displays times "as-is" without adjusting for timezones, which is appropriate for a campus-focused app where all users are in the same timezone (Toronto).

#### Functions

**formatMessageTime(timestamp)**
- **Purpose:** Format message timestamps in chat interfaces
- **Returns:** Time string in format "HH:MM AM/PM"
- **Example:**
  ```javascript
  formatMessageTime('2024-01-15T14:30:00')
  // Returns: "2:30 PM"
  ```

**formatPostTime(timestamp)**
- **Purpose:** Format post creation times with relative or absolute time
- **Returns:** 
  - "Just now" (< 1 minute)
  - "X minutes ago" (< 60 minutes)
  - "X hours ago" (< 24 hours)
  - "Yesterday at HH:MM AM/PM" (yesterday)
  - "MMM DD at HH:MM AM/PM" (this year)
  - "MMM DD, YYYY at HH:MM AM/PM" (previous years)
- **Example:**
  ```javascript
  formatPostTime('2024-01-15T14:30:00')
  // If current time is 2024-01-15T14:35:00
  // Returns: "5 minutes ago"
  
  formatPostTime('2024-01-14T14:30:00')
  // If viewed on 2024-01-15
  // Returns: "Yesterday at 2:30 PM"
  ```

**formatEventTime(startTime, endTime)**
- **Purpose:** Format event time ranges for event cards
- **Returns:** Formatted time range
- **Example:**
  ```javascript
  formatEventTime('2024-01-15T14:00:00', '2024-01-15T16:00:00')
  // Returns: "Jan 15, 2024 • 2:00 PM - 4:00 PM"
  ```

**formatFullDateTime(timestamp)**
- **Purpose:** Full datetime display for detailed views
- **Returns:** "MMMM DD, YYYY at HH:MM AM/PM"
- **Example:**
  ```javascript
  formatFullDateTime('2024-01-15T14:30:00')
  // Returns: "January 15, 2024 at 2:30 PM"
  ```

**isToday(timestamp)**
- **Purpose:** Check if timestamp is today
- **Returns:** Boolean
- **Example:**
  ```javascript
  isToday('2024-01-15T14:30:00')
  // If today is 2024-01-15, returns: true
  ```

**isYesterday(timestamp)**
- **Purpose:** Check if timestamp was yesterday
- **Returns:** Boolean

**parseLocalDateTime(datetimeString)**
- **Purpose:** Parse datetime string without timezone conversion
- **Note:** Critical function that ensures times are treated as local, not UTC
- **Example:**
  ```javascript
  parseLocalDateTime('2024-01-15T14:30:00')
  // Returns: Date object representing exactly 2:30 PM (no timezone shift)
  ```

#### Usage Examples

**In Message Components:**
```javascript
import { formatMessageTime } from '../../utils/dateTimeUtils';

function MessageBubble({ message }) {
  return (
    <div>
      <p>{message.content}</p>
      <span className="text-xs text-gray-500">
        {formatMessageTime(message.created_at)}
      </span>
    </div>
  );
}
```

**In Post Components:**
```javascript
import { formatPostTime } from '../../../utils/dateTimeUtils';

function PostItem({ post }) {
  return (
    <div>
      <p>{post.content}</p>
      <span className="text-sm text-gray-600">
        {formatPostTime(post.created_at)}
      </span>
    </div>
  );
}
```

**In Event Components:**
```javascript
import { formatEventTime, formatFullDateTime } from '../../../utils/dateTimeUtils';

function EventCard({ event }) {
  return (
    <div>
      <h3>{event.title}</h3>
      <p>{formatEventTime(event.start_time, event.end_time)}</p>
      <p className="text-xs">
        Full details: {formatFullDateTime(event.start_time)}
      </p>
    </div>
  );
}
```

#### Important Notes

1. **No Timezone Conversion:** Functions use `parseLocalDateTime()` to prevent unwanted timezone shifts
2. **Consistent Format:** All functions use same date parsing approach
3. **Relative Times:** Recent times shown as "X ago" for better UX
4. **12-Hour Format:** Uses AM/PM notation
5. **Month Abbreviations:** Three-letter month names (Jan, Feb, etc.)

---

### profileUtils.js

**Purpose:** Profile picture URL generation and default avatar handling

#### Functions

**getProfilePictureUrl(user)**
- **Purpose:** Generate full URL for user profile pictures with fallback to default
- **Parameters:** 
  - `user` - User object with optional `profile_picture` field
- **Returns:** Full URL string
- **Handles:**
  - S3 URLs (full URLs)
  - Relative paths (appends to API_BASE_URL)
  - Null/undefined (returns default SVG avatar)
  - Empty strings (returns default avatar)

**Example:**
```javascript
import { getProfilePictureUrl } from '../../utils/profileUtils';

function UserCard({ user }) {
  const profilePicUrl = getProfilePictureUrl(user);
  
  return (
    <img 
      src={profilePicUrl}
      alt={`${user.username}'s profile`}
      className="w-12 h-12 rounded-full"
    />
  );
}
```

#### Profile Picture URL Logic

```javascript
function getProfilePictureUrl(user) {
  const profilePic = user?.profile_picture;
  
  // No picture set - use default
  if (!profilePic) {
    return 'data:image/svg+xml,...'; // Default avatar SVG
  }
  
  // Full URL (S3 or external)
  if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
    return profilePic;
  }
  
  // Relative path - prepend API base URL
  return `${API_BASE_URL}${profilePic}`;
}
```

#### Default Avatar SVG

The default avatar is an inline SVG data URI showing a user icon:
- Neutral gray color
- Circular background
- User silhouette icon
- Optimized inline SVG (no external request)

#### Usage Patterns

**Profile Display:**
```javascript
<img 
  src={getProfilePictureUrl(user)}
  alt="Profile"
  onError={(e) => {
    e.target.src = 'data:image/svg+xml,...'; // Fallback on load error
  }}
/>
```

**Conversation Lists:**
```javascript
function ConversationItem({ conversation }) {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={getProfilePictureUrl(conversation.other_user)}
        className="w-10 h-10 rounded-full object-cover"
      />
      <span>{conversation.other_user.username}</span>
    </div>
  );
}
```

**Message Bubbles:**
```javascript
function MessageBubble({ message }) {
  return (
    <div className="flex gap-2">
      <img 
        src={getProfilePictureUrl(message.sender)}
        className="w-8 h-8 rounded-full"
      />
      <div>{message.content}</div>
    </div>
  );
}
```

#### Image Loading Best Practices

1. **Always provide alt text** for accessibility
2. **Use object-cover** for consistent aspect ratios
3. **Add onError handler** for graceful fallback
4. **Consider lazy loading** for long lists
5. **Cache profile pictures** (browser cache handles this automatically)

**Enhanced Image Component:**
```javascript
function ProfileImage({ user, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  };

  return (
    <img 
      src={getProfilePictureUrl(user)}
      alt={`${user.username}'s profile picture`}
      className={`${sizeClasses[size]} rounded-full object-cover bg-gray-200`}
      loading="lazy"
      onError={(e) => {
        e.target.src = 'data:image/svg+xml,...';
      }}
    />
  );
}
```

## Adding New Utilities

### Guidelines for New Utility Functions

1. **Pure Functions:** No side effects, same input → same output
2. **Single Responsibility:** Each function does one thing well
3. **Descriptive Names:** Clear, verb-based names
4. **Documentation:** JSDoc comments explaining parameters and return values
5. **Exports:** Named exports for tree-shaking

### Template for New Utility File

```javascript
/**
 * Brief description of utility module
 * @module utils/moduleName
 */

/**
 * Function description
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @example
 * functionName(input)
 * // Returns: output
 */
export function functionName(paramName) {
  // Implementation
  return result;
}

/**
 * Another function description
 * @param {Type} param1 - First parameter
 * @param {Type} param2 - Second parameter
 * @returns {Type} Return value
 */
export function anotherFunction(param1, param2) {
  // Implementation
  return result;
}
```

### Utility Categories to Consider

**String Utilities:**
- Text truncation
- Slug generation
- String validation
- Sanitization

**Number Utilities:**
- Number formatting
- Currency formatting
- Percentage calculations

**Array Utilities:**
- Sorting helpers
- Grouping functions
- Deduplication

**Validation Utilities:**
- Email validation
- URL validation
- TMU email verification
- Username validation

**Storage Utilities:**
- localStorage wrappers
- sessionStorage helpers
- Cookie management

## Testing Utilities

When testing infrastructure is added, utilities should be prioritized for unit testing as they're pure functions:

```javascript
// dateTimeUtils.test.js (future)
import { formatPostTime, isToday } from './dateTimeUtils';

describe('formatPostTime', () => {
  it('shows "Just now" for very recent posts', () => {
    const now = new Date();
    expect(formatPostTime(now.toISOString())).toBe('Just now');
  });

  it('shows minutes ago for recent posts', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatPostTime(fiveMinutesAgo.toISOString())).toBe('5 minutes ago');
  });
});

describe('isToday', () => {
  it('returns true for today\'s date', () => {
    const today = new Date();
    expect(isToday(today.toISOString())).toBe(true);
  });

  it('returns false for yesterday', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isToday(yesterday.toISOString())).toBe(false);
  });
});
```

## Performance Considerations

1. **Memoization:** For expensive calculations, consider memoizing results
2. **Date Parsing:** parseLocalDateTime is called frequently; optimized implementation important
3. **Profile Pictures:** Browser caches URLs automatically, no need for manual caching
4. **Avoid Mutations:** Return new objects/arrays, don't mutate inputs

## Common Patterns

### Formatting User Input

```javascript
// Sanitize and format user input
export function sanitizeUsername(username) {
  return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

// Usage
const clean = sanitizeUsername(userInput);
```

### Safe Property Access

```javascript
// Safe nested property access
export function safeGet(obj, path, defaultValue = null) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
}

// Usage
const email = safeGet(user, 'contact.email', 'no-email@example.com');
```

### Debounce Helper

```javascript
// Debounce function calls
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Usage in component
const debouncedSearch = debounce(searchUsers, 300);
```

## Related Documentation

- [src/components/messages/](/src/components/messages/) - Uses dateTimeUtils and profileUtils extensively
- [src/components/pages/home/](/src/components/pages/home/) - Post time formatting
- [ARCHITECTURE.md](/ARCHITECTURE.md) - Overall code organization principles
