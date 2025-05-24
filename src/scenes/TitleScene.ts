import { Scene, Types } from 'phaser';

interface ButtonConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    text: string;
    style: Types.GameObjects.Text.TextStyle;
    onClick: () => void;
}

class Button extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;

    constructor(config: ButtonConfig) {
        super(config.scene, config.x, config.y);
        this.scene = config.scene;
        
        // Create button background
        this.background = this.scene.add.rectangle(0, 0, 200, 50, 0x4CAF50)
            .setInteractive()
            .on('pointerover', () => this.onHover())
            .on('pointerout', () => this.onOut())
            .on('pointerdown', () => this.onClick());
        
        // Create button text
        this.text = this.scene.add.text(0, 0, config.text, config.style).setOrigin(0.5);
        
        // Add to container
        this.add([this.background, this.text]);
        
        // Store click handler
        this.onClick = config.onClick;
        
        // Add to scene
        this.scene.add.existing(this);
    }
    
    private onHover() {
        this.background.setFillStyle(0x45a049);
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100
        });
    }
    
    private onOut() {
        this.background.setFillStyle(0x4CAF50);
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 100
        });
    }
    
    private onClick() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 50,
            yoyo: true,
            onComplete: () => {
                if (this.onClick) {
                    this.onClick();
                }
            }
        });
    }
    
    setColor(color: number) {
        this.background.setFillStyle(color);
        return this;
    }
}

export class TitleScene extends Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        // Add title with shadow effect
        const title = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 3,
            'SPELLNAMI',
            {
                fontSize: '64px',
                color: '#fff',
                fontStyle: 'bold',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Add glow effect to title
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add subtitle
        this.add.text(
            this.cameras.main.width / 2,
            title.y + 70,
            'Select Difficulty',
            {
                fontSize: '24px',
                color: '#fff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Difficulty levels with different colors and positions
        const difficulties = [
            { text: 'Apprentice', key: 'apprentice', color: 0x4CAF50, y: 0 },
            { text: 'Scholar', key: 'scholar', color: 0xFF9800, y: 70 },
            { text: 'Master', key: 'master', color: 0xF44336, y: 140 }
        ];

        // Create buttons
        const buttonYStart = this.cameras.main.height / 2 - 30;
        
        difficulties.forEach((difficulty) => {
            const button = new Button({
                scene: this,
                x: this.cameras.main.width / 2,
                y: buttonYStart + difficulty.y,
                text: difficulty.text,
                style: {
                    fontSize: '24px',
                    color: '#fff',
                    fontStyle: 'bold',
                    stroke: '#000',
                    strokeThickness: 2
                },
                onClick: () => this.startGame(difficulty.key as 'apprentice' | 'scholar' | 'master')
            }).setColor(difficulty.color);
            
            // Add hover effect
            button.on('pointerover', () => {
                this.tweens.add({
                    targets: button,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 200
                });
            });
            
            button.on('pointerout', () => {
                this.tweens.add({
                    targets: button,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200
                });
            });
        });
        
        // Initialize particles in the background
        this.initParticles();
    }

    private startGame(difficulty: 'apprentice' | 'scholar' | 'master') {
        // Define difficulty settings
        const difficultySettings = {
            apprentice: { minLength: 3, maxLength: 5, speed: 120, color: '#4CAF50' },
            scholar: { minLength: 5, maxLength: 7, speed: 170, color: '#FF9800' },
            master: { minLength: 7, maxLength: 10, speed: 220, color: '#F44336' }
        };
        
        // Start both scenes with the difficulty settings
        this.scene.start('UIScene', { difficulty: difficulty, settings: difficultySettings[difficulty] });
        this.scene.start('GameScene', { difficulty: difficulty });
    }
    
    private initParticles() {
        // Create a simple particle effect using a timer
        this.time.addEvent({
            delay: 500, // Every 500ms
            callback: () => {
                // Create a single particle at a random x position at the bottom of the screen
                const x = Phaser.Math.Between(0, this.cameras.main.width);
                const particle = this.add.image(x, this.cameras.main.height, 'flame')
                    .setScale(0.5)
                    .setAlpha(0.7);
                
                // Animate the particle moving up and fading out
                this.tweens.add({
                    targets: particle,
                    y: 0,
                    alpha: 0,
                    scale: 0,
                    duration: 3000,
                    ease: 'Linear',
                    onComplete: () => {
                        particle.destroy();
                    }
                });
            },
            loop: true
        });
    }
}
