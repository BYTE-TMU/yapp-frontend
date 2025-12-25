# React Contexts

## Overview

This folder contains React Context providers that manage global application state. Contexts provide a way to share data across the component tree without prop drilling, ideal for theme preferences, authentication state, and other app-wide concerns.

## Files

### ThemeContext.jsx (51 lines)

**Purpose:** Global dark/light theme management with localStorage persistence

This context provides theme state and toggle functionality to all components in the application, enabling consistent dark/light mode switching across the entire UI.

## ThemeContext Architecture

### Context Creation

```javascript
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### ThemeProvider Component

**Props:**
- `children` - React components to wrap with theme context

**State:**
- `theme` - Current theme: `'light'` or `'dark'`
- `isDarkMode` - Boolean convenience property

**Methods:**
- `toggleTheme()` - Switches between light and dark mode

**Initialization:**
1. Check localStorage for saved preference
2. Fall back to system preference (`prefers-color-scheme`)
3. Default to 'light' if no preference found

```javascript
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default to light
    return 'light';
  });

  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Persist to localStorage and update document class
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [theme, isDarkMode]);

  const value = {
    theme,
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## Integration

### App Root Setup

In `App.jsx`, wrap the entire application with ThemeProvider:

```javascript
import { ThemeProvider } from './contexts/ThemeContext';
import AuthRoutes from './AuthRoutes';

function App() {
  return (
    <ThemeProvider>
      <AuthRoutes />
    </ThemeProvider>
  );
}

export default App;
```

This ensures all components have access to theme context.

### Using Theme in Components

**Import the hook:**
```javascript
import { useTheme } from '../../contexts/ThemeContext';
```

**Access theme state:**
```javascript
function MyComponent() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
```

## Common Usage Patterns

### Conditional Styling

**Using isDarkMode boolean:**
```javascript
function Component() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`
      p-4 rounded-lg
      ${isDarkMode 
        ? 'bg-gray-800 text-white border-gray-700' 
        : 'bg-white text-gray-900 border-gray-200'}
    `}>
      Content
    </div>
  );
}
```

**Using theme string:**
```javascript
function Component() {
  const { theme } = useTheme();
  
  const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#111827';
  
  return (
    <div style={{ backgroundColor: bgColor, color: textColor }}>
      Content
    </div>
  );
}
```

### Theme Toggle Button

**Simple toggle:**
```javascript
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
```

**Toggle with animation:**
```javascript
function AnimatedThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-14 h-7 rounded-full transition-colors duration-300
        ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}
      `}
    >
      <div className={`
        absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white
        transform transition-transform duration-300
        ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}
      `} />
    </button>
  );
}
```

### Theme-Aware Images

**Switch logo based on theme:**
```javascript
import { useTheme } from '../../contexts/ThemeContext';
import LogoLight from '../../assets/logo-light.png';
import LogoDark from '../../assets/logo-dark.png';

function Logo() {
  const { isDarkMode } = useTheme();
  
  return (
    <img 
      src={isDarkMode ? LogoDark : LogoLight}
      alt="Yap Logo"
      className="h-8"
    />
  );
}
```

### Theme-Aware Icons

```javascript
function StatusIcon() {
  const { isDarkMode } = useTheme();
  
  return (
    <CheckCircle 
      size={24}
      color={isDarkMode ? '#10b981' : '#059669'}
    />
  );
}
```

## localStorage Integration

### Persistence

Theme preference is automatically saved to localStorage whenever it changes:

```javascript
useEffect(() => {
  localStorage.setItem('theme', theme);
}, [theme]);
```

### Retrieval

On app load, theme is restored from localStorage:

```javascript
const saved = localStorage.getItem('theme');
if (saved) {
  setTheme(saved);
}
```

### Benefits

1. **Persistent across sessions:** User's choice remembered
2. **Instant load:** No flash of wrong theme on page load
3. **Cross-tab sync:** Can be enhanced to sync across tabs

## Document Class Integration

The context automatically applies/removes the 'dark' class on the document element:

```javascript
useEffect(() => {
  document.documentElement.classList.toggle('dark', isDarkMode);
}, [isDarkMode]);
```

This enables Tailwind's dark mode variant classes:

```html
<!-- Automatically uses correct styles based on .dark class -->
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

## System Preference Detection

