# Yap Web Frontend

React-based web application for the Yap social platform - a social network for Toronto Metropolitan University (TMU) students.

## 📚 Documentation

**New Engineer Onboarding:** Start here to understand the codebase

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, design patterns, and technical decisions
2. **[API_INTEGRATION.md](./API_INTEGRATION.md)** - Backend integration, endpoints, and authentication
3. **Component Documentation** - Detailed README files in each major folder:
   - [src/components/authentication/](./src/components/authentication/) - Authentication system
   - [src/components/messages/](./src/components/messages/) - Real-time messaging
   - [src/components/pages/](./src/components/pages/) - Main application pages
   - [src/components/sidebar/](./src/components/sidebar/) - Navigation sidebar
   - [src/services/](./src/services/) - API and Socket.IO services
   - [src/utils/](./src/utils/) - Utility functions
   - [src/contexts/](./src/contexts/) - React contexts

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **Icons**: Lucide React
- **Maps**: Leaflet / React-Leaflet
- **Real-time**: Socket.io Client

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- **Backend running** - See [yapp-backend](https://github.com/BYTE-TMU/yapp-backend) setup first

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/BYTE-TMU/yapp-frontend.git
   cd yapp-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## Full Stack Development

To run the complete stack locally:

1. **Start the backend** (in a separate terminal):
   ```bash
   cd yapp-backend
   python app.py
   # Backend runs at http://localhost:5001
   ```

2. **Start the frontend**:
   ```bash
   cd yapp-frontend
   npm run dev
   # Frontend runs at http://localhost:5173
   ```

3. **Verify connection**: Check browser console for `✅ Socket connected` message

**Troubleshooting:**
- If you see `ERR_CONNECTION_REFUSED`, ensure the backend is running on port 5001
- If WebSocket fails after changing `.env`, restart the frontend dev server
- Check `VITE_API_URL` matches the backend port (5001, not 5000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
├── index.html          # HTML entry point
├── vite.config.js      # Vite configuration
├── vercel.json         # Vercel deployment config
├── package.json        # Dependencies
├── src/
│   ├── main.jsx        # React entry point
│   ├── App.jsx         # Root component
│   ├── AuthRoutes.jsx  # Route definitions
│   ├── index.css       # Global styles (Tailwind)
│   ├── components/
│   │   ├── authentication/  # Login, Register, etc.
│   │   ├── common/          # Shared UI components
│   │   ├── header/          # Navigation header
│   │   ├── messages/        # Chat/messaging
│   │   ├── pages/           # Main page components
│   │   └── sidebar/         # Navigation sidebar
│   ├── contexts/
│   │   └── ThemeContext.jsx # Theme provider
│   ├── services/
│   │   ├── config.js        # API configuration
│   │   └── messageService.js # WebSocket service
│   └── utils/
│       ├── dateTimeUtils.js  # Date formatting
│       └── profileUtils.js   # Profile helpers
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5001` | ✅ |
| `VITE_BASE_PATH` | Base path for routing | `/` | Optional |

**Note:** The backend runs on port `5001` locally. Make sure to restart the dev server after changing `.env` (Vite caches environment variables).

## Features

- 🔐 **Authentication** - Login, Register, Password Reset
- 📝 **Posts** - Create, like, comment on posts
- 📅 **Events** - Create and discover campus events
- 💬 **Messaging** - Real-time chat with Socket.IO
- 📍 **Waypoint** - Location-based features
- 👤 **Profiles** - User profiles and settings
- 🌙 **Dark Mode** - Theme switching support

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# VITE_API_URL=https://your-backend.railway.app
```

The `vercel.json` handles SPA routing:
```json
{
  "rewrites": [
    { "source": "/((?!api/.*).*)", "destination": "/index.html" }
  ]
}
```

### Manual Build

```bash
npm run build
# Deploy the `dist/` folder to any static host
```

## Contributing

For detailed development guidelines, coding standards, and best practices, refer to:
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Understand the system design first
- **[API_INTEGRATION.md](./API_INTEGRATION.md)** - Learn API patterns
- **Component READMEs** - Check folder-specific documentation

### Quick Contribution Steps

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Read relevant component documentation in the folder you're working on
3. Make your changes following existing patterns
4. Run linting: `npm run lint`
5. Test locally with backend running
6. Submit a pull request

### Code Standards

- Use functional components with hooks
- Follow ESLint configuration
- Use Tailwind for styling
- Keep components small and focused

## License

Proprietary - All rights reserved
