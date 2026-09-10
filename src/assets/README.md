# Assets

## Overview

This folder contains static assets including images, logos, and icons used throughout the application. Assets are organized by type and imported directly into components for optimal bundling with Vite.

## Folder Structure

```
assets/
├── icons/                    # Currently empty (placeholder none.txt only)
├── images/                   # Currently empty (placeholder none.txt only)
├── Yapp White logo.png
├── Yapp web icon.png
├── light_mode_logo2.png
├── image0.jpg
├── image1.jpg
├── image2.jpg
├── image (6).png
├── Blobs_slowly_drifting_202602212145_b8gyk.mp4
├── Make_it_feel_202602212226_rbw0t.mp4
├── loopingani.mp4
├── byte_black.png
├── byte_white.png
├── byte_icon_black.png
└── byte_icon_white.png
```

Both `icons/` and `images/` currently contain only a placeholder `none.txt` file — verified empty of real assets as of this writing.

## Available Assets

### Logos

**Yapp White logo.png**
- **Usage:** Dark mode/dark backgrounds
- **Description:** White version of the Yapp logo
- **Recommended for:** Sidebar, header in dark mode

**light_mode_logo2.png**
- **Usage:** Light mode/light backgrounds
- **Description:** Dark/colored version of the logo for light backgrounds
- **Recommended for:** Sidebar, header in light mode

**Yapp web icon.png**
- **Usage:** Favicon, app icons
- **Description:** Small icon version for browser tabs
- **Recommended for:** index.html favicon link

### Cyber Summit — TMU Exclusive (BYTE branding)

Four logo/icon assets used by the Cyber Summit "TMU Exclusive" feature, which promotes the BYTE-branded partner attribution. Consumed by `src/components/pages/cyber-summit/ByteIcon.jsx` and `ByteAttribution.jsx`, both of which import directly via the `@/assets/...` alias and swap between the black/white variant based on the current theme.

**byte_black.png**
- **Usage:** Light backgrounds
- **Description:** Full BYTE wordmark/logo, black variant
- **Used by:** `ByteAttribution.jsx`

**byte_white.png**
- **Usage:** Dark backgrounds
- **Description:** Full BYTE wordmark/logo, white variant
- **Used by:** `ByteAttribution.jsx`

**byte_icon_black.png**
- **Usage:** Light backgrounds, compact spaces
- **Description:** BYTE icon-only mark (no wordmark), black variant
- **Used by:** `ByteIcon.jsx`

**byte_icon_white.png**
- **Usage:** Dark backgrounds, compact spaces
- **Description:** BYTE icon-only mark (no wordmark), white variant
- **Used by:** `ByteIcon.jsx`

### Photos

**image0.jpg, image1.jpg, image2.jpg**
- **Usage:** General app photography (e.g. onboarding, marketing, or feature imagery)
- **Description:** JPEG photo assets

**image (6).png**
- **Usage:** General app imagery
- **Description:** PNG image asset (note the literal space and parentheses in the filename — quote or escape the path when referencing it outside of an `import` statement)

### Videos

**Blobs_slowly_drifting_202602212145_b8gyk.mp4**
- **Usage:** Background/decorative animation
- **Description:** Looping abstract blob animation clip

**Make_it_feel_202602212226_rbw0t.mp4**
- **Usage:** Background/decorative animation
- **Description:** Motion/animation clip

**loopingani.mp4**
- **Usage:** Background/decorative animation
- **Description:** Looping animation clip

## Usage Patterns

### Importing Assets

Vite processes assets through ES modules:

```javascript
// Import at the top of your component
import LogoLight from '../../assets/light_mode_logo2.png';
import LogoDark from '../../assets/Yapp White logo.png';

function Logo() {
  return <img src={LogoLight} alt="Yap Logo" />;
}
```

### Theme-Aware Logo

Using ThemeContext to switch logos:

```javascript
import { useTheme } from '../../contexts/ThemeContext';
import LogoLight from '../../assets/light_mode_logo2.png';
import LogoDark from '../../assets/Yapp White logo.png';

function Logo() {
  const { isDarkMode } = useTheme();
  
  return (
    <img 
      src={isDarkMode ? LogoDark : LogoLight}
      alt="Yap Logo"
      className="h-8 w-auto"
    />
  );
}
```

