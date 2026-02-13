import { Link } from 'react-router-dom';
import YappLogoDark from '../../assets/Yapp White logo.png'; // Import the dark mode logo
import YappLogoLight from '../../assets/yapp_light_mode.png'; // Import the light mode logo (colored version)
import { useTheme } from '../../contexts/ThemeContext';

function Header(){
    const { isDarkMode } = useTheme();
    return(
        <div className={` flex md:hidden w-full items-start ${
                        isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'
                    }`}>
                        <Link to="/home" className="flex items-start">
                            <img 
                                        src={isDarkMode ? YappLogoDark : YappLogoLight} 
                                        alt="Yapp Logo" 
                                        className="w-1/3 max-w-full object-contain"
                                        style={{ height: isDarkMode ? '5rem' : '4rem' }}
                                      />
                        </Link>
                    </div>
    )
}

export default Header;