import { Scene } from 'phaser';

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load particle textures as images
        this.load.setPath('');
        this.load.image('flame', '/assets/particles/flame.png');
        this.load.image('snow-puff', '/assets/particles/snow-puff.png');
        
        // Load block texture (simple white rectangle)
        const block = this.make.graphics(undefined, false);
        block.fillStyle(0xffffff, 1);
        block.fillRect(0, 0, 40, 40);
        block.generateTexture('block', 40, 40);
        block.destroy();
    }

    create() {
        // Start the TitleScene
        this.scene.start('TitleScene');
    }
}
