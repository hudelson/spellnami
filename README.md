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
