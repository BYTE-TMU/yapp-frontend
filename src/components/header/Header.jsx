import { Link, useLocation } from 'react-router-dom';
import { Home, Users, MessageCircle, Plus, User, Settings } from 'lucide-react';
import YappLogoDark from '../../assets/Yapp White logo.png';
import YappLogoLight from '../../assets/yapp_light_mode.png';
import { useTheme } from '../../contexts/ThemeContext';

function Header() {
    const { isDarkMode } = useTheme();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const bottomNavItems = [
        { path: '/home', label: 'Home', icon: Home },
        { path: '/users', label: 'Users', icon: Users },
        { path: '/create', label: '', icon: Plus, isCreate: true },
        { path: '/messages', label: 'Messages', icon: MessageCircle },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <>
            {/* Top header bar - mobile only (logo + settings) */}
            <div className={`flex md:hidden w-full items-center justify-between px-2 ${
                isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'
            }`}>
                <Link to="/home" className="flex items-center">
                    <img
                        src={isDarkMode ? YappLogoDark : YappLogoLight}
                        alt="Yapp Logo"
                        className="w-auto max-w-full object-contain"
                        style={{ height: isDarkMode ? '4rem' : '3.25rem' }}
                    />
                </Link>
                <Link
                    to="/settings"
                    className={`p-2 rounded-lg transition-colors ${
                        isActive('/settings')
                            ? 'text-orange-500'
                            : isDarkMode
                                ? 'text-gray-400 hover:text-white'
                                : 'text-gray-500 hover:text-gray-900'
                    }`}
                    aria-label="Settings"
                >
                    <Settings className="w-6 h-6" />
                </Link>
            </div>

            {/* Bottom navigation bar - mobile only (Instagram-style) */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around px-2 py-1 border-t"
                style={{
                    backgroundColor: isDarkMode ? '#121212' : '#ffffff',
                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
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
                                    ? 'text-orange-500'
                                    : isDarkMode
                                        ? 'text-gray-400 hover:text-white'
                                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        {isCreate ? (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 shadow-lg shadow-orange-500/30">
                                <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                        ) : (
                            <>
                                <Icon className={`w-6 h-6 ${isActive(path) ? 'stroke-[2.5]' : ''}`} />
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