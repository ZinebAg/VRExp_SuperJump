# Gameplay Specification — Swisscom Jump & Run Demo

## Overview
This project is a browser-based 2D side-scrolling platformer inspired by classic Super Mario Bros mechanics, simplified into a single demo level that lasts approximately 15 seconds. The purpose of the game is to reach the end of the level, represented by a flag, where the player receives a Swisscom promotion code (“SWISSCOM2025”). The game should run entirely client-side using HTML, CSS, and JavaScript, and remain responsive and fully playable on both desktop and mobile devices.

---

## Core Gameplay

### Objective
- The player controls a character that must traverse a horizontally scrolling level filled with platforms, enemies, and obstacles.
- The goal is to reach the flag at the end of the level.
- Upon reaching the flag, display a message containing the Swisscom promotion code **“SWISSCOM2025”** and a “Play Again” button.

### Duration
- The entire level should be designed to take about **15 seconds** to complete under normal play.

### Player Actions
- **Move Left / Right**: Player can move horizontally using keyboard or on-screen buttons if the app is displayed as responsive.
- **Jump**: Standard upward leap; used to navigate platforms and defeat enemies.
- **Crouch**: Player crouches low; if combined with jumping onto an enemy, it defeats the enemy.
- **Collisions**:
  - Landing on enemies while crouched defeats them.
  - Touching an enemy from the side or below ends the game.
  - Colliding with an antenna immediately ends the game.

### Controls
- **Desktop Controls**: Arrow keys or WASD.
- **Mobile Controls**: On-screen buttons for left, right, jump, and crouch. Buttons must be sized and positioned ergonomically for thumb access.The Buttons should have a transparent look to not obscure the view on the game. 
- Both control schemes should function seamlessly without requiring page reloads or mode switches.

---

## World & Level Design

### Structure
- The level is side-scrolling and visually continuous.
- Background scrolls horizontally but slower than the floor tiles, to simulate player movement and give perspective.
- When the background image reaches its end, the same image is mirrored and appended to avoid visible breaks.

### Elements
| Element | Asset | Description |
|----------|--------|-------------|
| Background | `background.png` | Looped and mirrored horizontally to create endless scroll effect. |
| Platform | `obstacle.png` | Used to build floating and ground-level platforms. Should support horizontal tiling. |
| Player Sprites | `characterStand.png`, `characterJump.png`, `characterCrouch.png` | Used to represent player states. |
| Enemy | `enemy.png` | Moves horizontally along platforms; can be defeated if jumped on while crouched. |
| Antenna | `antenna.png` | Acts as an instant-death obstacle when touched. |
| Flag | '@flag.png' | Marks the end of the level. |
| Antenna | `floor.png` | Floor-Tiles which represent the ground on which the caracter is running. Repeat the tiles to simulate the floor |

---

## Gameplay Flow

1. **Start Screen**
   - Title: “Swisscom Jump & Run Demo”
   - Start Button: Begins the game and transitions to play state.
   - Background fades in using color and transition definitions from `style.json`.

2. **Play Scene**
   - Character begins on the left side of the screen.
   - Player navigates through platforms, enemies, and antennas.
   - Horizontal scrolling background conveys forward motion.
   - Collisions and physics handled by the chosen framework (Phaser.js recommended).

3. **Game Over Scene**
   - Triggered when player collides with an antenna or enemy (not crouched).
   - Display message: “Game Over – Try Again.”
   - Offer “Restart” button.

4. **Victory Scene**
   - Triggered upon reaching the flag.
   - Display message:  
     “Congratulations! You’ve reached the goal.”  
     “Your Swisscom promotion code: SWISSCOM2025”
   - Include “Play Again” button.

---

## Technical Notes

- **Framework**: Phaser.js or a similarly lightweight 2D JavaScript game engine is recommended.
- **Responsiveness**:
  - The game canvas should scale dynamically to fit any device.
  - Maintain correct aspect ratio across screen sizes.
- **Assets**:  
  All assets are located in `/img`: