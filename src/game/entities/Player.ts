import Phaser from 'phaser';
import { GAME_CONFIG, POWERUP_CONFIG, type PowerUpType } from '../utils/constants';
import { soundGenerator } from '../utils/soundGenerator';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key};
  private spaceKey!: Phaser.Input.Keyboard.Key;
  
  private shurikens!: Phaser.GameObjects.Group;
  private shurikenCooldown: number = 0;
  private cooldownMax: number = GAME_CONFIG.SHURIKEN_COOLDOWN;
  
  private invincible: boolean = false;
  private invincibleUntil: number = 0;
  
  private activePowerUps: Map<PowerUpType, number> = new Map();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Fix sprite sizing: use absolute display size so source image dimensions don't break layout
    // Increased slightly for better visibility
    this.setDisplaySize(60, 80);    // Setup physics
    this.setCollideWorldBounds(true);
    this.setImmovable(false);
    
    // Setup input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Create shuriken group
    this.shurikens = scene.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 50,
      runChildUpdate: true
    });
  }

  update(time: number, delta: number) {
    // Update cooldown
    if (this.shurikenCooldown > 0) {
      this.shurikenCooldown -= delta;
    }
    
    // Update invincibility
    if (this.invincible && time > this.invincibleUntil) {
      this.invincible = false;
      this.clearTint();
    }
    
    // Flashing effect when invincible
    if (this.invincible) {
      this.setAlpha(Math.sin(time / 50) * 0.5 + 0.5);
    } else {
      this.setAlpha(1);
    }
    
    // Handle movement
    this.handleMovement();
    
    // Handle shooting
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.throwShuriken();
    }
    
    // Update power-ups
    this.updatePowerUps(time);
  }

  private handleMovement() {
    const speed = GAME_CONFIG.PLAYER_SPEED;
    
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.setVelocityX(speed);
    } else {
      this.setVelocityX(0);
    }
  }

  private throwShuriken() {
    if (!this.canThrow()) return;
    
    // Play sound
    soundGenerator.playShuriken();
    
    // Apply cooldown (check for rapid fire power-up)
    const cooldownReduction = this.activePowerUps.has('rapidFire') ? 0.5 : 1;
    this.shurikenCooldown = this.cooldownMax * cooldownReduction;
    
    // Check for double shuriken power-up
    const count = this.activePowerUps.has('doubleShuriken') ? 2 : 1;
    
    for (let i = 0; i < count; i++) {
      const offsetX = count === 2 ? (i === 0 ? -10 : 10) : 0;
      this.createShuriken(this.x + offsetX, this.y - 20);
    }
  }

  private createShuriken(x: number, y: number) {
    const shuriken = this.scene.physics.add.sprite(x, y, 'shuriken');
    // Ensure shuriken is a small consistent size (slightly bigger for visibility)
    shuriken.setDisplaySize(16, 16);
    shuriken.setVelocityY(-GAME_CONFIG.SHURIKEN_SPEED);
    
    // Add rotation animation
    this.scene.tweens.add({
      targets: shuriken,
      angle: 360,
      duration: 500,
      repeat: -1,
      ease: 'Linear'
    });
    
    // Add trail effect
    const trail = this.scene.add.particles(x, y, 'shuriken', {
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 200,
      frequency: 50,
      follow: shuriken,
      quantity: 1
    });
    
    this.shurikens.add(shuriken);
    
    // Auto-destroy when off screen
    this.scene.time.delayedCall(2000, () => {
      if (shuriken.active) {
        trail.destroy();
        shuriken.destroy();
      }
    });
  }

  private canThrow(): boolean {
    return this.shurikenCooldown <= 0;
  }

  canTakeDamage(): boolean {
    return !this.invincible && !this.activePowerUps.has('invincibility');
  }

  hit() {
    if (this.canTakeDamage()) {
      this.invincible = true;
      this.invincibleUntil = Date.now() + GAME_CONFIG.INVINCIBILITY_DURATION;
      this.setTint(0xff0000);
      
      // Camera shake
      this.scene.cameras.main.shake(200, 0.01);
    }
  }

  applyPowerUp(type: PowerUpType) {
    const config = POWERUP_CONFIG[type];
    
    if (config.duration > 0) {
      this.activePowerUps.set(type, Date.now() + config.duration);
    }
    
    // Special handling for freeze bomb
    if (type === 'freezeBomb') {
      this.scene.events.emit('freezeEnemies', config.duration);
    }
  }

  private updatePowerUps(time: number) {
    // Remove expired power-ups
    for (const [type, expireTime] of this.activePowerUps.entries()) {
      if (time > expireTime) {
        this.activePowerUps.delete(type);
      }
    }
  }

  getShurikens(): Phaser.GameObjects.Group {
    return this.shurikens;
  }

  hasActivePowerUp(type: PowerUpType): boolean {
    return this.activePowerUps.has(type);
  }
}
