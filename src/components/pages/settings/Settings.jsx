import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../sidebar/Sidebar';
import Header from '../../header/Header';
import {
  LogOut,
  Settings as SettingsIcon,
  Shield,
  Bell,
  Palette,
  HelpCircle,
  Eye,
  EyeOff,
  Lock,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE_URL } from '../../../services/config';

function Settings() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const mainContentRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark'; // Simplified for UI toggle, though 'system' might be active

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Disconnect messageService before clearing token
      try {
        const { messageService } =
          await import('../../../services/messageService');
        messageService.disconnect();
      } catch (error) {
        console.warn('Could not disconnect messageService:', error);
      }

      // Only need to clear the main token now
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Also clear any stale user data

      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Password change functions
  const passwordValidation = {
    minLength: passwordForm.newPassword.length >= 6,
    match:
      passwordForm.newPassword === passwordForm.confirmPassword &&
      passwordForm.confirmPassword !== '',
    different:
      passwordForm.currentPassword !== passwordForm.newPassword &&
      passwordForm.newPassword !== '',
  };

  const isPasswordFormValid =
    passwordValidation.minLength &&
    passwordValidation.match &&
    passwordValidation.different &&
    passwordForm.currentPassword;

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordFormValid) return;

    setPasswordLoading(true);
    setPasswordError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPasswordError('Please log in again');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
          confirm_password: passwordForm.confirmPassword,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess(true);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        // Auto close after 2 seconds
        setTimeout(() => {
          setPasswordSuccess(false);
          setIsChangePasswordOpen(false);
        }, 2000);
      } else {
        setPasswordError(data.error || 'Password change failed');
      }
    } catch (err) {
      console.error('Change password error:', err);
      setPasswordError('Network error. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClosePasswordModal = () => {
    if (!passwordLoading) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError('');
      setPasswordSuccess(false);
      setIsChangePasswordOpen(false);
    }
  };

  return (
    <div
      className="h-screen overflow-hidden font-bold bg-background text-foreground"
      style={{
        fontFamily: 'Albert Sans',
      }}
    >
      <Header />
      <Sidebar />
      <div
        ref={mainContentRef}
        className="ml-0 md:ml-64 h-full overflow-y-auto p-4 sm:p-5 md:p-6"
      >
        {/* Animated Background */}
        <div className="fixed inset-0 md:ml-64 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-primary/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-orange-600/20 to-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="max-w-6xl mx-auto">
          {/* Settings Header */}
          <div className="rounded-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 bg-card border border-border">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-5 md:mb-6">
              <SettingsIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-foreground" />
              <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Settings
              </h1>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Account Section */}
            <div className="rounded-lg p-4 sm:p-5 md:p-6 bg-card border border-border">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center space-x-2 text-foreground">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Account</span>
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div
                  className="flex items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  <div>
                    <p className="font-medium text-sm sm:text-base text-foreground">
                      Change Password
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Update your account password
                    </p>
                  </div>
                  <div className="text-lg sm:text-xl text-muted-foreground">
                    ›
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="rounded-lg p-4 sm:p-5 md:p-6 bg-card border border-border">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center space-x-2 text-foreground">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Appearance</span>
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-background border border-border">
                  <div>
                    <p className="font-medium text-sm sm:text-base text-foreground">
                      Dark Mode
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {isDarkMode
                        ? 'Currently using dark theme'
                        : 'Currently using light theme'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDarkMode}
                      onChange={() => setTheme(isDarkMode ? 'light' : 'dark')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <div className="rounded-lg p-4 sm:p-5 md:p-6 bg-card border border-border">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground">
                Account Actions
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center space-x-2 sm:space-x-3 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-destructive hover:bg-destructive/90 disabled:opacity-50 text-destructive-foreground rounded-lg font-bold transition-colors text-sm sm:text-base"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
                </button>

                <p className="text-xs sm:text-sm text-center text-muted-foreground">
                  You'll be redirected to the login page
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm transition-all duration-300 bg-background/80 z-9999 flex items-center justify-center p-4"
          onClick={handleClosePasswordModal}
        >
          {passwordSuccess ? (
            <div className="w-full max-w-md p-4 sm:p-5 md:p-6 rounded-2xl shadow-2xl bg-card border border-border">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Check className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold mb-2 text-foreground">
                  Password Changed Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your password has been updated securely.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-card border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-5 md:p-6 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      Change Password
                    </h2>
                  </div>
                  <button
                    onClick={handleClosePasswordModal}
                    disabled={passwordLoading}
                    className={`p-1.5 sm:p-2 rounded-full transition-colors text-muted-foreground hover:text-foreground hover:bg-muted ${passwordLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={handlePasswordSubmit}
                className="p-4 sm:p-5 md:p-6"
              >
                {passwordError && (
                  <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg flex items-center space-x-2 bg-destructive/10 border border-destructive/20 text-destructive">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{passwordError}</span>
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-foreground">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-foreground">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-foreground">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  {passwordForm.newPassword && (
                    <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50">
                      <p className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-foreground">
                        Password Requirements:
                      </p>
                      <div className="space-y-0.5 sm:space-y-1">
                        <div
                          className={`flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm ${
                            passwordValidation.minLength
                              ? 'text-green-500'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              passwordValidation.minLength
                                ? 'bg-green-500'
                                : 'bg-muted-foreground'
                            }`}
                          />
                          <span>At least 6 characters</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm ${
                            passwordValidation.different
                              ? 'text-green-500'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              passwordValidation.different
                                ? 'bg-green-500'
                                : 'bg-muted-foreground'
                            }`}
                          />
                          <span>Different from current password</span>
                        </div>
                        {passwordForm.confirmPassword && (
                          <div
                            className={`flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm ${
                              passwordValidation.match
                                ? 'text-green-500'
                                : 'text-destructive'
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                passwordValidation.match
                                  ? 'bg-green-500'
                                  : 'bg-destructive'
                              }`}
                            />
                            <span>Passwords match</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 sm:space-x-3 mt-4 sm:mt-5 md:mt-6">
                  <button
                    type="button"
                    onClick={handleClosePasswordModal}
                    disabled={passwordLoading}
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base bg-secondary hover:bg-secondary/80 text-secondary-foreground ${passwordLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isPasswordFormValid || passwordLoading}
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                      isPasswordFormValid && !passwordLoading
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Settings;
