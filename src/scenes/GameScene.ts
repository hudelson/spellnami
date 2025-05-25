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

    constructor() {
        super('GameScene');
    }

    create(data: { difficulty?: string }) {
        console.log('GameScene create called');
        
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
        
        // Configure physics world with proper gravity settings
        this.matter.world.setGravity(0, 1);
        
        // Set up camera
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(width / 2, height / 2);
        
        // Create bounds using Phaser's Matter API with thicker walls
        const wallThickness = 32;
        this.matter.world.setBounds(0, 0, width, height, wallThickness, true, true, true, true);
        
        // Enable Matter.js debug rendering with custom colors
        this.matter.world.drawDebug = true;
        this.matter.world.debugGraphic.setDepth(100);
        
        // Customize debug colors
        const debugConfig = {
            showBody: true,
            showStaticBody: true,
            showVelocity: true,
            showCollisions: true,
            showAxes: true,
            showPositions: true,
            showAngleIndicator: true,
            angleColor: 0xe81153,
            staticFillStyle: '#ffffff',
            staticLineThickness: 1,
            fillColor: 0x106909,
            fillOpacity: 0.5,
            lineColor: 0xff00ff,
            lineThickness: 2,
            render: {
                visible: true,
                opacity: 1,
                fillStyle: '#ff0000',
                strokeStyle: '#0000ff',
                lineWidth: 2
            }
        };
        
        // Apply debug config
        Object.assign(this.matter.world.debugConfig, debugConfig);
        
        // Force debug rendering to update
        this.matter.world.debugGraphic.clear();
        this.matter.world.drawDebug = true;
        
        // Get the Matter.js engine instance
        const engine = this.matter.world.engine;
        
        // Debug: Draw a border around the game area
        const border = this.add.graphics();
        border.lineStyle(4, 0x00ff00, 1);
        border.strokeRect(wallThickness, wallThickness, width - wallThickness * 2, height - wallThickness * 2);
        border.setDepth(1000);
        
        // Add a grid for better visibility
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x333333, 0.5);
        for (let y = 0; y < height; y += 40) {
            grid.moveTo(0, y);
            grid.lineTo(width, y);
        }
        for (let x = 0; x < width; x += 40) {
            grid.moveTo(x, 0);
            grid.lineTo(x, height);
        }
        grid.strokePath();
        
        // Add a test block to verify rendering
        const testBlock = this.add.rectangle(width / 2, height / 2, 80, 40, 0xff0000);
        testBlock.setDepth(1000);
        
        // Add test text
        const testText = this.add.text(width / 2, height / 2 - 50, 'Spellnami', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        testText.setDepth(1000);
        
        // Configure physics timing and engine settings
        engine.timing.timeScale = 1.0;
        engine.enableSleeping = false; // Disable sleeping to prevent bodies from stopping
        
        // Enable continuous updates for physics
        this.matter.world.autoUpdate = true;
        
        // Debug logging for physics world
        console.log('Physics world configured with settings:', {
            autoUpdate: this.matter.world.autoUpdate,
            gravity: { x: 0, y: 1 },
            bounds: { width, height },
            engine: {
                timing: engine.timing,
                enableSleeping: engine.enableSleeping
            }
        });
        
        // Debug: Log when physics world updates
        this.matter.world.on('beforeupdate', () => {
            if (this.game.loop.frame % 60 === 0) {
                const bodies = this.matter.world.getAllBodies();
                console.log(`Physics update - Bodies: ${bodies.length}`);
                bodies.forEach((body, index) => {
                    if (index < 3) { // Only log first few bodies to avoid spam
                        console.log(`Body ${index}:`, {
                            id: body.id,
                            position: body.position,
                            velocity: body.velocity,
                            isStatic: body.isStatic,
                            label: body.label
                        });
                    }
                });
            }
        });
        
        // Add a debug key to manually trigger physics updates
        this.input.keyboard?.on('keydown-D', () => {
            const bodies = this.matter.world.getAllBodies();
            console.log('=== DEBUG PHYSICS STATE ===');
            console.log('Total bodies:', bodies.length);
            bodies.forEach((body, index) => {
                console.log(`Body ${index} (${body.label || 'no-label'})`, {
                    id: body.id,
                    position: body.position,
                    velocity: body.velocity,
                    isStatic: body.isStatic
                });
            });
        });
        
        // Label the bounds for collision detection
        const boundsBodies = this.matter.world.walls as MatterJS.BodyType[];
        if (boundsBodies && boundsBodies.length >= 4) {
            // Top, Right, Bottom, Left - Phaser's internal order
            boundsBodies[0].label = 'Bounds Top';
            boundsBodies[1].label = 'Bounds Right';
            boundsBodies[2].label = 'Bounds Bottom';
            boundsBodies[3].label = 'Bounds Left';
        }
        
        console.log('Physics world initialized with bounds');

        // Set up keyboard input
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => this.handleKeyPress(event));

        // Listen for collision events
        this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
            this.handleCollisions(event);
        });
        
        // Start spawning words after a short delay to ensure everything is initialized
        this.time.delayedCall(500, () => {
            console.log('Starting to spawn words...');
            this.spawnNextWord();
        });
    }


    private spawnNextWord() {
        if (this.isGameOver) return;

        // Create a new word
        this.currentWord = this.wordManager.createWord();
        
        // When the word is cleared, spawn the next one
        this.matter.world.once('destroy', (event: any) => {
            if (this.currentWord && this.currentWord.blocks.includes(event.body)) {
                if (this.currentWord.blocks.every(block => !block || block.isStatic)) {
                    this.scheduleNextWord();
                }
            }
        });
    }

    private scheduleNextWord() {
        // Small delay before spawning the next word
        this.time.delayedCall(800, () => {
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

        // Play burn effect
        this.effectManager.playBurnEffect(block.position.x, block.position.y);
        
        // Remove the block from physics world
        this.matter.world.remove(block);
        
        // Update score using the scene's event system
        this.events.emit('addScore', 10);
        
        // If all blocks are cleared
        if (this.currentWord.blocks.length === 0) {
            this.currentWord = null;
            this.scheduleNextWord();
        } else {
            // Update the word text (remove first character)
            this.currentWord.text = this.currentWord.text.substring(1);
            
            // Update the next block's appearance
            const nextBlock = this.currentWord.blocks[0];
            if (nextBlock) {
                const sprite = nextBlock.gameObject as Phaser.Physics.Matter.Sprite;
                sprite.setTint(0xffff00); // Highlight next block
            }
        }
    }

    private handleWrongKey() {
        if (!this.currentWord) return;
        
        // Convert remaining blocks to static and change their appearance
        this.currentWord.blocks.forEach(block => {
            if (block) {
                // Use the physics manager to convert the block to static
                // Cast to Matter.Body to match the expected parameter type
                this.physicsManager.convertToStatic(block as Matter.Body);
                const sprite = block.gameObject as Phaser.Physics.Matter.Sprite;
                if (sprite) {
                    sprite.setTint(0xadd8e6); // Light blue tint for static blocks
                    this.effectManager.playFreezeEffect(block.position.x, block.position.y);
                }
            }
        });
        
        // Clear the current word
        this.currentWord = null;
        
        // Schedule next word
        this.scheduleNextWord();
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
                    if (this.currentWord && this.currentWord.blocks) {
                        const isBodyAInCurrentWord = this.currentWord.blocks.some(block => block === bodyA);
                        const isBodyBInCurrentWord = this.currentWord.blocks.some(block => block === bodyB);
                        
                        if (isBodyAInCurrentWord || isBodyBInCurrentWord) {
                            // Word hit the bottom, convert to static
                            this.handleWrongKey();
                            break; // Exit after handling the collision
                        }
                    }
                }
                
                // Check if any block is too high (game over)
                if (this.isGameOver) {
                    break;
                }
                
                const highestBlock = this.physicsManager.findHighestBlock();
                if (highestBlock?.position?.y !== undefined && highestBlock.position.y <= 32) {
                    this.gameOver();
                    break;
                }
            }
        } catch (error) {
            console.error('Error in handleCollisions:', error);
        }
    }

    private isBottomCollision(bodyA: BlockBody, bodyB: BlockBody): boolean {
        // Check if bodyA is the bottom bounds and bodyB is a block with a game object
        if (bodyA.label === 'Bounds Bottom' && bodyB.gameObject) {
            return true;
        }
        // Also check the reverse case where bodyB is the bottom bounds
        if (bodyB.label === 'Bounds Bottom' && bodyA.gameObject) {
            return true;
        }
        return false;
    }

    private gameOver() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        
        try {
            // Pause physics if available
            if (this.physics && typeof this.physics.pause === 'function') {
                this.physics.pause();
            }
            
            // Stop all timers
            if (this.time) {
                this.time.removeAllEvents();
            }
            
            // Notify UI about game over using the scene's event system
            this.events.emit('gameOver');
            
            // Disable input
            if (this.input && this.input.keyboard) {
                this.input.keyboard.off('keydown');
            }
        } catch (error) {
            console.error('Error in gameOver:', error);
        }
    }

    /**
     * Called every frame, used for game logic updates
     */
    update() {
        try {
            if (this.isGameOver || !this.physicsManager) {
                return;
            }
            
            // Check for game over condition (block too high)
            const highestBlock = this.physicsManager.findHighestBlock();
            
            // Only check for game over if we have a valid block with a position
            if (highestBlock?.position?.y !== undefined) {
                const gameOverY = 50; // Y-coordinate threshold for game over
                const currentY = highestBlock.position.y;
                const isBlockTooHigh = currentY <= gameOverY;
                
                // Only log every 60 frames to reduce console spam
                if (this.game?.loop?.frame % 60 === 0) {
                    console.log('Highest block check:', {
                        blockId: highestBlock.id,
                        blockY: currentY.toFixed(2),
                        gameOverY,
                        isBlockTooHigh,
                        isStatic: highestBlock.isStatic,
                        hasGameObject: !!highestBlock.gameObject,
                        blockLabel: highestBlock.label || 'no-label'
                    });
                }
                
                if (isBlockTooHigh) {
                    console.log('GAME OVER - Block reached the top of the screen at y:', currentY.toFixed(2));
                    this.gameOver();
                }
            }
        } catch (error) {
            console.error('Error in update loop:', error);
        }
        
        // If we have no current word, spawn a new one
        if (!this.currentWord) {
            console.log('No current word, spawning a new one');
            this.spawnNextWord();
        }
    }
}
