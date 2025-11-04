# Swisscom Jump & Run Game - Project Prompts Documentation

## All Prompts Used in This Project

### Prompt 1: Initial Project Request

**Objective**: Create a responsive single-level 2D side-scrolling web game similar to a simplified Super Mario Bros following the definition in gamePlay.md using HTML, CSS, and JavaScript leveraging a client-side package or framework most suitable.

**Key Requirements**:
- Player controls: move left, right, jump, and crouch using on-screen touch buttons on mobile or arrow/WASD keys on desktop
- Scaling of elements defined in structure.md
- Use assets from /img as defined in gamePlay.md
- Read color and fade definitions from style.json
- Level duration: approximately 15 seconds
- No scoring system needed
- Victory condition: reach flag, show overlay with "Congratulations! You've reached the goal. Your Swisscom promotion code: SWISSCOM2025" and replay button
- Maintain aspect ratio and responsiveness for all screen sizes
- Clean modular structure: /index.html, /css/style.css, /js/game.js, /style.json, and /img/
- Include start screen, play scene, game over scene, and victory scene
- Everything runs client-side with no server dependencies
- Create prompts.md for iteration and one-shot replication

## Design Decisions Made

### 1. Framework Choice: Kaboom.js
**Decision**: Kaboom.js v3000+
**Rationale**: 
- Lightweight client-side framework (no build process)
- Excellent 2D game engine with built-in physics
- Simple sprite management and collision detection
- Good mobile support
- CDN available for easy integration

### 2. Mobile Control Style: Glass-morphism
**Decision**: Glass-morphism effect with backdrop-blur
**Implementation**:
- Semi-transparent background (20% opacity)
- Backdrop-filter: blur(10px)
- Subtle borders and shadows
- Positioned at bottom 20% of screen
- Non-obstructive design

### 3. Level Design: Fixed Layout
**Decision**: Pre-defined level layout for 15-second completion
**Layout**:
- Ground: continuous floor tiles across 3000px width
- 8 floating platforms at varying heights
- 4 enemies patrolling platforms
- 4 antennas as instant-death obstacles
- Flag at x=2800px position

## Technical Specifications

### Sprite Scaling (from structure.md)
- Player: 0.30 canvas height (~125px)
- Platform blocks: 0.08 canvas height (~35px), tiled
- Enemy: 0.20 canvas height (~80px)
- Antenna: 0.22 canvas height (~90px)
- Flag: 0.40 canvas height (~160px)
- Background: full height with 0.4× parallax scroll

