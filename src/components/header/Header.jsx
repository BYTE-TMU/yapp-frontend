import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  MessageCircle,
  Plus,
  User,
  Settings,
  MapPin,
} from 'lucide-react';
import YappLogoDark from '../../assets/Yapp White logo.png';
import YappLogoLight from '../../assets/yapp_light_mode.png';

function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const bottomNavItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/create', label: '', icon: Plus, isCreate: true },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
    { path: '/waypoint', label: 'Waypoint', icon: MapPin },
  ];

  return (
    <>
      {/* Top header bar - mobile only (logo + settings) */}
      <div className="flex md:hidden w-full items-center justify-between px-2 border-b border-border">
        <Link to="/home" className="flex items-center">
          <img
            src={YappLogoLight}
            alt="Yapp Logo"
            className="w-auto max-w-full object-contain dark:hidden h-13"
          />
          <img
            src={YappLogoDark}
            alt="Yapp Logo"
            className="w-auto max-w-full object-contain hidden dark:block h-16"
          />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/profile"
            className={`p-2 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Profile"
          >
            <User className="w-6 h-6" />
          </Link>
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
        </div>
      </div>

      {/* Bottom navigation bar - mobile only (Instagram-style) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around px-2 py-1 border-t bg-background border-border"
        style={{
          paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))',
        }}
      >
        {bottomNavItems.map(({ path, label, icon: Icon, isCreate }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-colors ${
              isCreate
                ? ''
                : isActive(path)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isCreate ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow-lg shadow-primary/30">
                <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            ) : (
              <>
                <Icon
                  className={`w-6 h-6 ${isActive(path) ? 'stroke-[2.5]' : ''}`}
                />
                <span className="text-[10px] mt-0.5">{label}</span>
              </>
            )}
          </Link>
        ))}
      </nav>
    </>
  );
}

export default Header;
