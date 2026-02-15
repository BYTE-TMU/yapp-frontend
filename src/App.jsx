import AuthRoutes from './AuthRoutes'; // Import AuthRoutes
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Toaster } from 'sonner';

function AppContent() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="app-container" style={{ 
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#121212' : '#ffffff',
      fontFamily: 'Albert Sans',
      overflow: 'hidden' // Prevent scrollbars during transitions
    }}>
      <Toaster 
        theme={isDarkMode ? 'dark' : 'light'}
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
      <AuthRoutes />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
        <AppContent />
    </ThemeProvider>
  );
}

export default App;