### Canvas Configuration
- Base resolution: 960×420px (16:7 aspect ratio)
- Scaling mode: "fit" to maintain aspect ratio
- Background color: Swisscom primary (#001155)

### Physics Settings
- Player movement: 200px/s horizontal speed
- Jump velocity: -500px/s initial, gravity 1500px/s²
- Crouch: reduces hitbox height by 40%
- Enemy patrol: 30px/s movement speed

### Swisscom Branding (from style.json)
- Primary color: #001155
- Primary light: #49A6E9
- Accent color: #DD0B1A
- Font family: TheSans, sans-serif
- Gradient: 135deg from primary to primary-light
- Corner radius: 12px
- Shadow: 0 2px 12px rgba(0, 17, 85, 0.08)

## Asset Mapping
- Background: `img/background.png` (parallax scrolling)
- Player sprites: `characterStand.png`, `characterJump.png`, `characterCrouch.png`
- Enemy: `img/enemy.png`
- Antenna: `img/antenna.png`
- Flag: `img/flag.png`
- Floor: `img/floor.png` (ground tiles)
- Platform: `img/obstacle.png` (floating platforms)

## Game Flow
1. **Start Screen**: Title + "Start Game" button with Swisscom gradient
2. **Play Scene**: Main game loop with parallax background, physics, collision detection
3. **Game Over**: Triggered by enemy/antenna collision, shows "Try Again" message
4. **Victory**: Triggered by flag collision, displays SWISSCOM2025 promo code

## Mobile Responsiveness
- Mobile detection: `window.innerWidth < 768px`
- Touch controls: glass-morphism buttons (bottom 20% of screen)
- Responsive scaling: CSS `object-fit: contain` maintains aspect ratio
- Touch events: preventDefault() to avoid scrolling

## Complete One-Shot Replication Prompt

**Use this single prompt to recreate the entire Swisscom Jump & Run game:**

---

Create a responsive single-level 2D side-scrolling web game similar to a simplified Super Mario Bros using vanilla JavaScript with HTML5 Canvas. The game should fill the entire browser window horizontally and vertically.

**Technical Requirements:**
- Use vanilla JavaScript with HTML5 Canvas API (no external frameworks)
- Canvas fills entire browser window (100vw x 100vh) with dynamic resizing
- Player controls: move left, right, jump, and crouch using on-screen touch buttons on mobile or arrow/WASD keys on desktop
- Glass-morphism mobile controls with backdrop-blur effect
- Swisscom branding: primary color #001155, accent #DD0B1A, TheSans font family
- Level duration: approximately 15 seconds
- Victory condition: reach flag, show overlay with "Congratulations! You've reached the goal. Your Swisscom promotion code: SWISSCOM2025"

**Critical Bug Fix - Floor Tile Calculation**:
- **Problem**: `SPRITE_SCALES.floor.width` (70px) - 344px = -274px (negative!)
- **Result**: Infinite loop in platform creation causing browser crash
- **Solution**: Use positive tile dimensions (100px width, 50px height) with proper sprite offsets
- **Prevention**: Always validate calculations result in positive values before loops

**Sprite Handling (Critical):**
- Floor tiles: 172px empty on each side, 428px empty on top - use sprite offset rendering with POSITIVE dimensions
- Antenna sprites: 43px empty at bottom - position antennas higher to align visible content
- Character sprites: Use characterJump.png when airborne (not on ground/obstacles), characterCrouch.png when crouching, characterStand.png when on ground
- **Double jump**: Player can jump twice before needing to land (jumpCount tracking)

**Game Mechanics:**
- Physics: gravity 1500px/s², jump velocity -500px/s, player speed 200px/s
- **Double jump**: Player can jump twice before needing to land (tracked with jumpCount)
- **Camera scrolling**: Player stays at left 25% of screen, world scrolls horizontally
- **Collision detection**: CRITICAL - Use WORLD coordinates for all collision checks, not screen coordinates
  - Player collision box: `{ x: player.x, y: player.y, width, height }` (world position)
  - Enemy/antenna/flag collision boxes: `{ x: object.x, y: object.y, width, height }` (world position)
  - DO NOT use screen coordinates or camera offsets in collision detection
  - Rendering uses screen coordinates (with camera offset), collision uses world coordinates
- Enemy defeat: crouch + land from above
- Game over: enemy side collision or antenna touch
- Parallax background scrolling at 0.4x player speed
- Scene management: start screen, play scene, game over, victory

**File Structure:**
- index.html: Canvas element, overlays, mobile controls
- css/style.css: Swisscom branding, glass-morphism controls, responsive design
- js/game.js: Complete vanilla JavaScript game engine
- All assets in /img/ directory

**Key Implementation Details:**
- Image preloading system for all sprites
- Delta time-based game loop with requestAnimationFrame
- Window resize handling for responsive canvas
- Mobile touch controls with preventDefault() to avoid scrolling
- Sprite offset rendering to show only visible content
- Automatic sprite switching based on player state
- **CRITICAL**: Use positive tile dimensions to prevent infinite loops
- **Double jump**: Track jump count and reset on landing

The game should run entirely client-side with no server dependencies and work immediately when opening index.html in any modern browser.

---

### Prompt 2: Framework and Design Decisions
**User Query**: "1. c) 2. c) 3 a)"
**Context**: User was asked to choose:
1. Game Framework Choice: c) Kaboom.js (lightweight, modern alternative)
2. Mobile Control Button Style: c) Glass-morphism style with blur effect  
3. Level Design: a) Fixed layout matching the 15-second completion time with specific obstacles

### Prompt 3: Implementation Request
**User Query**: "Implement the plan as specified. To-do's from the plan have already been created, do not create them again."
**Context**: User approved the implementation plan and requested execution without recreating todos.

### Prompt 4: Bug Report - Game Not Loading
**User Query**: "After the starting screen nothing is happening, no content and no game is loading. The gradient of the page background is as anticipated"
**Context**: Initial implementation had Kaboom.js initialization timing issues.

### Prompt 5: Bug Report - Start Button Not Working
**User Query**: "The game doesn't initiate, the "start game" button doesn't have any effect when clicked"
**Context**: DOMContentLoaded event was needed to ensure proper initialization order.

### Prompt 8: Game Improvements Request
**User Query**: "Please make the game bigger and fit it to the size of the browser window horizontally. Additionally change the placement of the floor-tiles, they contain 172px empty on each side of the visible content. 43px of the picture from bottom of the Antenna are empty pixels and 428px of the top of the floor tile is empty as well. Please consider this while placing the antenna and while rendering the ground for the character. Please incorporate the @characterJump.png file when the character is in the air - not on an obstacle and not on the ground."
**Context**: User requested full-screen gameplay, proper sprite alignment accounting for empty pixels, and jump sprite implementation.

**Technical Improvements Made**:
- Canvas now fills entire browser window (100vw x 100vh)
- Dynamic canvas sizing with window resize handling
- Floor tile rendering with sprite offsets (172px sides, 428px top empty pixels)
- Antenna positioning adjusted for 43px empty bottom pixels
- Character jump sprite displays when airborne (not on ground/obstacles)
- Proper collision detection matching visible sprite content
- Responsive scaling maintained across all screen sizes

