# Authentication Components

## Overview

This folder contains all components related to user authentication including login, registration, email verification, and password reset functionality. The authentication system uses JWT (JSON Web Token) for secure user sessions and includes email verification to ensure valid TMU student accounts.

## Components

### LoginForm.jsx (252 lines)

**Purpose:** Handles user login and authentication

**Key Features:**
- Username/password authentication
- Show/hide password toggle
- Email verification detection and redirect
- Smooth entrance animations
- Loading states during API calls
- Error message display
- Auto-redirect to home page on successful login
- Forces messageService reconnection after login to ensure correct user context

**State Management:**
- `formData` - Username and password inputs
- `msg` - Error/success messages
- `loading` - Submit button loading state
- `showPassword` - Password visibility toggle
- `showVerification` - Controls transition to email verification screen
- `unverifiedUsername` - Username for unverified accounts

**API Integration:**
```javascript
POST ${API_BASE_URL}/auth/login
Body: { username, password }
Success: { token, user }
Special Case (403): { requires_verification: true, username }
```

**Usage Example:**
```jsx
import LoginForm from './components/authentication/LoginForm';

function App() {
  return <LoginForm />;
}
```

**Integration Points:**
- Stores token in `localStorage`
- Forces `messageService` reconnection with new token
- Redirects to `/home` on success
- Shows `EmailVerification` component for unverified users
- Links to `/signup` and `/forgot-password`

---

### RegisterForm.jsx

**Purpose:** User registration for new accounts

**Key Features:**
- Username, email, password, and program selection
- Form validation
- TMU email verification
- Password strength requirements
- Program dropdown (TMU academic programs)
- Automatic redirect to email verification screen

**State Management:**
- `formData` - All registration fields
- `msg` - Success/error messages
- `loading` - Submit state
- `showPassword` - Password visibility
- `showVerification` - Controls email verification flow

**API Integration:**
```javascript
POST ${API_BASE_URL}/auth/register
Body: { username, email, password, program }
Success: { message, userId }
```

**Validation:**
- Username: Required, no special characters
- Email: Must be valid TMU email format
- Password: Minimum 8 characters, complexity requirements
- Program: Required selection from dropdown

---

### EmailVerification.jsx

**Purpose:** Email verification code input and validation

**Key Features:**
- 6-digit verification code input
- Resend verification code functionality
- Countdown timer for resend button (60 seconds)
- Auto-focus on code input
- Visual feedback for verification status

**Props:**
```javascript
{
  username: string,  // Required - Username for verification
  onVerificationSuccess: function,  // Callback after successful verification
  onBackToLogin: function  // Callback to return to login
}
```

**API Integration:**
```javascript
POST ${API_BASE_URL}/auth/verify-email
Body: { username, verification_code }

POST ${API_BASE_URL}/auth/resend-verification
Body: { username }
```

**Usage Example:**
```jsx
<EmailVerification
  username="john_doe"
  onVerificationSuccess={() => navigate('/login')}
  onBackToLogin={() => setShowVerification(false)}
/>
```

---

### ForgotPasswordForm.jsx

**Purpose:** Initiates password reset process

**Key Features:**
- Email input for password reset request
- Sends reset link to user's email
- Success confirmation message
- Link back to login page

**State Management:**
- `email` - User email input
- `msg` - Success/error messages
- `loading` - Submit state
- `sent` - Tracks if email has been sent

**API Integration:**
```javascript
POST ${API_BASE_URL}/auth/forgot-password
Body: { email }
Success: { message: "Reset link sent" }
```

**Flow:**
1. User enters email
2. System sends reset link to email
3. User clicks link in email
4. User is directed to `ResetPasswordForm` with token

---

### ResetPasswordForm.jsx

**Purpose:** Completes password reset with reset token

**Key Features:**
- New password input with confirmation
- Password strength validation
- URL token extraction
- Show/hide password toggles
- Success redirect to login

**State Management:**
- `formData` - New password and confirmation
- `msg` - Messages
- `loading` - Submit state
- `showPassword` / `showConfirmPassword` - Visibility toggles

**API Integration:**
```javascript
POST ${API_BASE_URL}/auth/reset-password
Body: { token, new_password }
```

**URL Pattern:**
```
/reset-password?token=abc123xyz
```

**Validation:**
- New password matches confirmation
- Meets password complexity requirements
- Token is valid and not expired

---

## Authentication Flow

### Complete Login Flow

```
1. User visits /login
   ↓
2. LoginForm component renders
   ↓
3. User enters username + password
   ↓
4. Submit → POST /auth/login
   ↓
5a. Success (200):
    - Store token in localStorage
    - Force messageService reconnection
    - Navigate to /home
    ↓
5b. Email Not Verified (403):
    - Show EmailVerification component
    - User enters verification code
    - POST /auth/verify-email
    - On success: redirect to login
    ↓
5c. Invalid Credentials (401):
    - Show error message
    - Stay on login form
```

### Complete Registration Flow

```
1. User visits /signup
   ↓
2. RegisterForm component renders
   ↓
3. User fills form (username, email, password, program)
   ↓
4. Submit → POST /auth/register
   ↓
5. Success:
   - Show EmailVerification component
   - System sends verification email
   ↓
6. User enters verification code from email
   ↓
7. POST /auth/verify-email
   ↓
8. Success:
   - Redirect to login
   - User can now log in
```

### Password Reset Flow

