import React, { useMemo, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useUIStore } from '../store/uiStore';

interface Milestone {
  ninjaRequired: number;
  octReward: number;
  tier: string;
}

const MILESTONES: Milestone[] = [
  { ninjaRequired: 100, octReward: 5, tier: 'Bronze' },
  { ninjaRequired: 300, octReward: 15, tier: 'Silver' },
  { ninjaRequired: 1000, octReward: 50, tier: 'Gold' },
];

export const MilestoneProgress: React.FC = () => {
  const { balance, connected, exchangeForOCT } = useWallet();
  const { showMainMenu } = useUIStore();
  const [claiming, setClaiming] = useState(false);

  const { currentMilestone, progress, nextReward, remaining, milestoneIndex } = useMemo(() => {
    const ninja = balance.ninja;
    
    // Find next milestone
    let current = MILESTONES.find(m => ninja < m.ninjaRequired);
    
    // If no milestone found, user has achieved all milestones
    if (!current) {
      current = MILESTONES[MILESTONES.length - 1];
      return {
        currentMilestone: current,
        progress: 100,
        nextReward: current.octReward,
        remaining: 0,
        milestoneIndex: MILESTONES.length
      };
    }

    const previousMilestone = MILESTONES[MILESTONES.indexOf(current) - 1];
    const baseNinja = previousMilestone ? previousMilestone.ninjaRequired : 0;
    
    const progressNinja = ninja - baseNinja;
    const requiredNinja = current.ninjaRequired - baseNinja;
    const progressPercent = (progressNinja / requiredNinja) * 100;

    return {
      currentMilestone: current,
      progress: Math.min(progressPercent, 100),
      nextReward: current.octReward,
      remaining: current.ninjaRequired - ninja,
      milestoneIndex: MILESTONES.indexOf(current) + 1
    };
  }, [balance.ninja]);

  const handleClaim = async () => {
    if (!canClaim || claiming) return;
    
    setClaiming(true);
    try {
      await exchangeForOCT(milestoneIndex);
      // Refresh balance after exchange
      setTimeout(() => {
        window.location.reload(); // Simple way to refresh all state
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to claim reward:', error);
      alert(`Failed to claim reward: ${errorMessage}`);
    } finally {
      setClaiming(false);
    }
  };

  // Hide on main menu or if not connected
  if (showMainMenu || !connected) {
    return null;
  }

  const canClaim = remaining <= 0;

  return (
    <div className="fixed bottom-6 right-6 w-96 z-40">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md rounded-2xl p-6 border-2 border-purple-500/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-lg">Milestone Progress</h3>
            <p className="text-gray-400 text-sm">{currentMilestone.tier} Tier</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-400">{nextReward}</div>
            <div className="text-gray-400 text-xs">OCT Reward</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-semibold">{balance.ninja} / {currentMilestone.ninjaRequired} NINJA</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {progress > 0 && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        {canClaim ? (
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="text-2xl">🎉</div>
              <div>
                <div className="text-green-400 font-bold text-sm">Milestone Reached!</div>
                <div className="text-green-300 text-xs">Ready to claim {nextReward} OCT</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="text-xl">🎯</div>
              <div>
                <div className="text-blue-400 font-semibold text-sm">{remaining} more NINJA needed</div>
                <div className="text-gray-400 text-xs">Keep playing to unlock {nextReward} OCT!</div>
              </div>
            </div>
          </div>
        )}

        {/* Claim Button */}
        <button
          disabled={!canClaim || claiming}
          onClick={handleClaim}
          className={`w-full py-3 rounded-lg font-bold transition-all duration-200 ${
            canClaim && !claiming
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {claiming ? 'Claiming...' : canClaim ? `Claim ${nextReward} OCT` : 'Milestone Locked'}
        </button>

        {/* All Milestones Mini View */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex justify-between text-xs">
            {MILESTONES.map((milestone, index) => {
              const achieved = balance.ninja >= milestone.ninjaRequired;
              return (
                <div key={index} className="text-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 ${
                    achieved 
                      ? 'bg-green-600 border-green-400 text-white' 
                      : 'bg-gray-800 border-gray-600 text-gray-500'
                  }`}>
                    {achieved ? '✓' : index + 1}
                  </div>
                  <div className={achieved ? 'text-green-400' : 'text-gray-500'}>
                    {milestone.ninjaRequired}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
