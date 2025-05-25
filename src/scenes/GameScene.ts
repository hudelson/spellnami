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
};

declare global {
    // Extend the Matter namespace to include our custom properties
    namespace MatterJS {
        interface Body {
            gameObject?: Phaser.GameObjects.GameObject;
            label?: string;
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
        
        // Create bounds using Phaser's Matter API
        this.matter.world.setBounds(0, 0, width, height, 32, true, true, true, true);
        
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
