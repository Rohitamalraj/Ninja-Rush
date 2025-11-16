import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { gameConfig, SCENES } from '../game/config';
import { GameOverModal } from './GameOverModal';
import { MainMenu } from './MainMenu';
import { useUIStore } from '../store/uiStore';

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const { showMainMenu, setShowMainMenu } = useUIStore();
  const [highScore, setHighScore] = useState(0);
  const [gameStats, setGameStats] = useState({
    score: 0,
    enemiesKilled: 0,
    powerUpsCollected: 0,
  });

  useEffect(() => {
    if (!parentRef.current) return;

    // Load high score
    const savedHighScore = parseInt(localStorage.getItem('ninjaRush_highScore') || '0');
    setHighScore(savedHighScore);

    // Create game instance
    const config = {
      ...gameConfig,
      parent: parentRef.current,
    };

    gameRef.current = new Phaser.Game(config);

    // Don't start any Phaser scenes yet - React MainMenu will handle it
    // Just let Phaser initialize

    // Poll for game over state
    const checkGameOver = setInterval(() => {
      if (gameRef.current?.registry.get('showGameOverModal')) {
        const stats = gameRef.current.registry.get('gameOverStats');
        if (stats) {
          setGameStats(stats);
          setShowModal(true);
          setHighScore(stats.highScore);
          gameRef.current.registry.set('showGameOverModal', false);
        }
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      clearInterval(checkGameOver);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const handleStartGame = () => {
    setShowMainMenu(false);
    if (gameRef.current) {
      // Start the game directly, skipping Phaser's menu
      const gameScene = gameRef.current.scene.getScene(SCENES.GAME);
      if (gameScene) {
        gameScene.scene.start(SCENES.GAME);
      } else {
        // If game scene not ready, start from boot
        const bootScene = gameRef.current.scene.getScene(SCENES.BOOT);
        if (bootScene) {
          bootScene.scene.start(SCENES.GAME);
        }
      }
    }
  };

  const handlePlayAgain = () => {
    setShowModal(false);
    if (gameRef.current) {
      const gameScene = gameRef.current.scene.getScene(SCENES.GAME);
      if (gameScene) {
        gameScene.scene.restart();
      }
    }
  };

  const handleMainMenu = () => {
    setShowModal(false);
    setShowMainMenu(true);
    if (gameRef.current) {
      const gameScene = gameRef.current.scene.getScene(SCENES.GAME);
      if (gameScene) {
        gameScene.scene.start(SCENES.MENU);
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Phaser game container - hidden when menu is shown */}
      <div 
        ref={parentRef} 
        id="game-container" 
        className="rounded-lg shadow-2xl"
        style={{ display: showMainMenu ? 'none' : 'block' }}
      />
      
      {showMainMenu && (
        <MainMenu onStartGame={handleStartGame} highScore={highScore} />
      )}
      
      {showModal && (
        <GameOverModal
          score={gameStats.score}
          enemiesKilled={gameStats.enemiesKilled}
          powerUpsCollected={gameStats.powerUpsCollected}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleMainMenu}
        />
      )}
    </div>
  );
}
