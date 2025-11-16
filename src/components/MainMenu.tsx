import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface MainMenuProps {
  onStartGame: () => void;
  highScore: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, highScore }) => {
  const { connected, balance } = useWallet();
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        {/* Logo/Title */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-8xl">🥷</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 mb-4 drop-shadow-2xl tracking-wider">
            NINJA RUSH
          </h1>
          <p className="text-2xl md:text-3xl text-yellow-400 font-bold animate-pulse">
            Survive 30 Seconds & Earn Crypto!
          </p>
        </div>

        {/* Stats Display */}
        <div className="flex justify-center gap-6 mb-8">
          {/* High Score */}
          <div className="bg-gray-800/80 backdrop-blur-sm border-2 border-yellow-500 rounded-2xl px-8 py-4 transform hover:scale-105 transition-transform">
            <div className="text-yellow-400 text-sm font-semibold mb-1">HIGH SCORE</div>
            <div className="text-white text-4xl font-black">{highScore}</div>
          </div>

          {/* Wallet Balance */}
          {connected && (
            <div className="bg-gray-800/80 backdrop-blur-sm border-2 border-purple-500 rounded-2xl px-8 py-4 transform hover:scale-105 transition-transform">
              <div className="text-purple-400 text-sm font-semibold mb-1">YOUR NINJA</div>
              <div className="text-white text-4xl font-black">{balance.ninja.toFixed(0)}</div>
            </div>
          )}
        </div>

        {/* Main Play Button */}
        <button
          onClick={onStartGame}
          className="group relative mb-6 transform hover:scale-110 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 
                        text-white font-black text-5xl py-8 px-20 rounded-2xl shadow-2xl
                        border-4 border-white/20 transform transition-all">
            ▶ PLAY NOW
          </div>
        </button>

        {/* Secondary Button - How to Play */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-3 px-6 rounded-xl
                     border-2 border-blue-400 shadow-lg transform hover:scale-105 transition-all"
          >
            {showInstructions ? '❌ Close' : '📖 How to Play'}
          </button>
        </div>

        {/* Instructions Panel */}
        {showInstructions && (
          <div className="bg-gray-800/95 backdrop-blur-md border-2 border-gray-600 rounded-2xl p-8 mb-6 text-left max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-6 text-center">🎮 How to Play</h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-white">
              <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/30">
                <h4 className="text-xl font-bold text-blue-400 mb-3">🕹️ Controls</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">→</span> Arrow Keys / WASD to Move
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">→</span> SPACE to Throw Shurikens
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">→</span> Survive for 30 Seconds!
                  </li>
                </ul>
              </div>

              <div className="bg-green-900/30 p-4 rounded-xl border border-green-500/30">
                <h4 className="text-xl font-bold text-green-400 mb-3">💰 Earn Crypto</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">→</span> 1 NINJA per Score Point
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">→</span> Exchange at Milestones
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">→</span> 100 NINJA = 5 OCT
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-purple-900/30 p-4 rounded-xl border border-purple-500/30">
              <h4 className="text-xl font-bold text-purple-400 mb-3">🎯 Milestones</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl mb-1">🥉</div>
                  <div className="text-gray-300 text-sm">Bronze</div>
                  <div className="text-white font-bold">100 NINJA</div>
                  <div className="text-green-400 font-bold">→ 5 OCT</div>
                </div>
                <div>
                  <div className="text-3xl mb-1">🥈</div>
                  <div className="text-gray-300 text-sm">Silver</div>
                  <div className="text-white font-bold">300 NINJA</div>
                  <div className="text-green-400 font-bold">→ 15 OCT</div>
                </div>
                <div>
                  <div className="text-3xl mb-1">🥇</div>
                  <div className="text-gray-300 text-sm">Gold</div>
                  <div className="text-white font-bold">1000 NINJA</div>
                  <div className="text-green-400 font-bold">→ 50 OCT</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection Status */}
        {!connected && (
          <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-xl p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-3 text-yellow-400">
              <span className="text-2xl">⚠️</span>
              <div className="text-left">
                <div className="font-bold">Connect Wallet to Earn</div>
                <div className="text-sm text-gray-300">Click "Connect OneWallet" button above to start earning NINJA tokens!</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-gray-400 text-sm">
          <p>Built on OneChain • Play-to-Earn • On-Chain Rewards</p>
        </div>
      </div>
    </div>
  );
};
