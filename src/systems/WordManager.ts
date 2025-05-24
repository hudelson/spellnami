import { Scene } from 'phaser';
import { PhysicsManager } from './PhysicsManager';
import { EffectManager } from './EffectManager';

export class WordManager {
    private scene: Scene;
    private physicsManager: PhysicsManager;
    private effectManager: EffectManager;
    private wordList: string[] = [];
    private difficulty: {
        minLength: number;
        maxLength: number;
        speed: number;
    };

    constructor(
        scene: Scene,
        physicsManager: PhysicsManager,
        effectManager: EffectManager,
        difficulty: { minLength: number; maxLength: number; speed: number }
    ) {
        this.scene = scene;
        this.physicsManager = physicsManager;
        this.effectManager = effectManager;
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
        
        // Calculate starting position (random x, above the top of the screen)
        const startX = 100 + Math.random() * (this.scene.cameras.main.width - 200);
        const startY = -50;
        
        // Create blocks for each letter
        const blocks: MatterJS.BodyType[] = [];
        let previousBlock: MatterJS.BodyType | null = null;
        
        for (let i = 0; i < word.length; i++) {
            const isFirst = i === 0;
            const block = this.physicsManager.createBlock(
                startX + (i * 45), // Position blocks horizontally
                startY,
                word[i],
                isFirst
            );
            
            // Add a small force to make the word fall
            this.scene.matter.body.setVelocity(block, { x: 0, y: this.difficulty.speed / 60 });
            
            // Connect blocks with constraints if not the first block
            if (previousBlock) {
                this.physicsManager.createConstraint(previousBlock, block);
            }
            
            blocks.push(block);
            previousBlock = block;
            
            // Highlight the first letter
            if (isFirst) {
                const sprite = block.gameObject as Phaser.Physics.Matter.Sprite;
                sprite.setTint(0xffff00); // Yellow tint for the first letter
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
