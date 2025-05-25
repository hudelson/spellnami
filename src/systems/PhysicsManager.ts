import Matter from 'matter-js';
import { GameObjects } from 'phaser';

// Extend MatterJS.BodyType to include our custom properties
export type BlockBody = MatterJS.BodyType & {
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
    
    /**
     * Finds the highest block in the world
     * @returns The highest block or null if no blocks found
     */
    public findHighestBlock(): BlockBody | null {
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
            
            let highestBlock: BlockBody | null = null;
            let minY = Infinity;
            
            // Check all bodies in the world
            for (const body of bodies) {
                const typedBody = body as BlockBody;
                
                // Skip if:
                // 1. Not a block
                // 2. No position
                // 3. Is a world bound
                // 4. Is a static body (like the ground)
                if (typedBody.label !== 'block' || 
                    !typedBody.position || 
                    typedBody.label?.includes('Bounds') || 
                    typedBody.isStatic) {
                    continue;
                }
                
                // Update the highest block if this one is higher (lower y value)
                if (typedBody.position.y < minY) {
                    minY = typedBody.position.y;
                    highestBlock = typedBody;
                }
            }
            
            return highestBlock;
            
        } catch (error) {
            console.error('Error finding highest block:', error);
            return null;
        }
    }

    /**
     * Creates a new block with physics and visual representation
     * @param x The x position of the block
     * @param y The y position of the block
     * @param letter The letter to display on the block
     * @param isFirst Whether this is the first block in a word
     * @returns The created block body with game object reference
     */
    public createBlock(x: number, y: number, letter: string, isFirst: boolean = false): BlockBody {
        try {
            // Create the physics body with all required properties
            const block = this.scene.matter.add.rectangle(
                x, 
                y, 
                40, // Width
                40, // Height
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
                    },
                    // Add custom properties for easier identification
                    render: {
                        visible: true
                    }
                }
            ) as unknown as BlockBody;
            
            if (!block) {
                throw new Error('Failed to create block physics body');
            }
            
            // Add text to the block
            const blockText = this.scene.add.text(x, y, letter.toUpperCase(), {
                fontSize: '20px',
                color: '#000',
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5);
            
            // Store reference to the text in the body's game object
            block.gameObject = this.scene.add.existing(blockText);
            
            // Ensure the block is added to the physics world
            this.scene.matter.world.add(block);
            
            return block;
            
        } catch (error) {
            console.error('Error creating block:', error);
            throw error; // Re-throw to allow handling in the calling code
        }
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

    // findHighestBlock method removed - using the one with BlockBody return type instead

    /**
     * Converts a physics body to be static
     * @param body The physics body to convert
     */
    public convertToStatic(body: Matter.Body) {
        try {
            if (!body) {
                console.warn('Cannot convert null or undefined body to static');
                return;
            }
            
            // Check if already static
            if (this.staticBodies.has(body as MatterBodyWithGameObject)) {
                return;
            }
            
            // Set the body to be static
            Matter.Body.setStatic(body, true);
            
            // Add to our tracking set
            this.staticBodies.add(body as MatterBodyWithGameObject);
            
            // Change visual appearance if there's a game object
            const matterBody = body as BlockBody;
            if (matterBody.gameObject) {
                const textObject = matterBody.gameObject as Phaser.GameObjects.Text;
                if (textObject.setTint) {
                    textObject.setTint(0xadd8e6); // Light blue tint for static blocks
                }
            }
        } catch (error) {
            console.error('Error converting body to static:', error);
        }
    }

    /**
     * Destroys a physics body and cleans up its resources
     * @param body The physics body to destroy
     */
    public destroyBody(body: Matter.Body) {
        try {
            if (!body) {
                console.warn('Cannot destroy null or undefined body');
                return;
            }
            
            // Remove from static bodies set if present
            this.staticBodies.delete(body as MatterBodyWithGameObject);
            
            // Clean up the game object if it exists
            const blockBody = body as BlockBody;
            if (blockBody.gameObject && blockBody.gameObject.destroy) {
                blockBody.gameObject.destroy();
            }
            
            // Remove from physics world
            this.scene.matter.world.remove(body as MatterJS.BodyType, true);
            
        } catch (error) {
            console.error('Error destroying body:', error);
        }
    }

    /**
     * Clears all physics bodies from the world
     */
    public clearAll() {
        try {
            // Get the Matter.js world from Phaser's Matter world
            const matterWorld = (this.scene.matter as any).world.engine.world;
            
            // Get all bodies in the world
            const allBodies = Matter.Composite.allBodies(matterWorld);
            
            // Filter for block bodies that should be destroyed
            const blockBodies = allBodies.filter(body => {
                const typedBody = body as Matter.Body & { label?: string };
                return typedBody.label === 'block' && !typedBody.isStatic;
            });
            
            // Destroy all block bodies
            blockBodies.forEach(body => {
                this.destroyBody(body);
            });
            
            // Clear the static bodies set
            this.staticBodies.clear();
            
        } catch (error) {
            console.error('Error clearing physics world:', error);
        }
    }
}
