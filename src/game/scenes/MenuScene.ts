import Phaser from 'phaser';
import { SCENES } from '../config';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Title
    const title = this.add.text(width / 2, height / 3, '🥷 NINJA RUSH', {
      fontSize: '64px',
      color: '#e94560',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    // Subtitle
    const subtitle = this.add.text(width / 2, height / 3 + 70, 'Survive 30 Seconds', {
      fontSize: '24px',
      color: '#f4a261'
    });
    subtitle.setOrigin(0.5);
    
    // High score display
    const highScore = localStorage.getItem('ninjaRush_highScore') || '0';
    const highScoreText = this.add.text(width / 2, height / 2, `High Score: ${highScore}`, {
      fontSize: '20px',
      color: '#ffffff'
    });
    highScoreText.setOrigin(0.5);
    
    // Play button
    const playButton = this.add.text(width / 2, height / 2 + 80, 'PLAY', {
      fontSize: '48px',
      color: '#ffffff',
      backgroundColor: '#e94560',
      padding: { x: 40, y: 15 }
    });
    playButton.setOrigin(0.5);
    playButton.setInteractive({ useHandCursor: true });
    
    playButton.on('pointerover', () => {
      playButton.setScale(1.1);
    });
    
    playButton.on('pointerout', () => {
      playButton.setScale(1);
    });
    
    playButton.on('pointerdown', () => {
      this.scene.start(SCENES.GAME);
    });
    
    // Controls info
    const controlsText = this.add.text(width / 2, height - 100, 
      'Arrow Keys or A/D to Move • Space to Throw Shurikens', {
      fontSize: '16px',
      color: '#888888'
    });
    controlsText.setOrigin(0.5);
    
    // Add some animated stars in background
    this.createStarfield();
  }
  
  private createStarfield() {
    const { width, height } = this.cameras.main;
    
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const star = this.add.circle(x, y, 1, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.8));
      
      // Twinkling effect
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.1, 0.3),
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }
  }
}
