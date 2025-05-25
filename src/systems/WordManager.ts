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
        // Extended word list with words of various lengths
        const allWords = [
            // 3-4 letters
            'cat', 'dog', 'sun', 'hat', 'pen', 'cup', 'key', 'jam', 'ant', 'bee',
            'car', 'bus', 'egg', 'ink', 'jar', 'keg', 'leg', 'man', 'net', 'owl',
            'pig', 'rat', 'sun', 'toy', 'van', 'web', 'yak', 'zip', 'arm', 'bed',
            
            // 5 letters
            'apple', 'beach', 'candy', 'dance', 'eagle', 'fairy', 'grape', 'house', 'igloo', 'jelly',
            'koala', 'lemon', 'mango', 'night', 'olive', 'panda', 'queen', 'river', 'sunny', 'tiger',
            'umbra', 'vivid', 'water', 'xerox', 'yacht', 'zebra', 'angel', 'bread', 'cloud', 'daisy',
            
            // 6-7 letters
            'banana', 'camera', 'dragon', 'eleven', 'flower', 'guitar', 'harbor', 'island', 'jacket', 'kitten',
            'laptop', 'monkey', 'napkin', 'orange', 'pencil', 'quarry', 'rabbit', 'sailor', 'turtle', 'umbrella',
            'vacuum', 'window', 'yellow', 'zephyr', 'basket', 'candle', 'dollar', 'echoes', 'forest', 'garden',
            
            // 8-10 letters
            'elephant', 'football', 'giraffee', 'hospital', 'jellyfish', 'kangaroo', 'lighthouse', 'mushroom', 'notebook', 'octopus',
            'pineapple', 'question', 'rainbow', 'sunshine', 'tomorrow', 'umbrella', 'volcano', 'waterfall', 'xylophone', 'yesterday',
            'zucchini', 'adventure', 'butterfly', 'chocolate', 'dinosaur', 'eleven', 'friendly', 'grandma', 'homework', 'jump', 'kite'
        ];

        // Filter words based on difficulty and log the filtering criteria
        const minLen = Math.max(3, this.difficulty.minLength); // Ensure minimum length is at least 3
        const maxLen = Math.min(10, this.difficulty.maxLength); // Ensure maximum length is at most 10
        
        console.log(`Filtering words for difficulty: ${minLen}-${maxLen} letters`);
        
        this.wordList = allWords.filter(word => {
            const len = word.length;
            return len >= minLen && len <= maxLen;
        });
        
        // If no words match the difficulty, use a default set that matches the criteria
        if (this.wordList.length === 0) {
            console.warn(`No words matched the difficulty settings (${minLen}-${maxLen} letters). Using default word list.`);
            this.wordList = allWords.filter(word => 
                word.length >= minLen && word.length <= maxLen
            );
            
            // If still no words, use a fallback list
            if (this.wordList.length === 0) {
                this.wordList = ['code', 'game', 'type', 'fast', 'slow', 'word', 'play', 'jump', 'fall', 'moon']
                    .filter(word => word.length >= minLen && word.length <= maxLen);
            }
        }
    }

    public createWord() {
        // Select a random word from the filtered list
        const word = this.wordList[Math.floor(Math.random() * this.wordList.length)];
        console.log('Creating word:', word);
        
        // Calculate starting position (random x, start below the visible area)
        const startX = 100 + Math.random() * (this.scene.cameras.main.width - 200);
        const startY = 200; // Start much lower on the screen to prevent instant game over
        
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
