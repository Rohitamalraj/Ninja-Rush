import { useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { WalletButton } from './components/WalletButton';
import { MilestoneProgress } from './components/MilestoneProgress';
import { GameInfo } from './components/GameInfo';
import { NetworkCheck } from './components/NetworkCheck';
import { WalletProvider } from './contexts/WalletContext';
import { useGameStore } from './store/gameStore';

function App() {
  const loadHighScore = useGameStore((state) => state.loadHighScore);

  useEffect(() => {
    // Load saved data on mount
    loadHighScore();
  }, [loadHighScore]);

  return (
    <WalletProvider>
      <div className="w-screen h-screen overflow-hidden bg-ninja-dark relative">
        <NetworkCheck />
        <WalletButton />
        <GameCanvas />
        {/* Only show game UI elements when not on main menu */}
        <GameInfo />
        <MilestoneProgress />
      </div>
    </WalletProvider>
  );
}

export default App;
