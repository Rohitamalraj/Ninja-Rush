import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config';
import { useWallet } from '../contexts/WalletContext';

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const { claimNinjaTokens } = useWallet();

  useEffect(() => {
    if (!parentRef.current) return;

    // Create game instance
    const config = {
      ...gameConfig,
      parent: parentRef.current,
    };

    gameRef.current = new Phaser.Game(config);

    // Store wallet functions in game registry for scenes to access
    if (gameRef.current) {
      gameRef.current.registry.set('claimNinjaTokens', claimNinjaTokens);
    }

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full bg-ninja-dark">
      <div ref={parentRef} id="game-container" className="rounded-lg shadow-2xl" />
    </div>
  );
}
