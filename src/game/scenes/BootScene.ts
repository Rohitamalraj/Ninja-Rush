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
    
    // TODO: Load actual game assets here
    // For now, we'll create placeholder graphics
    this.createPlaceholderAssets();
  }

  create() {
    // Move to menu scene after loading
    this.scene.start(SCENES.MENU);
  }
  
  private createPlaceholderAssets() {
    // Create enhanced placeholder sprites with more detail
    
    // Player sprite - Ninja silhouette
    const playerGraphics = this.add.graphics();
    // Body (green ninja)
    playerGraphics.fillStyle(0x2d5016, 1);
    playerGraphics.fillRect(8, 12, 16, 24);
    // Head
    playerGraphics.fillStyle(0x3a6b1f, 1);
    playerGraphics.fillCircle(16, 10, 8);
    // Eyes (glowing)
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(13, 9, 2);
    playerGraphics.fillCircle(19, 9, 2);
    // Arms
    playerGraphics.fillStyle(0x2d5016, 1);
    playerGraphics.fillRect(4, 16, 6, 12);
    playerGraphics.fillRect(22, 16, 6, 12);
    // Legs
    playerGraphics.fillRect(10, 36, 5, 10);
    playerGraphics.fillRect(17, 36, 5, 10);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();
    
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
    
    // Basic enemy - Simple rogue
    const basicEnemyGraphics = this.add.graphics();
    basicEnemyGraphics.fillStyle(0x8b0000, 1);
    basicEnemyGraphics.fillRect(8, 8, 16, 16);
    // Eyes
    basicEnemyGraphics.fillStyle(0xff0000, 1);
    basicEnemyGraphics.fillCircle(13, 13, 2);
    basicEnemyGraphics.fillCircle(19, 13, 2);
    // Shadow
    basicEnemyGraphics.fillStyle(0x000000, 0.3);
    basicEnemyGraphics.fillEllipse(16, 28, 16, 4);
    basicEnemyGraphics.generateTexture('enemy-basic', 32, 32);
    basicEnemyGraphics.destroy();
    
    // Fast enemy - Streamlined
    const fastEnemyGraphics = this.add.graphics();
    fastEnemyGraphics.fillStyle(0xff4444, 1);
    // Elongated body for speed
    fastEnemyGraphics.fillRect(6, 6, 16, 16);
    fastEnemyGraphics.fillTriangle(22, 10, 22, 18, 28, 14);
    // Glowing eyes
    fastEnemyGraphics.fillStyle(0xffff00, 1);
    fastEnemyGraphics.fillCircle(12, 12, 2);
    fastEnemyGraphics.fillCircle(17, 12, 2);
    fastEnemyGraphics.generateTexture('enemy-fast', 28, 28);
    fastEnemyGraphics.destroy();
    
    // Armored enemy - Larger with armor plating
    const armoredEnemyGraphics = this.add.graphics();
    // Armor plating
    armoredEnemyGraphics.fillStyle(0x2a6f7f, 1);
    armoredEnemyGraphics.fillRect(8, 8, 24, 24);
    armoredEnemyGraphics.fillStyle(0x4ecdc4, 1);
    armoredEnemyGraphics.fillRect(10, 10, 20, 20);
    // Helmet
    armoredEnemyGraphics.fillStyle(0x2a6f7f, 1);
    armoredEnemyGraphics.fillRect(12, 12, 16, 8);
    // Eyes
    armoredEnemyGraphics.fillStyle(0xff0000, 1);
    armoredEnemyGraphics.fillCircle(16, 16, 2);
    armoredEnemyGraphics.fillCircle(24, 16, 2);
    armoredEnemyGraphics.generateTexture('enemy-armored', 40, 40);
    armoredEnemyGraphics.destroy();
    
    // Boss enemy - Large and menacing
    const bossEnemyGraphics = this.add.graphics();
    // Body
    bossEnemyGraphics.fillStyle(0x8b008b, 1);
    bossEnemyGraphics.fillRect(8, 12, 32, 32);
    // Crown/horns
    bossEnemyGraphics.fillStyle(0xff00ff, 1);
    bossEnemyGraphics.fillTriangle(10, 12, 15, 4, 20, 12);
    bossEnemyGraphics.fillTriangle(28, 12, 33, 4, 38, 12);
    // Eyes (glowing)
    bossEnemyGraphics.fillStyle(0xffffff, 1);
    bossEnemyGraphics.fillCircle(18, 22, 3);
    bossEnemyGraphics.fillCircle(30, 22, 3);
    bossEnemyGraphics.fillStyle(0xff0000, 1);
    bossEnemyGraphics.fillCircle(18, 22, 2);
    bossEnemyGraphics.fillCircle(30, 22, 2);
    bossEnemyGraphics.generateTexture('enemy-boss', 48, 48);
    bossEnemyGraphics.destroy();
    
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
