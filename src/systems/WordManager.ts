import { Scene } from 'phaser';
import { PhysicsManager, BlockBody } from './PhysicsManager';

export class WordManager {
    private scene: Scene;
    private physicsManager: PhysicsManager;
    private wordList: string[] = [];
    private difficulty: {
        minLength: number;
        maxLength: number;
        speed: number;
    };

    constructor(
        scene: Scene,
        physicsManager: PhysicsManager,
        difficulty: { minLength: number; maxLength: number; speed: number }
    ) {
        this.scene = scene;
        this.physicsManager = physicsManager;
        this.difficulty = difficulty;
        this.initializeWordList();
    }

    private initializeWordList() {
        // Basic word list - in a real game, this would be loaded from a JSON file
        this.wordList = [
            'code', 'game', 'type', 'fast', 'slow', 'word', 'play', 'jump', 'fall', 'moon',
            'star', 'bird', 'fish', 'frog', 'duck', 'lion', 'bear', 'wolf', 'deer', 'goat',
            'frog', 'swan', 'seal', 'mole', 'mice', 'rat', 'bat', 'cat', 'dog', 'cow',
            'pig', 'fox', 'ant', 'bee', 'fly', 'wasp', 'bug', 'owl', 'eel', 'emu',
            'ape', 'ass', 'elk', 'hen', 'ram', 'yak', 'koi', 'kite', 'lamb', 'lynx'
        ];

        // Filter words based on difficulty
        this.wordList = this.wordList.filter(
            word => word.length >= this.difficulty.minLength && word.length <= this.difficulty.maxLength
        );
    }

    public createWord() {
        // Select a random word from the filtered list
        const word = this.wordList[Math.floor(Math.random() * this.wordList.length)];
        console.log('Creating word:', word);
        
        // Calculate starting position (random x, just above the top of the screen)
        const startX = 100 + Math.random() * (this.scene.cameras.main.width - 200);
        const startY = 100; // Start lower on the screen
        
        // Create blocks for each letter
        const blocks: BlockBody[] = [];
        let previousBlock: BlockBody | null = null;
        
        for (let i = 0; i < word.length; i++) {
            const isFirst = i === 0;
            const block = this.physicsManager.createBlock(
                startX + (i * 45), // Position blocks horizontally
                startY - (i * 5),   // Slight vertical offset for each block
                word[i],
                isFirst
            );
            
            // Add a small initial velocity to make the word fall naturally
            // Use Phaser's Matter Physics API to set velocity
            const velocity = { 
                x: (Math.random() - 0.5) * 2, // Slight horizontal movement
                y: this.difficulty.speed / 30  // Reduced initial speed
            };
            // Set velocity directly on the block's body
            if (block && block.velocity) {
                block.velocity.x = velocity.x;
                block.velocity.y = velocity.y;
            }
            
            // Connect blocks with constraints if not the first block
            if (previousBlock) {
                this.physicsManager.createConstraint(previousBlock, block);
            }
            
            blocks.push(block);
            previousBlock = block;
            
            // Highlight the first letter
            if (isFirst) {
                const sprite = block.gameObject;
                if (sprite && 'setTint' in sprite) {
                    (sprite as any).setTint(0xffff00); // Yellow tint for the first letter
                    console.log('First block created at y:', startY);
                }
            }
        }
        
        return {
            text: word,
            blocks: blocks
        };
    }

    public cleanup() {
        // Clean up any resources if needed
    }
}
