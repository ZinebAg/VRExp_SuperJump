# Scaling & Proportion Guide

This guide defines the relative sizes, hitbox ratios, and placement relationships between all major visual components in the Swisscom Jump & Run demo game. It ensures consistent scaling across devices and preserves the aesthetic shown in the design reference image.

---

## 1. General Canvas & Scaling
- **Base Resolution Reference:** 1536 × 672 px (16:7 aspect ratio, taken from design image).  
- **Default Canvas Size:** 960 × 420 px (scaled proportionally to fit viewport).  
- **Scaling Mode:** Maintain aspect ratio using "fit" scaling — the game world scales down or up while maintaining visual proportions.  
- **Safe Zone (Gameplay Area):** Bottom 60% of screen height reserved for ground, platforms, player, and obstacles.  
- **HUD/UI Area:** Top 40% reserved for background and sky.

---

## 2. Element Size Ratios (relative to canvas height)

| Element | Approx. Height | Approx. Width | Relative to Player | Notes |
|----------|----------------|---------------|--------------------|-------|
| **Player (Hero)** | 0.30 × canvas height | 0.18 × canvas width | 1.0 | Standing sprite baseline. Used for collision body. |
| **Platform Block** | 0.08 × canvas height | 0.08 × canvas width | 0.25 | Each platform tile should align to a grid. Ground is built from a row of these tiles. |
| **Enemy** | 0.20 × canvas height | 0.15 × canvas width | ~0.7 | Hitbox centered, slightly smaller than sprite for forgiving collisions. |
| **Antenna** | 0.22 × canvas height | 0.07 × canvas width | ~0.75 | Collider should extend from base to 90% of height. |
| **Flagpole** | 0.40 × canvas height | 0.05 × canvas width | ~1.3 | Positioned at far-right end of level. Flag image extends from pole mid-height. |
| **Background Mountains** | 1.00 × canvas height | Seamless horizontal tile | — | Scrolls at 30–40% of player speed (parallax effect). |
| **Ground Grass Layer** | 0.10 × canvas height | Follows platform width | — | Forms the top edge of the platform layer. |

---

## 3. Proportional Layout (based on the screenshot)
- The **player’s head** reaches approximately halfway up the antennas.  
- The **enemy** is slightly shorter than the player’s torso when standing.  
- The **flagpole** is roughly 1.3× the player’s height.  
- **Platforms** are roughly one-third the height of the player’s sprite and use consistent tile height for physics collisions.  
- The **background mountain peaks** occupy 60–70% of screen height; the base of the mountains aligns just above the top of the ground platform layer.

---

## 4. Physics & Collision Bodies
- **Player Collider:** Rectangle from feet to 90% of sprite height; width ≈ 65% of sprite width.  
- **Enemy Collider:** Centered circle or rectangle (70% of sprite width).  
- **Platform Collider:** Full block rectangle (no gaps).  
- **Antenna Collider:** Narrow vertical rectangle covering base and body, ~80% of height.

---

## 5. Parallax & Motion
- **Background scroll speed:** 0.4 × player speed.  
- **Foreground (platforms, antennas, enemies):** Scroll at full player speed.  
- **Mirrored Background:** When background scroll reaches end, append a mirrored copy of the same image to maintain seamless motion.

---

## 6. Mobile Scaling Notes
- Maintain hero sprite height ≈ 25–30% of viewport height on all screens.  
- Minimum ground/platform height: 8% of viewport height for touch visibility.  
- Touch controls should occupy bottom 15–20% of screen height, overlayed semi-transparent on top of gameplay area without obstructing the hero.  

---

## 7. Recommended Pixel Dimensions (base scale at 960×420 canvas)
| Element | Width (px) | Height (px) |
|----------|-------------|-------------|
| Player | ~170 | ~125 |
| Platform block | 70 | 35 |
| Enemy | ~100 | ~80 |
| Antenna | ~60 | ~90 |
| Flagpole | ~80 | ~160 |
| Ground grass strip | ~960 | ~42 |

---

## 8. Summary
The design should maintain a clear hierarchy: player > enemies/antennas > platforms > background. The player must always appear visually prominent and readable at all viewport scales. Parallax background layers should scroll slower than the gameplay layer to create depth without distracting from the foreground.