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

class PixelButton extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private text: Phaser.GameObjects.Text;
    private clickHandler: () => void;
    private normalColor: number;
    private hoverColor: number;

    constructor(config: DifficultyButtonConfig) {
        super(config.scene, config.x, config.y);
        this.scene = config.scene;
        this.normalColor = config.normalColor;
        this.hoverColor = config.hoverColor;
        this.clickHandler = config.onClick;
        
        // Create pixel-art style button background
        this.background = this.scene.add.graphics();
        this.createPixelButton();
        
        // Create button text with pixel-art styling
        this.text = this.scene.add.text(0, 0, config.text, {
            ...config.style,
            fontFamily: 'monospace',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Add to container
        this.add([this.background, this.text]);
        
        // Make interactive
        this.background.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains)
            .on('pointerover', () => this.onHover())
            .on('pointerout', () => this.onOut())
            .on('pointerdown', () => this.onClickHandler());
        
        // Add to scene
        this.scene.add.existing(this);
    }

    private createPixelButton() {
        this.background.clear();
        
        // Main button body
        this.background.fillStyle(this.normalColor, 1);
        this.background.fillRect(-100, -25, 200, 50);
        
        // Pixel-art style 3D effect - highlights (lighter colors)
        let highlightColor = this.normalColor;
        if (this.normalColor === 0x4CAF50) highlightColor = 0x66BB6A; // Green
        else if (this.normalColor === 0xFF9800) highlightColor = 0xFFB74D; // Orange  
        else if (this.normalColor === 0xF44336) highlightColor = 0xEF5350; // Red
        
        this.background.fillStyle(highlightColor, 1);
        this.background.fillRect(-100, -25, 200, 4); // Top highlight
        this.background.fillRect(-100, -25, 4, 50); // Left highlight
        
        // Pixel-art style 3D effect - shadows (darker colors)
        let shadowColor = this.normalColor;
        if (this.normalColor === 0x4CAF50) shadowColor = 0x388E3C; // Dark green
        else if (this.normalColor === 0xFF9800) shadowColor = 0xF57C00; // Dark orange
        else if (this.normalColor === 0xF44336) shadowColor = 0xD32F2F; // Dark red
        
        this.background.fillStyle(shadowColor, 1);
        this.background.fillRect(-100, 21, 200, 4); // Bottom shadow
        this.background.fillRect(96, -25, 4, 50); // Right shadow
        
        // Corner pixels for authentic retro look
        this.background.fillStyle(0x000000, 0.3);
        this.background.fillRect(-100, -25, 2, 2); // Top-left corner
        this.background.fillRect(98, -25, 2, 2); // Top-right corner
        this.background.fillRect(-100, 23, 2, 2); // Bottom-left corner
        this.background.fillRect(98, 23, 2, 2); // Bottom-right corner
    }

    private onHover() {
        // Swap colors for hover effect
        const tempColor = this.normalColor;
        this.normalColor = this.hoverColor;
        this.hoverColor = tempColor;
        this.createPixelButton();
        
        // Scale effect
        this.setScale(1.05);
        
        // Glow effect
        this.text.setTint(0xffffff);
    }

    private onOut() {
        // Restore original colors
        const tempColor = this.normalColor;
        this.normalColor = this.hoverColor;
        this.hoverColor = tempColor;
        this.createPixelButton();
        
        // Reset scale
        this.setScale(1);
        
        // Remove glow
        this.text.clearTint();
    }

    private onClickHandler() {
        // Click animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                if (this.clickHandler) {
                    this.clickHandler();
                }
            }
        });
    }
}

