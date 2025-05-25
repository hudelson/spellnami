import { Scene } from 'phaser';
import * as Matter from 'matter-js';
import { WordManager } from '../systems/WordManager';
import { PhysicsManager } from '../systems/PhysicsManager';
import { EffectManager } from '../systems/EffectManager';
import { UIScene } from './UIScene';

// Extend MatterJS.BodyType to include our custom properties
type BlockBody = MatterJS.BodyType & {
    gameObject?: Phaser.GameObjects.GameObject;
    label?: string;
    body?: MatterJS.BodyType;
};

declare global {
    // Extend the Matter namespace to include our custom properties
    namespace MatterJS {
        interface Body {
            gameObject?: Phaser.GameObjects.GameObject;
            label?: string;
            body?: MatterJS.BodyType;
        }
    }
}

export class GameScene extends Scene {
    private wordManager!: WordManager;
    private physicsManager!: PhysicsManager;
    private effectManager!: EffectManager;
    private uiScene!: UIScene;
    private isGameOver: boolean = false;
    // Define the current word with our block type
    private currentWord: { text: string; blocks: BlockBody[] } | null = null;
    // Header UI elements
    private headerScoreText!: Phaser.GameObjects.Text;
    private headerNextWordText!: Phaser.GameObjects.Text;

    constructor() {
        super('GameScene');
    }

    create(data: { difficulty?: string }) {
        console.log('GameScene create called');
        
        // Reset game state
        this.isGameOver = false;
        this.currentWord = null;
        
        // Get reference to UI scene
        this.uiScene = this.scene.get('UIScene') as UIScene;
        
        // Get difficulty settings from UI scene
        const difficultySettings = this.uiScene.getDifficultySettings();
        
        // Initialize managers
        this.effectManager = new EffectManager(this);
        this.physicsManager = new PhysicsManager(this);
        this.wordManager = new WordManager(
            this,
            this.physicsManager,
            difficultySettings
        );
        
        // Initialize effect manager
        this.effectManager = new EffectManager(this);
        
        console.log('Game started with difficulty:', data.difficulty || 'default');

        // Set up world bounds with collision events
        const { width, height } = this.cameras.main;
        
        // Clear any existing physics bodies (in case of restart)
        const existingBodies = this.matter.world.getAllBodies();
        existingBodies.forEach(body => {
            if (!body.isStatic) {
                this.matter.world.remove(body);
            }
        });
        
        // Configure physics world with even slower gravity settings for easier gameplay
        this.matter.world.setGravity(0, 0.2);
        
        // Set up camera
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(width / 2, height / 2);
        
        // Create bounds manually to ensure proper collision detection
        // Make the play area narrower with wider margins
        const sideMarginWidth = 120; // Much wider side margins for texture
        const topMarginHeight = 80; // Reduced top margin for more vertical play space
        const bottomWallThickness = 20; // Thinner bottom wall for more play space
        
        // Calculate play area dimensions
        const playAreaWidth = width - (sideMarginWidth * 2);
        const playAreaHeight = height - topMarginHeight - bottomWallThickness;
        const playAreaLeft = sideMarginWidth;
        const playAreaTop = topMarginHeight;
        
        // Create individual wall bodies manually for the narrower play area
        const topWall = this.matter.add.rectangle(
            width / 2, 
            playAreaTop - 16, 
            playAreaWidth, 
            32, 
            { isStatic: true, label: 'Bounds Top' }
        );
        const bottomWall = this.matter.add.rectangle(
            width / 2, 
            height - bottomWallThickness / 2, 
            playAreaWidth, 
            bottomWallThickness, 
            { isStatic: true, label: 'Bounds Bottom' }
        );
        const leftWall = this.matter.add.rectangle(
            playAreaLeft - 16, 
            height / 2, 
            32, 
            height, 
            { isStatic: true, label: 'Bounds Left' }
        );
        const rightWall = this.matter.add.rectangle(
            playAreaLeft + playAreaWidth + 16, 
            height / 2, 
            32, 
            height, 
            { isStatic: true, label: 'Bounds Right' }
        );
        
        // Wall boundaries created successfully
        
        // Disable debug rendering for production
        this.matter.world.drawDebug = false;
        
        // Get the Matter.js engine instance
        const engine = this.matter.world.engine;
        
        // Create visual enhancements with new layout parameters
        this.createVisualEnhancements(width, height, sideMarginWidth, topMarginHeight, bottomWallThickness);
        
        // Configure physics timing and engine settings
        engine.timing.timeScale = 1.0;
        engine.enableSleeping = false; // Disable sleeping to prevent bodies from stopping
        
        // Enable continuous updates for physics
        this.matter.world.autoUpdate = true;
        
        // Physics world configured successfully
        
        // Physics world is ready for gameplay
        
        // Game world setup complete

        // Set up keyboard input
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => this.handleKeyPress(event));

