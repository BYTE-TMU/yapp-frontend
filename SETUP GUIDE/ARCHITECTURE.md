# Yap Frontend Architecture

## Overview

Yap is a React-based social networking platform specifically designed for Toronto Metropolitan University (TMU) students. The frontend is built with modern web technologies focusing on real-time communication, interactive mapping, and social engagement features.

## Technology Stack

### Core Technologies
- **React 19.1.0** - UI library with latest features including automatic batching and improved hydration
- **React Router 7.8.0** - Client-side routing with protected route patterns
- **Vite 6** - Build tool providing fast development server and optimized production builds
- **Tailwind CSS 4.1.11** - Utility-first CSS framework for rapid UI development

### Key Libraries
- **Socket.IO Client 4.8.1** - Real-time bidirectional event-based communication for messaging features
- **Leaflet 1.9.4** - Interactive maps library for the Waypoint location-based features
- **React-Leaflet 5.0.0** - React components for Leaflet integration
- **FontAwesome 0.525.0 & Lucide React 5.5.0** - Icon libraries for consistent UI elements

### Development Tools
- **ESLint 9** - Code linting and quality enforcement
- **Vite React Plugin** - React Fast Refresh and JSX transformation

## Project Structure

```
yap-frontend/
├── src/
│   ├── main.jsx                 # Application entry point
│   ├── App.jsx                  # Root component with ThemeProvider
│   ├── AuthRoutes.jsx           # Centralized routing configuration
│   ├── index.css                # Global styles and Tailwind imports
│   │
│   ├── components/              # React components organized by feature
│   │   ├── authentication/      # Login, registration, password reset
│   │   ├── common/              # Shared reusable components
│   │   ├── header/              # Header navigation (placeholder)
│   │   ├── messages/            # Real-time messaging components
│   │   ├── pages/               # Main page components and features
│   │   └── sidebar/             # App navigation sidebar
│   │
│   ├── contexts/                # React Context providers
│   │   └── ThemeContext.jsx    # Dark/light theme management
│   │
│   ├── services/                # External service integrations
│   │   ├── config.js            # API endpoint configuration
│   │   └── messageService.js   # Socket.IO wrapper for messaging
│   │
│   ├── utils/                   # Utility functions
│   │   ├── dateTimeUtils.js    # Date/time formatting
│   │   └── profileUtils.js     # Profile picture URL generation
│   │
│   └── assets/                  # Static assets (images, icons)
│
├── index.html                   # HTML entry point
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint rules
└── vercel.json                 # Vercel deployment configuration
```

## Architectural Patterns

### 1. Feature-Based Component Organization

Components are organized by feature/domain rather than by type. This approach:
- Improves discoverability - all related components are co-located
- Enhances maintainability - features are self-contained modules
- Facilitates team collaboration - engineers can own specific feature areas

Example: All messaging components (chat list, message bubbles, input, typing indicators) are grouped under `components/messages/`.

### 2. Centralized Routing

All application routes are defined in `AuthRoutes.jsx` with two key patterns:

**PrivateRoute Component:**
```jsx
// Protects authenticated routes by checking for valid JWT token
<PrivateRoute element={<Home />} />
```

**PageTransition Wrapper:**
```jsx
// Provides smooth fade animations between route changes
<PageTransition element={<Component />} />
```

Routes are organized hierarchically:
- Public routes: Landing, Login, Signup, Password Reset
- Protected routes: Home, Profile, Messages, Waypoint, Settings, etc.

### 3. Context-Based State Management

The application uses React Context API for global state management:

**ThemeContext:**
- Manages dark/light mode preference
- Persists theme selection to localStorage
- Provides theme state and toggle function throughout app
- Applies theme class to document element

For feature-specific state, components use:
- **Local useState** for component-specific data
- **Service classes** for complex state (messageService)
- **Props drilling** for parent-child communication

**Future Consideration:** As the app scales, consider adding Zustand or Redux for more complex global state needs.