On first visit (no saved preference), theme defaults to system preference:

```javascript
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  return 'dark';
}
```

This respects user's OS-level dark mode setting.

## Best Practices

### 1. Use Semantic Color Names

```javascript
// ✅ Good - Semantic naming
const bgPrimary = isDarkMode ? 'bg-gray-900' : 'bg-white';
const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';

// ❌ Avoid - Hard to understand intent
const bg = isDarkMode ? 'bg-gray-900' : 'bg-white';
```

### 2. Consistent Color Palette

Define color constants for consistency:

```javascript
const COLORS = {
  light: {
    bg: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-50'
  },
  dark: {
    bg: 'bg-gray-900',
    text: 'text-white',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-800'
  }
};

function Component() {
  const { theme } = useTheme();
  const colors = COLORS[theme];
  
  return (
    <div className={`${colors.bg} ${colors.text} ${colors.border}`}>
      Content
    </div>
  );
}
```

### 3. Accessibility

Ensure sufficient color contrast in both themes:

```javascript
// Verify contrast ratios meet WCAG AA standards
// Light mode: dark text on light background
// Dark mode: light text on dark background
```

### 4. Smooth Transitions

Add transitions for theme changes:

```css
/* In index.css */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

Or per-component:

```javascript
<div className="transition-colors duration-300">
  Content
</div>
```

## Testing Theme Changes

### Manual Testing Checklist

- [ ] Toggle works in all screens
- [ ] Theme persists on page refresh
- [ ] All text remains readable in both modes
- [ ] Images/logos switch appropriately
- [ ] Transitions are smooth
- [ ] No flash of wrong theme on load
- [ ] Works in all browsers

### Development Tips

```javascript
// Force theme for testing
localStorage.setItem('theme', 'dark');  // Test dark mode
localStorage.setItem('theme', 'light'); // Test light mode
window.location.reload();
```

## Future Enhancements

### 1. Additional Themes

```javascript
// Extend beyond dark/light
const [theme, setTheme] = useState('light'); // 'light' | 'dark' | 'auto' | 'high-contrast'
```

### 2. Custom Theme Colors

```javascript
// Allow user customization
const [accentColor, setAccentColor] = useState('#3b82f6');
```

### 3. Scheduled Theme Switching

```javascript
// Auto-switch based on time of day
const [autoTheme, setAutoTheme] = useState(true);

useEffect(() => {
  if (autoTheme) {
    const hour = new Date().getHours();
    setTheme(hour >= 18 || hour < 6 ? 'dark' : 'light');
  }
}, [autoTheme]);
```

### 4. Cross-Tab Synchronization

```javascript
// Sync theme across browser tabs
useEffect(() => {
  const handleStorage = (e) => {
    if (e.key === 'theme' && e.newValue) {
      setTheme(e.newValue);
    }
  };
  
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}, []);
```

### 5. Theme Transition Events

```javascript
// Emit events for theme changes
const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  
  // Custom event for analytics or animations
  window.dispatchEvent(new CustomEvent('theme-changed', {
    detail: { oldTheme: theme, newTheme }
  }));
};
```

## Adding New Contexts

When adding new global state contexts, follow the ThemeContext pattern:

```javascript
// NewContext.jsx
import { createContext, useContext, useState } from 'react';

const NewContext = createContext();

export function useNewContext() {
  const context = useContext(NewContext);
  if (!context) {
    throw new Error('useNewContext must be used within NewContextProvider');
  }
  return context;
}

export function NewContextProvider({ children }) {
  const [state, setState] = useState(initialState);

  const value = {
    state,
    // methods
  };

  return (
    <NewContext.Provider value={value}>
      {children}
    </NewContext.Provider>
  );
}
```

### Potential Future Contexts

1. **AuthContext:** User authentication state
2. **NotificationContext:** App-wide notifications
3. **LanguageContext:** Internationalization (i18n)
4. **FeatureFlagContext:** Feature toggles
5. **AnalyticsContext:** Event tracking

## Related Documentation

- [ARCHITECTURE.md](/ARCHITECTURE.md) - State management patterns
- [src/components/sidebar/](/src/components/sidebar/) - Theme toggle in navigation
- [src/components/pages/settings/](/src/components/pages/settings/) - Settings page with theme control
- [index.css](/src/index.css) - Global theme styles