class PixelHowToPlayButton extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private text: Phaser.GameObjects.Text;
    private clickHandler: () => void;

    constructor(config: ButtonConfig) {
        super(config.scene, config.x, config.y);
        this.scene = config.scene;
        this.clickHandler = config.onClick;
        
        // Create pixel-art style button background
        this.background = this.scene.add.graphics();
        this.createPixelButton();
        
        // Create button text with pixel-art styling
        this.text = this.scene.add.text(0, 0, config.text, {
            ...config.style,
            fontFamily: 'monospace',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add to container
        this.add([this.background, this.text]);
        
        // Make interactive
        this.background.setInteractive(new Phaser.Geom.Rectangle(-80, -20, 160, 40), Phaser.Geom.Rectangle.Contains)
            .on('pointerover', () => this.onHover())
            .on('pointerout', () => this.onOut())
            .on('pointerdown', () => this.onClickHandler());
        
        // Add to scene
        this.scene.add.existing(this);
    }

    private createPixelButton() {
        this.background.clear();
        
        // Main button body - blue theme
        this.background.fillStyle(0x2196F3, 1);
        this.background.fillRect(-80, -20, 160, 40);
        
        // Pixel-art style 3D effect - highlights
        this.background.fillStyle(0x64B5F6, 1);
        this.background.fillRect(-80, -20, 160, 3); // Top highlight
        this.background.fillRect(-80, -20, 3, 40); // Left highlight
        
        // Pixel-art style 3D effect - shadows
        this.background.fillStyle(0x1565C0, 1);
        this.background.fillRect(-80, 17, 160, 3); // Bottom shadow
        this.background.fillRect(77, -20, 3, 40); // Right shadow
        
        // Corner details
        this.background.fillStyle(0x0D47A1, 1);
        this.background.fillRect(-77, -17, 2, 2);
        this.background.fillRect(75, -17, 2, 2);
        this.background.fillRect(-77, 15, 2, 2);
        this.background.fillRect(75, 15, 2, 2);
    }

    private onHover() {
        // Brighter blue on hover
        this.background.clear();
        this.background.fillStyle(0x42A5F5, 1);
        this.background.fillRect(-80, -20, 160, 40);
        
        // Enhanced highlights
        this.background.fillStyle(0x90CAF9, 1);
        this.background.fillRect(-80, -20, 160, 3);
        this.background.fillRect(-80, -20, 3, 40);
        
        this.background.fillStyle(0x1976D2, 1);
        this.background.fillRect(-80, 17, 160, 3);
        this.background.fillRect(77, -20, 3, 40);
        
        this.setScale(1.05);
        this.text.setTint(0xffffff);
    }

    private onOut() {
        this.createPixelButton();
        this.setScale(1);
        this.text.clearTint();
    }

    private onClickHandler() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                if (this.clickHandler) {
                    this.clickHandler();
                }
            }
        });
    }
}

export class TitleScene extends Scene {
    private howToPlayPopup: Phaser.GameObjects.Container | null = null;

    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        // Create pixel-art style background
        this.createPixelBackground();
        
        // Add pixel-art style title with multiple layers for depth
        this.createPixelTitle();
        
        // Create animated pixel border
        this.createAnimatedBorder();
        
        // Add subtitle with pixel styling
        const subtitle = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height * 0.25 + 80,
            'Select Difficulty',
            {
                fontSize: '28px',
                color: '#00ffff',
                fontFamily: 'monospace',
                fontStyle: 'bold',
                stroke: '#000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);

        // Calculate button positions
        const buttonSpacing = 80;
        const buttonYStart = subtitle.y + 60;

        // Create difficulty buttons with enhanced pixel art style
        const difficulties = [
            { text: 'Apprentice', key: 'apprentice', y: 0, color: 0x4CAF50, hoverColor: 0x66BB6A },
            { text: 'Scholar', key: 'scholar', y: buttonSpacing, color: 0xFF9800, hoverColor: 0xFFB74D },
            { text: 'Master', key: 'master', y: buttonSpacing * 2, color: 0xF44336, hoverColor: 0xEF5350 }
        ];

        difficulties.forEach((difficulty) => {
            new PixelButton({
                scene: this,
                x: this.cameras.main.width / 2,
                y: buttonYStart + difficulty.y,
                text: difficulty.text,
                style: {
                    fontSize: '24px',
                    color: '#fff',
                    fontStyle: 'bold'
                },
                onClick: () => this.startGame(difficulty.key as 'apprentice' | 'scholar' | 'master'),
                normalColor: difficulty.color,
                hoverColor: difficulty.hoverColor
            });
        });

        // Add "How to Play" button with pixel art style
        const howToPlayY = buttonYStart + buttonSpacing * 3 + 20;
        new PixelHowToPlayButton({
            scene: this,
            x: this.cameras.main.width / 2,
            y: howToPlayY,
            text: 'How to Play',
            style: {
                fontSize: '18px',
                color: '#fff',
                fontStyle: 'bold'
            },
            onClick: () => this.showHowToPlay()
        });

        // Initialize enhanced pixel-art particles in the background
        this.initPixelParticles();
    }

