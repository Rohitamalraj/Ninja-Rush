import Phaser from 'phaser';
import { SCENES } from '../config';

export default class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private highScore: number = 0;

  constructor() {
    super({ key: SCENES.GAMEOVER });
  }

  init(data: { score: number; highScore: number }) {
    this.score = data.score || 0;
    this.highScore = data.highScore || 0;
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Game Over title
    const title = this.add.text(width / 2, height / 3 - 50, 'GAME OVER', {
      fontSize: '64px',
      color: '#e94560',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    // Check if new high score
    const isNewHighScore = this.score === this.highScore && this.score > 0;
    
    if (isNewHighScore) {
      const newRecordText = this.add.text(width / 2, height / 3 + 20, '🎉 NEW RECORD! 🎉', {
        fontSize: '32px',
        color: '#ffd93d',
        fontStyle: 'bold'
      });
      newRecordText.setOrigin(0.5);
      
      // Pulse animation
      this.tweens.add({
        targets: newRecordText,
        scale: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
    
    // Final score
    const scoreText = this.add.text(width / 2, height / 2 - 20, `Final Score: ${this.score}`, {
      fontSize: '36px',
      color: '#ffffff'
    });
    scoreText.setOrigin(0.5);
    
    // High score
    const highScoreText = this.add.text(width / 2, height / 2 + 30, `High Score: ${this.highScore}`, {
      fontSize: '24px',
      color: '#f4a261'
    });
    highScoreText.setOrigin(0.5);
    
    // Play Again button
    const playAgainButton = this.add.text(width / 2, height / 2 + 100, 'PLAY AGAIN', {
      fontSize: '36px',
      color: '#ffffff',
      backgroundColor: '#e94560',
      padding: { x: 30, y: 12 }
    });
    playAgainButton.setOrigin(0.5);
    playAgainButton.setInteractive({ useHandCursor: true });
    
    playAgainButton.on('pointerover', () => {
      playAgainButton.setScale(1.1);
    });
    
    playAgainButton.on('pointerout', () => {
      playAgainButton.setScale(1);
    });
    
    playAgainButton.on('pointerdown', () => {
      this.scene.start(SCENES.GAME);
    });
    
    // Main Menu button
    const menuButton = this.add.text(width / 2, height / 2 + 160, 'MAIN MENU', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#555555',
      padding: { x: 20, y: 8 }
    });
    menuButton.setOrigin(0.5);
    menuButton.setInteractive({ useHandCursor: true });
    
    menuButton.on('pointerover', () => {
      menuButton.setScale(1.1);
    });
    
    menuButton.on('pointerout', () => {
      menuButton.setScale(1);
    });
    
    menuButton.on('pointerdown', () => {
      this.scene.start(SCENES.MENU);
    });
    
    // Keyboard controls
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start(SCENES.GAME);
    });
    
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start(SCENES.MENU);
    });
    
    // Hint text
    const hintText = this.add.text(width / 2, height - 40, 'Press SPACE to play again or ESC for menu', {
      fontSize: '16px',
      color: '#888888'
    });
    hintText.setOrigin(0.5);
  }
}
