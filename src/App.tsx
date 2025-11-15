import { useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { WalletButton } from './components/WalletButton';
import { MilestoneProgress } from './components/MilestoneProgress';
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
      <div className="w-screen h-screen overflow-hidden bg-ninja-dark">
        <WalletButton />
        <GameCanvas />
        <MilestoneProgress />
      </div>
    </WalletProvider>
  );
}

export default App;
