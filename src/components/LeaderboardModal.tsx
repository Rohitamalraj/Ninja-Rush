import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '../contexts/WalletContext';

interface LeaderboardEntry {
  player: string;
  score: number;
  enemiesKilled: number;
  powerUpsCollected: number;
  timestamp: number;
}

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const { getLeaderboard } = useWallet();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard();
        setEntries(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [getLeaderboard]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  console.log('LeaderboardModal rendering, entries:', entries, 'loading:', loading);

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 via-purple-900/95 to-gray-900 rounded-2xl p-6 md:p-8 w-full max-w-5xl max-h-[85vh] overflow-hidden border-2 border-purple-500/30"
        style={{ 
          position: 'relative', 
          zIndex: 10000,
          boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-purple-500/30">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500">
              🏆 LEADERBOARD
            </h2>
            <p className="text-purple-300 text-sm mt-1">Top players on OneChain</p>
          </div>
          <button
            onClick={onClose}
            className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg px-6 py-3 rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-red-500/50"
            style={{
              boxShadow: '0 10px 25px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-y-auto overflow-x-auto max-h-[calc(85vh-180px)]" style={{ scrollbarWidth: 'thin' }}>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
              <p className="text-white text-xl mt-4 font-semibold">Loading leaderboard...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-4">🎮</div>
              <p className="text-white text-2xl font-bold mb-2">No scores yet!</p>
              <p className="text-gray-400 text-lg">Be the first to play and set a record!</p>
            </div>
          ) : (
            <div className="min-w-full">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
                  <tr className="border-b-2 border-purple-500/50">
                    <th className="text-left text-yellow-400 font-bold text-base md:text-lg py-4 px-3 md:px-6">Rank</th>
                    <th className="text-left text-yellow-400 font-bold text-base md:text-lg py-4 px-3 md:px-6">Player</th>
                    <th className="text-center text-yellow-400 font-bold text-base md:text-lg py-4 px-3 md:px-6">Score</th>
                    <th className="text-center text-yellow-400 font-bold text-base md:text-lg py-4 px-3 md:px-6">Enemies</th>
                    <th className="text-center text-yellow-400 font-bold text-base md:text-lg py-4 px-3 md:px-6">Power-ups</th>
                    <th className="text-right text-yellow-400 font-bold text-base md:text-lg py-4 px-3 md:px-6 hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key={index}
                      className="border-b border-purple-500/20 hover:bg-purple-500/10 transition-colors duration-150"
                      style={{
                        background: index < 3 ? `linear-gradient(90deg, rgba(139, 92, 246, 0.${5-index}), transparent)` : 'transparent'
                      }}
                    >
                      <td className="py-4 px-3 md:px-6">
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-3xl md:text-4xl">🥇</span>}
                          {index === 1 && <span className="text-3xl md:text-4xl">🥈</span>}
                          {index === 2 && <span className="text-3xl md:text-4xl">🥉</span>}
                          {index > 2 && <span className="text-white font-bold text-xl md:text-2xl ml-2">#{index + 1}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-3 md:px-6">
                        <div className="font-mono text-xs md:text-sm bg-gradient-to-r from-purple-500/20 to-transparent px-3 py-2 rounded-lg border border-purple-500/30 text-white max-w-[150px] md:max-w-none truncate">
                          {formatAddress(entry.player)}
                        </div>
                      </td>
                      <td className="text-center py-4 px-3 md:px-6">
                        <div className="inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/40">
                          <span className="text-yellow-400 font-black text-xl md:text-2xl">
                            {entry.score.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-3 md:px-6">
                        <span className="inline-flex items-center gap-1 text-red-400 font-bold text-base md:text-lg bg-red-500/10 px-3 py-1 rounded-lg">
                          ⚔️ {entry.enemiesKilled}
                        </span>
                      </td>
                      <td className="text-center py-4 px-3 md:px-6">
                        <span className="inline-flex items-center gap-1 text-blue-400 font-bold text-base md:text-lg bg-blue-500/10 px-3 py-1 rounded-lg">
                          ⚡ {entry.powerUpsCollected}
                        </span>
                      </td>
                      <td className="text-right py-4 px-3 md:px-6 hidden md:table-cell">
                        <span className="text-gray-400 text-sm">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-purple-500/30 text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <span className="text-purple-400">💎</span>
            All scores are stored permanently on the OneChain blockchain
            <span className="text-purple-400">⛓️</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        /* Custom scrollbar */
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        *::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        *::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};
