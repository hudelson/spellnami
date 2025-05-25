import 'phaser';
import { TitleScene } from './scenes/TitleScene';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'matter',
        matter: {
            gravity: { x: 0, y: 1.0 },
            debug: {
                showBody: true,
                showStaticBody: true,
                showVelocity: true
            },
            enableSleeping: false
        }
    },
    scene: [BootScene, TitleScene, GameScene, UIScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: false,
        antialias: true
    }
};

// Initialize the game
export const game = new Phaser.Game(config);
