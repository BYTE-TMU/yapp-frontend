// WouldYouRather.jsx - Hot Takes: single-statement voting
import { useState, useEffect, useMemo } from 'react';
import WYRItem from './WYRItem';
import { API_BASE_URL } from '../../../../../services/config';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { showDeleteConfirmation } from '../../../../../utils/toastNotifications';
import { Button } from '@/components/ui/button';

// Utility: Fisher-Yates shuffle
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Reorder: unvoted questions randomized first, then interacted questions at bottom
function reorderQuestions(questions) {
  const unvoted = questions.filter((q) => q.user_vote == null);
  const voted = questions.filter((q) => q.user_vote != null);
  const shuffledUnvoted = shuffleArray(unvoted);
  return [...shuffledUnvoted, ...voted];
}

const API_URL = `${API_BASE_URL}/api/activities/wouldyourather`;

export default function WouldYouRather() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const { isDarkMode } = useTheme();

  // Create question state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStatement, setNewStatement] = useState('');
  const [creating, setCreating] = useState(false);

  // Get current user ID from JWT token
  const currentUserId = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload._id || payload.id || payload.user_id;
    } catch (e) {
      return null;
    }
  }, []);

  // Load questions on component mount
  useEffect(() => {
    fetchQuestions();

    // Refresh content every ~48 hours to avoid an ever-growing list.
    const refreshIntervalMs = 48 * 60 * 60 * 1000;
    const intervalId = setInterval(() => {
      fetchQuestions();
    }, refreshIntervalMs);

    return () => clearInterval(intervalId);
  }, []);

  const getAuthHeaders = () => {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');

    console.log(
      '🔍 Frontend: Token from localStorage:',
      token ? 'Token exists' : 'No token found',
    );

    if (!token) {
      console.log('🔍 Frontend: No token, sending basic headers');
      return {
        'Content-Type': 'application/json',
      };
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    console.log('🔍 Frontend: Sending headers:', headers);
    return headers;
  };

  const fetchQuestions = async () => {
    console.log('🔍 Frontend: Starting fetchQuestions...');
    console.log('🔍 Frontend: API_URL:', API_URL);

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: getAuthHeaders(),
        mode: 'cors',
        credentials: 'include',
      });

      console.log('🔍 Frontend: Response received:', response);
      console.log('🔍 Frontend: Response status:', response.status);
      console.log('🔍 Frontend: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Frontend: Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 Frontend: Data received:', data);
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(reorderQuestions(data));
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error('🔍 Frontend: Fetch error:', err);
      console.error('🔍 Frontend: Error message:', err.message);
      setError(err.message || 'Failed to load activity.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (questionId, option) => {
    console.log('🔍 Frontend: handleVote called', { questionId, option });

    try {
      console.log('🔍 Frontend: Sending vote request...');
      const response = await fetch(`${API_URL}/vote`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ option, question_id: questionId }),
      });

      console.log('🔍 Frontend: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔍 Frontend: Vote failed:', errorData);
        throw new Error(errorData.error || 'Failed to submit vote');
      }

      const updatedQuestion = await response.json();
      console.log('🔍 Frontend: Updated question received:', updatedQuestion);
      // Update the question in-place without reordering — it stays where it is
      // until the next page load/refresh
      setQuestions((prev) =>
        prev.map((q) => (q._id === questionId ? updatedQuestion : q)),
      );
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(err.message || 'Failed to submit vote. Please try again.');
      throw err;
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();

    // Validation
    if (!newStatement.trim()) {
      setError('Statement is required.');
      return;
    }

    if (newStatement.trim().length < 2) {
      setError('Statement must be at least 2 characters long.');
      return;
    }

    if (newStatement.length > 200) {
      setError('Statement cannot exceed 200 characters.');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          statement: newStatement.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create hot take');
      }

      const createdQuestion = await response.json();

      // Add the new question to the beginning of the list
      setQuestions((prev) => [createdQuestion, ...prev]);

      // Reset form
      setNewStatement('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating hot take:', err);
      setError(err.message || 'Failed to create hot take. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setNewStatement('');
    setShowCreateForm(false);
    setError('');
  };

  const handleDeleteQuestion = async (questionId) => {
    const confirmed = await showDeleteConfirmation('hot take');
    if (!confirmed) {
      return;
    }

    setDeleting(questionId);

    try {
      const response = await fetch(`${API_URL}/${questionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete hot take');
      }

      // Remove the question from the list
      setQuestions((prev) => prev.filter((q) => q._id !== questionId));
    } catch (err) {
      console.error('Error deleting hot take:', err);
      setError(err.message || 'Failed to delete hot take. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const mainBgColor = isDarkMode ? '#171717' : '#ffffff';
  const loadingBgColor = isDarkMode ? '#1c1c1c' : '#f3f4f6';

  // Show create form
  if (showCreateForm) {
    return (
      <div className={`rounded-lg p-4 border `}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold`}>Create Hot Take</h3>
          <button
            onClick={resetCreateForm}
            className={`transition-colors text-muted-foreground hover:text-foreground`}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 text-muted-foreground`}
            >
              Your hot take *
            </label>
            <textarea
              value={newStatement}
              onChange={(e) => setNewStatement(e.target.value)}
              placeholder="Drop your hot take here..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder:text-muted-foreground bg-accent resize-none`}
              maxLength={200}
              rows={3}
              disabled={creating}
            />
            <div className={`text-xs mt-1 text-muted-foreground`}>
              {newStatement.length}/200 characters
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={creating || !newStatement.trim()}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
            >
              {creating ? 'Creating...' : 'Create Hot Take'}
            </button>
            <button
              type="button"
              onClick={resetCreateForm}
              disabled={creating}
              className={`px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 bg-accent`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`rounded-lg p-4 ${isDarkMode ? '' : 'border border-gray-200'}`}
        style={{ backgroundColor: mainBgColor }}
      >
        <div className="animate-pulse">
          <div
            className="h-4 rounded w-3/4 mb-4"
            style={{ backgroundColor: loadingBgColor }}
          ></div>
          <div
            className="h-8 rounded mb-4"
            style={{ backgroundColor: loadingBgColor }}
          ></div>
          <div className="flex gap-4 mb-4">
            <div
              className="flex-1 h-10 rounded"
              style={{ backgroundColor: loadingBgColor }}
            ></div>
            <div
              className="flex-1 h-10 rounded"
              style={{ backgroundColor: loadingBgColor }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 flex flex-col h-full dark:border`}>
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className={`text-xl font-bold `}>Hot Takes</h2>
        <Button
          variant="default"
          onClick={() => setShowCreateForm(true)}
          className="transition-colors whitespace-nowrap"
        >
          + Create
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-300 rounded-lg shrink-0">
          {error}
        </div>
      )}

      {questions.length === 0 ? (
        <div
          className={`text-center py-12 rounded-lg border flex-1 flex flex-col justify-center text-muted-foreground bg-background`}
        >
          <p className={`mb-4`}>
            No hot takes yet. Be the first to create one!
          </p>
        </div>
      ) : (
        <div className="space-y-0 flex-1 overflow-y-auto">
          {questions.map((question) => {
            const canDelete = currentUserId && String(question.created_by) === String(currentUserId);

            return (
              <WYRItem
                key={question._id}
                question={question}
                onVote={handleVote}
                onDelete={handleDeleteQuestion}
                userVote={question.user_vote}
                canDelete={canDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