    private createPixelBackground() {
        const { width, height } = this.cameras.main;
        
        // Create a gradient-like background using pixel blocks
        const bgGraphics = this.add.graphics();
        
        // Create a starfield effect with pixel stars
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const brightness = Phaser.Math.FloatBetween(0.3, 1.0);
            const size = Phaser.Math.Between(1, 3);
            
            bgGraphics.fillStyle(Phaser.Display.Color.GetColor32(
                Math.floor(255 * brightness),
                Math.floor(255 * brightness),
                255,
                255
            ), brightness * 0.6);
            bgGraphics.fillRect(x, y, size, size);
        }
        
        // Add some larger pixel clusters for depth
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const clusterSize = Phaser.Math.Between(3, 8);
            
            bgGraphics.fillStyle(0x1a1a2e, 0.4);
            bgGraphics.fillRect(x, y, clusterSize, clusterSize);
        }
        
        bgGraphics.setDepth(-100);
    }

    private createPixelTitle() {
        const centerX = this.cameras.main.width / 2;
        const titleY = this.cameras.main.height * 0.25;
        
        // Shadow layer (offset)
        const shadowTitle = this.add.text(centerX + 4, titleY + 4, 'SPELLNAMI', {
            fontSize: '72px',
            color: '#000000',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Main title layer
        const mainTitle = this.add.text(centerX, titleY, 'SPELLNAMI', {
            fontSize: '72px',
            color: '#00ffff',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#0088ff',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Highlight layer (slight offset for 3D effect)
        const highlightTitle = this.add.text(centerX - 2, titleY - 2, 'SPELLNAMI', {
            fontSize: '72px',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0.3);
        
        // Add pulsing animation to main title
        this.tweens.add({
            targets: mainTitle,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add subtle color cycling to main title
        this.tweens.add({
            targets: mainTitle,
            duration: 4000,
            repeat: -1,
            onUpdate: (tween) => {
                const progress = tween.progress;
                // Cycle through blue-cyan colors
                const colors = [0x00ffff, 0x0088ff, 0x5dade2, 0x74b9ff];
                const colorIndex = Math.floor(progress * colors.length);
                mainTitle.setTint(colors[colorIndex] || 0x00ffff);
            }
        });
    }

    private createAnimatedBorder() {
        const { width, height } = this.cameras.main;
        const borderGraphics = this.add.graphics();
        const borderWidth = 8;
        const pixelSize = 4;
        
        // Create animated pixel border pattern
        for (let x = 0; x < width; x += pixelSize * 2) {
            const color = (x / (pixelSize * 2)) % 2 === 0 ? 0x00ffff : 0x0088ff;
            borderGraphics.fillStyle(color, 0.6);
            
            // Top border
            borderGraphics.fillRect(x, 0, pixelSize, borderWidth);
            // Bottom border
            borderGraphics.fillRect(x, height - borderWidth, pixelSize, borderWidth);
        }
        
        for (let y = 0; y < height; y += pixelSize * 2) {
            const color = (y / (pixelSize * 2)) % 2 === 0 ? 0x00ffff : 0x0088ff;
            borderGraphics.fillStyle(color, 0.6);
            
            // Left border
            borderGraphics.fillRect(0, y, borderWidth, pixelSize);
            // Right border
            borderGraphics.fillRect(width - borderWidth, y, borderWidth, pixelSize);
        }
        
        // Animate border with pulsing effect
        this.tweens.add({
            targets: borderGraphics,
            alpha: 0.4,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        borderGraphics.setDepth(-50);
    }

    private initPixelParticles() {
        this.createFloatingPixels();
        this.createEnergyOrbs();
        this.createSparkles();
    }

    private createFloatingPixels() {
        this.time.addEvent({
            delay: 800,
            callback: () => {
                const x = Phaser.Math.Between(0, this.cameras.main.width);
                const startY = this.cameras.main.height + 10;
                
                const particle = this.add.graphics();
                const size = Phaser.Math.Between(2, 6);
                const color = Phaser.Math.RND.pick([0x00ffff, 0x74b9ff, 0x5dade2, 0xffffff]);
                
                particle.fillStyle(color, 0.8);
                particle.fillRect(0, 0, size, size);
                particle.setPosition(x, startY);
                
                this.tweens.add({
                    targets: particle,
                    y: -20,
                    x: x + Phaser.Math.Between(-50, 50),
                    alpha: 0,
                    duration: Phaser.Math.Between(4000, 6000),
                    ease: 'Linear',
                    onComplete: () => particle.destroy()
                });
            },
            loop: true
        });
    }

    private createEnergyOrbs() {
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
                const y = Phaser.Math.Between(100, this.cameras.main.height - 100);
                
                const orb = this.add.graphics();
                orb.setPosition(x, y);
                
                orb.fillStyle(0x00ffff, 0.6);
                orb.fillRect(-4, -4, 8, 8);
                orb.fillStyle(0x74b9ff, 0.4);
                orb.fillRect(-6, -2, 2, 4);
                orb.fillRect(4, -2, 2, 4);
                orb.fillRect(-2, -6, 4, 2);
                orb.fillRect(-2, 4, 4, 2);
                
                this.tweens.add({
                    targets: orb,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    alpha: 0,
                    duration: 3000,
                    ease: 'Quad.easeOut',
                    onComplete: () => orb.destroy()
                });
                
                this.tweens.add({
                    targets: orb,
                    rotation: Math.PI * 2,
                    duration: 3000,
                    ease: 'Linear'
                });
            },
            loop: true
        });
    }

    private createSparkles() {
        this.time.addEvent({
            delay: 300,
            callback: () => {
                const x = Phaser.Math.Between(50, this.cameras.main.width - 50);
                const y = Phaser.Math.Between(50, this.cameras.main.height - 50);
                
                const sparkle = this.add.graphics();
                sparkle.setPosition(x, y);
                
                sparkle.fillStyle(0xffffff, 1);
                sparkle.fillRect(0, -4, 2, 8);
                sparkle.fillRect(-4, 0, 8, 2);
                sparkle.fillRect(-2, -2, 4, 4);
                
                this.tweens.add({
                    targets: sparkle,
                    scaleX: 0,
                    scaleY: 0,
                    alpha: 0,
                    duration: 600,
                    ease: 'Back.easeIn',
                    onComplete: () => sparkle.destroy()
                });
            },
            loop: true
        });
    }

    private showHowToPlay() {
        if (this.howToPlayPopup) return;

        const { width, height } = this.cameras.main;
        this.howToPlayPopup = this.add.container(width / 2, height / 2);
        
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setInteractive()
            .on('pointerdown', () => this.hideHowToPlay());
        
        const popupBg = this.add.graphics();
        const popupWidth = Math.min(width * 0.9, 700);
        const popupHeight = Math.min(height * 0.9, 600);
        
        // Pixel-art style popup background
        popupBg.fillStyle(0x2c3e50, 1);
        popupBg.fillRect(-popupWidth/2, -popupHeight/2, popupWidth, popupHeight);
        
        popupBg.fillStyle(0x5dade2, 1);
        popupBg.fillRect(-popupWidth/2, -popupHeight/2, popupWidth, 4);
        popupBg.fillRect(-popupWidth/2, -popupHeight/2, 4, popupHeight);
        
        popupBg.fillStyle(0x1a252f, 1);
        popupBg.fillRect(-popupWidth/2, popupHeight/2 - 4, popupWidth, 4);
        popupBg.fillRect(popupWidth/2 - 4, -popupHeight/2, 4, popupHeight);
        
        const popupTitle = this.add.text(0, -popupHeight/2 + 40, 'HOW TO PLAY', {
            fontSize: '32px',
            color: '#00ffff',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        const instructions = [
            'OBJECTIVE: Type letters to destroy falling words!',
            '',
            '',
            'CONTROLS:',
            '• Type the first letter of each word to start destroying it',
            '• Continue typing each letter in sequence',
            '• Wrong letters freeze the word and make it fall faster',
            '',
            '',
            'GAME OVER:',
            '• When frozen blocks reach the top of the screen',
            '',
            '',
            'SCORING:',
            '• 10 points per letter typed correctly',
            '• Complete words for bonus effects!'
        ];
        
        const closeButton = this.add.text(popupWidth/2 - 30, -popupHeight/2 + 20, '✕', {
            fontSize: '24px',
            color: '#ff6b6b',
            fontStyle: 'bold'
        }).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.hideHowToPlay())
        .on('pointerover', () => closeButton.setScale(1.2))
        .on('pointerout', () => closeButton.setScale(1));
        
        this.howToPlayPopup.add([overlay, popupBg, popupTitle, closeButton]);
        
        let textYOffset = -popupHeight/2 + 80;
        instructions.forEach((line) => {
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
            
            this.howToPlayPopup!.add(instructionText);
            
            if (line === '') {
                textYOffset += 8;
            } else if (isHeader) {
                textYOffset += 28;
            } else {
                textYOffset += 18;
            }
        });
        
        const blockExamplesYPos = textYOffset + 25;
        const blockTypesTitle = this.add.text(0, blockExamplesYPos, 'BLOCK TYPES', {
            fontSize: '16px',
            color: '#00ffff',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.howToPlayPopup.add(blockTypesTitle);
        
        const blockY = blockExamplesYPos + 35;
        this.createExampleBlock(-120, blockY, 'A', 'Normal Block', 0x2c3e50);
        this.createExampleBlock(0, blockY, 'B', 'Frozen Block', 0x74b9ff);
        this.createExampleBlock(120, blockY, 'C', 'Active Letter', 0x2c3e50, true);
        
        this.howToPlayPopup.setDepth(1000);
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
        
        const blockGraphic = this.add.graphics();
        blockGraphic.setPosition(x, y);
        
        blockGraphic.fillStyle(color, 1);
        blockGraphic.fillRect(-15, -15, 30, 30);
        
        if (color === 0x74b9ff) {
            blockGraphic.fillStyle(0xe17055, 1);
            blockGraphic.fillRect(-15, -15, 30, 3);
            blockGraphic.fillRect(-15, -15, 3, 30);
            
            blockGraphic.fillStyle(0x0984e3, 1);
            blockGraphic.fillRect(-15, 12, 30, 3);
            blockGraphic.fillRect(12, -15, 3, 30);
            
            blockGraphic.fillStyle(0xffffff, 0.8);
            blockGraphic.fillRect(-6, -6, 2, 2);
            blockGraphic.fillRect(4, -9, 2, 2);
            blockGraphic.fillRect(-9, 6, 2, 2);
            blockGraphic.fillRect(7, 4, 2, 2);
        } else {
            blockGraphic.fillStyle(0x5dade2, 1);
            blockGraphic.fillRect(-15, -15, 30, 3);
            blockGraphic.fillRect(-15, -15, 3, 30);
            
            blockGraphic.fillStyle(0x1a252f, 1);
            blockGraphic.fillRect(-15, 12, 30, 3);
            blockGraphic.fillRect(12, -15, 3, 30);
        }
        
        const letterText = this.add.text(x, y, letter, {
            fontSize: '16px',
            color: isActive ? '#ffff00' : '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        const labelText = this.add.text(x, y + 25, label, {
            fontSize: '11px',
            color: '#cccccc',
            fontFamily: 'monospace',
            align: 'center'
        }).setOrigin(0.5);
        
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
        const difficultySettings = {
            apprentice: { minLength: 3, maxLength: 5, speed: 120, color: '#4CAF50' },
            scholar: { minLength: 5, maxLength: 7, speed: 170, color: '#FF9800' },
            master: { minLength: 7, maxLength: 10, speed: 220, color: '#F44336' }
        };
        
        this.scene.start('UIScene', { difficulty: difficulty, settings: difficultySettings[difficulty] });
        this.scene.start('GameScene', { difficulty: difficulty });
    }
}
