import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
function WaypointModal({ isOpen, onClose, onSubmit, location }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('food');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() && description.trim() && !submitting) {
      setSubmitting(true);
      try {
        await onSubmit({ title, description, type });
        // Reset form
        setTitle('');
        setDescription('');
        setType('food');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setTitle('');
      setDescription('');
      setType('food');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center bg-black/70">
      {/* Dimmed background overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal content */}
      <div className="relative z-10 rounded-xl shadow-2xl p-6 w-96 max-w-[90vw] m-4 transform transition-all scale-100 bg-card border border-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Create Waypoint
              </h2>
              <p className="text-sm text-muted-foreground">
                📍 {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50 hover:bg-muted"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Waypoint Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              disabled={submitting}
            >
              <option value="food">🍕 Food & Events</option>
              <option value="study">📚 Study Spot</option>
              <option value="group">👥 Study Group</option>
              <option value="social">🎉 Social</option>
              <option value="event">📅 Event</option>
              <option value="other">📍 Other</option>
            </select>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Free coffee here!"
              maxLength={100}
              className="w-full px-4 py-3 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              disabled={submitting}
              required
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                Make it catchy and clear
              </span>
              <span className="text-xs text-muted-foreground">
                {title.length}/100
              </span>
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others what's happening here..."
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              disabled={submitting}
              required
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                Provide helpful details
              </span>
              <span className="text-xs text-muted-foreground">
                {description.length}/500
              </span>
            </div>
          </div>

          {/* Duration Info */}
          <div className="border border-primary/30 rounded-lg p-3 bg-primary/10">
            <p className="text-sm text-primary">
              <span className="font-semibold">⏰ Duration:</span> This waypoint
              will automatically expire after 1 week
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-3 disabled:opacity-50 font-semibold rounded-lg transition-colors bg-muted hover:opacity-80 text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !description.trim()}
              className="flex-1 px-4 py-3 bg-primary hover:opacity-90 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Waypoint'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WaypointModal;
