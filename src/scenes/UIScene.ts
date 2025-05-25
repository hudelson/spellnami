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
    private topScores: number[] = [];
    private scoreAlreadyRecorded: boolean = false;

    constructor() {
        super('UIScene');
        this.loadTopScores();
    }

    private loadTopScores() {
        try {
            const savedScores = localStorage.getItem('spellnami-top-scores');
            if (savedScores) {
                this.topScores = JSON.parse(savedScores);
            } else {
                this.topScores = [0, 0, 0]; // Default top scores
            }
        } catch (error) {
            console.warn('Failed to load top scores:', error);
            this.topScores = [0, 0, 0];
        }
    }

    private saveTopScores() {
        try {
            localStorage.setItem('spellnami-top-scores', JSON.stringify(this.topScores));
        } catch (error) {
            console.warn('Failed to save top scores:', error);
        }
    }

    private updateTopScores(newScore: number): boolean {
        // Check if this score qualifies for top 3
        const wouldBeTopScore = this.topScores.length < 3 || newScore > this.topScores[2];
        
        if (wouldBeTopScore) {
            // Add the new score to the list
            this.topScores.push(newScore);
            
            // Sort in descending order and keep only top 3
            this.topScores.sort((a, b) => b - a);
            this.topScores = this.topScores.slice(0, 3);
            
            // Save to localStorage
            this.saveTopScores();
            
            return true;
        }
        
        return false;
    }

    private addScore(points: number) {
        this.score += points;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    private showGameOver() {
        // Only update top scores once per game session
        if (!this.scoreAlreadyRecorded) {
            const isNewHighScore = this.updateTopScores(this.score);
            this.scoreAlreadyRecorded = true;
        }
        
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
            
            // Update top scores display
            const medals = ['🥇', '🥈', '🥉'];
            const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
            
            // Find and update the top score elements (they should be after the title)
            const topScoreElements = this.gameOverPanel.list.filter(child => 
                child instanceof Phaser.GameObjects.Text && 
                (child as Phaser.GameObjects.Text).text.match(/[🥇🥈🥉]/)
            ) as Phaser.GameObjects.Text[];
            
            for (let i = 0; i < Math.min(3, topScoreElements.length); i++) {
                const score = this.topScores[i] || 0;
                const medal = medals[i];
                const color = colors[i];
                
                topScoreElements[i].setText(`${medal} ${score}`);
                topScoreElements[i].setColor(color);
            }
        }
    }

    private restartGame() {
        // Hide game over panel
        this.gameOverPanel.setVisible(false);
        
        // Reset score and score recording flag
        this.score = 0;
        this.scoreAlreadyRecorded = false;
        this.scoreText.setText('Score: 0');
        
        // Stop both scenes completely
        this.scene.stop('GameScene');
        this.scene.stop('UIScene');
        
        // Start fresh from title screen
        this.scene.start('TitleScene');
    }

    private createGameOverPanel() {
        const width = 500;
        const height = 400;
        const x = this.cameras.main.width / 2;
        const y = this.cameras.main.height / 2;

        // Create panel background
        const panel = this.add.graphics()
            .fillStyle(0x000000, 0.9)
            .fillRoundedRect(-width / 2, -height / 2, width, height, 10)
            .lineStyle(2, 0xffffff, 1)
            .strokeRoundedRect(-width / 2, -height / 2, width, height, 10);

        // Add game over text
        const gameOverText = this.add.text(0, -160, 'GAME OVER', {
            fontSize: '36px',
            color: '#ff3333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add score text
        const finalScoreText = this.add.text(0, -110, `Final Score: ${this.score}`, {
            fontSize: '24px',
            color: '#fff'
        }).setOrigin(0.5);

        // Add top scores section
        const topScoresTitle = this.add.text(0, -70, 'TOP SCORES', {
            fontSize: '20px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create top scores list
        const topScoreElements: Phaser.GameObjects.Text[] = [];
        const medals = ['🥇', '🥈', '🥉'];
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
        
        for (let i = 0; i < 3; i++) {
            const score = this.topScores[i] || 0;
            const medal = medals[i];
            const color = colors[i];
            
            const scoreText = this.add.text(0, -40 + (i * 25), `${medal} ${score}`, {
                fontSize: '18px',
                color: color,
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            topScoreElements.push(scoreText);
        }

        // Add restart button
        const restartButton = this.add.rectangle(0, 120, 150, 50, 0x4CAF50)
            .setInteractive()
            .on('pointerdown', () => {
                // Properly reset and restart the game
                this.restartGame();
            });

        const buttonText = this.add.text(0, 120, 'Play Again', {
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
            topScoresTitle,
            ...topScoreElements,
            restartButton,
            buttonText
        ]).setDepth(1000).setVisible(false);
    }

    create(data: { difficulty: string; settings: any }) {
        // Reset score recording flag for new game
        this.scoreAlreadyRecorded = false;
        
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

        // Create score text (hidden since we show it in game header)
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            color: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 2
        }).setVisible(false);

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
