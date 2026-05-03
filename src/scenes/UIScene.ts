import { Scene } from 'phaser';
import { GameMode } from '../types/GameTypes';

interface DifficultySettings {
    name?: string;
    minLength?: number;
    maxLength?: number;
    operation?: string;
    minOperand?: number;
    maxOperand?: number;
    speed: number;
    color: string;
}

export class UIScene extends Scene {
    private scoreText!: Phaser.GameObjects.Text;
    private gameOverPanel!: Phaser.GameObjects.Container;
    private score: number = 0;
    private difficultySettings!: DifficultySettings;
    private currentDifficulty!: string;
    private currentMode: GameMode = GameMode.Spell;
    private topScores: number[] = [];
    private scoreAlreadyRecorded: boolean = false;
    // Health bars for Math mode
    private playerHealthBar?: Phaser.GameObjects.Graphics;
    private enemyHealthBar?: Phaser.GameObjects.Graphics;
    private playerHealthText?: Phaser.GameObjects.Text;
    private enemyHealthText?: Phaser.GameObjects.Text;

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
            console.log('Loaded top scores:', this.topScores);
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
            this.updateTopScores(this.score);
            this.scoreAlreadyRecorded = true;
        }
        
        // Always destroy and recreate the panel to ensure fresh data
        if (this.gameOverPanel) {
            this.gameOverPanel.destroy();
        }
        this.createGameOverPanel();
        this.gameOverPanel.setVisible(true);
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

        // Create pixel-art style panel background
        const panel = this.add.graphics();
        
        // Main background - dark blue
        panel.fillStyle(0x2c3e50, 1);
        panel.fillRect(-width / 2, -height / 2, width, height);
        
        // Pixel-art style border - multiple layers for depth
        // Outer border - bright cyan
        panel.lineStyle(4, 0x00ffff, 1);
        panel.strokeRect(-width / 2, -height / 2, width, height);
        
        // Inner border - darker blue
        panel.lineStyle(2, 0x3498db, 1);
        panel.strokeRect(-width / 2 + 6, -height / 2 + 6, width - 12, height - 12);
        
        // Corner highlights - pixel-art style
        panel.fillStyle(0x5dade2, 1);
        // Top-left corner
        panel.fillRect(-width / 2, -height / 2, 12, 4);
        panel.fillRect(-width / 2, -height / 2, 4, 12);
        // Top-right corner
        panel.fillRect(width / 2 - 12, -height / 2, 12, 4);
        panel.fillRect(width / 2 - 4, -height / 2, 4, 12);
        // Bottom-left corner
        panel.fillRect(-width / 2, height / 2 - 4, 12, 4);
        panel.fillRect(-width / 2, height / 2 - 12, 4, 12);
        // Bottom-right corner
        panel.fillRect(width / 2 - 12, height / 2 - 4, 12, 4);
        panel.fillRect(width / 2 - 4, height / 2 - 12, 4, 12);

        // Add pixel-art style game over text with shadow
        const gameOverShadow = this.add.text(2, -158, 'GAME OVER', {
            fontSize: '36px',
            color: '#000000',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const gameOverText = this.add.text(0, -160, 'GAME OVER', {
            fontSize: '36px',
            color: '#ff3333',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Add pixel-art style score text with shadow
        const scoreShadow = this.add.text(2, -108, `Final Score: ${this.score}`, {
            fontSize: '24px',
            color: '#000000',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        const finalScoreText = this.add.text(0, -110, `Final Score: ${this.score}`, {
            fontSize: '24px',
            color: '#ffff00',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Add pixel-art style top scores section
        const topScoresShadow = this.add.text(2, -68, 'TOP SCORES', {
            fontSize: '20px',
            color: '#000000',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        const topScoresTitle = this.add.text(0, -70, 'TOP SCORES', {
            fontSize: '20px',
            color: '#00ffff',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Create pixel-art style top scores list with trophy icons
        const topScoreElements: Phaser.GameObjects.Text[] = [];
        const topScoreShadows: Phaser.GameObjects.Text[] = [];
        const medals = ['🥇', '🥈', '🥉'];
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
        
        console.log('Creating game over panel with top scores:', this.topScores);
        
        for (let i = 0; i < 3; i++) {
            const score = this.topScores[i] || 0;
            const medal = medals[i];
            const color = colors[i];
            
            // Increased spacing to 40 pixels to prevent overlap
            const scoreShadow = this.add.text(2, -20 + (i * 40), `${medal} ${score}`, {
                fontSize: '18px',
                color: '#000000',
                fontFamily: 'monospace'
            }).setOrigin(0.5);
            
            const scoreText = this.add.text(0, -22 + (i * 40), `${medal} ${score}`, {
                fontSize: '18px',
                color: color,
                fontFamily: 'monospace',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5);
            
            topScoreShadows.push(scoreShadow);
            topScoreElements.push(scoreText);
        }

        // Create pixel-art style restart button (moved down to avoid overlap)
        const buttonBg = this.add.graphics();
        
        // Button background - green with pixel-art styling
        buttonBg.fillStyle(0x4CAF50, 1);
        buttonBg.fillRect(-75, 140, 150, 50);
        
        // Button highlights - pixel-art style
        buttonBg.fillStyle(0x66BB6A, 1);
        buttonBg.fillRect(-75, 140, 150, 4); // Top highlight
        buttonBg.fillRect(-75, 140, 4, 50); // Left highlight
        
        // Button shadows
        buttonBg.fillStyle(0x388E3C, 1);
        buttonBg.fillRect(-75, 186, 150, 4); // Bottom shadow
        buttonBg.fillRect(71, 140, 4, 50); // Right shadow
        
        // Button border
        buttonBg.lineStyle(2, 0x2E7D32, 1);
        buttonBg.strokeRect(-75, 140, 150, 50);

        // Make button interactive
        const buttonHitArea = this.add.rectangle(0, 165, 150, 50, 0x000000, 0)
            .setInteractive()
            .on('pointerdown', () => {
                this.restartGame();
            });

        const buttonShadow = this.add.text(2, 167, 'PLAY AGAIN', {
            fontSize: '20px',
            color: '#000000',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        const buttonText = this.add.text(0, 165, 'PLAY AGAIN', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Button hover effects - pixel-art style
        buttonHitArea.on('pointerover', () => {
            buttonBg.clear();
            // Brighter green on hover
            buttonBg.fillStyle(0x66BB6A, 1);
            buttonBg.fillRect(-75, 140, 150, 50);
            
            buttonBg.fillStyle(0x81C784, 1);
            buttonBg.fillRect(-75, 140, 150, 4);
            buttonBg.fillRect(-75, 140, 4, 50);
            
            buttonBg.fillStyle(0x4CAF50, 1);
            buttonBg.fillRect(-75, 186, 150, 4);
            buttonBg.fillRect(71, 140, 4, 50);
            
            buttonBg.lineStyle(2, 0x2E7D32, 1);
            buttonBg.strokeRect(-75, 140, 150, 50);
        });

        buttonHitArea.on('pointerout', () => {
            buttonBg.clear();
            // Original green
            buttonBg.fillStyle(0x4CAF50, 1);
            buttonBg.fillRect(-75, 140, 150, 50);
            
            buttonBg.fillStyle(0x66BB6A, 1);
            buttonBg.fillRect(-75, 140, 150, 4);
            buttonBg.fillRect(-75, 140, 4, 50);
            
            buttonBg.fillStyle(0x388E3C, 1);
            buttonBg.fillRect(-75, 186, 150, 4);
            buttonBg.fillRect(71, 140, 4, 50);
            
            buttonBg.lineStyle(2, 0x2E7D32, 1);
            buttonBg.strokeRect(-75, 140, 150, 50);
        });

        // Create container for the panel
        this.gameOverPanel = this.add.container(x, y, [
            panel,
            gameOverShadow,
            gameOverText,
            scoreShadow,
            finalScoreText,
            topScoresShadow,
            topScoresTitle,
            ...topScoreShadows,
            ...topScoreElements,
            buttonBg,
            buttonHitArea,
            buttonShadow,
            buttonText
        ]).setDepth(1000).setVisible(false);
    }

    create(data: { difficulty: string; settings: any; mode?: GameMode }) {
        // Reset score recording flag for new game
        this.scoreAlreadyRecorded = false;
        
        // Load top scores from localStorage
        this.loadTopScores();
        
        // Get mode from data or registry
        if (data && data.mode) {
            this.currentMode = data.mode;
            this.registry.set('gameMode', data.mode);
        } else {
            this.currentMode = this.registry.get('gameMode') || GameMode.Spell;
        }
        
        // Get difficulty from scene data or registry
        if (data && data.difficulty) {
            this.currentDifficulty = data.difficulty;
            this.registry.set('difficulty', data.difficulty);
        } else {
            this.currentDifficulty = this.registry.get('difficulty') || 'apprentice';
        }
        
        // Update difficulty settings if provided
        if (data && data.settings) {
            this.difficultySettings = data.settings;
            this.registry.set('settings', data.settings);
        }
        
        // Clean up any existing event listeners to prevent accumulation
        this.events.off('addScore');
        this.events.off('gameOver');
        this.events.off('updateHealth');
        
        // Set up event listeners
        this.events.on('addScore', this.addScore, this);
        this.events.on('gameOver', this.showGameOver, this);
        this.events.on('updateHealth', this.updateHealthBars, this);
        
        // Clean up any existing GameScene event listeners to prevent accumulation
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.events) {
            gameScene.events.off('addScore');
            gameScene.events.off('gameOver');
            gameScene.events.off('updateHealth');
            
            // Listen for score updates from the GameScene
            gameScene.events.on('addScore', (points: number) => {
                this.addScore(points);
            });
            
            // Listen for game over from the GameScene
            gameScene.events.on('gameOver', () => {
                this.showGameOver();
            });
            
            // Listen for health updates from the GameScene
            gameScene.events.on('updateHealth', (data: any) => {
                this.updateHealthBars(data);
            });
        }

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
        
        // Create health bars for Math mode
        if (this.currentMode === GameMode.Math) {
            this.createHealthBars();
        }
    }
    
    /**
     * Create health bars for ship battle mode
     */
    private createHealthBars() {
        const { width } = this.cameras.main;
        
        // Player health bar (bottom)
        const playerBarX = width / 2 - 100;
        const playerBarY = this.cameras.main.height - 40;
        
        this.playerHealthBar = this.add.graphics();
        this.playerHealthText = this.add.text(playerBarX - 80, playerBarY - 10, 'PLAYER', {
            fontSize: '14px',
            color: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setDepth(200);
        
        // Enemy health bar (top)
        const enemyBarX = width / 2 - 100;
        const enemyBarY = 30;
        
        this.enemyHealthBar = this.add.graphics();
        this.enemyHealthText = this.add.text(enemyBarX - 80, enemyBarY - 10, 'ENEMY', {
            fontSize: '14px',
            color: '#ff0000',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setDepth(200);
        
        // Draw initial health bars (full)
        this.drawHealthBar(this.playerHealthBar, playerBarX, playerBarY, 100, 100, 0x00ff00);
        this.drawHealthBar(this.enemyHealthBar, enemyBarX, enemyBarY, 100, 100, 0xff0000);
    }
    
    /**
     * Draw a health bar
     */
    private drawHealthBar(
        graphics: Phaser.GameObjects.Graphics,
        x: number,
        y: number,
        current: number,
        max: number,
        color: number
    ) {
        graphics.clear();
        graphics.setDepth(200);
        
        const barWidth = 200;
        const barHeight = 20;
        const fillWidth = (current / max) * barWidth;
        
        // Background (empty part)
        graphics.fillStyle(0x333333, 1);
        graphics.fillRect(x, y, barWidth, barHeight);
        
        // Health fill
        graphics.fillStyle(color, 1);
        graphics.fillRect(x, y, fillWidth, barHeight);
        
        // Border
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.strokeRect(x, y, barWidth, barHeight);
        
        // Pixel-art style highlights
        graphics.lineStyle(1, 0xffffff, 0.5);
        graphics.strokeRect(x + 2, y + 2, barWidth - 4, barHeight - 4);
    }
    
    /**
     * Update health bars
     */
    private updateHealthBars(data: {
        playerHealth: number;
        playerMaxHealth: number;
        enemyHealth: number;
        enemyMaxHealth: number;
    }) {
        if (!this.playerHealthBar || !this.enemyHealthBar) return;
        
        const { width } = this.cameras.main;
        const playerBarX = width / 2 - 100;
        const playerBarY = this.cameras.main.height - 40;
        const enemyBarX = width / 2 - 100;
        const enemyBarY = 30;
        
        // Determine color based on health percentage
        const playerHealthPercent = data.playerHealth / data.playerMaxHealth;
        const playerColor = playerHealthPercent > 0.5 ? 0x00ff00 : playerHealthPercent > 0.25 ? 0xffff00 : 0xff0000;
        
        const enemyHealthPercent = data.enemyHealth / data.enemyMaxHealth;
        const enemyColor = enemyHealthPercent > 0.5 ? 0xff0000 : enemyHealthPercent > 0.25 ? 0xff8800 : 0xff0000;
        
        this.drawHealthBar(this.playerHealthBar, playerBarX, playerBarY, data.playerHealth, data.playerMaxHealth, playerColor);
        this.drawHealthBar(this.enemyHealthBar, enemyBarX, enemyBarY, data.enemyHealth, data.enemyMaxHealth, enemyColor);
    }

    public getDifficultySettings(): DifficultySettings {
        return this.difficultySettings;
    }

    public getScore(): number {
        return this.score;
    }
}