### 4. Service Layer Pattern

Complex features with external dependencies are abstracted into service classes:

**messageService.js:**
- Singleton pattern for Socket.IO connection management
- Handles connection lifecycle (connect, disconnect, reconnect)
- Provides event listener registration/cleanup
- Manages authentication with backend WebSocket server
- Exposes methods: `connect()`, `disconnect()`, `sendMessage()`, `on()`, `off()`

Benefits:
- Decouples Socket.IO implementation from components
- Provides consistent API across messaging features
- Simplifies testing and mocking
- Centralizes connection state management

### 5. Token-Based Authentication

Authentication flow:
1. User logs in via `/login` endpoint
2. Backend returns JWT access token
3. Frontend stores token in `localStorage`
4. Token included in all API requests via `Authorization` header
5. Token validated on protected routes via `PrivateRoute` component
6. Token decoded to extract user information (userId, email, etc.)

**Security Considerations:**
- Tokens stored in localStorage (vulnerable to XSS attacks)
- No refresh token mechanism currently implemented
- Future enhancement: Consider httpOnly cookies for improved security

### 6. API Communication Pattern

**Configuration:**
```javascript
// config.js dynamically determines backend URL
const API_URL = process.env.VITE_API_URL || 
                detectBackendUrl() || 
                'https://yap-backend.up.railway.app';
```

**API Call Pattern:**
```javascript
// Typical API request with authentication
const response = await fetch(`${API_URL}/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

Components handle API calls directly (no dedicated API service layer beyond messageService). Each component manages:
- Loading states
- Error handling
- Data transformation

**Future Enhancement:** Consider creating a centralized API service with request/response interceptors.

### 7. Styling Architecture

**Tailwind CSS Utility-First Approach:**
- Rapid development with utility classes
- Consistent spacing, colors, and typography
- Responsive design with breakpoint prefixes
- Custom scrollbar styles in global CSS

**Theme Integration:**
```jsx
// Components check theme context and apply conditional styles
const { theme } = useTheme();
<div className={`bg-${theme === 'dark' ? 'gray-800' : 'white'}`}>
```

**Inline Styles for Dynamic Theming:**
```jsx
// Used when Tailwind utilities can't cover dynamic values
<div style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}>
```

### 8. Real-Time Communication Architecture

**Socket.IO Integration:**
- Persistent WebSocket connection managed by messageService
- Event-driven architecture for real-time updates
- Automatic reconnection on connection loss
- Authentication via token passed during connection handshake

**Message Flow:**
1. User connects to WebSocket server on app initialization
2. Components register event listeners (e.g., 'new_message', 'user_typing')
3. Backend emits events to connected clients
4. Frontend components react to events and update UI
5. Components cleanup listeners on unmount

**Events Handled:**
- `new_message` - Incoming messages
- `user_typing` - Typing indicators
- `message_read` - Read receipts
- `user_online` / `user_offline` - Online status

### 9. Lazy Loading and Code Splitting

Currently, the app uses route-level code splitting automatically via Vite:
- Each route component is a potential split point
- Heavy libraries (Leaflet, Socket.IO) are bundled with routes that use them

**Future Optimization:**
- Implement React.lazy() for heavy features (Waypoint, Messages)
- Add loading fallbacks with Suspense
- Virtualize long lists (home feed, user search)

### 10. Error Handling Strategy

**Current Approach:**
- Component-level error handling with try-catch blocks
- Error states stored in component state
- User-facing error messages displayed conditionally

**Missing:**
- No global Error Boundary component
- No centralized error logging
- No standardized error message format

**Future Enhancement:**
- Implement Error Boundary at app level
- Add error tracking (Sentry, LogRocket)
- Standardize error response format with backend

## Data Flow Patterns

### Authentication Flow
```
1. User submits credentials → LoginForm
2. LoginForm calls /auth/login → Backend API
3. Backend returns {token, user} → LoginForm
4. Token stored in localStorage → LocalStorage
5. User redirected to /home → Router
6. PrivateRoute validates token → Allows access
```

