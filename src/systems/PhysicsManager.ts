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
    private constraints: MatterJS.ConstraintType[] = [];

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
    public createBlock(x: number, y: number, letter: string, isFirst: boolean = false): BlockBody | null {
        try {
            // Create a container for the block
            const container = this.scene.add.container(x, y);
            
            // Create a simple rectangle for the block
            const blockGraphic = this.scene.add.graphics();
            blockGraphic.fillStyle(0x3498db, 1);
            blockGraphic.fillRect(-20, -20, 40, 40);
            blockGraphic.lineStyle(2, 0x2980b9, 1);
            blockGraphic.strokeRect(-20, -20, 40, 40);
            
            // Add text for the letter
            const letterText = this.scene.add.text(0, 0, letter.toUpperCase(), {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5);
            
            // Add children to container
            container.add([blockGraphic, letterText]);
            container.setDepth(1000);
            
            // Debug: Add a small red dot at the container's origin
            const debugDot = this.scene.add.circle(0, 0, 3, 0xff0000);
            container.add(debugDot);
            
            // Make container interactive for debugging
            container.setInteractive(new Phaser.Geom.Rectangle(-20, -20, 40, 40), Phaser.Geom.Rectangle.Contains);
            container.on('pointerover', () => {
                blockGraphic.clear();
                blockGraphic.fillStyle(0x00ff00, 0.5);
                blockGraphic.fillRect(-20, -20, 40, 40);
                console.log('Block hovered:', { x: container.x, y: container.y, letter });
            });
            
            container.on('pointerout', () => {
                blockGraphic.clear();
                blockGraphic.fillStyle(0x3498db, 1);
                blockGraphic.fillRect(-20, -20, 40, 40);
                blockGraphic.lineStyle(2, 0x2980b9, 1);
                blockGraphic.strokeRect(-20, -20, 40, 40);
            });
            
            // Create the physics body
            const block = this.scene.matter.add.gameObject(container, {
                shape: {
                    type: 'rectangle',
                    width: 40,
                    height: 40
                },
                isStatic: false,
                friction: 0.1,
                frictionAir: 0.01,
                restitution: 0.3,
                density: 0.001,
                collisionFilter: {
                    group: isFirst ? -1 : 0,
                    category: 0x0001,
                    mask: 0xFFFFFFFF
                },
                render: {
                    visible: false // We'll use our own rendering
                },
                ignoreGravity: false,
                sleepThreshold: 0
            }) as any; // Using 'any' to avoid TypeScript errors with the game object
            
            // Store the container reference on the physics body
            if (block.body) {
                (block.body as any).gameObject = container;
            }
            
            // Debug: Add position update logging
            this.scene.events.on('update', () => {
                if (block.body) {
                    container.x = block.body.position.x;
                    container.y = block.body.position.y;
                    container.rotation = block.body.angle;
                }
            });
            
            // Debug: Log block creation
            console.log('Created block:', {
                id: block.body?.id,
                position: block.body?.position,
                container: { x: container.x, y: container.y },
                visible: container.visible,
                active: container.active
            });
            container.y = block.position.y;
            container.rotation = block.angle;
            
            // Add a one-time update listener to verify the position after the first frame
            this.scene.events.once('update', () => {
                console.log('After first update:', {
                    blockPos: block.position,
                    containerPos: { x: container.x, y: container.y },
                    containerVisible: container.visible,
                    containerActive: container.active
                });
            });
            
            // Log block creation for debugging
            console.log('Created block:', {
                id: block.id,
                position: block.position,
                isStatic: block.isStatic,
                label: block.label
            });
            
            return block as unknown as BlockBody;
            
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

    public createConstraint(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void {
        try {
            // Ensure both bodies exist and have valid positions
            if (!bodyA || !bodyB) {
                console.error('Cannot create constraint: one or both bodies are invalid');
                return;
            }
            
            // Create a simple distance constraint between the two bodies
            // The constraint will be created at the current distance between the bodies
            // Create a simple distance constraint
            const constraint = this.scene.matter.add.constraint(
                bodyA,
                bodyB,
                Phaser.Math.Distance.Between(
                    bodyA.position.x,
                    bodyA.position.y,
                    bodyB.position.x,
                    bodyB.position.y
                ),
                0.1, // Stiffness (0-1)
                {
                    render: {
                        visible: false // Hide the constraint for now
                    }
                }
            ) as MatterJS.ConstraintType;
            
            // Store the constraint
            this.constraints.push(constraint);
            
            // Log constraint creation for debugging
            console.log('Created constraint between blocks:', {
                bodyA: bodyA.id,
                bodyB: bodyB.id,
                constraint: constraint.id
            });
            
        } catch (error) {
            console.error('Error creating constraint:', error);
        }
    }

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
