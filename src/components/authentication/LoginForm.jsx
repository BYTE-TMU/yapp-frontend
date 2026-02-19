import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../services/config';
import EmailVerification from './EmailVerification';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [animationClass, setAnimationClass] = useState(
    'translate-y-4 opacity-0',
  );
  const [showVerification, setShowVerification] = useState(false);
  const [unverifiedUsername, setUnverifiedUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Entrance animation
    setTimeout(() => {
      setAnimationClass('translate-y-0 opacity-100');
    }, 100);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // store the token in localStorage
        localStorage.setItem('token', data.token);

        // Force messageService to reconnect with new token to prevent sender ID issues
        try {
          const { messageService } =
            await import('../../services/messageService');
          messageService.forceReconnect();
        } catch (error) {
          console.warn('Could not force messageService reconnect:', error);
        }

        setMsg('Login success');

        // Check if user has completed onboarding
        const onboardingComplete = localStorage.getItem('onboarding_complete');
        if (onboardingComplete) {
          // Returning user - go to home
          navigate('/home');
        } else {
          // New user - go to onboarding
          navigate('/onboarding');
        }
      } else if (res.status === 403 && data.requires_verification) {
        // User exists but email is not verified
        setUnverifiedUsername(data.username || formData.username);
        setShowVerification(true);
        setMsg(''); // Clear any previous messages
      } else {
        setMsg(data.error || 'Login failed');
      }
    } catch {
      setMsg('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    // After successful verification, redirect to login or auto-login
    setShowVerification(false);
    setMsg('Email verified successfully! Please log in.');

    // Clearing form cus why not
    setFormData({
      username: '',
      password: '',
    });
  };

  const handleBackToLogin = () => {
    setShowVerification(false);
    setUnverifiedUsername('');
    setMsg('');
  };

  // Show verification component if user needs to verify email
  if (showVerification) {
    return (
      <EmailVerification
        username={unverifiedUsername}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToRegister={handleBackToLogin}
      />
    );
  }

  // Show the regular login form
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-background"
      style={{
        fontFamily: 'Albert Sans',
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-primary/20 to-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-primary/20 to-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div
        className={`w-full max-w-md relative z-10 transform transition-all duration-700 ease-out ${animationClass}`}
      >
        {/* Back to Landing Page */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200 mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>

        {/* Header with Animation */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 bg-linear-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-lg text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>

        {/* Form Container with Glass Effect */}
        <div
          className={`bg-card/50 backdrop-blur-lg border border-border rounded-2xl p-8 shadow-2xl transition-all duration-300 ${isFormFocused ? 'scale-105 shadow-primary/25' : ''}`}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-foreground text-sm font-semibold mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-primary" />
                Username/Email
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username or email"
                  value={formData.username}
                  onChange={handleInputChange}
                  onFocus={() => setIsFormFocused(true)}
                  onBlur={() => setIsFormFocused(false)}
                  required
                  className="w-full px-4 py-4 bg-background border-2 border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-xl bg-linear-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-foreground text-sm font-semibold mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-primary" />
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setIsFormFocused(true)}
                  onBlur={() => setIsFormFocused(false)}
                  required
                  className="w-full px-4 py-4 pr-12 bg-background border-2 border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-xl bg-linear-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-primary hover:opacity-80 text-sm font-medium transition-colors duration-200 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Login Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/25 disabled:scale-100 disabled:shadow-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    <span>Logging you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Success/Error Messages */}
            {msg && (
              <div
                className={`text-center text-sm mt-4 p-3 rounded-lg transition-all duration-300 ${
                  msg.includes('success')
                    ? 'text-green-500 bg-green-500/10 border border-green-500/20'
                    : 'text-destructive bg-destructive/10 border border-destructive/20'
                }`}
              >
                {msg}
              </div>
            )}
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-lg">
            New to Yapp?
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-bold ml-2 transition-colors duration-200 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
