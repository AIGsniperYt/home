class Node {
    constructor(x, y, tileState = TileState.EMPTY, g = 0, h = 0, parent = null, tileType = TileType.PATH) {
        this.x = x;
        this.y = y;
        this.tileState = tileState;
        this.tileType = tileType; // Publicly accessible
        this.g_cost = g;
        this.h_cost = h;
        this.f_cost = h + g;
        this.parent = parent;
        this.updateEffort(); // Initialize effort based on tileType
    }

    // Method to update the effort based on the current tileType
    updateEffort() {
        this.effort = this.calculateEffort(this.tileType);
    }

    // Method to calculate effort based on tileType
    calculateEffort(tileType) {
        switch (tileType) {
            case TileType.GRASS:
                return 2;
            case TileType.SAND:
                return 3;
            case TileType.WATER:
                return 5;
            case TileType.PATH:
                return 1;
            default:
                return 0; // Default effort value
        }
    }

    // Setter for tileType that updates effort when tileType changes
    set tileType(newTileType) {
        this.tileType = newTileType;
        this.updateEffort(); // Update effort when tileType changes
    }
}

// Enum-like constants for tile types (for illustration)
const TileType = {
    GRASS: 'grass',
    SAND: 'sand',
    WATER: 'water',
    PATH: 'path'
};

const TileState = {
    EMPTY: 'empty'
};

// Example usage:
let node = new Node(5, 10, TileState.EMPTY, 0, 0, null, TileType.GRASS);
console.log(node.effort); // Output: 2

node.tileType = TileType.SAND;
console.log(node.effort); // Output: 3

node.tileType = TileType.WATER;
console.log(node.effort); // Output: 5
