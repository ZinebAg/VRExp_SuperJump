# Swisscom Jump & Run Demo

A lightweight, mobile-friendly side‑scroller built with vanilla JavaScript and HTML5 Canvas. Run, jump, collect coins, avoid hazards, and reach the flag. Designed to work on desktop and mobile with on‑screen controls.

## Features

- **Responsive canvas**: Full‑screen rendering with parallax background
- **Mobile support**: Virtual buttons for left/right/jump/crouch
- **Physics-lite controls**: Gravity, jump, double jump, knockback
- **Enemies and hazards**: Patrol enemies you can stomp; antennas you must avoid
- **Collectibles and HUD**: Coins (+10), hearts for lives, score on screen
- **Game states**: Start, Play, Victory, and Game Over overlays
- **Sound effects**: Jump, stomp, coin, win, and game over (mobile‑friendly unlock)

## Controls

- **Desktop**: Left/Right (arrow keys or A/D), Jump (Up or W), Crouch (Down or S)
- **Mobile**: Use the on‑screen arrows and up/down buttons

## Getting Started

Static assets require a local server.

1. Open a terminal at the project root
2. Start a local server, e.g.:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node (http-server)
   npx http-server -p 8000
   ```
3. Visit `http://localhost:8000` in your browser

## Project Structure

```
backup.SuperJumpGame/
├── index.html          # Game container and overlays
├── css/
│   └── style.css       # Layout, overlays, mobile controls, theme
├── js/
│   └── game.js         # Core game logic (canvas, input, physics, render)
├── img/                # Sprites (background, player, enemy, floor, flag, etc.)
├── sfx/                # Audio (coins.mp3, jump.mp3, gameover.mp3, stomp.mp3, win.mp3)
└── README.md
```

## Customization

- Update sprites in `img/` and sounds in `sfx/`
- Tweak gameplay in `js/game.js`:
  - `GAME_CONFIG` for gravity, speeds, jump power
  - `SPRITE_SCALES` for visual sizes
  - Platform/enemy layout in `initializeGame()`

## Troubleshooting

- Blank screen: ensure you’re serving via HTTP (not opening the file directly)
- Audio doesn’t play on mobile: tap once to unlock audio, then try again
- Controls not responding: check the focused tab/window; reload the page

## License

For educational and demo purposes.
