import { Scene } from 'phaser';

interface DifficultySettings {
    name: string;
    minLength: number;
    maxLength: number;
    speed: number;
    color: string;
}

export class UIScene extends Scene {
    private scoreText!: Phaser.GameObjects.Text;
    private gameOverPanel!: Phaser.GameObjects.Container;
    private score: number = 0;
    private difficultySettings: { [key: string]: DifficultySettings } = {
        apprentice: { name: 'Apprentice', minLength: 3, maxLength: 5, speed: 120, color: '#4CAF50' },
        scholar: { name: 'Scholar', minLength: 5, maxLength: 7, speed: 170, color: '#FF9800' },
        master: { name: 'Master', minLength: 7, maxLength: 10, speed: 220, color: '#F44336' }
    };
    private currentDifficulty!: string;

    constructor() {
        super('UIScene');
    }

    private addScore(points: number) {
        this.score += points;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    private showGameOver() {
        // Show game over panel if it doesn't exist
        if (!this.gameOverPanel) {
            this.createGameOverPanel();
        } else {
            // Update the score in the existing panel
            this.updateGameOverScore();
        }
        this.gameOverPanel.setVisible(true);
    }

    private updateGameOverScore() {
        if (this.gameOverPanel) {
            // Find the score text in the container and update it
            const scoreText = this.gameOverPanel.list.find(child => 
                child instanceof Phaser.GameObjects.Text && 
                (child as Phaser.GameObjects.Text).text.includes('Score:')
            ) as Phaser.GameObjects.Text;
            
            if (scoreText) {
                scoreText.setText(`Final Score: ${this.score}`);
            }
        }
    }

    private restartGame() {
        // Hide game over panel
        this.gameOverPanel.setVisible(false);
        
        // Reset score
        this.score = 0;
        this.scoreText.setText('Score: 0');
        
        // Stop both scenes completely
        this.scene.stop('GameScene');
        this.scene.stop('UIScene');
        
        // Start fresh from title screen
        this.scene.start('TitleScene');
    }

    private createGameOverPanel() {
        const width = 400;
        const height = 250;
        const x = this.cameras.main.width / 2;
        const y = this.cameras.main.height / 2;

        // Create panel background
        const panel = this.add.graphics()
            .fillStyle(0x000000, 0.8)
            .fillRoundedRect(-width / 2, -height / 2, width, height, 10)
            .lineStyle(2, 0xffffff, 1)
            .strokeRoundedRect(-width / 2, -height / 2, width, height, 10);

        // Add game over text
        const gameOverText = this.add.text(0, -60, 'GAME OVER', {
            fontSize: '36px',
            color: '#ff3333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add score text
        const finalScoreText = this.add.text(0, -10, `Final Score: ${this.score}`, {
            fontSize: '24px',
            color: '#fff'
        }).setOrigin(0.5);

        // Add restart button
        const restartButton = this.add.rectangle(0, 60, 150, 50, 0x4CAF50)
            .setInteractive()
            .on('pointerdown', () => {
                // Properly reset and restart the game
                this.restartGame();
            });

        const buttonText = this.add.text(0, 60, 'Play Again', {
            fontSize: '20px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Button hover effects
        restartButton.on('pointerover', () => {
            restartButton.setFillStyle(0x45a049);
        });

        restartButton.on('pointerout', () => {
            restartButton.setFillStyle(0x4CAF50);
        });

        // Create container for the panel
        this.gameOverPanel = this.add.container(x, y, [
            panel,
            gameOverText,
            finalScoreText,
            restartButton,
            buttonText
        ]).setDepth(1000).setVisible(false);
    }

    create(data: { difficulty: string; settings: any }) {
        // Get difficulty from scene data or registry
        if (data && data.difficulty) {
            this.currentDifficulty = data.difficulty;
            this.registry.set('difficulty', data.difficulty);
        } else {
            this.currentDifficulty = this.registry.get('difficulty') || 'apprentice';
        }
        
        // Update difficulty settings if provided
        if (data && data.settings) {
            this.difficultySettings[this.currentDifficulty] = data.settings;
        }
        
        // Set up event listeners
        this.events.on('addScore', this.addScore, this);
        this.events.on('gameOver', this.showGameOver, this);
        
        // Listen for score updates from the GameScene
        this.scene.get('GameScene').events.on('addScore', (points: number) => {
            this.addScore(points);
        });
        
        // Listen for game over from the GameScene
        this.scene.get('GameScene').events.on('gameOver', () => {
            this.showGameOver();
        });

        // Create score text
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            color: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 2
        });

        // Create game over panel (initially hidden)
        this.createGameOverPanel();
    }

    public getDifficultySettings(): DifficultySettings {
        return this.difficultySettings[this.currentDifficulty];
    }

    public getScore(): number {
        return this.score;
    }
}
