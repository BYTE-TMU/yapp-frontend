import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/config';

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/password-reset/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        setMessage('Reset code sent! Redirecting...');
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 1500);
      } else {
        setError(data.error || 'Failed to send reset code.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden"
      style={{ fontFamily: 'Albert Sans' }}
    >
      {/* Animated Background Blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-primary/20 to-primary/10 rounded-full blur-3xl animate-pulse z-0 hover:bg-linear-to-br"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-primary/20 to-primary/10 rounded-full blur-3xl animate-pulse z-0 hover:bg-linear-to-tr"></div>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 flex flex-col items-center relative z-10">
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
          Reset Your Password
        </h2>
        <p className="text-muted-foreground text-center mb-6 text-sm">
          Enter your TMU email to receive a reset code
        </p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <label className="text-foreground text-sm font-semibold">
            TMU Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg bg-muted text-foreground border border-border focus:border-primary focus:outline-none transition-colors"
            placeholder="your.name@torontomu.ca"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-lg bg-primary hover:opacity-90 text-white font-bold text-lg shadow-md transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
        {message && (
          <div className="mt-4 text-green-400 text-center">{message}</div>
        )}
        {error && <div className="mt-4 text-red-400 text-center">{error}</div>}
        <div className="mt-6 text-muted-foreground text-sm text-center">
          Remember your password?{' '}
          <a
            href="/login"
            className="text-primary hover:underline font-semibold"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
