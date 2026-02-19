import AuthRoutes from './AuthRoutes'; // Import AuthRoutes
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Toaster } from 'sonner';

function AppContent() {
  const { theme } = useTheme();

  return (
    <div
      className="app-container bg-background"
      style={{
        minHeight: '100vh',
        fontFamily: 'Albert Sans',
        overflow: 'hidden', // Prevent scrollbars during transitions
      }}
    >
      <Toaster
        theme={theme}
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
