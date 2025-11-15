import React from 'react';
import { useWallet } from '../contexts/WalletContext';

export const WalletButton: React.FC = () => {
  const { connected, address, balance, connecting, connect, disconnect } = useWallet();

  if (connected && address) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
        {/* Token Balances */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-orange-400 text-sm font-bold">{balance.ninja}</div>
              <div className="text-gray-400 text-xs">NINJA</div>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center">
              <div className="text-blue-400 text-sm font-bold">{balance.oct}</div>
              <div className="text-gray-400 text-xs">OCT</div>
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-gray-300 text-sm font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <button
            onClick={disconnect}
            className="text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
            title="Disconnect"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={connect}
        disabled={connecting}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                   text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {connecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Connect OneWallet
          </>
        )}
      </button>
    </div>
  );
};
