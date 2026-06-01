import pygame
import sys
import random

# Initialize Pygame
pygame.init()

# Screen dimensions and tile properties
screen_width = 800
screen_height = 600
tile_size = 40

# Create the screen surface
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("Player Movement with Walls")

# Define colors
background_color = (0, 0, 0)  # Black background
player_color = (0, 128, 255)  # Blue player color
wall_color = (128, 128, 128)  # Gray color for walls

# Player settings
player_size = tile_size
player_pos = [screen_width // 2, screen_height // 2]
player_speed = 5

# Grid settings
grid_width = screen_width // tile_size
grid_height = screen_height // tile_size

# Create a grid of tiles
tiles = [[0 for _ in range(grid_width)] for _ in range(grid_height)]

# Randomly set some tiles as walls
wall_probability = 0.2  # Probability of a tile being a wall
for y in range(grid_height):
    for x in range(grid_width):
        if random.random() < wall_probability:
            tiles[y][x] = 1  # 1 represents a wall

def draw_grid():
    for y in range(grid_height):
        for x in range(grid_width):
            rect = pygame.Rect(x * tile_size, y * tile_size, tile_size, tile_size)
            if tiles[y][x] == 1:
                pygame.draw.rect(screen, wall_color, rect)  # Draw wall
            pygame.draw.rect(screen, (50, 50, 50), rect, 1)  # Draw grid lines

def is_collision(x, y):
    grid_x = x // tile_size
    grid_y = y // tile_size
    if 0 <= grid_x < grid_width and 0 <= grid_y < grid_height:
        return tiles[grid_y][grid_x] == 1
    return False

def move_player(keys):
    old_pos = player_pos[:]
    
    if keys[pygame.K_LEFT]:
        player_pos[0] -= player_speed
    if keys[pygame.K_RIGHT]:
        player_pos[0] += player_speed
    if keys[pygame.K_UP]:
        player_pos[1] -= player_speed
    if keys[pygame.K_DOWN]:
        player_pos[1] += player_speed

    # Check collision and revert if necessary
    if is_collision(player_pos[0], player_pos[1]):
        player_pos[:] = old_pos

# Initialize the clock
clock = pygame.time.Clock()

# Main loop
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    keys = pygame.key.get_pressed()

    # Move player
    move_player(keys)

    # Clear the screen
    screen.fill(background_color)

    # Draw the grid and player
    draw_grid()
    pygame.draw.rect(screen, player_color, pygame.Rect(player_pos[0], player_pos[1], player_size, player_size))

    # Update the display
    pygame.display.flip()

    # Cap the frame rate
    clock.tick(30)