### Cyber Summit BYTE Attribution (Theme-Aware)

```javascript
import byteBlack from '@/assets/byte_black.png';
import byteWhite from '@/assets/byte_white.png';
import { useTheme } from '../../contexts/ThemeContext';

function ByteAttribution() {
  const { isDarkMode } = useTheme();
  return <img src={isDarkMode ? byteWhite : byteBlack} alt="BYTE" />;
}
```

### Favicon Setup

In `index.html`:

```html
<head>
  <link rel="icon" type="image/png" href="/assets/Yapp web icon.png" />
  <title>Yap - TMU Social Network</title>
</head>
```

### Responsive Images

```javascript
<img 
  src={logo}
  alt="Yap Logo"
  className="h-8 md:h-10 lg:h-12 w-auto"
  loading="lazy"
/>
```

## Image Optimization

### Best Practices

1. **Use Appropriate Formats:**
   - PNG for logos (transparency needed)
   - JPG for photos
   - WebP for modern browsers (smaller size)
   - SVG for icons (scalable, smallest)

2. **Optimize File Sizes:**
   ```bash
   # Use tools like ImageOptim, TinyPNG, or Squoosh
   # Target < 100KB for web icons
   # Target < 500KB for logos
   ```

3. **Lazy Loading:**
   ```javascript
   <img loading="lazy" src={image} alt="..." />
   ```

4. **Responsive Images:**
   ```javascript
   <img
     srcSet={`${smallImage} 300w, ${mediumImage} 600w, ${largeImage} 1200w`}
     sizes="(max-width: 300px) 100vw, (max-width: 600px) 50vw, 33vw"
     src={mediumImage}
     alt="..."
   />
   ```

## Adding New Assets

### Guidelines

1. **Naming Convention:**
   - Use lowercase with hyphens: `logo-dark-mode.png`
   - Be descriptive: `user-avatar-default.svg`
   - Include size if multiple versions: `logo-sm.png`, `logo-lg.png`

2. **Organization:**
   - Place logos in root `assets/` folder
   - Place icons in `assets/icons/`
   - Place general images in `assets/images/`

3. **File Size:**
   - Optimize before committing
   - Compress images to reduce bundle size
   - Consider using SVG for icons

4. **Documentation:**
   - Update this README when adding new assets
   - Document intended usage
   - Note which components use the asset

### Adding Icons

For icon files (not icon libraries):

```
assets/icons/
├── check-circle.svg
├── warning.svg
└── info.svg
```

Usage:
```javascript
import CheckIcon from '../../assets/icons/check-circle.svg';

function Success() {
  return (
    <div>
      <img src={CheckIcon} className="w-6 h-6" alt="" />
      <span>Success!</span>
    </div>
  );
}
```

### Adding Images

For general images:

```
assets/images/
├── landing-hero.jpg
├── campus-map.png
└── default-event-cover.jpg
```

Usage:
```javascript
import HeroImage from '../../assets/images/landing-hero.jpg';

function LandingPage() {
  return (
    <div>
      <img src={HeroImage} alt="Campus life" className="w-full h-64 object-cover" />
    </div>
  );
}
```

## Icon Libraries vs Icon Files

### Current Setup: Icon Libraries

The app uses **Lucide React** for icons:

```javascript
import { Home, User, Settings, MessageCircle } from 'lucide-react';

function Navigation() {
  return (
    <nav>
      <Home size={24} />
      <User size={24} />
      <Settings size={24} />
      <MessageCircle size={24} />
    </nav>
  );
}
```

**Benefits:**
- Tree-shaking (only imports used icons)
- Consistent style
- Customizable size and color
- No file management

### When to Use Icon Files

Use actual icon files when:
- Custom brand icons needed
- Icon libraries don't have specific icons
- Need very specific styling not achievable with libraries
- Designer provides custom icon set

## Asset Loading States

### Handling Image Load Errors

