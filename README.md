# 🌊 Spellnami

A fast-paced falling-word typing game built with Phaser 3 and TypeScript. Test your typing skills as words cascade from the sky like a tsunami of letters!

## 🎮 Play Online

**[Play Spellnami Now!](https://hudelson.github.io/spellnami)**

## ✨ Features

- **Three Difficulty Levels**: From Apprentice to Master, each with different word lengths and falling speeds
- **Physics-Based Gameplay**: Words fall and stack realistically using Matter.js physics
- **Pixel Art Style**: Retro-inspired visual design with detailed block graphics
- **High Score System**: Track your top 3 scores locally
- **Smooth Animations**: Satisfying effects for correct typing, mistakes, and game over
- **Responsive Controls**: Type letters to clear words before they pile up

## 🎯 Gameplay

- Words fall from the top of the screen
- Type the letters in order to clear them
- Clear the entire word before it reaches the bottom
- If you make a mistake, the remaining letters will freeze in place and turn blue
- The game ends when the pile of letters reaches the top of the screen
- Score points for each word completed - longer words = more points!

## 🎚️ Difficulty Levels

| Level | Word Length | Speed | Description |
|-------|-------------|-------|-------------|
| **🟢 Apprentice** | 3-5 letters | Slow | Perfect for beginners |
| **🟡 Scholar** | 5-7 letters | Medium | Balanced challenge |
| **🔴 Master** | 7-10 letters | Fast | For typing masters |

## 🎮 Controls

- **Keyboard**: Type the letters of falling words
- **Mouse**: Navigate menus and select difficulty
- **How to Play**: Click the "How to Play" button for detailed instructions

## 🛠️ Development

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hudelson/spellnami.git
   cd spellnami
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Development Notes

- The project uses **Vite** for fast development and building
- **TypeScript** compilation is handled automatically
- **Terser** is used for production minification
- Source maps are generated for debugging

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Other Commands

```bash
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
npm run test      # Run tests with Vitest
npm run preview   # Preview production build
```

## 🏗️ Project Structure

```
spellnami/
├── src/
│   ├── scenes/          # Game scenes (Title, Game, UI)
│   ├── systems/         # Game systems (Physics, Word Manager, Effects)
│   └── main.ts          # Entry point
├── public/
│   └── assets/          # Game assets (images, sounds)
├── scripts/             # Build scripts
└── dist/                # Built files (after npm run build)
```

## 🎨 Technical Features

- **TypeScript**: Full type safety and modern JavaScript features
- **Phaser 3**: Powerful 2D game framework
- **Matter.js**: Realistic physics simulation
- **Vite**: Fast development and building with HMR
- **Terser**: Production code minification
- **ESLint + Prettier**: Code quality and formatting
- **Pixel Art Graphics**: Custom-drawn game elements
- **GitHub Pages**: Automated deployment via GitHub Actions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Phaser 3](https://phaser.io/) game framework
- Physics powered by [Matter.js](https://brm.io/matter-js/)
- Inspired by classic falling-block puzzle games

---

**Enjoy playing Spellnami! 🌊⌨️**