```
1. User clicks "Forgot Password" on login
   ↓
2. ForgotPasswordForm component renders
   ↓
3. User enters email → POST /auth/forgot-password
   ↓
4. System sends reset email with token link
   ↓
5. User clicks link in email
   ↓
6. Redirects to /reset-password?token=...
   ↓
7. ResetPasswordForm extracts token from URL
   ↓
8. User enters new password
   ↓
9. POST /auth/reset-password with token
   ↓
10. Success: Redirect to login with new password
```

## Token Management

### JWT Token Structure

The JWT token contains encoded user information:

```javascript
// Token format: header.payload.signature
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));

// Payload structure:
{
  userId: "user_id_string",
  email: "user@torontomu.ca",
  username: "username",
  exp: 1234567890  // Unix timestamp expiration
}
```

### Token Storage

Tokens are stored in `localStorage` for persistence across browser sessions:

```javascript
// Store after login
localStorage.setItem('token', data.token);

// Retrieve for API calls
const token = localStorage.getItem('token');

// Remove on logout
localStorage.removeItem('token');
```

### Token Usage in API Calls

All authenticated API requests include the token in the Authorization header:

```javascript
const token = localStorage.getItem('token');

fetch(`${API_BASE_URL}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### MessageService Integration

After successful login, the messageService must reconnect with the new token to ensure proper user identification in real-time messaging:

```javascript
// In LoginForm.jsx after successful login
const { messageService } = await import('../../services/messageService');
messageService.forceReconnect();
```

This prevents issues where messages might be sent with an incorrect sender ID from a previous session.

## Theme Integration

All authentication components are theme-aware and respond to dark/light mode:

```jsx
import { useTheme } from '../../contexts/ThemeContext';

function Component() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
      {/* Content */}
    </div>
  );
}
```

## Styling Patterns

### Consistent Input Styling

```jsx
<input
  className={`w-full px-4 py-3 rounded-lg border transition ${
    isDarkMode
      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  }`}
/>
```

### Button Styling

```jsx
<button
  className={`w-full py-3 rounded-lg font-semibold transition ${
    loading
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-blue-500 hover:bg-blue-600 text-white'
  }`}
  disabled={loading}
>
  {loading ? 'Processing...' : 'Submit'}
</button>
```

### Animation Classes

Entrance animations use Tailwind transition utilities:

```jsx
const [animationClass, setAnimationClass] = useState("translate-y-4 opacity-0");

useEffect(() => {
  setTimeout(() => {
    setAnimationClass("translate-y-0 opacity-100");
  }, 100);
}, []);

return (
  <div className={`transition-all duration-500 ${animationClass}`}>
    {/* Content */}
  </div>
);
```

## Error Handling

### Common Error Scenarios

1. **Invalid Credentials (401)**
   - Display: "Invalid username or password"
   - Action: Allow retry

2. **Email Not Verified (403)**
   - Display EmailVerification component
   - Provide resend option

3. **Server Error (500)**
   - Display: "Server error. Please try again later."
   - Action: Log error, allow retry

4. **Network Error**
   - Display: "Unable to connect. Check your internet connection."
   - Action: Allow retry

### Error Display Pattern

```jsx
{msg && (
  <div className={`p-3 rounded-lg ${
    msg.includes('success')
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }`}>
    {msg}
  </div>
)}
```

## Security Considerations

1. **Password Visibility:** Passwords are hidden by default with optional show/hide toggle
2. **Token Storage:** Tokens stored in localStorage (consider httpOnly cookies for enhanced security)
3. **Verification Codes:** 6-digit codes with limited validity
4. **Reset Tokens:** Time-limited tokens in password reset URLs
5. **Input Validation:** Both frontend and backend validation

## Best Practices

### When Adding New Authentication Features

1. **Follow existing patterns:** Use similar state management and API call patterns
2. **Include loading states:** Always show loading indicator during API calls
3. **Handle all error cases:** Network errors, validation errors, server errors
4. **Theme awareness:** Use `useTheme()` hook for consistent styling
5. **Animations:** Add smooth transitions for better UX
6. **Token management:** Update token storage/retrieval as needed
7. **MessageService:** Remember to handle messageService reconnection if needed

### Component Checklist

- [ ] Loading state during API calls
- [ ] Error message display
- [ ] Success feedback
- [ ] Theme-aware styling
- [ ] Input validation
- [ ] Keyboard accessibility (Enter to submit)
- [ ] Mobile-responsive design
- [ ] Link to related auth pages

## Dependencies

- **React Router:** Navigation between auth pages
- **useTheme:** Dark/light mode styling
- **Lucide React:** Icons (Eye, EyeOff, User, Lock, etc.)
- **API_BASE_URL:** From `src/services/config.js`

## Future Enhancements

1. **OAuth Integration:** Add Google/Microsoft SSO for TMU students
2. **2FA Support:** Two-factor authentication
3. **Biometric Auth:** Face ID / Touch ID on supported devices
4. **Remember Me:** Persistent login option
5. **Session Management:** Multiple device session tracking
6. **Password Strength Meter:** Visual feedback for password complexity
7. **Rate Limiting UI:** Handle and display rate limit errors gracefully

## Related Documentation

- [API_INTEGRATION.md](/API_INTEGRATION.md) - Authentication API endpoints
- [ARCHITECTURE.md](/ARCHITECTURE.md) - Overall system architecture
- [src/services/messageService.js](/src/services/) - Real-time connection management
- [src/contexts/ThemeContext.jsx](/src/contexts/) - Theme management
