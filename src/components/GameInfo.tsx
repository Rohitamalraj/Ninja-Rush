import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useUIStore } from '../store/uiStore';

export const GameInfo: React.FC = () => {
  const { connected } = useWallet();
  const { showMainMenu } = useUIStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Hide on main menu
  if (showMainMenu) return null;

  return (
    <div className="fixed top-24 left-6 z-40 max-w-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md rounded-2xl border-2 border-blue-500/50 shadow-2xl overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <span className="text-white font-bold">How to Play & Earn</span>
          </div>
          <span className="text-gray-400 text-xl">{isExpanded ? '▼' : '▶'}</span>
        </button>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 text-sm">
            {/* Game Rules */}
            <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
              <h4 className="text-blue-400 font-bold mb-2">🕹️ Game Rules</h4>
              <ul className="text-gray-300 space-y-1 text-xs">
                <li>• Survive for 30 seconds</li>
                <li>• Eliminate enemies with shurikens (Space)</li>
                <li>• Collect power-ups for abilities</li>
                <li>• 3 lives - avoid enemy contact</li>
              </ul>
            </div>

            {/* Blockchain Rewards */}
            <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-500/30">
              <h4 className="text-orange-400 font-bold mb-2">🪙 Earn NINJA Tokens</h4>
              <ul className="text-gray-300 space-y-1 text-xs">
                <li>• <strong>1 NINJA = 1 Score Point</strong></li>
                <li>• Auto-claimed after each game</li>
                <li>• Stored on OneChain blockchain</li>
              </ul>
            </div>

            {/* Milestones */}
            <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/30">
              <h4 className="text-green-400 font-bold mb-2">🏆 Milestone Rewards</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>🥉 Bronze: 100 NINJA</span>
                  <span className="text-green-400 font-bold">→ 5 OCT</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>🥈 Silver: 300 NINJA</span>
                  <span className="text-green-400 font-bold">→ 15 OCT</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>🥇 Gold: 1000 NINJA</span>
                  <span className="text-green-400 font-bold">→ 50 OCT</span>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/30">
              <h4 className="text-purple-400 font-bold mb-2">📊 Global Leaderboard</h4>
              <p className="text-gray-300 text-xs">
                Submit your score on-chain to compete with players worldwide!
              </p>
            </div>

            {/* Connection Status */}
            {!connected && (
              <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-500/30">
                <div className="flex items-center gap-2 text-yellow-400 text-xs">
                  <span>⚠️</span>
                  <strong>Connect OneWallet to earn rewards!</strong>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
