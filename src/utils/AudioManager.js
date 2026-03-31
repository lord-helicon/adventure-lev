/**
 * Audio Manager - Handles all sound effects and music
 */
export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
    this.music = null;
    this.isMuted = false;
    this.volume = 0.5;
    
    // Initialize Web Audio Context
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.audioContext.destination);
  }

  /**
   * Play a sound effect using Web Audio API
   */
  play(type, config = {}) {
    if (this.isMuted) return;

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
    if (this.music || this.isMuted) return;
    
    // Simple chiptune loop
    const playMusicLoop = () => {
      if (this.isMuted) return;
      
      const now = this.audioContext.currentTime;
      const bpm = 120;
      const beatTime = 60 / bpm;
      
      // Simple bass line
      const bassLine = [130.81, 130.81, 146.83, 130.81, 110.00, 110.00, 146.83, 130.81];
      
      bassLine.forEach((freq, i) => {
        this.playTone(freq, beatTime * 0.8, beatTime * 100, 'triangle', now + i * beatTime);
      });
      
      // Schedule next loop
      this.musicTimeout = setTimeout(playMusicLoop, beatTime * 8 * 1000);
    };
    
    playMusicLoop();
  }

  /**
   * Stop background music
   */
  stopMusic() {
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    this.masterGain.gain.value = this.volume;
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    return this.isMuted;
  }

  /**
   * Resume audio context (needed for browsers that suspend it)
   */
  resume() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}