### Prompt 9: Documentation Update Request
**User Query**: "Please incorporate these changes to the @prompts.md in order to make this game executable with one prompt."
**Context**: User requested comprehensive documentation update for one-shot replication.

## Prompt Iteration Summary

**Initial Prompt**: Comprehensive game specification with Swisscom branding requirements
**Decision Prompts**: Framework choice (Kaboom.js), mobile controls (glass-morphism), level design (fixed layout)
**Implementation Prompts**: Plan execution and bug fixes
**Documentation Prompts**: Complete prompt history for one-shot replication

**Key Learning**: The most effective approach combines:
1. Detailed initial specification with all requirements
2. Clear decision points for framework and design choices
3. Structured implementation plan with specific technical details
4. Iterative bug fixing with focused problem-solving
5. Complete documentation for future replication
6. Flexibility to rebuild with different technologies when requirements change

## Final Implementation Summary

**Framework Evolution**: Kaboom.js → Vanilla JavaScript + HTML5 Canvas
**Benefits of Vanilla Approach**:
- No external dependencies or CDN requirements
- No server needed for local development
- Complete control over game engine implementation
- Smaller bundle size and faster loading
- Better understanding of game mechanics

**Core Features Maintained**:
- Swisscom branding and styling
- 15-second level completion time
- Full-screen responsive design (100vw x 100vh)
- Mobile touch controls with glass-morphism styling
- Physics-based gameplay with collision detection
- Scene management (start, play, game over, victory)
- Parallax background scrolling
- Enemy defeat mechanics and victory conditions
- Proper sprite alignment accounting for empty pixels
- Character jump sprite when airborne
- Dynamic canvas resizing with window changes

**Final Technical Specifications**:
- Canvas: Full browser window with dynamic sizing
- Floor tiles: Sprite offset rendering (172px sides, 428px top empty) with POSITIVE dimensions
- Antennas: Positioned accounting for 43px bottom empty pixels
- Character sprites: Automatic switching based on state (standing/jumping/crouching)
- **Double jump**: Two jumps allowed before landing required
- Physics: Delta time-based with 60fps game loop
- Collision: Bounding box intersection with visible sprite content
- Mobile: Touch controls with preventDefault() for no-scroll experience
- **Critical**: Always validate calculations result in positive values to prevent infinite loops

## Critical Bug Fixes

### Bug: Desktop Mode Crash (Collision Detection)

**Problem**: Game worked in responsive/mobile mode but immediately crashed to "Game Over" in desktop mode when "Start Game" was clicked.

**Root Cause**: 
- Collision detection used **screen coordinates** instead of **world coordinates**
- Player collision box was set to `playerScreenX = GAME_CONFIG.width * 0.25` (screen position)
- Enemies, antennas, and flag were in world coordinates
- This coordinate system mismatch caused immediate collisions at game start in desktop mode
- Mobile mode worked because touch controls handled input differently

**The Bug**:
```javascript
// WRONG - Screen coordinates for player
const playerCollisionBox = {
    x: playerScreenX,  // Screen position (25% of screen)
    y: player.y,
    width: player.width,
    height: player.height
};

// Enemy in world coordinates with camera offset
const enemyCollisionBox = {
    x: enemy.x - camera.x,  // World position with camera offset
    y: enemy.y,
    width: enemy.width,
    height: enemy.height
};
```

**The Fix**:
```javascript
// CORRECT - World coordinates for all collision detection
const playerCollisionBox = {
    x: player.x,  // Use world position, not screen position
    y: player.y,
    width: player.width,
    height: player.height
};

// Enemy in world coordinates (no camera offset needed)
const enemyCollisionBox = {
    x: enemy.x,  // World position
    y: enemy.y,
    width: enemy.width,
    height: enemy.height
};
```

**Key Principle**: 
- **Rendering** uses screen coordinates (with camera offset for world objects)
- **Collision detection** must use world coordinates for all objects
- Never mix coordinate systems in collision detection

**Implementation Details**:
- Player renders at fixed screen position: `playerScreenX = GAME_CONFIG.width * 0.25`
- Player physics/collision uses world position: `player.x` (updated by velocity)
- Camera follows player in world space: `camera.x = player.x - targetPlayerScreenX`
- All world objects (enemies, antennas, platforms, flag) render with camera offset: `object.x - camera.x`
- All collision detection uses pure world coordinates without camera offset

### Bug: Touch Event Performance Warning

**Problem**: Console warning about non-passive touch event listeners blocking scroll performance.

