import { useState, useEffect } from 'react';
import { useTheme } from '../../../../../contexts/ThemeContext';

export default function WYRItem({
  question,
  onVote,
  onDelete,
  userVote,
  canDelete,
}) {
  const [voting, setVoting] = useState(false);
  const [votingOption, setVotingOption] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clickedButton, setClickedButton] = useState(null);
  const { isDarkMode } = useTheme();

  // Start from 50% to avoid both bars growing from the left
  const [animatedPercentageFire, setAnimatedPercentageFire] = useState(50);
  const [animatedPercentageGarbage, setAnimatedPercentageGarbage] = useState(50);

  const totalVotes = (question.votes_fire || 0) + (question.votes_garbage || 0);
  const showResults = userVote; // userVote is now 'fire', 'garbage', or null/undefined

  console.log('🔍 WYRItem: Props received:', {
    questionId: question._id,
    userVote,
    showResults,
    totalVotes,
    votesFire: question.votes_fire,
    votesGarbage: question.votes_garbage,
    fullQuestion: question,
  });

  const getVotePercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const percentageFire = getVotePercentage(question.votes_fire || 0, totalVotes);
  const percentageGarbage = getVotePercentage(question.votes_garbage || 0, totalVotes);

  // Format the creation date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return '';
    }
  };

  // Get creator display name
  const getCreatorName = () => {
    return question.creator_name || 'Anonymous';
  };

  useEffect(() => {
    if (!showResults) return;

    // Animate from 50/50 to real percentages
    const timeout = setTimeout(() => {
      setAnimatedPercentageFire(percentageFire);
      setAnimatedPercentageGarbage(percentageGarbage);
    }, 50);

    return () => clearTimeout(timeout);
  }, [showResults, percentageFire, percentageGarbage]);

  const handleVote = async (option) => {
    console.log('🔍 WYRItem: handleVote called', { option, userVote, voting });

    if (userVote || voting) {
      console.log(
        '🔍 WYRItem: Vote blocked - already voted or voting in progress',
      );
      return;
    }

    setClickedButton(option);
    setTimeout(() => {
      setClickedButton(null);
    }, 400);

    setVoting(true);
    setVotingOption(option);

    try {
      console.log('🔍 WYRItem: Calling onVote...');
      await onVote(question._id, option);
      console.log('🔍 WYRItem: onVote completed successfully');
    } catch (err) {
      console.error('🔍 WYRItem: Error voting:', err);
    } finally {
      console.log('🔍 WYRItem: Resetting voting state');
      setVoting(false);
      setVotingOption(null);
    }
  };

  return (
    <div className={`rounded-lg p-4 mb-6 border `}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className={`text-lg font-bold mb-1`}>{question.statement}</h3>
          <div
            className={`flex items-center gap-2 text-xs font-light md:text-sm text-muted-foreground`}
          >
            <span>@{getCreatorName()}</span>
            {question.created_at && (
              <>
                <span>•</span>
                <span>{formatDate(question.created_at)}</span>
              </>
            )}
          </div>
        </div>
        {canDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={`transition-colors p-1 ml-2 text-muted-foreground hover:text-destructive`}
            title="Delete this hot take"
          >
            🗑️
          </button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="mb-4 p-3 rounded-lg border border-destructive/50 bg-destructive/10">
          <p className="text-sm text-muted-foreground mb-3">
            Delete this hot take? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onDelete(question._id);
                setShowDeleteConfirm(false);
              }}
              className="px-3 py-1.5 text-sm bg-destructive hover:bg-destructive/80 rounded-md font-medium text-destructive-foreground"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 text-sm rounded-md font-medium bg-accent hover:bg-accent/80"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showResults ? (
        <div className="flex gap-3 mb-4">
          {/* Vote Fire Button */}
          <button
            className={`flex-1 min-w-0 px-0 md:px-4 py-0 md:py-3 rounded-lg font-bold transition-all duration-300 ease-out transform hover:scale-105 shadow-md relative ${
              isDarkMode
                ? 'bg-green-700 border-2 border-green-900 text-green-100 hover:bg-green-600 hover:border-green-800'
                : 'bg-green-600 border-2 border-green-700 text-white hover:bg-green-500 hover:border-green-600'
            } ${
              voting && votingOption === 'fire' ? 'opacity-75' : ''
            } ${clickedButton === 'fire' ? 'scale-95' : ''}`}
            disabled={voting}
            onClick={() => handleVote('fire')}
          >
            <div className="text-center">
              <div className="text-md md:text-xl">🔥</div>
              {voting && votingOption === 'fire' && (
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-opacity-50 rounded-lg ${
                    isDarkMode ? 'bg-green-800' : 'bg-green-700'
                  }`}
                >
                  <div
                    className={`animate-spin rounded-full h-5 w-5 border-b-2 ${
                      isDarkMode ? 'border-green-100' : 'border-white'
                    }`}
                  ></div>
                </div>
              )}
            </div>
          </button>

          {/* Vote Garbage Button */}
          <button
            className={`flex-1 min-w-0 px-0 md:px-4 py-0 md:py-3 rounded-lg font-bold transition-all duration-300 ease-out transform hover:scale-105 shadow-md relative ${
              isDarkMode
                ? 'bg-red-700 border-2 border-red-900 text-red-100 hover:bg-red-600 hover:border-red-800'
                : 'bg-red-600 border-2 border-red-700 text-white hover:bg-red-500 hover:border-red-600'
            } ${
              voting && votingOption === 'garbage' ? 'opacity-75' : ''
            } ${clickedButton === 'garbage' ? 'scale-95' : ''}`}
            disabled={voting}
            onClick={() => handleVote('garbage')}
          >
            <div className="text-center">
              <div className="text-xl">🗑️</div>
              {voting && votingOption === 'garbage' && (
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-opacity-50 rounded-lg ${
                    isDarkMode ? 'bg-red-800' : 'bg-red-700'
                  }`}
                >
                  <div
                    className={`animate-spin rounded-full h-5 w-5 border-b-2 ${
                      isDarkMode ? 'border-red-100' : 'border-white'
                    }`}
                  ></div>
                </div>
              )}
            </div>
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex h-16 rounded-lg overflow-hidden shadow-lg">
            {/* Result Fire */}
            {animatedPercentageFire > 0 && (
              <div
                className={`flex items-center justify-center text-white font-bold will-change-[width] transition-[width] duration-700 ease-in-out min-w-0 ${
                  isDarkMode ? 'bg-green-700' : 'bg-green-600'
                } ${
                  userVote === 'fire'
                    ? isDarkMode
                      ? 'ring-4 ring-green-400'
                      : 'ring-4 ring-green-300'
                    : ''
                }`}
                style={{
                  width: `${Math.max(animatedPercentageFire, 5)}%`,
                }}
              >
                <div className="text-center px-2 min-w-0">
                  <div className="text-base font-bold truncate">
                    {animatedPercentageFire}%
                  </div>
                  <div className="text-xs opacity-80 truncate">
                    🔥 {question.votes_fire || 0}
                  </div>
                  {userVote === 'fire' && (
                    <div className="text-xs mt-1 truncate">✓ Your vote</div>
                  )}
                </div>
              </div>
            )}

            {/* Result Garbage */}
            {animatedPercentageGarbage > 0 && (
              <div
                className={`flex items-center justify-center text-white font-bold will-change-[width] transition-[width] duration-700 ease-in-out min-w-0 ${
                  isDarkMode ? 'bg-red-700' : 'bg-red-600'
                } ${
                  userVote === 'garbage'
                    ? isDarkMode
                      ? 'ring-4 ring-red-400'
                      : 'ring-4 ring-red-300'
                    : ''
                }`}
                style={{
                  width: `${Math.max(animatedPercentageGarbage, 5)}%`,
                }}
              >
                <div className="text-center px-2 min-w-0">
                  <div className="text-base font-bold truncate">
                    {animatedPercentageGarbage}%
                  </div>
                  <div className="text-xs opacity-80 truncate">
                    🗑️ {question.votes_garbage || 0}
                  </div>
                  {userVote === 'garbage' && (
                    <div className="text-xs mt-1 truncate">✓ Your vote</div>
                  )}
                </div>
              </div>
            )}

            {/* Show message when both options have 0 votes */}
            {animatedPercentageFire === 0 && animatedPercentageGarbage === 0 && (
              <div
                className={`w-full flex items-center justify-center font-medium ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                No votes yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
