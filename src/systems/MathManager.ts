import { Scene } from 'phaser';
import { PhysicsManager, BlockBody } from './PhysicsManager';
import { MathOperation, MathDifficultySettings } from '../types/GameTypes';

/**
 * Equation data structure
 */
export interface Equation {
    /** Full equation string (e.g., "5x3=") */
    text: string;
    /** Correct answer as string (e.g., "15") */
    answer: string;
    /** Physics blocks for the equation */
    blocks: BlockBody[];
    /** Current position in answer being typed */
    answerIndex: number;
}

/**
 * MathManager - Generates and manages math equations for Mathnami mode
 */
export class MathManager {
    private scene: Scene;
    private physicsManager: PhysicsManager;
    private difficulty: MathDifficultySettings;
    private nextEquation: { text: string; answer: string } | null = null;
    private enemyShipX: number = 0;
    private enemyShipY: number = 0;
    private playerShipX: number = 0;
    private playerShipY: number = 0;

    constructor(
        scene: Scene,
        physicsManager: PhysicsManager,
        difficulty: MathDifficultySettings
    ) {
        this.scene = scene;
        this.physicsManager = physicsManager;
        this.difficulty = difficulty;
        
        // Pre-generate the first equation
        this.nextEquation = this.generateEquationData();
        
        console.log('MathManager initialized with operation:', difficulty.operation);
    }
    
    /**
     * Set the ship positions for projectile calculations
     */
    public setShipPositions(enemyX: number, enemyY: number, playerX: number, playerY: number): void {
        this.enemyShipX = enemyX;
        this.enemyShipY = enemyY;
        this.playerShipX = playerX;
        this.playerShipY = playerY;
    }

    /**
     * Generate equation data (text + answer) based on difficulty
     */
    private generateEquationData(): { text: string; answer: string } {
        const { operation, minOperand, maxOperand } = this.difficulty;
        
        let a: number, b: number, answer: number, equationText: string;
        
        switch (operation) {
            case MathOperation.Addition:
                a = this.randomInt(minOperand, maxOperand);
                b = this.randomInt(minOperand, maxOperand);
                answer = a + b;
                equationText = `${a}+${b}=`;
                break;
                
            case MathOperation.Subtraction:
                // Ensure result is positive
                a = this.randomInt(minOperand, maxOperand);
                b = this.randomInt(minOperand, a);
                answer = a - b;
                equationText = `${a}-${b}=`;
                break;
                
            case MathOperation.Multiplication:
                a = this.randomInt(minOperand, maxOperand);
                b = this.randomInt(minOperand, maxOperand);
                answer = a * b;
                equationText = `${a}x${b}=`;
                break;
                
            case MathOperation.Division:
                // Generate division that results in whole number
                b = this.randomInt(Math.max(2, minOperand), maxOperand);
                answer = this.randomInt(minOperand, maxOperand);
                a = b * answer;
                equationText = `${a}÷${b}=`;
                break;
                
            default:
                // Fallback to addition
                a = this.randomInt(minOperand, maxOperand);
                b = this.randomInt(minOperand, maxOperand);
                answer = a + b;
                equationText = `${a}+${b}=`;
        }
        
        const answerStr = answer.toString();
        console.log(`Generated equation: ${equationText}${answerStr}`);
        
        return {
            text: equationText,
            answer: answerStr
        };
    }

    /**
     * Generate random integer between min and max (inclusive)
     */
    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Create an equation with physics blocks
     */
    public createEquation(): Equation | null {
        // Use pre-generated equation
        const eqData = this.nextEquation || this.generateEquationData();
        
        // Generate next equation for next spawn
        this.nextEquation = this.generateEquationData();
        
        const { text, answer } = eqData;
        
        // Calculate starting position - launch from enemy ship
        const screenWidth = this.scene.cameras.main.width;
        
        // Total blocks = equation characters + answer digits
        const totalBlocks = text.length + answer.length;
        const wordWidth = totalBlocks * 40;
        
        // Start from enemy ship position (or center if not set)
        const startX = this.enemyShipX || screenWidth / 2;
        const startY = this.enemyShipY || 100;
        
        console.log(`Equation "${text}${answer}" launching from (${startX.toFixed(1)}, ${startY.toFixed(1)})`);
        
        // Create blocks for equation characters
        const blocks: BlockBody[] = [];
        let previousBlock: BlockBody | null = null;
        let blockIndex = 0;
        
        // Create blocks for equation text (e.g., "5x3=")
        for (let i = 0; i < text.length; i++) {
            const block = this.physicsManager.createBlock(
                startX + (blockIndex * 40) - (wordWidth / 2),
                startY + (blockIndex * 5),
                text[i],
                false  // Not active initially
            );
            
            if (!block) {
                console.error('Failed to create block for equation character:', text[i]);
                return null;
            }
            
            this.setBlockVelocity(block);
            blocks.push(block);
            
            if (previousBlock) {
                this.physicsManager.createConstraint(previousBlock, block);
            }
            previousBlock = block;
            blockIndex++;
        }
        
        // Create blocks for answer blanks (e.g., empty boxes for answer "15")
        for (let i = 0; i < answer.length; i++) {
            const isFirstBlank = i === 0;
            const block = this.physicsManager.createBlock(
                startX + (blockIndex * 40) - (wordWidth / 2),
                startY + (blockIndex * 5),
                ' ',  // Display as empty/space (blank block)
                isFirstBlank  // Highlight first blank
            );
            
            if (!block) {
                console.error('Failed to create blank block');
                return null;
            }
            
            // Mark block as blank for special handling
            (block as any).isBlank = true;
            (block as any).expectedDigit = answer[i];
            
            this.setBlockVelocity(block);
            blocks.push(block);
            
            if (previousBlock) {
                this.physicsManager.createConstraint(previousBlock, block);
            }
            previousBlock = block;
            blockIndex++;
        }
        
        return {
            text,
            answer,
            blocks,
            answerIndex: 0
        };
    }

    /**
     * Set initial velocity on a block - launch towards player ship
     */
    private setBlockVelocity(block: BlockBody) {
        // Calculate direction from enemy ship to player ship
        const dx = (this.playerShipX || this.scene.cameras.main.width / 2) - (this.enemyShipX || this.scene.cameras.main.width / 2);
        const dy = (this.playerShipY || this.scene.cameras.main.height - 100) - (this.enemyShipY || 100);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize and scale by speed
        const speed = this.difficulty.speed / 60; // Adjust speed for projectile
        const velocityX = (dx / distance) * speed;
        const velocityY = (dy / distance) * speed;
        
        const velocity = {
            x: velocityX,
            y: velocityY
        };
        
        if (block && block.position) {
            this.scene.matter.body.setVelocity(block, velocity);
        }
    }

    /**
     * Get the next equation that will be spawned
     */
    public getNextEquation(): string | null {
        if (!this.nextEquation) return null;
        return this.nextEquation.text + this.nextEquation.answer;
    }

    /**
     * Update difficulty settings
     */
    public updateDifficulty(newDifficulty: MathDifficultySettings): void {
        this.difficulty = newDifficulty;
        this.nextEquation = this.generateEquationData();
        console.log('Math difficulty updated to:', newDifficulty.operation);
    }

    /**
     * Clean up resources
     */
    public cleanup(): void {
        this.nextEquation = null;
    }
}
