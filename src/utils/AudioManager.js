import { loadSettings, saveSettings } from './storage.js';

/**
 * Audio Manager - Handles all sound effects and music
 */
export default class AudioManager {
  constructor(scene) {
    this.scene = scene;

    if (!AudioManager.shared) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const masterGain = audioContext.createGain();
      const settings = loadSettings();
      const volume = settings.volume;

      masterGain.gain.value = settings.isMuted ? 0 : volume;
      masterGain.connect(audioContext.destination);

      AudioManager.shared = {
        audioContext,
        masterGain,
        isMuted: settings.isMuted,
        volume,
        musicTimeout: null,
        wantsMusic: false,
        lifecycleBound: false,
      };
    }

    this.shared = AudioManager.shared;
    this.audioContext = this.shared.audioContext;
    this.masterGain = this.shared.masterGain;
    this.bindSceneUnlockHandlers();
    this.bindLifecycleHandlers();
  }

  get isMuted() {
    return this.shared.isMuted;
  }

  get volume() {
    return this.shared.volume;
  }

  /**
   * Play a sound effect using Web Audio API
   */
  play(type, config = {}) {
    if (this.isMuted) return;

    if (this.audioContext.state !== 'running') {
      this.resume().then(() => this.play(type, config)).catch(() => {});
      return;
    }

    const now = this.audioContext.currentTime;
    
    switch(type) {
      case 'jump':
        this.playTone(150, 0.3, 200, 'square', now);
        this.playTone(200, 0.2, 150, 'square', now + 0.05);
        break;
        
      case 'coin':
        this.playTone(900, 0.15, 100, 'sine', now);
        this.playTone(1200, 0.2, 100, 'sine', now + 0.05);
        break;
        
      case 'coin_big':
        this.playTone(600, 0.1, 100, 'sine', now);
        this.playTone(900, 0.1, 100, 'sine', now + 0.1);
        this.playTone(1200, 0.2, 150, 'sine', now + 0.2);
        break;
        
      case 'enemy_hit':
        this.playTone(100, 0.3, 200, 'sawtooth', now);
        this.playTone(50, 0.4, 300, 'sawtooth', now + 0.1);
        break;
        
      case 'stomp':
        this.playTone(80, 0.2, 150, 'square', now);
        this.playTone(60, 0.3, 200, 'square', now + 0.05);
        break;
        
      case 'death':
        this.playTone(300, 0.2, 200, 'sawtooth', now);
        this.playTone(200, 0.3, 300, 'sawtooth', now + 0.2);
        this.playTone(100, 0.5, 400, 'sawtooth', now + 0.4);
        break;
        
      case 'powerup':
        this.playTone(400, 0.1, 100, 'sine', now);
        this.playTone(600, 0.1, 100, 'sine', now + 0.1);
        this.playTone(800, 0.1, 100, 'sine', now + 0.2);
        this.playTone(1000, 0.3, 150, 'sine', now + 0.3);
        break;
        
      case 'checkpoint':
        this.playTone(600, 0.15, 100, 'triangle', now);
        this.playTone(800, 0.2, 150, 'triangle', now + 0.15);
        break;
        
      case 'break':
        this.playTone(200, 0.1, 100, 'square', now);
        this.playTone(150, 0.15, 150, 'square', now + 0.05);
        break;
        
      case 'spring':
        this.playTone(200, 0.1, 80, 'square', now);
        this.playTone(400, 0.1, 80, 'square', now + 0.05);
        this.playTone(600, 0.2, 100, 'square', now + 0.1);
        break;
        
      case 'complete':
        this.playVictoryMelody(now);
        break;
        
      case 'select':
        this.playTone(800, 0.1, 50, 'sine', now);
        break;
        
      case 'start':
        this.playTone(400, 0.1, 100, 'square', now);
        this.playTone(600, 0.1, 100, 'square', now + 0.1);
        this.playTone(800, 0.3, 150, 'square', now + 0.2);
        break;
    }
  }

  /**
   * Play a single tone
   */
  playTone(frequency, duration, fadeTime, waveType, startTime) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.value = frequency;
    oscillator.type = waveType;
    
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /**
   * Play victory melody
   */
  playVictoryMelody(startTime) {
    const melody = [
      { freq: 523.25, duration: 0.15 }, // C5
      { freq: 659.25, duration: 0.15 }, // E5
      { freq: 783.99, duration: 0.15 }, // G5
      { freq: 1046.50, duration: 0.4 }, // C6
    ];
    
    let time = startTime;
    melody.forEach(note => {
      this.playTone(note.freq, note.duration, 100, 'square', time);
      time += note.duration;
    });
  }

  /**
   * Start background music
   */
  startMusic() {
    this.shared.wantsMusic = true;

    if (this.shared.musicTimeout || this.isMuted) return;

    if (this.audioContext.state !== 'running') {
      this.resume().then(() => {
        if (this.shared.wantsMusic && !this.shared.musicTimeout && !this.isMuted) {
          this.startMusic();
        }
      }).catch(() => {});
      return;
    }
    
    // Simple chiptune loop
    const playMusicLoop = () => {
      if (this.isMuted || !this.shared.wantsMusic) {
        this.clearMusicLoop();
        return;
      }

      if (this.audioContext.state !== 'running') {
        this.clearMusicLoop();
        return;
      }
       
      const now = this.audioContext.currentTime;
      const bpm = 120;
      const beatTime = 60 / bpm;
      
      // Simple bass line
      const bassLine = [130.81, 130.81, 146.83, 130.81, 110.00, 110.00, 146.83, 130.81];
      
      bassLine.forEach((freq, i) => {
        this.playTone(freq, beatTime * 0.8, beatTime * 100, 'triangle', now + i * beatTime);
      });
      
      // Schedule next loop
      this.shared.musicTimeout = setTimeout(playMusicLoop, beatTime * 8 * 1000);
    };
     
    playMusicLoop();
  }

  /**
   * Stop background music
   */
  stopMusic() {
    this.shared.wantsMusic = false;
    this.clearMusicLoop();
  }

  clearMusicLoop() {
    if (this.shared.musicTimeout) {
      clearTimeout(this.shared.musicTimeout);
      this.shared.musicTimeout = null;
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(value) {
    this.shared.volume = Math.max(0, Math.min(1, value));
    this.masterGain.gain.value = this.isMuted ? 0 : this.shared.volume;
    saveSettings({ volume: this.shared.volume, isMuted: this.shared.isMuted });
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.shared.isMuted = !this.shared.isMuted;
    this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    saveSettings({ volume: this.shared.volume, isMuted: this.shared.isMuted });

    if (this.isMuted) {
      this.clearMusicLoop();
    } else if (this.shared.wantsMusic) {
      this.startMusic();
    }

    return this.isMuted;
  }

  cycleVolume() {
    const volumeSteps = [0.25, 0.5, 0.75, 1];
    const currentIndex = volumeSteps.findIndex(step => Math.abs(step - this.volume) < 0.01);
    const nextIndex = (currentIndex + 1) % volumeSteps.length;
    this.setVolume(volumeSteps[nextIndex]);
    return this.volume;
  }

  /**
   * Resume audio context (needed for browsers that suspend it)
   */
  resume() {
    if (this.audioContext.state === 'running') {
      return Promise.resolve();
    }

    return this.audioContext.resume().then(() => {
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;

      if (this.shared.wantsMusic && !this.shared.musicTimeout && !this.isMuted) {
        this.startMusic();
      }
    });
  }

  bindSceneUnlockHandlers() {
    if (this.scene.__audioUnlockBound) {
      return;
    }

    const resumeAudio = () => {
      this.resume();
    };

    this.scene.__audioUnlockBound = true;
    this.scene.input?.on('pointerdown', resumeAudio);
    this.scene.input?.keyboard?.on('keydown', resumeAudio);

    this.scene.events.once('shutdown', () => {
      this.scene.input?.off('pointerdown', resumeAudio);
      this.scene.input?.keyboard?.off('keydown', resumeAudio);
      this.scene.__audioUnlockBound = false;
    });
  }

  bindLifecycleHandlers() {
    if (this.shared.lifecycleBound || typeof document === 'undefined') {
      return;
    }

    this.shared.lifecycleBound = true;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.clearMusicLoop();
        return;
      }

      this.resume();
    });

    window.addEventListener('pageshow', () => {
      this.resume();
    });

    window.addEventListener('focus', () => {
      this.resume();
    });
  }

  syncSettings() {
    const settings = loadSettings();
    this.shared.isMuted = settings.isMuted;
    this.shared.volume = settings.volume;
    this.masterGain.gain.value = this.isMuted ? 0 : this.volume;

    if (this.isMuted) {
      this.clearMusicLoop();
    } else if (this.shared.wantsMusic) {
      this.startMusic();
    }
  }
}