### Post Creation Flow
```
1. User fills form → CreatePost
2. Image upload (optional) → Backend /upload
3. Form submission → Backend /posts
4. Success response → Redirect to /home
5. New post appears in feed → Home component refetch
```

### Real-Time Messaging Flow
```
1. User opens Messages page → Messages component
2. messageService.connect() → WebSocket connection
3. Component registers listeners → messageService.on('new_message')
4. User sends message → messageService.sendMessage()
5. Backend broadcasts to recipient → Socket.IO
6. Recipient receives via 'new_message' event → UI updates
7. Component cleanup → messageService.off('new_message')
```

### Theme Toggle Flow
```
1. User clicks theme toggle → Settings/Sidebar
2. ThemeContext.toggleTheme() → Context method
3. Theme state updated → React state
4. localStorage updated → Persistence
5. Document class updated → CSS applies
6. All components re-render with new theme → Context consumers
```

## Performance Considerations

### Current Optimizations
- Vite's fast HMR for development productivity
- Route-based code splitting
- Tailwind CSS tree-shaking in production
- Debounced search inputs (User search)
- Conditional rendering to minimize DOM operations

### Performance Bottlenecks
1. **Large Components:**
   - Waypoint.jsx (1021 lines) - Heavy Leaflet integration
   - Profile.jsx (800 lines) - Multiple data fetching operations
   - messageService.js (677 lines) - Complex Socket.IO logic

2. **Unoptimized Lists:**
   - Home feed infinite scroll could use virtualization
   - Message list renders all messages (no virtualization)
   - User search results not paginated

3. **Bundle Size:**
   - Leaflet adds ~140KB to bundle
   - Socket.IO client adds ~80KB
   - FontAwesome icons not tree-shaken

### Future Optimizations
- Implement React.memo for expensive re-renders
- Add useMemo/useCallback for computed values and callbacks
- Consider virtual scrolling for long lists
- Lazy load Leaflet only when Waypoint page is accessed
- Optimize image loading with lazy loading and placeholders

## Security Architecture

### Current Security Measures
1. **Token-Based Authentication:**
   - JWT tokens for API authentication
   - Token expiration handled by backend
   
2. **Protected Routes:**
   - PrivateRoute component blocks unauthenticated access
   - Automatic redirect to login on unauthorized access

3. **CORS Configuration:**
   - Backend configured to accept requests from frontend domain

### Security Gaps
1. **localStorage Token Storage:**
   - Vulnerable to XSS attacks
   - No refresh token mechanism
   
2. **No Input Sanitization (Frontend):**
   - Relies entirely on backend validation
   
3. **No CSRF Protection:**
   - Stateless JWT approach assumes CSRF protection not needed

### Security Enhancements Needed
- Consider httpOnly cookies for token storage
- Implement refresh token rotation
- Add Content Security Policy (CSP) headers
- Implement rate limiting on API calls
- Add input validation and sanitization

## Deployment Architecture

### Vercel Deployment
Configuration in `vercel.json`:
- Single Page Application (SPA) routing
- All routes serve `index.html`
- Environment variables for API_URL

### Build Process
```bash
npm run build  # Vite builds optimized production bundle
# Output: dist/ folder with minified assets
```

### Environment Configuration
```bash
# .env.example
VITE_API_URL=https://your-backend-url.com
```

## Testing Strategy (Future Implementation)

### Recommended Testing Approach
1. **Unit Tests:**
   - Utility functions (dateTimeUtils, profileUtils)
   - Service classes (messageService)
   - Custom hooks (future)

2. **Component Tests:**
   - Render tests for all components
   - User interaction tests
   - Theme toggle tests

3. **Integration Tests:**
   - Authentication flow
   - Post creation flow
   - Messaging flow

4. **E2E Tests:**
   - Critical user journeys
   - Cross-browser testing

