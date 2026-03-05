import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  MessageCircle,
  Plus,
  User,
  Settings,
  MapPin,
  Send,
} from 'lucide-react';
import YappLogoDark from '@/assets/Yapp White logo.png';
import YappLogoLight from '@/assets/yapp_light_mode.png';

function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const bottomNavItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/create', label: '', icon: Plus, isCreate: true },
    { path: '/waypoint', label: 'Waypoint', icon: MapPin },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Top header bar - mobile only (logo + settings) */}
      <div className="flex md:hidden items-center justify-between bg-white/[0.07] backdrop-blur-[5px] rounded-full px-2 py-1 border border-white/8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] absolute top-2 left-2 right-2 z-50 h-12">
        <Link to="/home" className="flex items-center">
          <img
            src={YappLogoLight}
            alt="Yapp Logo"
            className="w-auto max-w-full object-contain dark:hidden h-8"
          />
          <img
            src={YappLogoDark}
            alt="Yapp Logo"
            className="w-auto max-w-full object-contain hidden dark:block h-8"
          />
        </Link>
        <div className="flex items-center gap-1">
          {isActive('/messages') ? (
            <></>
          ) : isActive('/profile') ? (
            <Link
              to="/settings"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/settings')
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Settings"
            >
              <Settings className="w-6 h-6" />
            </Link>
          ) : (
            <Link
              to="/messages"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/messages')
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Messages"
            >
              <Send className="w-6 h-6" />
            </Link>
          )}
        </div>
      </div>

      {/* Bottom navigation bar - mobile only (Instagram-style) */}
      <nav
        className="fixed bottom-2 left-2 right-2 z-50 md:hidden flex items-center justify-around px-2 py-1 bg-white/[0.07] backdrop-blur-[5px] rounded-full  border border-white/8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] h-12"
        style={{
          paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))',
        }}
      >
        {bottomNavItems.map(({ path, label, icon: Icon, isCreate }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
              isCreate
                ? ''
                : isActive(path)
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
            }`}
          >
            {isCreate ? (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary shadow-lg shadow-primary/30">
                <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            ) : (
              <>
                <Icon
                  className={`w-4 h-4 ${isActive(path) ? 'stroke-[2.5]' : ''}`}
                />
                <span className="text-[10px] font-normal mt-0.5">{label}</span>
              </>
            )}
          </Link>
        ))}
      </nav>
    </>
  );
}

export default Header;
