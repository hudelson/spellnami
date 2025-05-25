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
        
        // Calculate starting position (random horizontal, at the top of the screen)
        const screenWidth = this.scene.cameras.main.width;
        const wordWidth = word.length * 40; // Each block is 40 pixels wide
        const wallThickness = 32; // Account for the wall thickness
        
        // Calculate safe horizontal range (ensure word fits completely in play area)
        const minX = wallThickness + 20; // Left wall + half block width
        const maxX = screenWidth - wallThickness - wordWidth + 20; // Right wall - word width + half block width
        
        // Generate random X position within safe range
        const startX = Math.random() * (maxX - minX) + minX;
        const startY = 50; // Start at the top of the visible area
        
        console.log(`Word "${word}" spawning at x: ${startX.toFixed(1)} (safe range: ${minX.toFixed(1)} - ${maxX.toFixed(1)})`);
        
        // Create blocks for each letter
        const blocks: BlockBody[] = [];
        let previousBlock: BlockBody | null = null;
        
        for (let i = 0; i < word.length; i++) {
            const isFirst = i === 0;
            // Create the block with physics properties
            const block = this.physicsManager.createBlock(
                startX + (i * 40), // Position blocks horizontally with some spacing
                startY + (i * 5),   // Slight vertical offset for each block
                word[i],
                isFirst
            );
            
            if (!block) {
                console.error('Failed to create block for letter:', word[i]);
                return null;
            }
            
            // Debug log the block before setting velocity
            console.log('Block before velocity:', block);
            
            // Set initial velocity to make the word fall naturally
            const velocity = { 
                x: (Math.random() - 0.5) * 0.5, // Very slight horizontal movement
                y: this.difficulty.speed / 50  // Much slower initial falling speed
            };
            
            try {
                // Set velocity directly on the block (which is the Matter.js body)
                if (block && block.position) {
                    this.scene.matter.body.setVelocity(block, {
                        x: velocity.x,
                        y: velocity.y
                    });
                    
                    // Debug log for the created block
                    console.log(`Created block at (${block.position.x.toFixed(1)}, ${block.position.y.toFixed(1)}) ` +
                              `with velocity (${velocity.x.toFixed(2)}, ${velocity.y.toFixed(2)})`);
                } else {
                    console.error('Block is undefined or missing position:', block);
                }
            } catch (error) {
                console.error('Error setting block velocity:', error);
            }
            
            // Add the block to our blocks array
            blocks.push(block);
            
            // Connect blocks with constraints if not the first block
            if (previousBlock) {
                this.physicsManager.createConstraint(previousBlock, block);
            }
            
            // Update the previous block reference
            previousBlock = block;
            
            // Highlight the first letter if this is the first block
            if (isFirst && block) {
                const container = (block as any).gameObject as Phaser.GameObjects.Container;
                if (container && container.list) {
                    // The text is the second child in the container (index 1)
                    const text = container.list[1] as Phaser.GameObjects.Text;
                    if (text && text.setStyle) {
                        text.setStyle({ color: '#ff0' });
                    }
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
