// Game Constants
export const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Game rules
  ROUND_DURATION: 30, // seconds
  PLAYER_LIVES: 3,
  
  // Combat
  COMBO_WINDOW: 2000, // milliseconds
  SHURIKEN_COOLDOWN: 500, // milliseconds
  INVINCIBILITY_DURATION: 1000, // milliseconds after hit
  
  // Difficulty phases (time in seconds)
  DIFFICULTY_PHASES: [
    {
      time: 0,
      spawnRate: 1000, // 1 enemy per second
      speedMultiplier: 1.0,
      enemyTypes: ['basic']
    },
    {
      time: 10,
      spawnRate: 500, // 2 enemies per second
      speedMultiplier: 1.3,
      enemyTypes: ['basic', 'fast']
    },
    {
      time: 20,
      spawnRate: 333, // 3 enemies per second
      speedMultiplier: 1.6,
      enemyTypes: ['basic', 'fast', 'armored']
    },
    {
      time: 25,
      spawnRate: 250, // 4 enemies per second
      speedMultiplier: 2.0,
      enemyTypes: ['fast', 'armored', 'boss'],
      frenzyMode: true
    }
  ],
  
  // Power-ups
  POWERUP_SPAWN_CHANCE: 0.2, // 20%
  POWERUP_SPAWN_INTERVAL: 8000, // milliseconds (8-10 seconds range)
  
  // Physics
  PLAYER_SPEED: 200,
  SHURIKEN_SPEED: 400,
  ENEMY_BASE_SPEED: 100,
} as const;

// Enemy configurations
export const ENEMY_CONFIG = {
  basic: {
    hp: 1,
    speed: 100,
    points: 10,
    color: 0x888888,
  },
  fast: {
    hp: 1,
    speed: 150,
    points: 15,
    color: 0xff6b6b,
  },
  armored: {
    hp: 2,
    speed: 80,
    points: 30,
    color: 0x4ecdc4,
  },
  boss: {
    hp: 3,
    speed: 60,
    points: 50,
    color: 0xff00ff,
    shootsBack: true,
  },
} as const;

// Power-up configurations
export const POWERUP_CONFIG = {
  rapidFire: {
    duration: 5000,
    effect: 0.5, // 50% cooldown reduction
    color: 0xff6b35,
    points: 5,
  },
  doubleShuriken: {
    duration: 5000,
    color: 0x4ecdc4,
    points: 5,
  },
  freezeBomb: {
    duration: 3000,
    color: 0x00d9ff,
    points: 5,
  },
  invincibility: {
    duration: 4000,
    color: 0xffd93d,
    points: 5,
  },
  scoreMultiplier: {
    duration: 6000,
    multiplier: 2,
    color: 0xf4a261,
    points: 5,
  },
  healthScroll: {
    duration: 0, // instant
    color: 0xff1744,
    points: 5,
  },
} as const;

// Combo thresholds
export const COMBO_THRESHOLDS = [
  { kills: 3, bonus: 50, text: 'Triple Kill!' },
  { kills: 5, bonus: 100, text: '5x Combo!' },
  { kills: 10, bonus: 200, text: 'Perfect 10 Combo!' },
] as const;

// Scene keys
export const SCENES = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  GAMEOVER: 'GameOverScene',
} as const;

export type EnemyType = keyof typeof ENEMY_CONFIG;
export type PowerUpType = keyof typeof POWERUP_CONFIG;
