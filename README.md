# Yap Web Frontend

React-based web application for the Yap social platform - a social network for Toronto Metropolitan University (TMU) students.

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

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_ORG/yap-frontend.git
   cd yap-frontend
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

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | ✅ |
| `VITE_BASE_PATH` | Base path for routing | Optional |

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

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run linting: `npm run lint`
4. Test locally with backend running
5. Submit a pull request

### Code Standards

- Use functional components with hooks
- Follow ESLint configuration
- Use Tailwind for styling
- Keep components small and focused

## License

Proprietary - All rights reserved
