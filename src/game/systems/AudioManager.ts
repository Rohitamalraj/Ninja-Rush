import Phaser from 'phaser';

export class AudioManager {
  private scene: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private music: Phaser.Sound.BaseSound | null = null;
  private sfxVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private muted: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadSettings();
  }

  private loadSettings() {
    const savedSfxVolume = localStorage.getItem('ninjaRush_sfxVolume');
    const savedMusicVolume = localStorage.getItem('ninjaRush_musicVolume');
    const savedMuted = localStorage.getItem('ninjaRush_muted');

    if (savedSfxVolume) this.sfxVolume = parseFloat(savedSfxVolume);
    if (savedMusicVolume) this.musicVolume = parseFloat(savedMusicVolume);
    if (savedMuted) this.muted = savedMuted === 'true';
  }

  playSfx(key: string, config?: Phaser.Types.Sound.SoundConfig) {
    if (this.muted) return;

    const sound = this.scene.sound.add(key, {
      volume: this.sfxVolume,
      ...config
    });
    sound.play();
    return sound;
  }

  playMusic(key: string, loop: boolean = true) {
    if (this.music) {
      this.music.stop();
    }

    this.music = this.scene.sound.add(key, {
      loop,
      volume: this.muted ? 0 : this.musicVolume
    });
    this.music.play();
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
      this.music = null;
    }
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('ninjaRush_sfxVolume', this.sfxVolume.toString());
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('ninjaRush_musicVolume', this.musicVolume.toString());
    if (this.music) {
      this.music.setVolume(this.muted ? 0 : this.musicVolume);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('ninjaRush_muted', this.muted.toString());
    
    if (this.music) {
      this.music.setVolume(this.muted ? 0 : this.musicVolume);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }
}
