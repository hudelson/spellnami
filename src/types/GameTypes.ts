/**
 * Game mode enumeration
 */
export enum GameMode {
    Spell = 'spell',
    Math = 'math',
    Flags = 'flags',  // TODO: Future implementation
    Morse = 'morse'   // TODO: Future implementation
}

/**
 * Difficulty level enumeration
 */
export enum DifficultyLevel {
    Apprentice = 'apprentice',
    Scholar = 'scholar',
    Master = 'master',
    Grandmaster = 'grandmaster'  // Math mode only
}

/**
 * Math operation types for Math mode
 */
export enum MathOperation {
    Addition = 'addition',
    Subtraction = 'subtraction',
    Multiplication = 'multiplication',
    Division = 'division'
}

/**
 * Difficulty settings for Spell mode
 */
export interface SpellDifficultySettings {
    minLength: number;
    maxLength: number;
    speed: number;
    color: string;
}

/**
 * Difficulty settings for Math mode
 */
export interface MathDifficultySettings {
    operation: MathOperation;
    minOperand: number;
    maxOperand: number;
    speed: number;
    color: string;
}

/**
 * Unified difficulty settings
 */
export type DifficultySettings = SpellDifficultySettings | MathDifficultySettings;

/**
 * Game configuration stored in registry
 */
export interface GameConfig {
    mode: GameMode;
    difficulty: DifficultyLevel;
    settings: DifficultySettings;
}

/**
 * Health state for ship battle mode (Math)
 */
export interface ShipHealth {
    current: number;
    max: number;
}

/**
 * Game state for ship battle mode
 */
export interface ShipBattleState {
    playerHealth: ShipHealth;
    enemyHealth: ShipHealth;
}

/**
 * Check if settings are for Spell mode
 */
export function isSpellSettings(settings: DifficultySettings): settings is SpellDifficultySettings {
    return 'minLength' in settings && 'maxLength' in settings;
}

/**
 * Check if settings are for Math mode
 */
export function isMathSettings(settings: DifficultySettings): settings is MathDifficultySettings {
    return 'operation' in settings && 'minOperand' in settings && 'maxOperand' in settings;
}
