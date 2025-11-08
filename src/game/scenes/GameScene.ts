import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, ENEMY_CONFIG, POWERUP_CONFIG, COMBO_THRESHOLDS } from '../utils/constants';
import type { EnemyType, PowerUpType } from '../utils/constants';
import { soundGenerator } from '../utils/soundGenerator';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import PowerUp from '../entities/PowerUp';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private powerUps!: Phaser.GameObjects.Group;
  
  private score: number = 0;
  private lives: number = GAME_CONFIG.PLAYER_LIVES;
  private timeLeft: number = GAME_CONFIG.ROUND_DURATION;
  private isGameOver: boolean = false;
  
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  
  private lastEnemySpawn: number = 0;
  private lastPowerUpCheck: number = 0;
  private comboKills: number[] = [];
  private currentDifficultyPhase: number = 0;
  private frenzyMode: boolean = false;
  
  constructor() {
    super({ key: SCENES.GAME });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Reset game state
    this.score = 0;
    this.lives = GAME_CONFIG.PLAYER_LIVES;
    this.timeLeft = GAME_CONFIG.ROUND_DURATION;
    this.isGameOver = false;
    this.comboKills = [];
    this.currentDifficultyPhase = 0;
    this.frenzyMode = false;
    
    // Create background
    this.createBackground();
    
    // Create player
    this.player = new Player(this, width / 2, height - 80);
    
    // Create groups
    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: true
    });
    
    this.powerUps = this.add.group({
      classType: PowerUp,
      runChildUpdate: true
    });
    
    // Setup collisions
    this.setupCollisions();
    
    // Create UI
    this.createUI();
    
    // Setup input
    this.setupInput();
  }

  update(time: number, delta: number) {
    // Don't update if game is over
    if (this.isGameOver) return;
    
    // Update timer
    this.timeLeft -= delta / 1000;
    this.timerText.setText(`Time: ${Math.ceil(this.timeLeft)}s`);
    
    // Check for game over
    if (this.timeLeft <= 0 || this.lives <= 0) {
      this.gameOver();
      return;
    }
    
    // Timer warning beeps
    const secondsLeft = Math.ceil(this.timeLeft);
    if (secondsLeft <= 5 && secondsLeft > 0) {
      const prevSecondsLeft = Math.ceil(this.timeLeft + delta / 1000);
      if (secondsLeft !== prevSecondsLeft) {
        soundGenerator.playBeep();
      }
    }
    
    // Update timer color if low
    if (this.timeLeft <= 10) {
      this.timerText.setColor('#ff0000');
      if (this.timeLeft <= 5 && Math.floor(time / 500) % 2 === 0) {
        this.timerText.setAlpha(0.5);
      } else {
        this.timerText.setAlpha(1);
      }
    }
    
    // Update difficulty phase
    this.updateDifficulty();
    
    // Spawn enemies
    this.spawnEnemies(time);
    
    // Spawn power-ups
    this.checkPowerUpSpawn(time);
    
    // Update player
    this.player.update(time, delta);
    
    // Clean up old combos
    this.cleanOldCombos(time);
    
    // Update frenzy mode visuals
    if (this.frenzyMode) {
      this.cameras.main.setBackgroundColor(0x330000 + Math.floor(Math.sin(time / 100) * 50) * 0x010000);
    }
  }

  private createBackground() {
    const { width, height } = this.cameras.main;
    
    // Use the loaded background image
    const bg = this.add.image(width / 2, height / 2, 'game-background');
    
    // Scale the background to cover the entire game area
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    
    // Add a subtle overlay for better contrast with game elements
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.2);
  }

  private createUI() {
    const { width } = this.cameras.main;
    
    // Score
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
    
    // Timer
    this.timerText = this.add.text(width / 2, 16, `Time: ${GAME_CONFIG.ROUND_DURATION}s`, {
      fontSize: '32px',
      color: '#f4a261',
      fontStyle: 'bold'
    });
    this.timerText.setOrigin(0.5, 0);
    
    // Lives
    this.livesText = this.add.text(width - 16, 16, `❤️ ${this.lives}`, {
      fontSize: '24px',
      color: '#ff1744'
    });
    this.livesText.setOrigin(1, 0);
    
    // Combo text (hidden by default)
    this.comboText = this.add.text(width / 2, 100, '', {
      fontSize: '48px',
      color: '#ffd93d',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);
    this.comboText.setAlpha(0);
  }

  private setupInput() {
    // Pause on ESC
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      // TODO: Show pause menu
    });
  }

  private setupCollisions() {
    // Shuriken hits enemy
    this.physics.add.overlap(
      this.player.getShurikens(),
      this.enemies,
      this.handleShurikenHit.bind(this),
      undefined,
      this
    );
    
    // Enemy hits player
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleEnemyHitPlayer.bind(this),
      undefined,
      this
    );
    
    // Player collects power-up
    this.physics.add.overlap(
      this.player,
      this.powerUps,
      this.handlePowerUpCollect.bind(this),
      undefined,
      this
    );
  }

  private handleShurikenHit(shuriken: any, enemy: any) {
    const enemyObj = enemy as Enemy;
    
    enemyObj.hit();
    shuriken.destroy();
    
    // Play hit sound
    soundGenerator.playHit();
    
    if (enemyObj.isDead()) {
      // Add score
      const points = enemyObj.getPoints();
      this.addScore(points);
      
      // Register kill for combo
      this.registerKill();
      
      // Destroy enemy
      enemyObj.destroy();
      
      // Particle effect
      this.createDeathParticles(enemyObj.x, enemyObj.y);
      
      // Play explosion sound
      soundGenerator.playExplosion();
    }
  }

  private handleEnemyHitPlayer(player: any, enemy: any) {
    const enemyObj = enemy as Enemy;
    
    if (this.player.canTakeDamage()) {
      this.lives--;
      this.livesText.setText(`❤️ ${this.lives}`);
      this.player.hit();
      
      // Play damage sound
      soundGenerator.playPlayerHit();
      
      // Screen shake
      this.cameras.main.shake(200, 0.01);
      
      // Flash effect
      this.cameras.main.flash(200, 255, 0, 0);
    }
    
    enemyObj.destroy();
  }

  private handlePowerUpCollect(player: any, powerUp: any) {
    const powerUpObj = powerUp as PowerUp;
    const type = powerUpObj.getType();
    
    this.addScore(POWERUP_CONFIG[type].points);
    
    // Play power-up sound
    soundGenerator.playPowerUp();
    
    // Apply power-up effect
    this.player.applyPowerUp(type);
    
    // Special handling for health scroll
    if (type === 'healthScroll') {
      this.lives = Math.min(this.lives + 1, GAME_CONFIG.PLAYER_LIVES);
      this.livesText.setText(`❤️ ${this.lives}`);
    }
    
    powerUpObj.destroy();
  }

  private addScore(points: number) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Pulse effect
    this.tweens.add({
      targets: this.scoreText,
      scale: 1.2,
      duration: 100,
      yoyo: true
    });
  }

  private registerKill() {
    const now = Date.now();
    this.comboKills.push(now);
    
    // Check for combo milestones
    const comboCount = this.comboKills.length;
    
    for (const threshold of COMBO_THRESHOLDS) {
      if (comboCount === threshold.kills) {
        this.addScore(threshold.bonus);
        this.showComboText(threshold.text);
        
        // Play combo sound
        soundGenerator.playCombo();
        
        // Special reward for 10 combo
        if (comboCount === 10) {
          this.spawnPowerUp(true);
        }
        break;
      }
    }
    
    // Update combo display for 2+ kills
    if (comboCount >= 2) {
      this.showComboText(`${comboCount}x Combo!`);
    }
  }

  private cleanOldCombos(time: number) {
    const cutoff = Date.now() - GAME_CONFIG.COMBO_WINDOW;
    this.comboKills = this.comboKills.filter(killTime => killTime > cutoff);
  }

  private showComboText(text: string) {
    this.comboText.setText(text);
    this.comboText.setAlpha(1);
    
    this.tweens.add({
      targets: this.comboText,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      onComplete: () => {
        this.comboText.setScale(1);
      }
    });
  }

  private updateDifficulty() {
    const elapsed = GAME_CONFIG.ROUND_DURATION - this.timeLeft;
    
    for (let i = GAME_CONFIG.DIFFICULTY_PHASES.length - 1; i >= 0; i--) {
      const phase = GAME_CONFIG.DIFFICULTY_PHASES[i];
      if (elapsed >= phase.time) {
        if (this.currentDifficultyPhase !== i) {
          this.currentDifficultyPhase = i;
          
          // Enable frenzy mode
          if (phase.frenzyMode && !this.frenzyMode) {
            this.frenzyMode = true;
            this.showComboText('FRENZY MODE!');
          }
        }
        break;
      }
    }
  }

  private spawnEnemies(time: number) {
    const phase = GAME_CONFIG.DIFFICULTY_PHASES[this.currentDifficultyPhase];
    
    if (time - this.lastEnemySpawn > phase.spawnRate) {
      this.lastEnemySpawn = time;
      
      // Random enemy type from current phase
      const enemyType = Phaser.Utils.Array.GetRandom(phase.enemyTypes) as EnemyType;
      
      // Random spawn position (top or sides)
      const { width, height } = this.cameras.main;
      let x, y;
      
      if (Math.random() < 0.7) {
        // Spawn from top
        x = Phaser.Math.Between(50, width - 50);
        y = -50;
      } else {
        // Spawn from sides
        x = Math.random() < 0.5 ? -50 : width + 50;
        y = Phaser.Math.Between(50, height / 2);
      }
      
      const enemy = new Enemy(this, x, y, enemyType, phase.speedMultiplier);
      enemy.setTarget(this.player);
      this.enemies.add(enemy);
    }
  }

  private checkPowerUpSpawn(time: number) {
    if (time - this.lastPowerUpCheck > GAME_CONFIG.POWERUP_SPAWN_INTERVAL) {
      this.lastPowerUpCheck = time;
      
      if (Math.random() < GAME_CONFIG.POWERUP_SPAWN_CHANCE) {
        this.spawnPowerUp();
      }
    }
  }

  private spawnPowerUp(force: boolean = false) {
    if (!force && Math.random() > GAME_CONFIG.POWERUP_SPAWN_CHANCE) return;
    
    const { width, height } = this.cameras.main;
    const x = Phaser.Math.Between(100, width - 100);
    const y = Phaser.Math.Between(100, height - 150);
    
    const types: PowerUpType[] = ['rapidFire', 'doubleShuriken', 'freezeBomb', 'invincibility', 'scoreMultiplier', 'healthScroll'];
    const type = Phaser.Utils.Array.GetRandom(types);
    
    const powerUp = new PowerUp(this, x, y, type);
    this.powerUps.add(powerUp);
  }

  private createDeathParticles(x: number, y: number) {
    const particles = this.add.particles(x, y, 'shuriken', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 8
    });
    
    this.time.delayedCall(600, () => particles.destroy());
  }

  private gameOver() {
    // Prevent multiple calls
    if (this.isGameOver) return;
    this.isGameOver = true;
    
    // Stop physics and disable inputs
    this.physics.pause();
    
    // Clean up groups properly before scene transition
    if (this.enemies) {
      this.enemies.clear(true, true);
    }
    if (this.powerUps) {
      this.powerUps.clear(true, true);
    }
    
    // Save high score
    const highScore = parseInt(localStorage.getItem('ninjaRush_highScore') || '0');
    if (this.score > highScore) {
      localStorage.setItem('ninjaRush_highScore', this.score.toString());
    }
    
    // Update stats
    const totalGames = parseInt(localStorage.getItem('ninjaRush_totalGames') || '0');
    localStorage.setItem('ninjaRush_totalGames', (totalGames + 1).toString());
    
    // Use a small delay to ensure cleanup is complete
    this.time.delayedCall(100, () => {
      // Pass score to game over scene
      this.scene.start(SCENES.GAMEOVER, { score: this.score, highScore: Math.max(this.score, highScore) });
    });
  }
}
