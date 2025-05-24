import { Scene } from 'phaser';
import * as Matter from 'matter-js';
import { WordManager } from '../systems/WordManager';
import { PhysicsManager } from '../systems/PhysicsManager';
import { EffectManager } from '../systems/EffectManager';
import { UIScene } from './UIScene';

export class GameScene extends Scene {
    private wordManager!: WordManager;
    private physicsManager!: PhysicsManager;
    private effectManager!: EffectManager;
    private uiScene!: UIScene;
    private isGameOver: boolean = false;
    private currentWord: { text: string; blocks: MatterJS.BodyType[] } | null = null;

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
            this.effectManager,
            difficultySettings
        );
        
        console.log('Game started with difficulty:', data.difficulty || 'default');

        // Enable Matter.js physics
        this.matter.world.setGravity(0, 1);
        
        // Set up world bounds with collision events
        // The bounds are created as Matter.js bodies
        // We don't need to store the return value as the bounds are automatically added to the world
        this.matter.world.setBounds(
            0,
            0,
            this.cameras.main.width,
            this.cameras.main.height,
            32, // Thickness
            true, // left
            true, // right
            false, // top
            true   // bottom
        );
        
        // Get all bodies and find the bounds
        const matterWorld = (this.matter as any).world.engine.world;
        const bodies = Matter.Composite.allBodies(matterWorld);
        
        for (const body of bodies) {
            const bound = body as Matter.Body & { label?: string };
            if (bound.label?.includes('left')) {
                bound.label = 'Bounds Left';
            } else if (bound.label?.includes('right')) {
                bound.label = 'Bounds Right';
            } else if (bound.label?.includes('bottom')) {
                bound.label = 'Bounds Bottom';
            }
        }

        console.log('Physics world initialized with bounds');

        // Set up keyboard input
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => this.handleKeyPress(event));

        // Listen for collision events
        this.matter.world.on('collisionstart', (event: any) => {
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
                this.matter.body.setStatic(block, true);
                const sprite = block.gameObject as Phaser.Physics.Matter.Sprite;
                sprite.setTint(0xadd8e6); // Light blue tint for static blocks
                this.effectManager.playFreezeEffect(block.position.x, block.position.y);
            }
        });
        
        // Clear the current word
        this.currentWord = null;
        
        // Schedule next word
        this.scheduleNextWord();
    }

    private handleCollisions(event: any) {
        if (this.isGameOver) return;
        
        const pairs = event.pairs;
        
        for (let i = 0; i < pairs.length; i++) {
            const bodyA = pairs[i].bodyA;
            const bodyB = pairs[i].bodyB;
            
            // Check if any block hit the bottom
            if (this.isBottomCollision(bodyA, bodyB) || this.isBottomCollision(bodyB, bodyA)) {
                if (this.currentWord && this.currentWord.blocks.includes(bodyA)) {
                    // Word hit the bottom, convert to static
                    this.handleWrongKey();
                } else if (this.currentWord && this.currentWord.blocks.includes(bodyB)) {
                    // Word hit the bottom, convert to static
                    this.handleWrongKey();
                }
            }
            
            // Check if any block is too high (game over)
            if (this.isGameOver) break;
            
            const highestBlock = this.physicsManager.findHighestBlock();
            if (highestBlock && highestBlock.position.y <= 32) {
                this.gameOver();
                break;
            }
        }
    }

    private isBottomCollision(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): boolean {
        return bodyA.label === 'Bounds Bottom' && bodyB.gameObject !== undefined;
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

    update() {
        if (this.isGameOver) return;
        
        // Check for game over condition (block too high)
        const highestBlock = this.physicsManager.findHighestBlock();
        
        // Only check for game over if we have a valid block
        if (highestBlock && highestBlock.position) {
            const gameOverY = 100; // Increased from 32 to be more lenient
            const isBlockTooHigh = highestBlock.position.y <= gameOverY;
            
            console.log('Highest block check:', {
                blockId: highestBlock.id,
                blockY: highestBlock.position.y,
                gameOverY,
                isBlockTooHigh,
                isStatic: highestBlock.isStatic,
                hasGameObject: !!highestBlock.gameObject,
                blockLabel: highestBlock.label
            });
            
            if (isBlockTooHigh) {
                console.log('GAME OVER - Block reached the top of the screen');
                this.gameOver();
                return;
            }
        }
        
        // If we have no current word, spawn a new one
        if (!this.currentWord) {
            console.log('No current word, spawning a new one');
            this.spawnNextWord();
        }
    }
}
