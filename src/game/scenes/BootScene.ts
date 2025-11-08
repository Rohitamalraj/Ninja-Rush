import Phaser from 'phaser';
import { SCENES } from '../config';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);
    
    // Update loading bar
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(Math.floor(value * 100) + '%');
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
    
    // Load game assets
    this.loadGameAssets();
    
    // Create placeholder assets for items that don't have images yet
    this.createPlaceholderAssets();
  }

  create() {
    // Move to menu scene after loading
    this.scene.start(SCENES.MENU);
  }
  
  private loadGameAssets() {
    // Load character sprites
    this.load.image('player', '/assets/images/ninja.png');
    
    // Load enemy sprites
    this.load.image('enemy-basic', '/assets/images/basic_rouge.png');
    this.load.image('enemy-fast', '/assets/images/fast_rouge.png');
    this.load.image('enemy-armored', '/assets/images/armoured_rouge.png');
    this.load.image('enemy-boss', '/assets/images/boss_rouge.png');
    
    // Load background
    this.load.image('game-background', '/assets/images/background_for_playing_screen.jpg');
  }
  
  private createPlaceholderAssets() {
    // Create placeholder sprites for items without images
    
    // Shuriken sprite - 4-pointed star
    const shurikenGraphics = this.add.graphics();
    shurikenGraphics.fillStyle(0xc0c0c0, 1);
    shurikenGraphics.beginPath();
    shurikenGraphics.moveTo(8, 2);
    shurikenGraphics.lineTo(10, 6);
    shurikenGraphics.lineTo(14, 8);
    shurikenGraphics.lineTo(10, 10);
    shurikenGraphics.lineTo(8, 14);
    shurikenGraphics.lineTo(6, 10);
    shurikenGraphics.lineTo(2, 8);
    shurikenGraphics.lineTo(6, 6);
    shurikenGraphics.closePath();
    shurikenGraphics.fillPath();
    // Center hole
    shurikenGraphics.fillStyle(0x000000, 0.3);
    shurikenGraphics.fillCircle(8, 8, 2);
    shurikenGraphics.generateTexture('shuriken', 16, 16);
    shurikenGraphics.destroy();
    
    // Power-ups with icons
    const powerupTypes = [
      { key: 'powerup-rapidFire', color: 0xff6b35, icon: '⚡' },
      { key: 'powerup-doubleShuriken', color: 0x4ecdc4, icon: '✦' },
      { key: 'powerup-freezeBomb', color: 0x00d9ff, icon: '❄' },
      { key: 'powerup-invincibility', color: 0xffd93d, icon: '🛡' },
      { key: 'powerup-scoreMultiplier', color: 0xf4a261, icon: '★' },
      { key: 'powerup-healthScroll', color: 0xff1744, icon: '❤' },
    ];
    
    powerupTypes.forEach(({ key, color }) => {
      const graphics = this.add.graphics();
      // Outer glow
      graphics.fillStyle(color, 0.3);
      graphics.fillCircle(16, 16, 18);
      // Main circle
      graphics.fillStyle(color, 1);
      graphics.fillCircle(16, 16, 14);
      // Inner highlight
      graphics.fillStyle(0xffffff, 0.5);
      graphics.fillCircle(16, 16, 10);
      // Core
      graphics.fillStyle(color, 0.8);
      graphics.fillCircle(16, 16, 8);
      graphics.generateTexture(key, 32, 32);
      graphics.destroy();
    });
  }
}
