import Phaser from 'phaser';
import { ENEMY_CONFIG, type EnemyType } from '../utils/constants';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  private enemyType: EnemyType;
  private hp: number;
  private maxHp: number;
  private speed: number;
  private points: number;
  private target: Phaser.GameObjects.GameObject | null = null;
  private speedMultiplier: number;
  private frozen: boolean = false;
  private frozenUntil: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType, speedMultiplier: number = 1) {
    const textureKey = `enemy-${type}`;
    super(scene, x, y, textureKey);
    
    this.enemyType = type;
    this.speedMultiplier = speedMultiplier;
    
    const config = ENEMY_CONFIG[type];
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.speed = config.speed * speedMultiplier;
    this.points = config.points;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Use fixed display sizes so large source images don't overflow the screen.
    // Increased sizes for better visibility
    if (type === 'boss') {
      this.setDisplaySize(100, 100);
    } else if (type === 'armored') {
      this.setDisplaySize(70, 70);
    } else if (type === 'fast') {
      this.setDisplaySize(55, 55);
    } else {
      // basic
      this.setDisplaySize(60, 60);
    }
    
    this.setTint(config.color);
    
    // Listen for freeze events
    scene.events.on('freezeEnemies', this.freeze, this);
  }

  update(time: number, delta: number) {
    // Check if still frozen
    if (this.frozen && time > this.frozenUntil) {
      this.frozen = false;
      this.clearTint();
      this.setTint(ENEMY_CONFIG[this.enemyType].color);
    }
    
    // Don't move if frozen
    if (this.frozen) {
      this.setVelocity(0, 0);
      return;
    }
    
    // Move towards target (player)
    if (this.target) {
      const targetSprite = this.target as Phaser.Physics.Arcade.Sprite;
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        targetSprite.x,
        targetSprite.y
      );
      
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
    }
    
    // Destroy if off screen (too far)
    if (this.y > this.scene.cameras.main.height + 100 ||
        this.x < -100 || this.x > this.scene.cameras.main.width + 100) {
      this.destroy();
    }
  }

  setTarget(target: Phaser.GameObjects.GameObject) {
    this.target = target;
  }

  hit() {
    this.hp--;
    
    // Flash effect
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        this.setTint(ENEMY_CONFIG[this.enemyType].color);
      }
    });
    
    // Scale effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  getPoints(): number {
    return this.points;
  }

  freeze(duration: number) {
    this.frozen = true;
    this.frozenUntil = Date.now() + duration;
    this.setTint(0x00d9ff);
  }

  destroy(fromScene?: boolean) {
    // Clean up event listeners only if scene is still active
    if (this.scene && this.scene.events) {
      this.scene.events.off('freezeEnemies', this.freeze, this);
    }
    super.destroy(fromScene);
  }
}