```javascript
function LogoWithFallback() {
  const [error, setError] = useState(false);
  
  if (error) {
    return <div className="w-32 h-8 bg-gray-200 rounded" />;
  }
  
  return (
    <img
      src={logo}
      alt="Yap Logo"
      onError={() => setError(true)}
    />
  );
}
```

### Progressive Image Loading

```javascript
function ProgressiveImage({ src, placeholder, alt }) {
  const [imgSrc, setImgSrc] = useState(placeholder);
  
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setImgSrc(src);
  }, [src]);
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        imgSrc === placeholder ? 'opacity-50' : 'opacity-100'
      }`}
    />
  );
}
```

## Performance Considerations

### Vite Asset Handling

Vite automatically:
- Optimizes images during build
- Generates hashed filenames for caching
- Inlines small assets as base64
- Code-splits large assets

### Bundle Size Impact

Check imported asset sizes:

```bash
npm run build

# Review dist/ folder
# Check asset sizes in build output
```

**Guidelines:**
- Keep individual assets < 500KB
- Use appropriate formats (WebP, SVG)
- Lazy load non-critical images
- Consider CDN for large media

### CDN Integration (Future)

For production, consider hosting assets on CDN:

```javascript
// config.js
export const CDN_URL = process.env.VITE_CDN_URL || '';

// Usage
import { CDN_URL } from '../../services/config';

function Image({ path }) {
  const src = CDN_URL ? `${CDN_URL}${path}` : path;
  return <img src={src} alt="..." />;
}
```

## Accessibility

### Alt Text Best Practices

```javascript
// ✅ Good - Descriptive alt text
<img src={logo} alt="Yap - Toronto Metropolitan University Social Network" />

// ✅ Good - Decorative image (empty alt)
<img src={decorative} alt="" role="presentation" />

// ❌ Bad - Generic alt text
<img src={logo} alt="logo" />

// ❌ Bad - Missing alt text
<img src={logo} />
```

### Responsive Images for Accessibility

```javascript
<picture>
  <source 
    media="(prefers-color-scheme: dark)" 
    srcSet={logoDark}
  />
  <source 
    media="(prefers-color-scheme: light)" 
    srcSet={logoLight}
  />
  <img src={logoLight} alt="Yap Logo" />
</picture>
```

## Logo Usage Guidelines

### Branding Consistency

1. **Minimum Size:** Don't scale below 32px height
2. **Clear Space:** Maintain padding around logo
3. **Color Variants:** Use appropriate variant for background
4. **Aspect Ratio:** Maintain original proportions

### Logo Component Example

```javascript
import { useTheme } from '../../contexts/ThemeContext';
import LogoLight from '../../assets/light_mode_logo2.png';
import LogoDark from '../../assets/Yapp White logo.png';

function YapLogo({ size = 'md', className = '' }) {
  const { isDarkMode } = useTheme();
  
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
  };
  
  return (
    <img
      src={isDarkMode ? LogoDark : LogoLight}
      alt="Yap"
      className={`w-auto ${sizeClasses[size]} ${className}`}
    />
  );
}

export default YapLogo;
```

## Future Enhancements

1. **Image Compression Pipeline:** Automate optimization on commit
2. **WebP Conversion:** Convert PNGs to WebP for better compression
3. **SVG Icons:** Convert raster icons to SVG where possible
4. **Asset Manifest:** Auto-generate documentation from assets
5. **CDN Integration:** Offload assets to CDN for production
6. **Responsive Image Sets:** Multiple sizes for different viewports
7. **Dark Mode Variants:** Separate asset versions optimized for each theme

## Related Documentation

- [src/contexts/ThemeContext.jsx](/src/contexts/) - Theme-based asset switching
- [src/components/sidebar/](/src/components/sidebar/) - Logo usage in navigation
- [src/components/pages/cyber-summit/](/src/components/pages/cyber-summit/) - BYTE-branded asset usage (`byte_*.png`) for the Cyber Summit TMU Exclusive feature
- [ARCHITECTURE.md](/ARCHITECTURE.md) - Build and deployment process