        // Listen for collision events
        this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
            this.handleCollisions(event);
        });
        
        // Listen for score updates to update header
        this.events.on('addScore', (points: number) => {
            if (this.headerScoreText && this.uiScene) {
                this.headerScoreText.setText(this.uiScene.getScore().toString());
            }
        });
        
        // Start spawning words after a short delay to ensure everything is initialized
        this.time.delayedCall(500, () => {
            console.log('Starting to spawn words...');
            this.spawnNextWord();
        });
    }


    private spawnNextWord() {
        if (this.isGameOver || this.currentWord) return; // Don't spawn if we already have a word

        console.log('Spawning new word...');
        // Create a new word
        this.currentWord = this.wordManager.createWord();
        
        // Update next word display
        this.updateNextWordDisplay();
    }

    private updateNextWordDisplay() {
        if (this.headerNextWordText && this.wordManager) {
            const nextWord = this.wordManager.getNextWord();
            this.headerNextWordText.setText(nextWord ? nextWord.toUpperCase() : '');
        }
    }

    private scheduleNextWord() {
        // Longer delay before spawning the next word
        this.time.delayedCall(2500, () => {
            if (!this.isGameOver) {
                this.spawnNextWord();
            }
        });
    }

    private handleKeyPress(event: KeyboardEvent) {
        if (this.isGameOver || !this.currentWord) return;

        const key = event.key.toLowerCase();
        
        // Only process letter keys
        if (!/^[a-z]$/.test(key)) return;

        const currentBlock = this.currentWord.blocks[0];
        if (!currentBlock) return;

        const expectedChar = this.currentWord.text[0].toLowerCase();
        
        if (key === expectedChar) {
            // Correct key - remove the block
            this.handleCorrectKey();
        } else {
            // Wrong key - detach the word
            this.handleWrongKey();
        }
    }


    private handleCorrectKey() {
        if (!this.currentWord) return;

        const block = this.currentWord.blocks.shift();
        if (!block) return;

        // Get the container (visual representation)
        const container = block.gameObject as Phaser.GameObjects.Container;
        
        // Play burn effect at the block's position
        this.effectManager.playBurnEffect(block.position.x, block.position.y);
        
        // Create a disappearing animation for the block
        if (container) {
            this.tweens.add({
                targets: container,
                alpha: 0,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    // Use PhysicsManager to properly destroy the block and its constraints
                    this.physicsManager.destroyBody(block as Matter.Body);
                }
            });
        } else {
            // Fallback: use PhysicsManager to destroy if no container
            this.physicsManager.destroyBody(block as Matter.Body);
        }
        
        // Update score using the scene's event system
        this.events.emit('addScore', 10);
        
        // If all blocks are cleared
        if (this.currentWord.blocks.length === 0) {
            this.currentWord = null;
            // Spawn next word immediately when word is completed correctly
            this.spawnNextWord();
        } else {
            // Update the word text (remove first character)
            this.currentWord.text = this.currentWord.text.substring(1);
            
            // Update the next block's appearance (highlight it)
            const nextBlock = this.currentWord.blocks[0];
            if (nextBlock) {
                const nextContainer = nextBlock.gameObject as Phaser.GameObjects.Container;
                if (nextContainer && nextContainer.list && nextContainer.list.length > 1) {
                    // Get the text object (second child in container)
                    const textObject = nextContainer.list[1] as Phaser.GameObjects.Text;
                    if (textObject && textObject.setStyle) {
                        textObject.setStyle({ color: '#ffff00' }); // Highlight next letter
                    }
                }
            }
        }
    }

    private handleWrongKey() {
        if (!this.currentWord) return;
        
        // Convert remaining blocks to frozen/inactive state
        this.currentWord.blocks.forEach(block => {
            if (block) {
                this.freezeBlock(block);
            }
        });
        
        // Clear the current word
        this.currentWord = null;
        
        // Spawn next word immediately (no delay)
        this.spawnNextWord();
    }

    private freezeBlock(block: BlockBody) {
        // Mark the block as frozen by adding a custom property
        (block as any).isFrozen = true;
        
        // Set a much faster downward velocity to clear the screen
        this.matter.body.setVelocity(block, {
            x: block.velocity.x, // Keep horizontal velocity
            y: 8 // Much faster downward velocity
        });
        
        // Change the visual appearance to indicate they're "frozen out"
        const container = block.gameObject as Phaser.GameObjects.Container;
        if (container && container.list && container.list.length > 0) {
            // Get the graphics object (first child in container)
            const graphics = container.list[0] as Phaser.GameObjects.Graphics;
            if (graphics) {
                // Change color to light blue to indicate frozen
                graphics.clear();
                graphics.fillStyle(0xadd8e6, 1); // Light blue
                graphics.fillRect(-20, -20, 40, 40);
                graphics.lineStyle(2, 0x87ceeb, 1);
                graphics.strokeRect(-20, -20, 40, 40);
            }
            
            // Play freeze effect
            this.effectManager.playFreezeEffect(block.position.x, block.position.y);
        }
    }

    /**
     * Handles collision events between physics bodies
     * @param event The collision event
     */
    private handleCollisions(event: Phaser.Physics.Matter.Events.CollisionActiveEvent) {
        try {
            if (this.isGameOver || !event || !event.pairs || event.pairs.length === 0) {
                return;
            }
            
            for (const pair of event.pairs) {
                if (!pair.bodyA || !pair.bodyB) {
                    continue; // Skip if either body is missing
                }
                
                // Type the colliding bodies
                const bodyA = pair.bodyA as BlockBody;
                const bodyB = pair.bodyB as BlockBody;
                
                // Skip if either body is missing required properties
                if (!bodyA || !bodyB) {
                    continue;
                }
                
                // Check for bottom collisions
                const isBodyABottomCollision = this.isBottomCollision(bodyA, bodyB);
                const isBodyBBottomCollision = this.isBottomCollision(bodyB, bodyA);
                
                if (isBodyABottomCollision || isBodyBBottomCollision) {
                    // Determine which body is the block (not the bottom boundary)
                    const blockBody = bodyA.label === 'Bounds Bottom' ? bodyB : bodyA;
                    
                    // Only handle blocks that have game objects (actual letter blocks)
                    if (blockBody.gameObject) {
                        console.log('Block hit the bottom - handling collision');
                        
                        // Check if this block is part of the current active word
                        if (this.currentWord && this.currentWord.blocks) {
                            const isBlockInCurrentWord = this.currentWord.blocks.some(block => block === blockBody);
                            
                            if (isBlockInCurrentWord) {
                                console.log('Active word hit the bottom - freezing entire word');
                                // Active word hit the bottom, freeze the entire word
                                this.handleWrongKey();
                                break; // Exit after handling the collision
                            }
                        }
                        
                        // If it's not part of current word, it might be a frozen block
                        // Make sure it's properly marked as frozen and has correct velocity
                        if (!(blockBody as any).isFrozen) {
                            console.log('Unfrozen block hit bottom - marking as frozen');
                            this.freezeBlock(blockBody);
                        }
                    }
                }
                
                // Check for word-to-word collisions (active word hitting frozen blocks)
                const isWordToWordCollision = this.isWordToWordCollision(bodyA, bodyB);
                if (isWordToWordCollision) {
                    console.log('Active word hit frozen blocks - freezing current word');
                    this.handleWrongKey();
                    break; // Exit after handling the collision
                }
                
                // Check for top collisions (game over condition)
                const isTopCollision = this.isTopCollision(bodyA, bodyB);
                if (isTopCollision) {
                    console.log('Dead letter hit the top - GAME OVER');
                    this.gameOver();
                    break;
                }
                
                // Check if any block is too high (game over)
                if (this.isGameOver) {
                    break;
                }
            }
        } catch (error) {
            console.error('Error in handleCollisions:', error);
        }
    }

    private isBottomCollision(bodyA: BlockBody, bodyB: BlockBody): boolean {
        const { height } = this.cameras.main;
        const bottomWallThickness = 20; // Updated to match new layout
        const bottomY = height - bottomWallThickness / 2; // Bottom boundary center position
        
        // Check if bodyA is the bottom bounds (by label or position) and bodyB is a block
        const isBodyABottom = (bodyA.label === 'Bounds Bottom' || 
                              (bodyA.isStatic && Math.abs(bodyA.position.y - bottomY) < 20));
        const isBodyBBottom = (bodyB.label === 'Bounds Bottom' || 
                              (bodyB.isStatic && Math.abs(bodyB.position.y - bottomY) < 20));
        
        if (isBodyABottom && bodyB.gameObject) {
            return true;
        }
        
        if (isBodyBBottom && bodyA.gameObject) {
            return true;
        }
        
        return false;
    }

    private isWordToWordCollision(bodyA: BlockBody, bodyB: BlockBody): boolean {
        // Only check if we have a current active word
        if (!this.currentWord || !this.currentWord.blocks) {
            return false;
        }
        
        // Check if one body is from the current word and the other is frozen
        const isBodyAInCurrentWord = this.currentWord.blocks.some(block => block === bodyA);
        const isBodyBInCurrentWord = this.currentWord.blocks.some(block => block === bodyB);
        
        // Check if either body is frozen (from a previous word)
        const isBodyAFrozen = (bodyA as any).isFrozen === true;
        const isBodyBFrozen = (bodyB as any).isFrozen === true;
        
        // Define spawn area to avoid false game overs
        const topMarginHeight = 80;
        const spawnAreaBottom = topMarginHeight + 60; // Give some buffer below spawn area
        
        // Check if frozen block is still in or near spawn area (likely still falling)
        const frozenBlockInSpawnArea = (
            (isBodyAFrozen && bodyA.position && bodyA.position.y < spawnAreaBottom) ||
            (isBodyBFrozen && bodyB.position && bodyB.position.y < spawnAreaBottom)
        );
        
        // If frozen block is in spawn area, don't trigger collision (let it fall through)
        if (frozenBlockInSpawnArea) {
            return false;
        }
        
        // Collision detected if:
        // - One body is from current word AND the other is frozen
        // - Both bodies have game objects (are actual letter blocks, not walls)
        // - Frozen block is not in spawn area (has settled lower)
        const collision = (
            (isBodyAInCurrentWord && isBodyBFrozen && !!bodyB.gameObject) ||
            (isBodyBInCurrentWord && isBodyAFrozen && !!bodyA.gameObject)
        );
        
        return collision;
    }

    private isTopCollision(bodyA: BlockBody, bodyB: BlockBody): boolean {
        const topMarginHeight = 80; // Updated to match new layout
        const topY = topMarginHeight - 16; // Top boundary center position
        
        // Check if a frozen/dead letter hits the top boundary (by label or position)
        const isBodyATopBounds = (bodyA.label === 'Bounds Top' || 
                                 (bodyA.isStatic && Math.abs(bodyA.position.y - topY) < 20));
        const isBodyBTopBounds = (bodyB.label === 'Bounds Top' || 
                                 (bodyB.isStatic && Math.abs(bodyB.position.y - topY) < 20));
        
        // Check if either body is frozen (dead letter)
        const isBodyAFrozen = (bodyA as any).isFrozen === true;
        const isBodyBFrozen = (bodyB as any).isFrozen === true;
        
        // Game over if a frozen letter hits the top boundary
        const topCollision = (
            (isBodyATopBounds && isBodyBFrozen && !!bodyB.gameObject) ||
            (isBodyBTopBounds && isBodyAFrozen && !!bodyA.gameObject)
        );
        
        // Top collision logic handled above
        
        return topCollision;
    }

    private gameOver() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        
        try {
            // Disable input immediately
            if (this.input && this.input.keyboard) {
                this.input.keyboard.off('keydown');
            }
            
            // Stop all timers
            if (this.time) {
                this.time.removeAllEvents();
            }
            
            // Create dramatic explosion effect for all remaining blocks
            this.explodeAllBlocks();
            
            // Add screen flash effect
            this.effectManager.playScreenFlash();
            
            // Delay the game over UI to let the explosion play out
            this.time.delayedCall(2000, () => {
                // Pause physics after explosions
                if (this.physics && typeof this.physics.pause === 'function') {
                    this.physics.pause();
                }
                
                // Notify UI about game over using the scene's event system
                this.events.emit('gameOver');
            });
            
        } catch (error) {
            console.error('Error in gameOver:', error);
        }
    }

    private explodeAllBlocks() {
        // Get all bodies in the physics world
        const allBodies = this.matter.world.getAllBodies();
        let explosionDelay = 0;
        
        // Create a list of blocks to explode with their positions captured now
        const blocksToExplode: Array<{
            body: Matter.Body;
            container: Phaser.GameObjects.Container;
            x: number;
            y: number;
        }> = [];
        
        allBodies.forEach((body) => {
            // Only explode blocks that have game objects (letter blocks)
            if (body.gameObject && !body.isStatic && body.position) {
                const container = body.gameObject as Phaser.GameObjects.Container;
                if (container && container.active) {
                    blocksToExplode.push({
                        body: body as Matter.Body,
                        container: container,
                        x: body.position.x,
                        y: body.position.y
                    });
                }
            }
        });
        
        // Now animate each block with proper safety checks
        blocksToExplode.forEach((blockData) => {
            // Play explosion effect at block position with staggered timing
            this.effectManager.playExplosionEffect(blockData.x, blockData.y, explosionDelay);
            
            // Animate the block disappearing
            this.time.delayedCall(explosionDelay, () => {
                // Check if container is still valid before animating
                if (blockData.container && blockData.container.active && blockData.container.scene) {
                    this.tweens.add({
                        targets: blockData.container,
                        alpha: 0,
                        scaleX: 2,
                        scaleY: 2,
                        rotation: (Math.random() - 0.5) * Math.PI,
                        duration: 800,
                        ease: 'Power2',
                        onComplete: () => {
                            // Destroy the block after animation, with safety check
                            if (blockData.body && this.physicsManager) {
                                this.physicsManager.destroyBody(blockData.body);
                            }
                        },
                        onCompleteScope: this
                    });
                } else {
                    // If container is already destroyed, just clean up the physics body
                    if (blockData.body && this.physicsManager) {
                        this.physicsManager.destroyBody(blockData.body);
                    }
                }
            });
            
            // Stagger the explosions for dramatic effect
            explosionDelay += 100 + Math.random() * 200;
        });
        
        console.log(`Exploding ${blocksToExplode.length} blocks`);
    }

    private createVisualEnhancements(width: number, height: number, sideMarginWidth: number, topMarginHeight: number, bottomWallThickness: number) {
        // Create play area border
        this.createPlayAreaBorder(width, height, sideMarginWidth, topMarginHeight, bottomWallThickness);
        
        // Create pixel pattern in margins
        this.createMarginPatterns(width, height, sideMarginWidth, topMarginHeight, bottomWallThickness);
        
        // Create header with score and next word
        this.createGameHeader(width, sideMarginWidth, topMarginHeight, bottomWallThickness);
    }

    private createPlayAreaBorder(width: number, height: number, sideMarginWidth: number, topMarginHeight: number, bottomWallThickness: number) {
        const borderGraphics = this.add.graphics();
        
        // Main play area border (inner border)
        borderGraphics.lineStyle(3, 0x00ffff, 0.8);
        borderGraphics.strokeRect(
            sideMarginWidth - 2, 
            topMarginHeight - 2, 
            width - (sideMarginWidth * 2) + 4, 
            height - (topMarginHeight + bottomWallThickness) + 4
        );
        
        // Outer decorative border
        borderGraphics.lineStyle(2, 0x0088ff, 0.6);
        borderGraphics.strokeRect(
            sideMarginWidth - 6, 
            topMarginHeight - 6, 
            width - (sideMarginWidth * 2) + 12, 
            height - (topMarginHeight + bottomWallThickness) + 12
        );
        
        borderGraphics.setDepth(10);
    }

    private createMarginPatterns(width: number, height: number, sideMarginWidth: number, topMarginHeight: number, bottomWallThickness: number) {
        const patternGraphics = this.add.graphics();
        
        // Left margin pattern
        this.createPixelPattern(patternGraphics, 0, 0, sideMarginWidth, height);
        
        // Right margin pattern
        this.createPixelPattern(patternGraphics, width - sideMarginWidth, 0, sideMarginWidth, height);
        
        // Top margin pattern (excluding corners)
        this.createPixelPattern(patternGraphics, sideMarginWidth, 0, width - (sideMarginWidth * 2), topMarginHeight);
        
        // Bottom margin pattern (excluding corners)
        this.createPixelPattern(patternGraphics, sideMarginWidth, height - bottomWallThickness, width - (sideMarginWidth * 2), bottomWallThickness);
        
        patternGraphics.setDepth(5);
    }

    private createPixelPattern(graphics: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
        const pixelSize = 4;
        const colors = [0x1a1a2e, 0x16213e, 0x0f3460, 0x533483];
        
        for (let px = x; px < x + w; px += pixelSize) {
            for (let py = y; py < y + h; py += pixelSize) {
                // Create a pseudo-random pattern based on position
                const seed = (px * 7 + py * 13) % 100;
                if (seed < 70) { // 70% chance of drawing a pixel
                    const colorIndex = Math.floor(seed / 17.5) % colors.length;
                    graphics.fillStyle(colors[colorIndex], 0.6);
                    graphics.fillRect(px, py, pixelSize, pixelSize);
                }
            }
        }
    }

    private createGameHeader(width: number, sideMarginWidth: number, topMarginHeight: number, bottomWallThickness: number) {
        const headerHeight = 60;
        const headerY = topMarginHeight - headerHeight - 10;
        
        // Header background
        const headerBg = this.add.graphics();
        headerBg.fillStyle(0x000000, 0.8);
        headerBg.fillRoundedRect(sideMarginWidth, headerY, width - (sideMarginWidth * 2), headerHeight, 8);
        headerBg.lineStyle(2, 0x00ffff, 0.6);
        headerBg.strokeRoundedRect(sideMarginWidth, headerY, width - (sideMarginWidth * 2), headerHeight, 8);
        headerBg.setDepth(15);
        
        // Score section (left side)
        this.add.text(sideMarginWidth + 20, headerY + 10, 'SCORE', {
            fontSize: '14px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setDepth(20);
        
        // Next word section (right side)
        this.add.text(width - sideMarginWidth - 120, headerY + 10, 'NEXT WORD', {
            fontSize: '14px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setDepth(20);
        
        // Store references for updating
        this.headerScoreText = this.add.text(sideMarginWidth + 20, headerY + 30, '0', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setDepth(20);
        
        this.headerNextWordText = this.add.text(width - sideMarginWidth - 120, headerY + 30, '', {
            fontSize: '16px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setDepth(20);
    }

    /**
     * Called every frame, used for game logic updates
     */
    update() {
        try {
            if (this.isGameOver || !this.physicsManager) {
                return;
            }
            
            // Check for game over condition (frozen blocks too high)
            const highestBlock = this.physicsManager.findHighestBlock();
            
            // Only check for game over if we have a valid block with a position
            if (highestBlock?.position?.y !== undefined) {
                const topMarginHeight = 80; // Updated to match new layout
                const gameOverY = topMarginHeight + 20; // Y-coordinate threshold for game over (slightly below spawn area)
                const currentY = highestBlock.position.y;
                const isBlockTooHigh = currentY <= gameOverY;
                const isBlockFrozen = (highestBlock as any).isFrozen === true;
                
                // Additional check: make sure the block has low velocity (settled, not just passing through)
                const blockVelocity = highestBlock.velocity;
                const isBlockSettled = blockVelocity && Math.abs(blockVelocity.y) < 0.5; // Very slow vertical movement
                
                // Game over if frozen blocks reach too high AND have settled (not just falling through)
                if (isBlockTooHigh && isBlockFrozen && isBlockSettled) {
                    console.log('GAME OVER - Frozen blocks settled too high at y:', currentY.toFixed(2), 'velocity:', blockVelocity?.y?.toFixed(2));
                    this.gameOver();
                }
            }
        } catch (error) {
            console.error('Error in update loop:', error);
        }
        
        // Don't automatically spawn words here - let the game logic handle it
    }

    shutdown() {
        // Clean up managers when scene is shut down
        if (this.effectManager) {
            this.effectManager.destroy();
        }
        
        // Remove event listeners
        if (this.input && this.input.keyboard) {
            this.input.keyboard.off('keydown');
        }
        
        // Clear timers
        if (this.time) {
            this.time.removeAllEvents();
        }
    }
}