### Testing Tools Recommendation
- **Vitest** - Fast unit testing (Vite-native)
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

## Accessibility Considerations

### Current State
- Semantic HTML elements used in most components
- Keyboard navigation partially supported
- Theme support improves readability

### Accessibility Gaps
- Missing ARIA labels on interactive elements
- No focus management for modals
- Color contrast not verified for WCAG compliance
- No screen reader testing performed

### Future Enhancements
- Add comprehensive ARIA labels
- Implement focus trap for modals
- Verify color contrast ratios
- Add keyboard shortcuts documentation
- Test with screen readers

## Browser Support

### Target Browsers
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

### Polyfills
- None currently included
- Relies on modern browser features

## Future Architectural Improvements

1. **State Management:**
   - Consider Zustand/Redux for complex global state
   - Implement server state management (React Query/SWR)

2. **Type Safety:**
   - Migrate to TypeScript for better developer experience
   - Add PropTypes as intermediate step

3. **Component Library:**
   - Extract common UI patterns (Button, Input, Modal, Card)
   - Create design system documentation
   - Consider Storybook for component showcase

4. **Custom Hooks:**
   - Extract common patterns (useAuth, useApi, useCurrentUser)
   - Centralize repeated logic

5. **API Layer:**
   - Create centralized API service
   - Implement request/response interceptors
   - Add retry logic and error handling

6. **Performance:**
   - Implement code splitting for heavy features
   - Add performance monitoring
   - Optimize bundle size

7. **Testing:**
   - Set up testing infrastructure
   - Achieve >80% code coverage
   - Add E2E tests for critical flows

## Architecture Decision Records (ADRs)

### ADR-001: React Router over Next.js
**Decision:** Use React Router for routing instead of Next.js framework  
**Rationale:** SPA approach sufficient for current needs; simpler deployment; full control over routing logic  
**Trade-offs:** No SSR/SSG benefits; SEO limitations for public pages

### ADR-002: Tailwind CSS over CSS-in-JS
**Decision:** Use Tailwind CSS utility classes over styled-components/emotion  
**Rationale:** Faster development; smaller bundle size; better performance; easier theme customization  
**Trade-offs:** Longer className strings; learning curve for utility-first approach

### ADR-003: Context API over Redux
**Decision:** Use React Context for global state instead of Redux  
**Rationale:** Simpler for current app complexity; less boilerplate; native React solution  
**Trade-offs:** May need refactoring if state complexity grows significantly

### ADR-004: Socket.IO over WebSockets API
**Decision:** Use Socket.IO library over native WebSocket API  
**Rationale:** Automatic reconnection; fallback to polling; event-based API; room support  
**Trade-offs:** Larger bundle size; dependency on third-party library

### ADR-005: Vite over Create React App
**Decision:** Use Vite as build tool over CRA  
**Rationale:** Significantly faster dev server; better build performance; native ESM; modern tooling  
**Trade-offs:** Slightly different config approach; ecosystem still maturing

## Getting Started for New Engineers

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Code editor (VS Code recommended)

### Setup Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Start dev server: `npm run dev`
5. Read this ARCHITECTURE.md and CONTRIBUTING.md
6. Explore component folders and their README files

### Recommended Learning Path
1. Start with `main.jsx` and `App.jsx` to understand entry points
2. Review `AuthRoutes.jsx` to understand routing structure
3. Explore `ThemeContext.jsx` to see Context pattern
4. Examine `messageService.js` to understand service pattern
5. Pick a feature area (authentication, messaging, etc.) and dive deep
6. Read component-specific README files for detailed feature documentation

## Conclusion

The Yap frontend is built with modern React patterns and a pragmatic architecture that balances simplicity with scalability. The codebase is organized for maintainability and developer productivity, with clear separation of concerns and feature-based organization. As the application grows, the architecture can evolve to incorporate more sophisticated patterns while maintaining the core principles of clarity and modularity.
