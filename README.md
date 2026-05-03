# 🌊 Spellnami v2

A fast-paced educational game suite built with Phaser 3 and TypeScript. Test your typing and math skills as challenges cascade from the sky like a tsunami!

## 🎮 Play Online

**[Play Spellnami Now!](https://hudelson.github.io/spellnami)**

## ✨ Features

### 🎯 Multiple Game Modes
- **Spellnami** 📝: Classic falling-word typing game
- **Mathnami** 🔢: Math equation solving game (NEW in v2!)
- **Flags** 🚩: Coming soon
- **Morse** 📡: Coming soon

### 🎓 Spellnami Mode
- **Three Difficulty Levels**: From Apprentice to Master, each with different word lengths and falling speeds
- **Comprehensive Dictionary**: Over 1,900+ English words dynamically generated using the `random-words` library
- **Smart Word Selection**: Avoids repetition and filters out confusing words for better gameplay

### 🔢 Mathnami Mode (NEW!)
- **Four Difficulty Levels**: Addition, Subtraction, Multiplication, and Division
- **Mental Math Practice**: Type digits to fill in equation answers
- **Progressive Difficulty**: Range from simple single-digit to complex two-digit operations
- **Real-time Feedback**: Correct answers burn blocks, wrong answers freeze them

### 🎨 Shared Features
- **Physics-Based Gameplay**: Blocks fall and stack realistically using Matter.js physics
- **Pixel Art Style**: Retro-inspired visual design with detailed block graphics
- **High Score System**: Track your top 3 scores locally
- **Smooth Animations**: Satisfying effects for correct answers, mistakes, and game over
- **Responsive Controls**: Type letters or digits to clear blocks before they pile up

## 🎯 Gameplay

### Spellnami (Typing Mode)
- Words fall from the top of the screen
- Type the letters in order to clear them
- Clear the entire word before it reaches the bottom
- If you make a mistake, the remaining letters will freeze in place and turn blue
- The game ends when the pile of letters reaches the top of the screen

### Mathnami (Math Mode) �
- Math equations fall from the top with blank answer spaces (e.g., `5x3=[][]`)
- Type the digits to fill in the answer (e.g., `1` then `5` for 15)
- Complete the answer correctly to clear the equation
- Wrong digits freeze the equation blocks immediately
- The game ends when frozen blocks reach the top of the screen

### �🏆 Scoring System (Both Modes)

- **10 points** per correct letter/digit typed
- **50 point bonus** for completing each word/equation
- **Spectacular visual effects** for completion including:
  - Screen flash and explosion effects
  - Colorful particle bursts
  - Camera shake for impact
  - Floating bonus text animations

## 🎚️ Difficulty Levels

### Spellnami Mode

| Level | Word Length | Speed | Available Words | Description |
|-------|-------------|-------|-----------------|-------------|
| **🟢 Apprentice** | 3-5 letters | Slow | 1,032 words | Perfect for beginners |
| **🟡 Scholar** | 5-7 letters | Medium | 1,015 words | Balanced challenge |
| **🔴 Master** | 7-10 letters | Fast | 518 words | For typing masters |

### Mathnami Mode �

| Level | Operation | Number Range | Speed | Example |
|-------|-----------|--------------|-------|---------|
| **🟢 Apprentice** | Addition | 1-10 | Slow | `5+3=[]` |
| **🟡 Scholar** | Subtraction | 1-20 | Medium | `18-7=[][]` |
| **🔴 Master** | Multiplication | 2-12 | Fast | `7x8=[][]` |
| **🟣 Grandmaster** | Division | 2-12 | Very Fast | `72÷8=[]` |

## �🎮 Controls

### Spellnami Mode
- **Keyboard**: Type the letters of falling words
- **Mouse**: Navigate menus and select difficulty

### Mathnami Mode 🆕
- **Keyboard**: Type digits (0-9) to fill in equation answers
- **Mouse**: Navigate menus and select difficulty

### General
- **How to Play**: Click the "How to Play" button for detailed instructions
- **Mode Selection**: Choose between Spellnami and Mathnami at the title screen

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

## 🚀 Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setting Up GitHub Pages Deployment

If you fork this repository and want to deploy it to your own GitHub Pages:

1. **Configure GitHub Pages Source**:
   - Go to your repository **Settings** → **Pages**
   - Under **Source**, select **"GitHub Actions"**

2. **Set Workflow Permissions**:
   - Go to **Settings** → **Actions** → **General**
   - Under **Workflow permissions**, select **"Read and write permissions"**
   - Check **"Allow GitHub Actions to create and approve pull requests"**

3. **Update Repository URL** (if forked):
   - Update the `homepage` field in `package.json`
   - Update the `base` field in `vite.config.ts`
   - Update the play link in this README

4. **Deploy**:
   - Push to the `main` branch
   - GitHub Actions will automatically build and deploy the site
   - Your game will be available at `https://yourusername.github.io/spellnami`

### Manual Deployment

To deploy manually to any static hosting service:

```bash
npm run build
# Upload the contents of the dist/ folder to your hosting service
```

### Troubleshooting Deployment

**Common Issues:**

- **Permission denied error**: Make sure workflow permissions are set correctly (step 2 above)
- **404 on deployed site**: Verify the `base` path in `vite.config.ts` matches your repository name
- **Build fails**: Check that all dependencies are properly installed and TypeScript compiles without errors
- **Assets not loading**: Ensure the repository name in the base path is correct

**Checking Deployment Status:**
- Go to **Actions** tab in your repository to see build/deploy progress
- Check the **Pages** section in repository settings for deployment URL

## 🏗️ Project Structure

```
spellnami/
├── src/
│   ├── scenes/          # Game scenes (Title, Boot, Game, UI)
│   ├── systems/         # Game systems (Physics, Word/Math Managers, Effects)
│   ├── types/           # TypeScript type definitions (GameTypes)
│   ├── data/            # Game data (word lists)
│   └── main.ts          # Entry point
├── public/
│   └── assets/          # Game assets (particles, etc.)
├── scripts/             # Build scripts
└── dist/                # Built files (after npm run build)
```

## 🎨 Technical Features

- **TypeScript**: Full type safety and modern JavaScript features
- **Phaser 3**: Powerful 2D game framework
- **Matter.js**: Realistic physics simulation
- **Multi-Mode Architecture**: Extensible game mode system (Spell, Math, Flags, Morse)
- **Random Words Library**: Dynamic word generation from comprehensive English dictionary
- **Math Equation Generator**: Dynamic equation generation with configurable difficulty
- **Vite**: Fast development and building with HMR
- **Terser**: Production code minification
- **ESLint + Prettier**: Code quality and formatting
- **Pixel Art Graphics**: Custom-drawn game elements
- **GitHub Pages**: Automated deployment via GitHub Actions

## 📝 Version History

### v2.0.0 (Current)
- ✨ **NEW**: Mathnami math mode with 4 difficulty levels
- ✨ **NEW**: Mode selection screen (Spell/Math/Flags/Morse)
- ✨ **NEW**: Equation-based gameplay with digit typing
- 🔧 Refactored type system for multi-mode support
- 🔧 Enhanced game architecture with mode-specific managers

### v1.0.0
- 🎉 Initial release of Spellnami typing game
- 🎯 3 difficulty levels for word typing
- 🎨 Pixel art visual style
- ⚡ Physics-based block piling

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
