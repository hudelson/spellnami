import { Scene } from 'phaser';

// Simple effect system that doesn't rely on the particle system
// since we're having issues with the Phaser 3.60 particle API
export class EffectManager {
    private scene: Scene;
    private burnEffects: Phaser.GameObjects.Sprite[] = [];
    private freezeEffects: Phaser.GameObjects.Sprite[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public playBurnEffect(x: number, y: number) {
        // Create a simple sprite effect
        const effect = this.scene.add.sprite(x, y, 'flame')
            .setScale(0.5)
            .setAlpha(1);
        
        // Animate the effect
        this.scene.tweens.add({
            targets: effect,
            scale: 1,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                effect.destroy();
                const index = this.burnEffects.indexOf(effect);
                if (index > -1) {
                    this.burnEffects.splice(index, 1);
                }
            }
        });
        
        this.burnEffects.push(effect);
    }

    public playFreezeEffect(x: number, y: number) {
        // Create a simple sprite effect
        const effect = this.scene.add.sprite(x, y, 'snow-puff')
            .setScale(0.3)
            .setAlpha(1);
        
        // Animate the effect
        this.scene.tweens.add({
            targets: effect,
            scale: 0.6,
            alpha: 0,
            duration: 800,
            onComplete: () => {
                effect.destroy();
                const index = this.freezeEffects.indexOf(effect);
                if (index > -1) {
                    this.freezeEffects.splice(index, 1);
                }
            }
        });
        
        this.freezeEffects.push(effect);
    }

    public playExplosionEffect(x: number, y: number, delay: number = 0) {
        // Create multiple flame sprites for explosion effect
        const numFlames = 5;
        const effects: Phaser.GameObjects.Sprite[] = [];
        
        this.scene.time.delayedCall(delay, () => {
            for (let i = 0; i < numFlames; i++) {
                const angle = (i / numFlames) * Math.PI * 2;
                const distance = 20 + Math.random() * 30;
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;
                
                const effect = this.scene.add.sprite(x + offsetX, y + offsetY, 'flame')
                    .setScale(0.3 + Math.random() * 0.4)
                    .setAlpha(1)
                    .setRotation(Math.random() * Math.PI * 2);
                
                // Animate the explosion effect
                this.scene.tweens.add({
                    targets: effect,
                    scale: effect.scale * 2,
                    alpha: 0,
                    rotation: effect.rotation + (Math.random() - 0.5) * Math.PI,
                    duration: 600 + Math.random() * 400,
                    ease: 'Power2',
                    onComplete: () => {
                        effect.destroy();
                    }
                });
                
                effects.push(effect);
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
        // Clean up all effects
        this.burnEffects.forEach(effect => effect.destroy());
        this.freezeEffects.forEach(effect => effect.destroy());
        this.burnEffects = [];
        this.freezeEffects = [];
    }
}
