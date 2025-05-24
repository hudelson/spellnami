# Spellnami

A falling-word typing game built with Phaser 3 and TypeScript.

## Gameplay

- Words fall from the top of the screen
- Type the letters in order to clear them
- Clear the entire word before it reaches the bottom
- If you make a mistake, the remaining letters will freeze in place
- The game ends when the pile of letters reaches the top of the screen

## Difficulty Levels

- **Apprentice**: 3-5 letter words, slow falling speed
- **Scholar**: 5-7 letter words, medium falling speed
- **Master**: 7-10 letter words, fast falling speed

## Controls

- Use your keyboard to type the letters
- Only the first letter of the current word is active

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
