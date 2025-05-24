import Matter from 'matter-js';
import { GameObjects } from 'phaser';

// Export the Matter.Body type for our use
export type BlockBody = Matter.Body & {
    gameObject?: GameObjects.GameObject;
    label?: string;
};

// Helper type for Matter.js body with game object
type MatterBodyWithGameObject = Matter.Body & {
    gameObject?: GameObjects.GameObject;
};

export class PhysicsManager {
    private scene: Phaser.Scene;
    private staticBodies: Set<MatterBodyWithGameObject> = new Set();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }
    
    /**
     * Adds a body to the static bodies collection
     * @param body The physics body to add
     */
    public addStaticBody(body: Matter.Body): void {
        const bodyWithGameObject = body as MatterBodyWithGameObject;
        this.staticBodies.add(bodyWithGameObject);
    }
    
    /**
     * Removes a body from the static bodies collection
     * @param body The physics body to remove
     */
    public removeStaticBody(body: Matter.Body): void {
        this.staticBodies.forEach((staticBody, _, set) => {
            if (staticBody === body) {
                set.delete(staticBody);
                return;
            }
        });
    }

    /**
     * Destroys a static body
     * @param body The physics body to destroy
     */
    public destroyStaticBody(body: Matter.Body): void {
        if (this.scene.matter.world.has(body)) {
            this.scene.matter.world.remove(body, true);
        }
        this.removeStaticBody(body);
    }

    public createBlock(x: number, y: number, letter: string, isFirst: boolean = false): BlockBody {
        // Create the physics body with all required properties
        const block = this.scene.matter.add.rectangle(
            x, 
            y, 
            40, 
            40, 
            {
                label: 'block',
                friction: 0.1,
                restitution: 0.3,
                density: 0.001,
                isStatic: false,
                collisionFilter: {
                    group: isFirst ? -1 : 0, // First block is in its own group
                    category: 0x0001,
                    mask: 0xFFFFFFFF
                }
            }
        ) as unknown as BlockBody;
        
        // Add the block to the physics world
        this.scene.matter.world.add(block);

        // Add text to the block
        const blockText = this.scene.add.text(x, y, letter.toUpperCase(), {
            fontSize: '20px',
            color: '#000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // Store reference to the text in the body's game object
        (block as any).gameObject = this.scene.add.existing(blockText);
        
        return block;
    }

    public createConstraint(bodyA: Matter.Body, bodyB: Matter.Body): Matter.Constraint {
        return this.scene.matter.add.constraint(
            bodyA as MatterJS.BodyType,
            bodyB as MatterJS.BodyType,
            40, // Length
            0.1, // Stiffness
            {
                pointA: { x: 20, y: 0 },
                pointB: { x: -20, y: 0 },
                render: {
                    visible: false
                }
            }
        ) as Matter.Constraint;
    }

    public findHighestBlock(): MatterJS.BodyType | null {
        try {
            // Get the Matter.js world from Phaser's Matter world
            const matterWorld = (this.scene.matter as any).world.engine.world;
            
            // Get all bodies from the world using the correct Matter.js API
            const bodies = Matter.Composite.allBodies(matterWorld);
            
            // If no bodies, return null
            if (!bodies || bodies.length === 0) {
                console.log('No bodies found in the world');
                return null;
            }
            
            let highestBlock: MatterJS.BodyType | null = null;
            let minY = Infinity;
            let blockCount = 0;
            
            // Check all bodies in the world
            for (const body of bodies) {
                // Type guard to ensure body has the required properties
                const typedBody = body as Matter.Body & { 
                    label?: string; 
                    gameObject?: Phaser.GameObjects.GameObject;
                    isStatic?: boolean;
                };
                
                // Skip if:
                // 1. Not a block
                // 2. No position
                // 3. Is a world bound
                // 4. No game object (shouldn't happen for real blocks)
                // 5. Is a static body (like the ground)
                if (typedBody.label !== 'block' || 
                    !typedBody.position || 
                    typedBody.label?.includes('Bounds') || 
                    !typedBody.gameObject ||
                    typedBody.isStatic) {
                    continue;
                }
                
                // Count this as a valid block
                blockCount++;
                
                // Update the highest block if this one is higher (lower y value)
                if (typedBody.position.y < minY) {
                    minY = typedBody.position.y;
                    highestBlock = typedBody as MatterJS.BodyType;
                }
            }
            
            console.log(`Found ${blockCount} blocks, highest at y=${highestBlock?.position?.y || 'N/A'}`);
            return highestBlock;
            
        } catch (error) {
            console.error('Error finding highest block:', error);
            return null;
        }
    }

    public convertToStatic(body: Matter.Body) {
        if (this.staticBodies.has(body)) return;
        
        // Ensure the body has the required properties
        const matterBody = body as Matter.Body & { gameObject?: Phaser.GameObjects.GameObject };
        
        Matter.Body.setStatic(matterBody, true);
        this.staticBodies.add(matterBody);
        
        // Change visual appearance
        if (matterBody.gameObject) {
            (matterBody.gameObject as Phaser.GameObjects.Text).setTint(0xadd8e6); // Light blue tint
        }
    }

    public destroyBody(body: Matter.Body) {
        this.staticBodies.delete(body);
        this.scene.matter.world.remove(body as MatterJS.BodyType);
    }

    public clearAll() {
        try {
            // Get the Matter.js world from Phaser's Matter world
            const matterWorld = (this.scene.matter as any).world.engine.world;
            
            // Get all non-static block bodies
            const bodies = Matter.Composite.allBodies(matterWorld).filter(
                body => {
                    const typedBody = body as Matter.Body & { label?: string };
                    return typedBody.label === 'block' && !this.staticBodies.has(typedBody);
                }
            );
            
            // Remove the bodies from the world
            if (bodies.length > 0) {
                this.scene.matter.world.remove(bodies as MatterJS.BodyType[], true);
            }
        } catch (error) {
            console.error('Error clearing bodies:', error);
        }
    }
}
