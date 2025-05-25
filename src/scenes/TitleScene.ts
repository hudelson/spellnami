import { Scene, Types } from 'phaser';

interface ButtonConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    text: string;
    style: Types.GameObjects.Text.TextStyle;
    onClick: () => void;
}

interface DifficultyButtonConfig extends ButtonConfig {
    normalColor: number;
    hoverColor: number;
}

class Button extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;
    private clickHandler: () => void;

    constructor(config: ButtonConfig) {
        super(config.scene, config.x, config.y);
        this.scene = config.scene;
        
        // Store click handler first
        this.clickHandler = config.onClick;
        
        // Create button background
        this.background = this.scene.add.rectangle(0, 0, 200, 50, 0x4CAF50)
            .setInteractive()
            .on('pointerover', () => this.onHover())
            .on('pointerout', () => this.onOut())
            .on('pointerdown', () => this.onClickHandler());
        
        // Create button text
        this.text = this.scene.add.text(0, 0, config.text, config.style).setOrigin(0.5);
        
        // Add to container
        this.add([this.background, this.text]);
        
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
    
    private onClickHandler() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 50,
            yoyo: true,
            onComplete: () => {
                if (this.clickHandler) {
                    this.clickHandler();
                }
            }
        });
    }
    
    setColor(color: number) {
        this.background.setFillStyle(color);
        return this;
    }
}

class DifficultyButton extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;
    private normalColor: number;
    private hoverColor: number;
    private onClick: () => void;

    constructor(config: DifficultyButtonConfig) {
        super(config.scene, config.x, config.y);
        this.scene = config.scene;
        this.normalColor = config.normalColor;
        this.hoverColor = config.hoverColor;
        this.onClick = config.onClick;
        
        // Create button background
        this.background = this.scene.add.rectangle(0, 0, 200, 50, this.normalColor)
            .setInteractive()
            .on('pointerover', () => this.onHover())
            .on('pointerout', () => this.onOut())
            .on('pointerdown', () => this.onClickHandler());
        
        // Create button text
        this.text = this.scene.add.text(0, 0, config.text, config.style).setOrigin(0.5);
        
        // Add to container
        this.add([this.background, this.text]);
        
        // Add to scene
        this.scene.add.existing(this);
    }
    
    private onHover() {
        this.background.setFillStyle(this.hoverColor);
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100
        });
    }
    
    private onOut() {
        this.background.setFillStyle(this.normalColor);
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 100
        });
    }
    
    private onClickHandler() {
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
}

export class TitleScene extends Scene {
    private howToPlayPopup: Phaser.GameObjects.Container | null = null;

    constructor() {
        super('TitleScene');
    }

