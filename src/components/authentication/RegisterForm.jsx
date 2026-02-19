import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../services/config';
import EmailVerification from './EmailVerification'; // Import the verification component

function RegisterForm() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - show verification page
        setRegisteredUsername(data.username || form.username);
        setShowVerification(true);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    // Redirect to login page or show success message
    window.location.href = '/login';
  };

  const handleBackToRegister = async () => {
    // Cancel the pending registration on the backend
    try {
      await fetch(`${API_BASE_URL}/users/cancel-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: registeredUsername }),
      });
    } catch (err) {
      // Ignore errors - cleanup will happen automatically via expiration
      console.log('Failed to cancel registration:', err);
    }

    setShowVerification(false);
    setRegisteredUsername('');
    // Clear the form
    setForm({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setError('');
    setMessage('');
  };

  // Show verification component if registration was successful
  if (showVerification) {
    return (
      <EmailVerification
        username={registeredUsername}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToRegister={handleBackToRegister}
      />
    );
  }

  // Show registration form
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background"
      style={{
        fontFamily: 'Albert Sans',
      }}
    >
      {/* Animated Background Blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-primary/20 to-primary/10 rounded-full blur-3xl animate-pulse z-0 pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-primary/20 to-primary/10 rounded-full blur-3xl animate-pulse z-0 pointer-events-none"></div>
      <div className="w-full max-w-md rounded-2xl shadow-xl p-8 flex flex-col items-center relative z-10 bg-card border border-border">
        {/* Back to Landing Page */}
        <Link
          to="/"
          className="self-start inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200 mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>
        <h2 className="text-2xl font-bold mb-2 text-center text-foreground">
          Welcome to Yapp
        </h2>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4 mt-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Username
            </label>
            <input
              type="text"
              name="username"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              placeholder="xxx@torontomu.ca"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-bold text-lg shadow-md transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {message && (
          <div className="mt-4 text-green-500 font-medium text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 text-destructive font-medium text-center">
            {error}
          </div>
        )}
        <div className="mt-6 text-muted-foreground text-sm text-center">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 hover:underline"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
