import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface GameOverModalProps {
  score: number;
  enemiesKilled: number;
  powerUpsCollected: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  enemiesKilled,
  powerUpsCollected,
  onPlayAgain,
  onMainMenu,
}) => {
  const { connected, claimNinjaTokens, submitScore, balance, refreshBalance } = useWallet();
  const [claiming, setClaiming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ninjaEarned = score; // 1 NINJA per point scored
  const highScore = parseInt(localStorage.getItem('ninjaRush_highScore') || '0');
  const isNewHighScore = score > highScore;

  useEffect(() => {
    // Auto-claim if wallet connected and score > 0
    if (connected && score > 0 && !claiming && !claimed) {
      handleClaimTokens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, score]);

  const handleClaimTokens = async () => {
    if (claiming || claimed || score === 0) return;
    
    setClaiming(true);
    setError(null);
    
    try {
      await claimNinjaTokens(score);
      setClaimed(true);
      // Refresh balance after claiming
      setTimeout(() => refreshBalance(), 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim tokens';
      console.error('Failed to claim NINJA tokens:', err);
      setError(errorMessage);
      setClaimed(false);
    } finally {
      setClaiming(false);
    }
  };

  const handleSubmitScore = async () => {
    if (submitting || submitted || score === 0) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      await submitScore(score, enemiesKilled, powerUpsCollected);
      setSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit score';
      console.error('Failed to submit score:', err);
      setError(errorMessage);
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-red-500 mb-2">GAME OVER</h2>
          {isNewHighScore && (
            <div className="text-2xl font-bold text-yellow-400 animate-pulse">
              🎉 NEW HIGH SCORE! 🎉
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Final Score:</span>
            <span className="text-3xl font-bold text-white">{score}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">High Score:</span>
            <span className="text-xl font-bold text-orange-400">{Math.max(score, highScore)}</span>
          </div>
          <div className="w-full h-px bg-gray-700"></div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Enemies Killed:</span>
            <span className="text-white font-semibold">{enemiesKilled}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Power-ups Collected:</span>
            <span className="text-white font-semibold">{powerUpsCollected}</span>
          </div>
        </div>

        {/* Blockchain Actions */}
        {connected ? (
          <div className="space-y-3 mb-6">
            {/* Claim NINJA Tokens */}
            <div className={`rounded-lg p-4 border-2 ${
              claimed ? 'bg-green-900/20 border-green-500' : 'bg-orange-900/20 border-orange-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{claimed ? '✅' : '🪙'}</span>
                  <div>
                    <div className="font-bold text-white">
                      {claimed ? 'Tokens Claimed!' : 'Claim NINJA Tokens'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Earn {ninjaEarned} NINJA tokens
                    </div>
                  </div>
                </div>
                {claimed && (
                  <div className="text-green-400 font-bold text-xl">+{ninjaEarned}</div>
                )}
              </div>
              {!claimed && (
                <button
                  onClick={handleClaimTokens}
                  disabled={claiming || score === 0}
                  className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                    claiming
                      ? 'bg-gray-700 text-gray-400 cursor-wait'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {claiming ? 'Claiming...' : `Claim ${ninjaEarned} NINJA`}
                </button>
              )}
            </div>

            {/* Submit to Leaderboard */}
            <div className={`rounded-lg p-4 border-2 ${
              submitted ? 'bg-blue-900/20 border-blue-500' : 'bg-purple-900/20 border-purple-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{submitted ? '✅' : '🏆'}</span>
                  <div>
                    <div className="font-bold text-white">
                      {submitted ? 'Score Submitted!' : 'Submit to Leaderboard'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Compete globally on-chain
                    </div>
                  </div>
                </div>
              </div>
              {!submitted && (
                <button
                  onClick={handleSubmitScore}
                  disabled={submitting || score === 0}
                  className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                    submitting
                      ? 'bg-gray-700 text-gray-400 cursor-wait'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Score'}
                </button>
              )}
            </div>

            {/* Current Balance */}
            <div className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Your Balance:</span>
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-orange-400 font-bold">{balance.ninja.toFixed(0)}</div>
                  <div className="text-gray-500 text-xs">NINJA</div>
                </div>
                <div className="text-right">
                  <div className="text-blue-400 font-bold">{balance.oct.toFixed(2)}</div>
                  <div className="text-gray-500 text-xs">OCT</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="text-xl">⚠️</span>
              <div className="text-sm">
                <div className="font-bold">Wallet Not Connected</div>
                <div className="text-xs text-gray-400">Connect your OneWallet to claim rewards</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-3 mb-4">
            <div className="text-red-400 text-sm font-semibold">❌ {error}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 
                     text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={onMainMenu}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg 
                     transition-all"
          >
            MAIN MENU
          </button>
        </div>

        {/* Hint */}
        <div className="mt-4 text-center text-gray-500 text-xs">
          Press ENTER to play again • ESC for menu
        </div>
      </div>
    </div>
  );
};
