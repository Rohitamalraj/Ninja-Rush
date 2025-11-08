import Phaser from 'phaser';
import { POWERUP_CONFIG, type PowerUpType } from '../utils/constants';

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
  private powerUpType: PowerUpType;
  private lifespan: number = 5000; // 5 seconds before disappearing
  private spawnTime: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    const textureKey = `powerup-${type}`;
    super(scene, x, y, textureKey);
    
    this.powerUpType = type;
    this.spawnTime = Date.now();
    
    const config = POWERUP_CONFIG[type];
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setTint(config.color);
    
    // Float animation
    scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Pulse animation
    scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Sparkle effect
    const particles = scene.add.particles(x, y, textureKey, {
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 },
      speed: { min: 20, max: 50 },
      lifespan: 500,
      frequency: 200,
      blendMode: 'ADD'
    });
    
    particles.startFollow(this);
    
    // Auto-destroy after lifespan
    scene.time.delayedCall(this.lifespan, () => {
      if (this.active) {
        particles.stop();
        scene.tweens.add({
          targets: this,
          alpha: 0,
          scale: 0,
          duration: 300,
          onComplete: () => {
            particles.destroy();
            this.destroy();
          }
        });
      }
    });
  }

  getType(): PowerUpType {
    return this.powerUpType;
  }

  getAge(): number {
    return Date.now() - this.spawnTime;
  }
}
