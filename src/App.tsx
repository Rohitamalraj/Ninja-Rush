import { useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { useGameStore } from './store/gameStore';

function App() {
  const loadHighScore = useGameStore((state) => state.loadHighScore);

  useEffect(() => {
    // Load saved data on mount
    loadHighScore();
  }, [loadHighScore]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-ninja-dark">
      <GameCanvas />
    </div>
  );
}

export default App;