    create() {
        // Add title with shadow effect
        const title = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height * 0.25,  // Moved up slightly (was / 3)
            'SPELLNAMI',
            {
                fontSize: '72px',
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

        // Add subtitle with more space from the title
        const subtitle = this.add.text(
            this.cameras.main.width / 2,
            title.y + 80,  // Reduced space from title
            'Select Difficulty',
            {
                fontSize: '28px',
                color: '#fff',
                fontStyle: 'bold',
                stroke: '#000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);

        // Calculate button positions based on screen size
        const buttonSpacing = 70;  // Reduced space between buttons
        const buttonYStart = subtitle.y + 60;  // Start buttons closer to subtitle
        
        // Difficulty levels with different colors and positions
        const difficulties = [
            { 
                text: 'Apprentice', 
                key: 'apprentice', 
                color: 0x4CAF50, 
                hoverColor: 0x45a049, 
                y: 0 
            },
            { 
                text: 'Scholar', 
                key: 'scholar', 
                color: 0xFF9800, 
                hoverColor: 0xe68a00, 
                y: buttonSpacing 
            },
            { 
                text: 'Master', 
                key: 'master', 
                color: 0xF44336, 
                hoverColor: 0xda190b, 
                y: buttonSpacing * 2 
            }
        ];
        
        difficulties.forEach((difficulty) => {
            const button = new DifficultyButton({
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
                onClick: () => this.startGame(difficulty.key as 'apprentice' | 'scholar' | 'master'),
                normalColor: difficulty.color,
                hoverColor: difficulty.hoverColor
            });
        });

        // Add "How to Play" button below the difficulty buttons
        const howToPlayY = buttonYStart + buttonSpacing * 3 + 20;
        console.log('Screen height:', this.cameras.main.height);
        console.log('How to Play button Y position:', howToPlayY);
        console.log('Button positions - Start:', buttonYStart, 'Spacing:', buttonSpacing);
        
        const howToPlayButton = new Button({
            scene: this,
            x: this.cameras.main.width / 2,
            y: howToPlayY, // Closer to the last difficulty button
            text: 'How to Play',
            style: {
                fontSize: '18px',
                color: '#fff',
                fontStyle: 'bold',
                stroke: '#000',
                strokeThickness: 2
            },
            onClick: () => this.showHowToPlay()
        });
        howToPlayButton.setColor(0x2196F3); // Blue color for How to Play button
        
        // Initialize particles in the background
        this.initParticles();
    }

    private showHowToPlay() {
        if (this.howToPlayPopup) return; // Prevent multiple popups

        const { width, height } = this.cameras.main;
        
        // Create popup container
        this.howToPlayPopup = this.add.container(width / 2, height / 2);
        
        // Create semi-transparent background overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setInteractive()
            .on('pointerdown', () => this.hideHowToPlay());
        
        // Create popup background with pixel-art style
        const popupBg = this.add.graphics();
        const popupWidth = Math.min(width * 0.9, 700);
        const popupHeight = Math.min(height * 0.9, 600);
        
        // Main popup background - dark
        popupBg.fillStyle(0x2c3e50, 1);
        popupBg.fillRect(-popupWidth/2, -popupHeight/2, popupWidth, popupHeight);
        
        // Pixel-art style border highlights
        popupBg.fillStyle(0x5dade2, 1);
        popupBg.fillRect(-popupWidth/2, -popupHeight/2, popupWidth, 4); // Top
        popupBg.fillRect(-popupWidth/2, -popupHeight/2, 4, popupHeight); // Left
        
        popupBg.fillStyle(0x1a252f, 1);
        popupBg.fillRect(-popupWidth/2, popupHeight/2 - 4, popupWidth, 4); // Bottom
        popupBg.fillRect(popupWidth/2 - 4, -popupHeight/2, 4, popupHeight); // Right
        
        // Title
        const popupTitle = this.add.text(0, -popupHeight/2 + 40, 'HOW TO PLAY', {
            fontSize: '32px',
            color: '#00ffff',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Instructions text with better spacing
        const instructions = [
            'OBJECTIVE: Type the letters to destroy falling words before they pile up!',
            '',
            'CONTROLS:',
            '• Type the first letter of each word to start destroying it',
            '• Continue typing each letter in sequence',
            '• Wrong letters freeze the word and make it fall faster',
            '',
            'GAME OVER:',
            '• When frozen blocks reach the top of the screen',
            '',
            'SCORING:',
            '• 10 points per letter typed correctly',
            '• Complete words for bonus effects!'
        ];
        
        // Close button
        const closeButton = this.add.text(popupWidth/2 - 30, -popupHeight/2 + 20, '✕', {
            fontSize: '24px',
            color: '#ff6b6b',
            fontStyle: 'bold'
        }).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.hideHowToPlay())
        .on('pointerover', () => closeButton.setScale(1.2))
        .on('pointerout', () => closeButton.setScale(1));
        
        // Add all elements to popup container
        this.howToPlayPopup.add([overlay, popupBg, popupTitle, closeButton]);
        
        // Add instruction text elements to popup with improved spacing
        let textYOffset = -popupHeight/2 + 80;
        instructions.forEach((line, index) => {
            const isHeader = line.includes('OBJECTIVE:') || line.includes('CONTROLS:') || 
                           line.includes('GAME OVER:') || line.includes('SCORING:');
            
            const instructionText = this.add.text(-popupWidth/2 + 40, textYOffset, line, {
                fontSize: isHeader ? '15px' : '13px',
                color: isHeader ? '#ffff00' : '#ffffff',
                fontFamily: 'monospace',
                fontStyle: isHeader ? 'bold' : 'normal',
                stroke: '#000000',
                strokeThickness: 1,
                wordWrap: { width: popupWidth - 80 }
            });
            
            if (this.howToPlayPopup) {
                this.howToPlayPopup.add(instructionText);
            }
            
            // Better spacing: more space after headers, less after bullet points
            if (line === '') {
                textYOffset += 8;
            } else if (isHeader) {
                textYOffset += 28;
            } else {
                textYOffset += 18;
            }
        });
        
        // Add block examples title with better spacing
        const blockExamplesYPos = textYOffset + 25;
        const blockTypesTitle = this.add.text(0, blockExamplesYPos, 'BLOCK TYPES', {
            fontSize: '16px',
            color: '#00ffff',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        if (this.howToPlayPopup) {
            this.howToPlayPopup.add(blockTypesTitle);
            
            // Create example blocks with better positioning
            const blockY = blockExamplesYPos + 35;
            
            // Normal block example
            this.createExampleBlock(-120, blockY, 'A', 'Normal Block', 0x2c3e50);
            
            // Frozen block example  
            this.createExampleBlock(0, blockY, 'B', 'Frozen Block', 0x74b9ff);
            
            // Active block example (highlighted)
            this.createExampleBlock(120, blockY, 'C', 'Active Letter', 0x2c3e50, true);
        }
        
        this.howToPlayPopup.setDepth(1000);
        
        // Animate popup appearance
        this.howToPlayPopup.setScale(0);
        this.tweens.add({
            targets: this.howToPlayPopup,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }
    
    private createExampleBlock(x: number, y: number, letter: string, label: string, color: number, isActive: boolean = false) {
        if (!this.howToPlayPopup) return;
        
        // Create block graphics
        const blockGraphic = this.add.graphics();
        blockGraphic.setPosition(x, y);
        
        // Main block body
        blockGraphic.fillStyle(color, 1);
        blockGraphic.fillRect(-15, -15, 30, 30);
        
        // Pixel-art style highlights and shadows
        if (color === 0x74b9ff) {
            // Frozen block styling
            blockGraphic.fillStyle(0xe17055, 1);
            blockGraphic.fillRect(-15, -15, 30, 3); // Top edge
            blockGraphic.fillRect(-15, -15, 3, 30); // Left edge
            
            blockGraphic.fillStyle(0x0984e3, 1);
            blockGraphic.fillRect(-15, 12, 30, 3); // Bottom edge
            blockGraphic.fillRect(12, -15, 3, 30); // Right edge
            
            // Ice crystals
            blockGraphic.fillStyle(0xffffff, 0.8);
            blockGraphic.fillRect(-6, -6, 2, 2);
            blockGraphic.fillRect(4, -9, 2, 2);
            blockGraphic.fillRect(-9, 6, 2, 2);
            blockGraphic.fillRect(7, 4, 2, 2);
        } else {
            // Normal block styling
            blockGraphic.fillStyle(0x5dade2, 1);
            blockGraphic.fillRect(-15, -15, 30, 3); // Top edge
            blockGraphic.fillRect(-15, -15, 3, 30); // Left edge
            
            blockGraphic.fillStyle(0x1a252f, 1);
            blockGraphic.fillRect(-15, 12, 30, 3); // Bottom edge
            blockGraphic.fillRect(12, -15, 3, 30); // Right edge
        }
        
        // Letter text
        const letterText = this.add.text(x, y, letter, {
            fontSize: '16px',
            color: isActive ? '#ffff00' : '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Label below block with better spacing
        const labelText = this.add.text(x, y + 25, label, {
            fontSize: '11px',
            color: '#cccccc',
            fontFamily: 'monospace',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add highlight effect for active block
        if (isActive) {
            this.tweens.add({
                targets: [blockGraphic, letterText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        this.howToPlayPopup.add([blockGraphic, letterText, labelText]);
    }
    
    private hideHowToPlay() {
        if (!this.howToPlayPopup) return;
        
        this.tweens.add({
            targets: this.howToPlayPopup,
            scaleX: 0,
            scaleY: 0,
            duration: 200,
            ease: 'Back.easeIn',
            onComplete: () => {
                if (this.howToPlayPopup) {
                    this.howToPlayPopup.destroy();
                    this.howToPlayPopup = null;
                }
            }
        });
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
