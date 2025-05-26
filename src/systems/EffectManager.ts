import { Scene } from 'phaser';

// Pixel-art effect system using graphics instead of sprites
export class EffectManager {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public playBurnEffect(x: number, y: number) {
        // Create pixel-art style burn effect using graphics
        const effect = this.scene.add.graphics();
        effect.setPosition(x, y);
        
        // Create flame-like pixel pattern
        const flameColors = [0xff6b35, 0xff8e53, 0xffa726, 0xffcc02];
        const pixels = [
            { x: -2, y: -6, size: 2 },
            { x: 0, y: -8, size: 2 },
            { x: 2, y: -6, size: 2 },
            { x: -4, y: -4, size: 2 },
            { x: -2, y: -4, size: 2 },
            { x: 0, y: -4, size: 2 },
            { x: 2, y: -4, size: 2 },
            { x: 4, y: -4, size: 2 },
            { x: -4, y: -2, size: 2 },
            { x: -2, y: -2, size: 2 },
            { x: 0, y: -2, size: 2 },
            { x: 2, y: -2, size: 2 },
            { x: 4, y: -2, size: 2 },
            { x: -2, y: 0, size: 2 },
            { x: 0, y: 0, size: 2 },
            { x: 2, y: 0, size: 2 }
        ];
        
        pixels.forEach((pixel) => {
            const colorIndex = Math.floor(Math.random() * flameColors.length);
            effect.fillStyle(flameColors[colorIndex], 1);
            effect.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
        });
        
        // Animate the effect
        this.scene.tweens.add({
            targets: effect,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            y: y - 20,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
    }

    public playFreezeEffect(x: number, y: number) {
        // Create pixel-art style freeze effect using graphics
        const effect = this.scene.add.graphics();
        effect.setPosition(x, y);
        
        // Create snowflake/ice crystal pixel pattern
        const iceColors = [0x74b9ff, 0xa29bfe, 0xffffff, 0xe17055];
        const crystals = [
            // Center cross
            { x: -1, y: -6, size: 2 },
            { x: -1, y: -4, size: 2 },
            { x: -1, y: -2, size: 2 },
            { x: -1, y: 0, size: 2 },
            { x: -1, y: 2, size: 2 },
            { x: -1, y: 4, size: 2 },
            { x: -6, y: -1, size: 2 },
            { x: -4, y: -1, size: 2 },
            { x: -2, y: -1, size: 2 },
            { x: 0, y: -1, size: 2 },
            { x: 2, y: -1, size: 2 },
            { x: 4, y: -1, size: 2 },
            // Diagonal arms
            { x: -3, y: -3, size: 2 },
            { x: -5, y: -5, size: 2 },
            { x: 1, y: -3, size: 2 },
            { x: 3, y: -5, size: 2 },
            { x: -3, y: 1, size: 2 },
            { x: -5, y: 3, size: 2 },
            { x: 1, y: 1, size: 2 },
            { x: 3, y: 3, size: 2 }
        ];
        
        crystals.forEach((crystal) => {
            const colorIndex = Math.floor(Math.random() * iceColors.length);
            effect.fillStyle(iceColors[colorIndex], 0.8);
            effect.fillRect(crystal.x, crystal.y, crystal.size, crystal.size);
        });
        
        // Animate the effect
        this.scene.tweens.add({
            targets: effect,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0,
            rotation: Math.PI / 4,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
    }

    public playExplosionEffect(x: number, y: number, delay: number = 0) {
        // Create multiple pixel-art explosion effects
        const numExplosions = 5;
        
        this.scene.time.delayedCall(delay, () => {
            for (let i = 0; i < numExplosions; i++) {
                const angle = (i / numExplosions) * Math.PI * 2;
                const distance = 20 + Math.random() * 30;
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;
                
                const effect = this.scene.add.graphics();
                effect.setPosition(x + offsetX, y + offsetY);
                
                // Create explosion burst pixel pattern
                const explosionColors = [0xff6b35, 0xff8e53, 0xffa726, 0xffcc02, 0xff3838];
                const burstPixels = [
                    // Center burst
                    { x: -2, y: -2, size: 4 },
                    { x: 0, y: -4, size: 2 },
                    { x: -4, y: 0, size: 2 },
                    { x: 4, y: 0, size: 2 },
                    { x: 0, y: 4, size: 2 },
                    // Scattered sparks
                    { x: -6, y: -2, size: 2 },
                    { x: 6, y: -2, size: 2 },
                    { x: -2, y: -6, size: 2 },
                    { x: -2, y: 6, size: 2 },
                    { x: -4, y: -4, size: 2 },
                    { x: 4, y: -4, size: 2 },
                    { x: -4, y: 4, size: 2 },
                    { x: 4, y: 4, size: 2 }
                ];
                
                burstPixels.forEach((pixel) => {
                    const colorIndex = Math.floor(Math.random() * explosionColors.length);
                    effect.fillStyle(explosionColors[colorIndex], 1);
                    effect.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
                });
                
                // Animate the explosion effect
                this.scene.tweens.add({
                    targets: effect,
                    scaleX: 2 + Math.random(),
                    scaleY: 2 + Math.random(),
                    alpha: 0,
                    rotation: (Math.random() - 0.5) * Math.PI,
                    duration: 600 + Math.random() * 400,
                    ease: 'Power2',
                    onComplete: () => {
                        effect.destroy();
                    }
                });
            }
        });
    }

    public playScreenFlash() {
        // Create a full-screen flash effect
        const { width, height } = this.scene.cameras.main;
        const flash = this.scene.add.rectangle(width / 2, height / 2, width, height, 0xffffff)
            .setAlpha(0.8)
            .setDepth(999);
        
        // Animate the flash
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
    }

    public destroy() {
        // Effects are automatically cleaned up when they complete their animations
        // No manual cleanup needed since we're not tracking them in arrays
    }
}
