import { Scene } from 'phaser';

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load particle textures as images
        this.load.setPath('');
        this.load.image('flame', '/spellnami/assets/particles/flame.png');
        this.load.image('snow-puff', '/spellnami/assets/particles/snow-puff.png');
        
        // Load ship images for Math mode
        this.load.image('player_ship', '/spellnami/assets/ships/player_ship.png');
        this.load.image('enemy_ship', '/spellnami/assets/ships/enemy_ship.png');
        
        // Load block texture (simple white rectangle)
        const block = this.make.graphics(undefined, false);
        block.fillStyle(0xffffff, 1);
        block.fillRect(0, 0, 40, 40);
        block.generateTexture('block', 40, 40);
        block.destroy();
    }
    
    create() {
        // Process ship images to remove white background and flip enemy ship
        this.processShipImages();
        
        // Start the TitleScene
        this.scene.start('TitleScene');
    }
    
    /**
     * Process ship images to remove white background and flip enemy ship
     */
    private processShipImages() {
        // Get canvas dimensions from the textures
        const playerTexture = this.textures.get('player_ship');
        const enemyTexture = this.textures.get('enemy_ship');
        
        if (!playerTexture || !enemyTexture) {
            console.error('Failed to load ship textures');
            return;
        }
        
        // Process player ship - remove white background
        const playerSource = playerTexture.getSourceImage() as HTMLImageElement;
        this.createTransparentTexture('player_ship_processed', playerSource, false);
        
        // Process enemy ship - remove white background and flip vertically
        const enemySource = enemyTexture.getSourceImage() as HTMLImageElement;
        this.createTransparentTexture('enemy_ship_processed', enemySource, true);
        
        console.log('Ship textures processed successfully');
    }
    
    /**
     * Create a texture with white background removed
     */
    private createTransparentTexture(key: string, sourceImage: HTMLImageElement, flipVertical: boolean) {
        // Create a temporary canvas
        const canvas = document.createElement('canvas');
        canvas.width = sourceImage.width;
        canvas.height = sourceImage.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // If flipping, transform the context
        if (flipVertical) {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
        }
        
        // Draw the source image
        ctx.drawImage(sourceImage, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Remove white background (make it transparent)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // If pixel is white or very close to white, make it transparent
            if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0; // Set alpha to 0
            }
        }
        
        // Reset transformation if flipped
        if (flipVertical) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        
        // Put the modified image data back
        ctx.putImageData(imageData, 0, 0);
        
        // Create a new texture from the canvas
        this.textures.addCanvas(key, canvas);
    }
}
