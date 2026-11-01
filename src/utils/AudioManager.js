import { loadSettings, saveSettings } from './storage.js';

const MUSIC_DUCK_LEVEL = 0.3;

// Per-level key/tempo changes for the 'level' track, indexed by level % length.
const MUSIC_LEVEL_VARIATIONS = [
  { shift: 0, tempo: 1 },
  { shift: 2, tempo: 1.06 },
  { shift: 5, tempo: 1.12 },
  { shift: -2, tempo: 1.18 },
];

const NOTE_SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// 'C#4' / 'Bb3' -> MIDI number
function noteToMidi(name) {
  const match = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  return (Number(match[3]) + 1) * 12 + NOTE_SEMITONES[match[1]] + accidental;
}

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// One bass note per step: root plus an interval pattern, repeated for each bar's root.
function bassFromRoots(roots, pattern) {
  return roots.flatMap(root => pattern.map(interval => (interval === null ? '.' : midiToNoteName(noteToMidi(root) + interval))));
}

function midiToNoteName(midi) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

// Notes are '.' (rest), 'A4', or ['A4', steps]. Voices in a track share one step grid.
const MUSIC_TRACKS = {
  // The original menu bass loop: one note per beat at 120 bpm.
  menu: {
    bpm: 120,
    stepsPerBeat: 1,
    loop: true,
    voices: [
      { wave: 'triangle', volume: 0.14, notes: ['C3', 'C3', 'D3', 'C3', 'A2', 'A2', 'D3', 'C3'] },
    ],
  },

  // Upbeat C major theme, C | Am | F | G in eighth notes.
  level: {
    bpm: 132,
    stepsPerBeat: 2,
    loop: true,
    vary: true,
    voices: [
      {
        wave: 'square',
        volume: 0.07,
        notes: [
          'E5', 'E5', '.', 'G5', 'E5', '.', 'C5', 'E5',
          'A4', 'C5', 'E5', '.', 'A5', 'G5', 'E5', 'C5',
          'F5', 'F5', '.', 'A5', 'F5', '.', 'C5', 'F5',
          'G5', 'F5', 'D5', '.', 'B4', 'D5', 'G5', '.',
        ],
      },
      {
        wave: 'triangle',
        volume: 0.16,
        notes: bassFromRoots(['C3', 'A2', 'F2', 'G2'], [0, 12, 0, 12, 0, 12, 0, 7]),
      },
    ],
  },

  // Tense A minor theme, Am | Am | F | E, driving sawtooth bass.
  boss: {
    bpm: 150,
    stepsPerBeat: 2,
    loop: true,
    voices: [
      {
        wave: 'square',
        volume: 0.07,
        notes: [
          'A4', 'A4', '.', 'C5', 'B4', '.', 'A4', '.',
          'A4', 'A4', '.', 'E5', 'D5', '.', 'C5', 'B4',
          'F4', 'F4', '.', 'A4', 'C5', '.', 'B4', 'A4',
          'E4', 'G#4', 'B4', '.', 'E5', 'D#5', 'B4', 'G#4',
        ],
      },
      {
        wave: 'sawtooth',
        volume: 0.07,
        notes: bassFromRoots(['A2', 'A2', 'F2', 'E2'], [0, 0, 0, 12, 0, 0, 12, 0]),
      },
    ],
  },

  // Short falling phrase, played once.
  gameover: {
    bpm: 80,
    stepsPerBeat: 1,
    loop: false,
    voices: [
      { wave: 'square', volume: 0.08, notes: ['E4', 'D4', 'C4', ['A3', 3]] },
      { wave: 'triangle', volume: 0.14, notes: ['A2', 'G2', 'F2', ['A1', 3]] },
    ],
  },
};

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
        musicBus: null,
        musicOut: null,
        musicName: null,
        musicKey: null,
        musicOpts: null,
        musicNextTime: 0,
        musicDucked: false,
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
        
      case 'fireball':
        this.playTone(700, 0.08, 80, 'square', now);
        this.playTone(420, 0.1, 100, 'sawtooth', now + 0.04);
        break;

      case 'powerdown':
        this.playTone(600, 0.1, 100, 'square', now);
        this.playTone(400, 0.1, 100, 'square', now + 0.1);
        this.playTone(220, 0.25, 150, 'square', now + 0.2);
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
   * Start (or switch to) a named music track: 'menu' | 'level' | 'boss'.
   * Calling it again with the track that is already playing is a no-op, so
   * scenes can call it unconditionally without restarting the loop.
   * opts.level (level index) varies key and tempo of the 'level' track.
   */
  playMusic(name, opts = {}) {
    const track = MUSIC_TRACKS[name];
    if (!track) return;

    const key = `${name}:${opts.level ?? 0}`;
    const shared = this.shared;
    const alreadyRunning = shared.musicKey === key && shared.musicName && shared.musicTimeout;

    shared.musicName = name;
    shared.musicKey = key;
    shared.musicOpts = opts;
    shared.wantsMusic = true;

    if (alreadyRunning) return;
    this.restartMusic();
  }

  /**
   * Play a short non-looping jingle ('gameover'). It replaces the current track
   * and leaves silence behind once it finishes.
   */
  playJingle(name) {
    this.playMusic(name);
  }

  /**
   * Back-compat: the menu theme.
   */
  startMusic() {
    this.playMusic('menu');
  }

  /**
   * Stop background music (and forget which track was wanted).
   */
  stopMusic(fade = 0.15) {
    const shared = this.shared;
    shared.musicName = null;
    shared.musicKey = null;
    shared.wantsMusic = false;
    this.haltMusic(fade);
  }

  /**
   * Lower music while an overlay (pause/settings) is open instead of cutting it,
   * so the loop keeps its place and nothing needs to be rescheduled.
   */
  setMusicDucked(isDucked) {
    const shared = this.shared;
    shared.musicDucked = isDucked;
    if (shared.musicOut) {
      shared.musicOut.gain.setTargetAtTime(isDucked ? MUSIC_DUCK_LEVEL : 1, this.audioContext.currentTime, 0.05);
    }
  }

  /**
   * Cancel the scheduler and fade out whatever is already scheduled. Notes are
   * queued ahead on the AudioContext clock, so the per-track bus is what makes
   * the cut immediate and keeps two tracks from overlapping.
   */
  haltMusic(fade = 0.12) {
    this.clearMusicLoop();

    const bus = this.shared.musicBus;
    this.shared.musicBus = null;
    if (!bus) return;

    const now = this.audioContext.currentTime;
    bus.gain.cancelScheduledValues(now);
    bus.gain.setValueAtTime(bus.gain.value, now);
    bus.gain.linearRampToValueAtTime(0, now + fade);
    setTimeout(() => bus.disconnect(), (fade + 0.05) * 1000);
  }

  /**
   * (Re)start the wanted track from its beginning, unless something blocks audio.
   */
  restartMusic() {
    const shared = this.shared;
    this.haltMusic();

    if (!shared.musicName || this.isMuted || (typeof document !== 'undefined' && document.hidden)) {
      // A jingle is a one-off: don't replay it later after unmute/refocus.
      if (shared.musicName && !MUSIC_TRACKS[shared.musicName].loop) {
        shared.musicName = null;
        shared.musicKey = null;
        shared.wantsMusic = false;
      }
      return;
    }

    if (this.audioContext.state !== 'running') {
      this.resume().catch(() => {});
      return;
    }

    if (!shared.musicOut) {
      shared.musicOut = this.audioContext.createGain();
      shared.musicOut.gain.value = shared.musicDucked ? MUSIC_DUCK_LEVEL : 1;
      shared.musicOut.connect(this.masterGain);
    }

    const bus = this.audioContext.createGain();
    bus.connect(shared.musicOut);
    shared.musicBus = bus;
    shared.musicNextTime = this.audioContext.currentTime + 0.15;
    this.scheduleMusicPattern(bus);
  }

  /**
   * Queue one pass of the current track at musicNextTime, then wake up shortly
   * before it ends to queue the next pass. No per-frame work.
   */
  scheduleMusicPattern(bus) {
    const shared = this.shared;
    const track = MUSIC_TRACKS[shared.musicName];
    if (!track || shared.musicBus !== bus) return;

    const level = shared.musicOpts?.level ?? 0;
    const variation = track.vary ? MUSIC_LEVEL_VARIATIONS[level % MUSIC_LEVEL_VARIATIONS.length] : { shift: 0, tempo: 1 };
    const stepTime = 60 / (track.bpm * variation.tempo) / track.stepsPerBeat;
    const start = shared.musicNextTime;
    const length = track.voices.reduce((max, voice) => Math.max(max, voice.notes.length), 0);

    track.voices.forEach(voice => {
      voice.notes.forEach((entry, step) => {
        if (entry === '.') return;
        const [noteName, steps = 1] = Array.isArray(entry) ? entry : [entry, 1];
        const frequency = midiToFrequency(noteToMidi(noteName) + variation.shift);
        this.playMusicNote(bus, frequency, voice, start + step * stepTime, stepTime * steps * 0.9);
      });
    });

    shared.musicNextTime = start + length * stepTime;

    if (track.loop) {
      const wakeIn = Math.max(50, (shared.musicNextTime - this.audioContext.currentTime - 0.4) * 1000);
      shared.musicTimeout = setTimeout(() => {
        shared.musicTimeout = null;
        if (shared.musicBus !== bus || this.isMuted || this.audioContext.state !== 'running') return;
        this.scheduleMusicPattern(bus);
      }, wakeIn);
      return;
    }

    // Jingle: clear the wanted track once it has played out.
    shared.musicTimeout = setTimeout(() => {
      shared.musicTimeout = null;
      if (shared.musicBus !== bus) return;
      shared.musicName = null;
      shared.musicKey = null;
      shared.wantsMusic = false;
      this.haltMusic(0.05);
    }, (shared.musicNextTime - this.audioContext.currentTime) * 1000 + 100);
  }

  playMusicNote(bus, frequency, voice, startTime, duration) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = voice.wave;
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(bus);

    gainNode.gain.setValueAtTime(voice.volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // Release both nodes as soon as the note ends.
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  /**
   * Restart the wanted track if it should be playing but nothing is scheduled
   * (after unmute, tab refocus, or autoplay unlock).
   */
  ensureMusic() {
    const shared = this.shared;
    if (!shared.musicName || shared.musicTimeout || this.isMuted) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    this.restartMusic();
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
      this.haltMusic(0.05);
    } else {
      this.ensureMusic();
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

      // Some browsers resolve resume() while still suspended; don't loop on that.
      if (this.audioContext.state === 'running') {
        this.ensureMusic();
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
        // Stop the queued notes too; the track restarts from the top on return.
        this.haltMusic(0.05);
        return;
      }

      this.resume().then(() => this.ensureMusic(), () => {});
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
      this.haltMusic(0.05);
    } else {
      this.ensureMusic();
    }
  }
}
