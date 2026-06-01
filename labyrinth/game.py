import pygame
import random

# Initialise pygame
pygame.init()

# define all he tile states and give them an abstract name
tile_state = {
    "empty": 0,
    "wall": 1,
    "start": 2,
    "end": 4
}

# define tile colors 
tile_colors = {
    tile_state["empty"]: (255, 255, 255),
    tile_state["wall"]: (50, 50, 50),
    tile_state["start"]: (255, 255, 0),
    tile_state["end"]: (255, 0, 255)
}

class Tile:
    def __init__(self, x, y, tileState=tile_state["wall"], parent=None):
        self.x = x
        self.y = y
        self.tileState = tileState
        self.parent = parent

# essential variables for ingame rendering
tile_size = 32 # how big the tiles appear (in pixels)
grid_rows = 31 # how many tiles on the x axis
grid_columns = 31 # how many tiles on the y axis

# Get the current screen dimensions
info = pygame.display.Info()
SCREEN_WIDTH = info.current_w
SCREEN_HEIGHT = info.current_h


grid_color = (0, 0, 0)

# set up display window: (w x h)
screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN) # how big screen is
pygame.display.set_caption("Labyrinth") # set window title

# define a grid of tiles/nodes
grid = [
    [Tile(x, y) for x in range(grid_columns)] for y in range(grid_rows)
]

frontiers = []

# define the camera rectangle
camera = pygame.Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

#camera.x = player.x - SCREEN_WIDTH // 2
#camera.y = player.y - SCREEN_HEIGHT // 2

#screen_x = object.x - camera.x
#screen_y = object.y - camera.y
#screen.blit(object_surface, (screen_x, screen_y))

def getRandomCorner(margin=1):
    """Returns a random corner coordinate of the grid with a given margin away from edges and sets the tileState of that corner to 'empty'."""
    if margin < 0:
        raise ValueError("Margin must be non-negative")
    
    # Ensure margins are valid with respect to grid dimensions
    if (grid_rows - 1 - margin) < margin or (grid_columns - 1 - margin) < margin:
        raise ValueError("Margin too large for the grid size")
    
    # Define corners with margin consideration
    corners = [
        (margin, margin),  # Top-left
        (margin, grid_columns - 1 - margin),  # Top-right
        (grid_rows - 1 - margin, margin),  # Bottom-left
        (grid_rows - 1 - margin, grid_columns - 1 - margin)  # Bottom-right
    ]
    
    # Select a random corner
    corner = random.choice(corners)
    
    # Set the tile state of the chosen corner to 'empty'
    grid[corner[0]][corner[1]].tileState = tile_state["empty"]
    print(grid[corner[0]][corner[1]].x)
    print(grid[corner[0]][corner[1]].y)
    return grid[corner[0]][corner[1]]

def add_frontiers(node):
    directions = [
        {'dx': -2, 'dy': 0},  # Left
        {'dx': 0, 'dy': -2},  # Top
        {'dx': 0, 'dy': 2},   # Bottom
        {'dx': 2, 'dy': 0}    # Right
    ]
    
    for direction in directions:
        dx = direction['dx']
        dy = direction['dy']
        
        new_x = node.x + dx
        new_y = node.y + dy
        
        # Check if the new coordinates are within the grid boundaries
        if (1 <= new_x < grid_columns - 1) and (1 <= new_y < grid_rows - 1):
            frontier = grid[new_y][new_x]
            if frontier.tileState == tile_state["wall"]:
                # Set the parent and mark it as a frontier
                frontier.parent = node
                frontiers.append(frontier)


def generateMaze():
    frontiers.clear()

    # get random starting corner and make it empty
    random_point = getRandomCorner()

    add_frontiers(random_point)




generateMaze()

# main loop 
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:  # Press ESC to exit fullscreen
                running = False
    
    # fill screen with a black background
    screen.fill((0,0,0))

    # Draw the grid
    for row in range(grid_rows):
        for col in range(grid_columns):
            # Calculate the position for each tile
            x = col * tile_size
            y = row * tile_size
            
            # Draw the tile
            if grid[col][row].tileState == tile_state["wall"]:
                pygame.draw.rect(screen, tile_colors[tile_state["wall"]], pygame.Rect(x, y, tile_size, tile_size))
            else:
                pygame.draw.rect(screen, tile_colors[tile_state["empty"]], pygame.Rect(x, y, tile_size, tile_size))
            
            
            # Draw the grid lines
            pygame.draw.rect(screen, grid_color, pygame.Rect(x, y, tile_size, tile_size), 1)  # Draw grid lines


    # update display
    pygame.display.flip()

# exit the program
pygame.quit()