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

    public destroy() {
        // Clean up all effects
        this.burnEffects.forEach(effect => effect.destroy());
        this.freezeEffects.forEach(effect => effect.destroy());
        this.burnEffects = [];
        this.freezeEffects = [];
    }
}
