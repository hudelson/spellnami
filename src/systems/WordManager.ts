import { Scene } from 'phaser';
import { PhysicsManager, BlockBody } from './PhysicsManager';
import { generate, count } from 'random-words';

export class WordManager {
    private scene: Scene;
    private physicsManager: PhysicsManager;
    private difficulty: {
        minLength: number;
        maxLength: number;
        speed: number;
    };
    private nextWord: string | null = null; // Store the next word to be spawned
    private usedWords: Set<string> = new Set(); // Track used words to avoid immediate repeats
    private totalAvailableWords: number = 0; // Cache the total number of available words

    constructor(
        scene: Scene,
        physicsManager: PhysicsManager,
        difficulty: { minLength: number; maxLength: number; speed: number }
    ) {
        this.scene = scene;
        this.physicsManager = physicsManager;
        this.difficulty = difficulty;
        this.initializeWordSystem();
        // Pre-select the first next word
        this.nextWord = this.selectRandomWord();
    }

    private initializeWordSystem() {
        // Calculate total available words for the current difficulty
        const minLen = Math.max(3, this.difficulty.minLength);
        const maxLen = Math.min(15, this.difficulty.maxLength); // Increased max to 15 for more variety
        
        this.totalAvailableWords = count({ 
            minLength: minLen, 
            maxLength: maxLen 
        });
        
        console.log(`WordManager initialized with ${this.totalAvailableWords} available words (${minLen}-${maxLen} letters)`);
        
        // Clear used words when difficulty changes
        this.usedWords.clear();
    }

    private selectRandomWord(): string {
        const minLen = Math.max(3, this.difficulty.minLength);
        const maxLen = Math.min(15, this.difficulty.maxLength);
        
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loops
        
        while (attempts < maxAttempts) {
            try {
                // Generate a random word with the specified length constraints
                const word = generate({ 
                    minLength: minLen, 
                    maxLength: maxLen 
                }) as string;
                
                // Validate the word
                if (this.isValidWord(word)) {
                    // If we haven't used too many words yet, or this word hasn't been used recently
                    if (this.usedWords.size < this.totalAvailableWords * 0.7 || !this.usedWords.has(word)) {
                        // Add to used words (but limit the size to prevent memory issues)
                        this.usedWords.add(word);
                        
                        // If we've used too many words, clear some old ones
                        if (this.usedWords.size > Math.min(100, this.totalAvailableWords * 0.8)) {
                            const wordsToRemove = Array.from(this.usedWords).slice(0, 20);
                            wordsToRemove.forEach(w => this.usedWords.delete(w));
                        }
                        
                        return word.toLowerCase();
                    }
                }
            } catch (error) {
                console.warn('Error generating word:', error);
            }
            
            attempts++;
        }
        
        // Fallback: if we can't generate a new word, clear used words and try again
        console.warn('Could not generate unused word, clearing used words cache');
        this.usedWords.clear();
        
        try {
            const fallbackWord = generate({ 
                minLength: minLen, 
                maxLength: maxLen 
            }) as string;
            
            if (this.isValidWord(fallbackWord)) {
                return fallbackWord.toLowerCase();
            }
        } catch (error) {
            console.error('Error generating fallback word:', error);
        }
        
        // Ultimate fallback to ensure game doesn't break
        const emergencyWords = ['code', 'game', 'play', 'word', 'type', 'fast', 'jump', 'fall'];
        const validEmergencyWords = emergencyWords.filter(word => 
            word.length >= minLen && word.length <= maxLen
        );
        
        if (validEmergencyWords.length > 0) {
            return validEmergencyWords[Math.floor(Math.random() * validEmergencyWords.length)];
        }
        
        // Last resort
        return 'word';
    }

    private isValidWord(word: string): boolean {
        if (!word || typeof word !== 'string') {
            return false;
        }
        
        // Check length constraints
        const minLen = Math.max(3, this.difficulty.minLength);
        const maxLen = Math.min(15, this.difficulty.maxLength);
        
        if (word.length < minLen || word.length > maxLen) {
            return false;
        }
        
        // Check that word contains only letters
        if (!/^[a-zA-Z]+$/.test(word)) {
            return false;
        }
        
        // Filter out potentially inappropriate or confusing words
        const bannedWords = [
            // Common abbreviations that might be confusing
            'www', 'http', 'html', 'css', 'xml', 'json', 'api',
            // Very short words that might be too easy
            'a', 'i', 'an', 'at', 'be', 'by', 'do', 'go', 'he', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'we'
        ];
        
        if (bannedWords.includes(word.toLowerCase())) {
            return false;
        }
        
        // Avoid words with repeated letters that might be confusing for typing
        const letterCounts = new Map<string, number>();
        for (const letter of word.toLowerCase()) {
            letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1);
        }
        
        // Reject words where any letter appears more than 3 times (like "mississippi")
        for (const count of letterCounts.values()) {
            if (count > 3) {
                return false;
            }
        }
        
        return true;
    }

    public createWord() {
        // Use the pre-selected next word
        const word = this.nextWord || this.selectRandomWord();
        
        // Immediately select the next word for the next spawn
        this.nextWord = this.selectRandomWord();
        
        console.log('Creating word:', word, '| Next word will be:', this.nextWord);
        console.log(`Used words cache size: ${this.usedWords.size}/${this.totalAvailableWords}`);
        
        // Calculate starting position (random horizontal, at the top of the screen)
        const screenWidth = this.scene.cameras.main.width;
        const wordWidth = word.length * 40; // Each block is 40 pixels wide
        const sideMarginWidth = 120; // New wider side margins
        const topMarginHeight = 80; // Updated smaller top margin for more play space
        
        // Calculate safe horizontal range (ensure word fits completely in play area)
        const minX = sideMarginWidth + 20; // Left margin + half block width
        const maxX = screenWidth - sideMarginWidth - wordWidth + 20; // Right margin - word width + half block width
        
        // Generate random X position within safe range
        const startX = Math.random() * (maxX - minX) + minX;
        const startY = topMarginHeight + 20; // Start below the header area
        
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
            
            // Set initial velocity to make the word fall naturally (slower for easier gameplay)
            const velocity = { 
                x: (Math.random() - 0.5) * 0.3, // Even less horizontal movement
                y: this.difficulty.speed / 80  // Much slower initial falling speed for easier gameplay
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

    public getNextWord(): string | null {
        return this.nextWord;
    }

    public getWordStats(): { totalAvailable: number; usedCount: number; usagePercentage: number } {
        return {
            totalAvailable: this.totalAvailableWords,
            usedCount: this.usedWords.size,
            usagePercentage: this.totalAvailableWords > 0 ? (this.usedWords.size / this.totalAvailableWords) * 100 : 0
        };
    }

    public resetUsedWords(): void {
        this.usedWords.clear();
        console.log('Used words cache cleared');
    }

    public updateDifficulty(newDifficulty: { minLength: number; maxLength: number; speed: number }): void {
        this.difficulty = newDifficulty;
        this.initializeWordSystem();
        // Generate a new next word with the updated difficulty
        this.nextWord = this.selectRandomWord();
        console.log('Difficulty updated, new next word:', this.nextWord);
    }

    public cleanup() {
        // Clean up any resources if needed
        this.usedWords.clear();
    }
}