**Root Cause**: 
- Touch event listeners using `preventDefault()` are non-passive by default
- Browser warns about potential scroll blocking on touch devices
- Performance impact on mobile scrolling responsiveness

**The Fix**:
```javascript
// Explicitly mark touch events as non-passive since we need preventDefault()
document.getElementById('btn-jump').addEventListener('touchstart', (e) => {
    e.preventDefault();
    mobileControls.jump = true;
}, { passive: false });
```

**Key Principle**: 
- Use `{ passive: false }` when `preventDefault()` is needed for game controls
- This explicitly acknowledges the performance trade-off
- Prevents browser console warnings while maintaining functionality

### Bug: Floor Not Loading After Removing Empty Pixels

**Problem**: After removing empty pixels from floor.png, the floor tiles wouldn't render properly.

**Root Cause**: 
- The code was configured for floor.png with 172px empty pixels on each side and 428px empty on top
- After cropping the image to remove empty space, the sprite offsets still pointed to the old positions
- This caused the game to try to render from coordinates that no longer exist in the image

**The Fix**:
- Updated `floorSpriteOffsetX` and `floorSpriteOffsetY` from 172/428 to 0
- Kept rendering dimensions the same (100px x 50px for visible tile)
- Updated comments to reflect that empty pixels have been removed

**Key Principle**:
- When modifying sprite images, always update corresponding offset values in code
- Sprite offsets should match the actual content position in the image file
- If empty pixels are removed, offsets should be set to 0

### Prompt 10: Add Stomp-to-Kill Enemy Functionality

For now, the player dies when colliding with an enemy. I want to improve this logic:

- If the player collides **from above** (the player’s bottom overlaps the enemy’s top while moving downward), the player should **stomp and kill** the enemy.
- When stomping, play a short bounce animation or upward velocity to simulate impact.
- If the player collides from the **side** or **bottom**, the player should lose a life or trigger game over (depending on the current life system).
- Keep antenna behavior unchanged (they cannot be killed).
- Maintain existing camera, parallax, and input systems unchanged.


### Prompt 11: Add Sound Effects to the Game

Add sound effects support using the existing `sfx/` folder.

- When the player **jumps**, play `sfx/jump.mp3`.
- When the player **wins**, play `sfx/win.mp3`.
- When the player **loses (game over)**, play `sfx/gameover.mp3`.

Integrate sound loading into `loadSounds()` and ensure it respects the `audioEnabled` flag (only play after first user interaction).  
Volume should be around 0.5.  
Do not interfere with background music or visual updates.

### Prompt 12: Add Coins + Score HUD

Add collectible coins and a visible score HUD.

- Asset: `img/coin.png` (40×40, preserve aspect ratio).
- Sound: `sfx/coins.mp3` (play when collected).

Functionality:
- Add `let coins = [];` and `let score = 0;`.
- Spawn **5 floating coins** randomly across the level, not overlapping any platforms, antennas, or enemies.
- Coins should float slightly up and down (sine wave bobbing) but remain static horizontally.
- When the player collides with a coin:
  - Remove the coin,
  - Increment score by 10,
  - Play `sfx/coins.mp3`.

HUD:
- Display score at the **top-right corner** of the screen (e.g., “Score: 50”).
- Reset score when restarting the game.
- Show final score on victory/game-over overlays.

### Prompt 13: Add a 3-Lives System

Implement a lives system with visible heart icons and loss rules.

- Add `gameState.lives = 3` (reset in `startGame()`).
- Use `img/heart.png` (max width 60px, maintain ratio) as the life icon.
- Display hearts at the **top-left corner**, spaced by 12px.

Life loss conditions:
- Lose 1 life when colliding with an **enemy from the side or bottom**.
- Lose 1 life when touching an **antenna**.
- Stomping an enemy from above does **not** cost a life.
- When lives reach **0**, trigger `gameOver()` and play the game over sound.

UX:
- On hit, briefly flash the player sprite and grant ~800ms invulnerability.
- Update the hearts in real-time in the HUD.

### Prompt 14: Aesthetic & Sprite Updates

Replace sprites and improve visual consistency without breaking gameplay logic.

New assets:
- Player sprites:
  - `img/characterStand.png`
  - `img/characterJump.png`
  - `img/characterCrouch.png`
- Enemy: `img/enemy.png`
- Background: keep or replace `img/background.png`
- Hearts: `img/heart.png`
- Coins: `img/coin.png`

Requirements:
- Maintain player position and physics (size, collision boxes, gravity) even if the new sprite dimensions differ.
- Scale all sprites proportionally so that gameplay alignment (floor, collision height) stays consistent.
- Keep parallax backgrounds, platforms, and flags as-is.
- Ensure all new images load correctly in `loadImages()` and render in the right z-order.

Optional polish:
- Slight bounce animation for idle player.
- Fade-in transition when starting or restarting.