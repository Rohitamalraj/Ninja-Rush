import { create } from 'zustand';
import { GAME_CONFIG } from '../game/utils/constants';

interface PowerUpState {
  type: string;
  expiresAt: number;
}

interface GameStore {
  // Game state
  score: number;
  highScore: number;
  lives: number;
  timeLeft: number;
  comboCount: number;
  activePowerUps: PowerUpState[];
  isPlaying: boolean;
  isPaused: boolean;
  
  // Stats
  totalGames: number;
  totalKills: number;
  
  // Actions
  addScore: (points: number) => void;
  setScore: (score: number) => void;
  loseLife: () => void;
  resetLives: () => void;
  updateTimer: (delta: number) => void;
  setTimeLeft: (time: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  addPowerUp: (type: string, duration: number) => void;
  removePowerUp: (type: string) => void;
  clearPowerUps: () => void;
  setPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  resetGame: () => void;
  incrementTotalGames: () => void;
  addKill: () => void;
  
  // localStorage
  loadHighScore: () => void;
  saveHighScore: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  score: 0,
  highScore: 0,
  lives: GAME_CONFIG.PLAYER_LIVES,
  timeLeft: GAME_CONFIG.ROUND_DURATION,
  comboCount: 0,
  activePowerUps: [],
  isPlaying: false,
  isPaused: false,
  totalGames: 0,
  totalKills: 0,
  
  // Actions
  addScore: (points: number) => set((state) => {
    const newScore = state.score + points;
    const newHighScore = Math.max(newScore, state.highScore);
    
    // Save high score to localStorage
    if (newHighScore > state.highScore) {
      localStorage.setItem('ninjaRush_highScore', newHighScore.toString());
    }
    
    return { score: newScore, highScore: newHighScore };
  }),
  
  setScore: (score: number) => set({ score }),
  
  loseLife: () => set((state) => ({
    lives: Math.max(0, state.lives - 1)
  })),
  
  resetLives: () => set({ lives: GAME_CONFIG.PLAYER_LIVES }),
  
  updateTimer: (delta: number) => set((state) => ({
    timeLeft: Math.max(0, state.timeLeft - delta)
  })),
  
  setTimeLeft: (time: number) => set({ timeLeft: time }),
  
  incrementCombo: () => set((state) => ({
    comboCount: state.comboCount + 1
  })),
  
  resetCombo: () => set({ comboCount: 0 }),
  
  addPowerUp: (type: string, duration: number) => set((state) => ({
    activePowerUps: [
      ...state.activePowerUps.filter(p => p.type !== type),
      { type, expiresAt: Date.now() + duration }
    ]
  })),
  
  removePowerUp: (type: string) => set((state) => ({
    activePowerUps: state.activePowerUps.filter(p => p.type !== type)
  })),
  
  clearPowerUps: () => set({ activePowerUps: [] }),
  
  setPlaying: (playing: boolean) => set({ isPlaying: playing }),
  
  setPaused: (paused: boolean) => set({ isPaused: paused }),
  
  resetGame: () => set({
    score: 0,
    lives: GAME_CONFIG.PLAYER_LIVES,
    timeLeft: GAME_CONFIG.ROUND_DURATION,
    comboCount: 0,
    activePowerUps: [],
    isPlaying: false,
    isPaused: false,
  }),
  
  incrementTotalGames: () => set((state) => {
    const newTotal = state.totalGames + 1;
    localStorage.setItem('ninjaRush_totalGames', newTotal.toString());
    return { totalGames: newTotal };
  }),
  
  addKill: () => set((state) => {
    const newTotal = state.totalKills + 1;
    localStorage.setItem('ninjaRush_totalKills', newTotal.toString());
    return { totalKills: newTotal };
  }),
  
  loadHighScore: () => {
    const savedHighScore = localStorage.getItem('ninjaRush_highScore');
    const savedTotalGames = localStorage.getItem('ninjaRush_totalGames');
    const savedTotalKills = localStorage.getItem('ninjaRush_totalKills');
    
    set({
      highScore: savedHighScore ? parseInt(savedHighScore) : 0,
      totalGames: savedTotalGames ? parseInt(savedTotalGames) : 0,
      totalKills: savedTotalKills ? parseInt(savedTotalKills) : 0,
    });
  },
  
  saveHighScore: () => {
    const state = get();
    if (state.score > state.highScore) {
      localStorage.setItem('ninjaRush_highScore', state.score.toString());
      set({ highScore: state.score });
    }
  },
}));
