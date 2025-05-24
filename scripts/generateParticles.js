import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../public/assets/particles');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Create flame particle
function createFlame() {
    const size = 64;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create radial gradient for flame
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255, 200, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    return canvas.toBuffer();
}

// Create snow puff particle
function createSnowPuff() {
    const size = 32;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create radial gradient for snow
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.7, 'rgba(200, 230, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(180, 220, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    return canvas.toBuffer();
}

// Save the textures
fs.writeFileSync(path.join(outputDir, 'flame.png'), createFlame());
fs.writeFileSync(path.join(outputDir, 'snow-puff.png'), createSnowPuff());

console.log('Particle textures generated successfully!');
