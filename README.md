# Adventure Lev 🎮

A polished, retro-inspired 2D platformer featuring Lev, an adventurous character with fluid animations and enhanced gameplay mechanics.

## Features ✨

### Visual Enhancements
- **Animated Player Character** - Lev has idle, running, and jumping animations with smooth pixel art
- **Parallax Scrolling Background** - Multiple layers create depth (sky, mountains, clouds, trees)
- **Particle Effects** - Dust on landing, coin sparkles, enemy explosions, power-up effects
- **Animated Collectibles** - Spinning coins and floating power-ups
- **Enhanced UI** - Heart-based lives display, pixel-art styled text

### Gameplay Mechanics
- **Variable Jump Height** - Hold jump longer for higher jumps
- **Coyote Time** - Brief window to jump after leaving a platform (100ms)
- **Jump Buffering** - Input registered slightly before landing (80ms)
- **Stomp Mechanics** - Jump on enemies to defeat them
- **Power-ups**:
  - ⭐ **Star** - Temporary invincibility with visual effects
  - ⚡ **Speed** - Move 50% faster
  - ❤️ **Extra Life** - Gain an additional life

### Level Elements
- **Moving Platforms** - Vertical and horizontal moving platforms
- **Breakable Blocks** - Destroy by jumping on them
- **Springs** - Launch player high into the air
- **Checkpoints** - Save progress mid-level
- **Multiple Enemy Types**:
  - Ground enemies with patrol patterns
  - Flying enemies with sine-wave movement

### Audio
- **Chiptune Sound Effects** - Jump, coin collect, enemy stomp, power-ups, death
- **Background Music** - Procedurally generated chiptune bass line
- **Audio Manager** - Volume control and mute functionality

### Game Flow
- **Menu Screen** - Start game, toggle music
- **Pause Menu** - Resume or return to menu (ESC/P key)
- **Level Complete** - Victory screen with score
- **Game Over** - Final score display with retry option

## Controls 🕹️

| Key | Action |
|-----|--------|
| ← → | Move left/right |
| SPACE | Jump (hold for higher jump) |
| ESC / P | Pause game |
| ENTER | Select menu options / Restart |

## How to Play 🎯

1. Navigate through the level by jumping on platforms
2. Collect coins for points (10 points each)
3. Stomp on enemies to defeat them (100 points each)
4. Grab power-ups for special abilities
5. Reach the flag at the end to complete the level
6. Activate checkpoints to save your progress

## Installation & Running 🚀

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd adventure-lev

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure 📁

```
├── src/
│   ├── data/
│   │   └── levelData.js          # Level configuration
│   ├── entities/
│   │   ├── Player.js             # Player class with animations
│   │   └── Enemy.js              # Enemy AI and behaviors
│   ├── scenes/
│   │   ├── BootScene.js          # Initial loading
│   │   ├── PreloadScene.js       # Asset generation
│   │   ├── MenuScene.js          # Main menu
│   │   ├── GameScene.js          # Main gameplay
│   │   ├── PauseScene.js         # Pause overlay
│   │   └── GameOverScene.js      # Game over screen
│   ├── utils/
│   │   ├── assetGenerator.js     # Dynamic pixel art generation
│   │   ├── AudioManager.js       # Sound and music management
│   │   └── ParticleSystem.js     # Visual effects system
│   └── main.js                   # Game configuration
├── index.html                    # Entry point
├── package.json                  # Dependencies
└── README.md                     # This file
```

## Technologies Used 🛠️

- [Phaser 3](https://phaser.io/) - HTML5 game framework
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Procedural sound generation
- Canvas API - Dynamic pixel art generation

## Browser Compatibility 🌐

- Chrome / Edge (recommended)
- Firefox
- Safari
- Mobile browsers (touch controls not yet implemented)

## Roadmap 🗺️

- [ ] Touch controls for mobile devices
- [ ] Multiple levels with different themes
- [ ] Boss battles
- [ ] Save/load game progress
- [ ] High score system
- [ ] Additional enemy types
- [ ] Level editor

## Credits 👏

- Game concept and development: Original author
- Pixel art: Procedurally generated
- Sound effects: Generated via Web Audio API

## License 📄

This project is licensed under the **MIT License** - see below for details.

---

## License Options Explained

For this game code, you have several licensing options depending on your goals:

### 1. MIT License (Recommended) ✅
**Best for:** Open source projects, learning resources, allowing commercial use

```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

**Pros:**
- Very permissive
- Allows commercial use
- Simple and widely understood
- Compatible with other licenses

### 2. Apache License 2.0
**Best for:** Patent protection, larger projects

Similar to MIT but includes explicit patent grants and requires stating changes.

### 3. GPL v3 (Copyleft)
**Best for:** Ensuring derivatives remain open source

Requires anyone distributing modified versions to also release source code under GPL.

### 4. Creative Commons (CC0 / CC-BY)
**Best for:** Assets, not code

CC0 = Public domain dedication
CC-BY = Attribution required

### 5. Proprietary / Commercial
**Best for:** Selling the game or keeping exclusive rights

No license file = "All rights reserved" by default.

---

## My Recommendation

Use **MIT License** for this game because:
1. It's a showcase/educational project
2. You want others to learn from and use the code
3. It's simple and doesn't scare away potential contributors
4. It allows others to build upon your work (even commercially)

If you want to add a license, create a `LICENSE` file in the root directory with the MIT license text.

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support 💬

If you encounter any issues or have questions, please open an issue on the repository.

---

**Happy Gaming!** 🎮✨
