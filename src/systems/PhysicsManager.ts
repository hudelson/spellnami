import * as Matter from 'matter-js';

export class PhysicsManager {
    private world: Matter.World;
    private scene: Phaser.Scene;
    private staticBodies: Set<Matter.Body> = new Set();

    constructor(world: Matter.World, scene: Phaser.Scene) {
        this.world = world;
        this.scene = scene;
    }

    public createBlock(x: number, y: number, letter: string, isFirst: boolean = false): MatterJS.BodyType {
        const block = this.scene.matter.add.rectangle(x, y, 40, 40, {
            label: 'block',
            friction: 0.1,
            restitution: 0.3,
            density: 0.001,
            collisionFilter: {
                group: isFirst ? -1 : 0 // First block is in its own group
            }
        });

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
            bodyA,
            bodyB,
            40, // Length
            0.1, // Stiffness
            {
                pointA: { x: 20, y: 0 },
                pointB: { x: -20, y: 0 },
                render: {
                    visible: false
                }
            }
        );
    }

    public findHighestBlock(): MatterJS.BodyType | null {
        let highestBlock: MatterJS.BodyType | null = null;
        let minY = Infinity;

        // Check all bodies in the world
        for (const body of this.world.bodies) {
            // Skip bounds and other non-block bodies
            if (body.label === 'Bounds' || body.label === 'block') {
                if (body.position.y < minY) {
                    minY = body.position.y;
                    highestBlock = body;
                }
            }
        }


        return highestBlock;
    }

    public convertToStatic(body: MatterJS.BodyType) {
        if (this.staticBodies.has(body)) return;
        
        this.matter.body.setStatic(body, true);
        this.staticBodies.add(body);
        
        // Change visual appearance
        const sprite = (body as any).gameObject;
        if (sprite) {
            sprite.setTint(0xadd8e6); // Light blue tint
        }
    }

    public destroyBody(body: MatterJS.BodyType) {
        this.staticBodies.delete(body);
        this.scene.matter.world.remove(body);
    }

    public clearAll() {
        // Remove all non-static bodies
        const bodies = this.world.bodies.filter(
            body => body.label === 'block' && !this.staticBodies.has(body)
        );
        
        this.scene.matter.world.remove(bodies, true);
    }
}
