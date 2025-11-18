import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { LeaderboardModal } from './LeaderboardModal';

interface MainMenuProps {
  onStartGame: () => void;
  highScore: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, highScore }) => {
  const { balance } = useWallet();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden" style={{ width: '100vw', height: '100vh' }}>
      {/* Background Image - Full Screen */}
      <img 
        src="/assets/images/og_background.png" 
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center'
        }}
      />
      
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30" />

      {/* Content Layer */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-between py-16 px-8">
        
        {/* Top Section - Logo */}
        <div className="flex-shrink-0">
          <img 
            src="/assets/images/logo_ninja.png" 
            alt="Ninja Rush" 
            className="w-[450px] h-auto drop-shadow-2xl"
            style={{ 
              filter: 'drop-shadow(0 10px 50px rgba(239, 68, 68, 0.8))',
              animation: 'logoBounce 2s ease-in-out infinite'
            }}
          />
        </div>

        {/* Middle Section - Stats + Buttons */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          
          {/* Stats Row - Enhanced Badges */}
          <div className="flex gap-8">
            {/* High Score Badge */}
            <div className="relative group">
              {/* Multi-layer glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity"></div>
              
              <div 
                className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-300"
                style={{
                  boxShadow: '0 15px 40px rgba(255,165,0,0.5), inset 0 -5px 15px rgba(0,0,0,0.3), inset 0 5px 15px rgba(255,255,255,0.2)',
                  border: '4px solid rgba(255,215,0,0.6)'
                }}
              >
                {/* Inner shine */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-transparent"></div>
                
                {/* Content */}
                <div className="relative text-center">
                  <div className="text-6xl mb-2 drop-shadow-lg filter">🏆</div>
                  <div className="text-white font-bold text-xs uppercase tracking-wider drop-shadow-md">High Score</div>
                  <div className="text-white text-4xl font-black mt-1 drop-shadow-lg">{highScore}</div>
                </div>
              </div>
            </div>

            {/* NINJA Balance Badge */}
            <div className="relative group">
              {/* Multi-layer glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity"></div>
              
              <div 
                className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transform hover:scale-110 hover:-rotate-6 transition-all duration-300"
                style={{
                  boxShadow: '0 15px 40px rgba(168,85,247,0.5), inset 0 -5px 15px rgba(0,0,0,0.3), inset 0 5px 15px rgba(255,255,255,0.2)',
                  border: '4px solid rgba(192,132,252,0.6)'
                }}
              >
                {/* Inner shine */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-transparent"></div>
                
                {/* Content */}
                <div className="relative text-center">
                  <div className="text-6xl mb-2 drop-shadow-lg filter">💎</div>
                  <div className="text-white font-bold text-xs uppercase tracking-wider drop-shadow-md">Your NINJA</div>
                  <div className="text-white text-4xl font-black mt-1 drop-shadow-lg">{balance.ninja}</div>
                </div>
              </div>
            </div>
          </div>
          {/* High Score Badge */}
          <div className="relative group">
            {/* Multi-layer glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity"></div>
            
            <div 
              className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-300"
              style={{
                boxShadow: '0 15px 40px rgba(255,165,0,0.5), inset 0 -5px 15px rgba(0,0,0,0.3), inset 0 5px 15px rgba(255,255,255,0.2)',
                border: '4px solid rgba(255,215,0,0.6)'
              }}
            >
              {/* Inner shine */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-transparent"></div>
              
              {/* Content */}
              <div className="relative text-center">
                <div className="text-6xl mb-2 drop-shadow-lg filter">🏆</div>
                <div className="text-white font-bold text-xs uppercase tracking-wider drop-shadow-md">High Score</div>
                <div className="text-white text-4xl font-black mt-1 drop-shadow-lg">{highScore}</div>
              </div>
            </div>
          </div>

          {/* NINJA Balance Badge */}
          <div className="relative group">
            {/* Multi-layer glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity"></div>
            
            <div 
              className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transform hover:scale-110 hover:-rotate-6 transition-all duration-300"
              style={{
                boxShadow: '0 15px 40px rgba(168,85,247,0.5), inset 0 -5px 15px rgba(0,0,0,0.3), inset 0 5px 15px rgba(255,255,255,0.2)',
                border: '4px solid rgba(192,132,252,0.6)'
              }}
            >
              {/* Inner shine */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-transparent"></div>
              
              {/* Content */}
              <div className="relative text-center">
                <div className="text-6xl mb-2 drop-shadow-lg filter">💎</div>
                <div className="text-white font-bold text-xs uppercase tracking-wider drop-shadow-md">Your NINJA</div>
                <div className="text-white text-4xl font-black mt-1 drop-shadow-lg">{balance.ninja}</div>
              </div>
            </div>
          </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-4 items-center">
            {/* Giant PLAY Button - Enhanced */}
            <div className="relative group">
          {/* Outer glow layers */}
          <div className="absolute -inset-6 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-full blur-3xl opacity-60 group-hover:opacity-90 animate-pulse transition-opacity"></div>
          <div className="absolute -inset-3 bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
          
          <button
            onClick={onStartGame}
            className="relative overflow-hidden bg-gradient-to-br from-red-600 via-purple-600 to-blue-600 text-white font-black text-5xl px-28 py-12 rounded-full shadow-2xl transform hover:scale-110 active:scale-95 transition-all duration-300"
            style={{ 
              textShadow: '0 4px 15px rgba(0,0,0,0.9), 0 0 30px rgba(255,255,255,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 -5px 20px rgba(0,0,0,0.3), inset 0 5px 20px rgba(255,255,255,0.1)'
            }}
          >
            {/* Shine effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Button border glow */}
            <div className="absolute inset-0 rounded-full border-4 border-white/30 group-hover:border-white/50 transition-colors"></div>
            
            {/* Content */}
            <div className="relative flex items-center gap-5">
              <span className="text-7xl animate-pulse drop-shadow-lg">▶</span>
              <span className="uppercase tracking-widest drop-shadow-lg">PLAY NOW</span>
            </div>
            </button>
          </div>

          {/* Secondary Buttons Row */}
          <div className="flex gap-4">
            {/* How to Play Button - Enhanced */}
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="relative overflow-hidden group bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 text-white font-bold text-lg px-10 py-4 rounded-full shadow-xl transform hover:scale-110 transition-all duration-300"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                boxShadow: '0 10px 30px rgba(0,150,255,0.4), inset 0 -3px 15px rgba(0,0,0,0.3), inset 0 3px 15px rgba(255,255,255,0.1)'
              }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
              
              {/* Border glow */}
              <div className="absolute inset-0 rounded-full border-3 border-cyan-300/40 group-hover:border-cyan-300/70 transition-colors"></div>
              
              {/* Content */}
              <span className="relative">
                {showInstructions ? '❌ Close Guide' : '📖 How to Play'}
              </span>
            </button>

            {/* Leaderboard Button - NEW */}
            <button
              onClick={() => setShowLeaderboard(true)}
              className="relative overflow-hidden group bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 text-white font-bold text-lg px-10 py-4 rounded-full shadow-xl transform hover:scale-110 transition-all duration-300"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                boxShadow: '0 10px 30px rgba(16,185,129,0.4), inset 0 -3px 15px rgba(0,0,0,0.3), inset 0 3px 15px rgba(255,255,255,0.1)'
              }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
              
              {/* Border glow */}
              <div className="absolute inset-0 rounded-full border-3 border-emerald-300/40 group-hover:border-emerald-300/70 transition-colors pointer-events-none"></div>
              
              {/* Content */}
              <span className="relative pointer-events-none">
                🏆 Leaderboard
              </span>
            </button>
          </div>
        </div>

        {/* Instructions Panel */}
        {showInstructions && (
          <div className="bg-black/90 backdrop-blur-xl rounded-3xl p-8 max-w-3xl border-4 border-purple-500/50 shadow-2xl animate-slideDown">
            <h3 className="text-4xl font-black text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              🎮 HOW TO PLAY
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">⬅️➡️</span>
                  <span className="text-white font-bold text-lg">Move</span>
                </div>
                <p className="text-gray-300 text-sm">Arrow Keys / A-D</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">⬆️</span>
                  <span className="text-white font-bold text-lg">Jump</span>
                </div>
                <p className="text-gray-300 text-sm">Space / W / Up Arrow</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">⏱️</span>
                  <span className="text-white font-bold text-lg">Survive 30s</span>
                </div>
                <p className="text-gray-300 text-sm">Avoid enemies & obstacles</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">💎</span>
                  <span className="text-white font-bold text-lg">Earn Crypto</span>
                </div>
                <p className="text-gray-300 text-sm">1 score = 1 NINJA token</p>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-2xl p-6 border-2 border-yellow-500/40">
              <h4 className="text-2xl font-black text-center text-yellow-400 mb-4">🏆 MILESTONE REWARDS</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="transform hover:scale-110 transition">
                  <div className="text-4xl mb-1">🥉</div>
                  <div className="text-yellow-600 font-bold text-xs mb-1">BRONZE</div>
                  <div className="text-white font-bold">100 NINJA</div>
                  <div className="text-green-400 font-black text-xl">→ 5 OCT</div>
                </div>
                <div className="transform hover:scale-110 transition">
                  <div className="text-4xl mb-1">🥈</div>
                  <div className="text-gray-400 font-bold text-xs mb-1">SILVER</div>
                  <div className="text-white font-bold">300 NINJA</div>
                  <div className="text-green-400 font-black text-xl">→ 15 OCT</div>
                </div>
                <div className="transform hover:scale-110 transition">
                  <div className="text-4xl mb-1">🥇</div>
                  <div className="text-yellow-400 font-bold text-xs mb-1">GOLD</div>
                  <div className="text-white font-bold">1000 NINJA</div>
                  <div className="text-green-400 font-black text-xl">→ 50 OCT</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex-shrink-0">
          <div className="bg-black/60 backdrop-blur-sm px-8 py-3 rounded-full border border-white/20 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">⛓️ Built on</span>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">OneChain</span>
            </div>
            <span className="text-white/60">•</span>
            <span className="text-green-400 font-semibold text-sm">🎮 Play-to-Earn</span>
            <span className="text-white/60">•</span>
            <span className="text-blue-400 font-semibold text-sm">💎 On-Chain Rewards</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Animations */}
      <style>{`
        @keyframes logoBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }

        /* Button hover glow pulse */
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};
