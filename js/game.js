// Swisscom Jump & Run Game - Vanilla JavaScript Implementation

// Game configuration - will be set after DOM loads
let GAME_CONFIG = {
    width: 960, // Default fallback
    height: 420, // Default fallback
    gravity: 1500,
    playerSpeed: 200,
    jumpVelocity: -500,
    backgroundScrollSpeed: 0.4
};

// Sprite scaling ratios (per structure.md)
const SPRITE_SCALES = {
    player: { width: 170, height: 125 },
    platform: { width: 70, height: 35 },
    enemy: { width: 90, height: 70 },
    antenna: { width: 70, height: 140 },
    flag: { width: 80, height: 160 },
    floor: { width: 70, height: 35 }
};

// Game state
let gameState = {
    isMobile: false, // Will be set after DOM loads
    currentScene: 'start',
    gameStarted: false,
    gameOver: false,
    victory: false,
    playerState: 'standing', // standing, jumping, crouching
    lives: 3
};

// Canvas and context
let canvas, ctx;

// Game objects
let player, enemies = [], platforms = [], antennas = [], flag, backgrounds = [];

// Camera system
let camera = {
    x: 0,
    targetX: 0,
    followSpeed: 5
};

// Input handling
let keys = {};
let mobileControls = {
    left: false,
    right: false,
    jump: false,
    crouch: false
};

// Image assets
let images = {};
let imagesLoaded = false;

// Audio assets
let sounds = {};
let soundsLoaded = false;
let audioEnabled = false;

// Collectibles and scoring
let coins = [];
let score = 0;

// Stop any end-state sounds (win/gameover)
function stopEndSounds() {
    try {
        if (sounds.win) {
            sounds.win.pause();
            sounds.win.currentTime = 0;
        }
    } catch (e) {}
    try {
        if (sounds.gameover) {
            sounds.gameover.pause();
            sounds.gameover.currentTime = 0;
        }
    } catch (e) {}
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get 2D context');
            return;
        }
        
        // Set canvas size to full window with fallbacks
        canvas.width = window.innerWidth || 960;
        canvas.height = window.innerHeight || 420;
        
        // Update game config with actual canvas dimensions
        GAME_CONFIG.width = canvas.width;
        GAME_CONFIG.height = canvas.height;
        
        // Update mobile detection
        gameState.isMobile = canvas.width < 768;
        
        // Load all images
        loadImages();
        
        // Load all audio
        loadSounds();
        
        // Setup event listeners
        setupEventListeners();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth || 960;
            canvas.height = window.innerHeight || 420;
            GAME_CONFIG.width = canvas.width;
            GAME_CONFIG.height = canvas.height;
            gameState.isMobile = canvas.width < 768;
        });
        
        // Start game loop
        gameLoop();
    } catch (error) {
        console.error('Game initialization error:', error);
    }
});

// Load all sprite images
function loadImages() {
    const imageNames = [
        'background', 'characterStand', 'characterJump', 'characterCrouch',
        'enemy', 'antenna', 'flag', 'floor', 'obstacle', 'heart', 'coin'
    ];
    
    let loadedCount = 0;
    let errorCount = 0;
    
    imageNames.forEach(name => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            if (loadedCount + errorCount === imageNames.length) {
                imagesLoaded = true;
                initializeGame();
            }
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${name}.png`);
            errorCount++;
            if (loadedCount + errorCount === imageNames.length) {
                imagesLoaded = true;
                initializeGame();
            }
        };
        // Replace old Swiss flag with Swisscom flag asset without changing variable names
        if (name === 'flag') {
            img.src = 'img/swisscom_flag.png';
        } else {
            img.src = `img/${name}.png`;
        }
        images[name] = img;
    });
}

// Load all audio sound effects
function loadSounds() {
    const soundNames = [
        { name: 'jump', path: 'sfx/jump.mp3' },
        { name: 'win', path: 'sfx/win.mp3' },
        { name: 'gameover', path: 'sfx/gameover.mp3' },
        { name: 'coins', path: 'sfx/coins.mp3' },
        { name: 'stomp', path: 'sfx/stomp.mp3' }
    ];
    
    let loadedCount = 0;
    let errorCount = 0;
    
    soundNames.forEach(sound => {
        const audio = new Audio();
        audio.oncanplaythrough = () => {
            loadedCount++;
            if (loadedCount + errorCount === soundNames.length) {
                soundsLoaded = true;
                console.log('All sounds loaded');
            }
        };
        audio.onerror = () => {
            console.error(`Failed to load sound: ${sound.name}.mp3`);
            errorCount++;
            if (loadedCount + errorCount === soundNames.length) {
                soundsLoaded = true;
                console.log('Sound loading completed with errors');
            }
        };
        audio.src = sound.path;
        audio.preload = 'auto';
        audio.volume = 0.5; // Set volume to 50%
        sounds[sound.name] = audio;
    });
}

// Update Lives HUD (DOM-based hearts in top-left)
function updateLivesHUD(lives) {
    try {
        const container = document.getElementById('lives');
        if (!container) return;
        const count = Math.max(0, lives || 0);
        // Replace contents
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const img = document.createElement('img');
            img.src = 'img/heart.png';
            img.alt = 'Life';
            img.className = 'hud-heart';
            container.appendChild(img);
        }
    } catch (e) {
        // Non-fatal UI failure
    }
}

// Enable audio on first user interaction (required for mobile browsers)
function enableAudio() {
    if (!audioEnabled) {
        audioEnabled = true;
        console.log('Audio enabled on first interaction');
        // Try to play a silent sound to unlock audio context
        if (sounds.jump) {
            sounds.jump.volume = 0;
            sounds.jump.play().catch(() => {});
            sounds.jump.volume = 0.5;
        }
    }
}

// Initialize game objects
function initializeGame() {
    try {
        // Floor tile sprite dimensions (actual PNG size, not SPRITE_SCALES)
        // Empty pixels have been removed from floor.png
        const floorTileWidth = 100; // Visible tile width for rendering
        const floorTileHeight = 50; // Visible tile height
        const floorSpriteOffsetX = 0; // No offset - empty pixels removed
        const floorSpriteOffsetY = 0; // No offset - empty pixels removed
        const floorSpriteVisibleWidth = 100; // Visible content width in sprite
        const floorSpriteVisibleHeight = 50; // Visible content height in sprite
        
        // Ground level is higher to avoid overlap with mobile controls
        // Mobile controls take up bottom 20% of screen, so floor starts at 80% height
        // On mobile, account for iPhone URL input field height (44px upward shift)
        const mobileOffset = gameState.isMobile ? 44 : 0;
        const groundY = GAME_CONFIG.height * 0.8 - floorTileHeight + mobileOffset;
        
    // Create player
    player = {
        x: 50,
        y: groundY - SPRITE_SCALES.player.height, // Remove physics box offset - character stands directly on ground
        width: SPRITE_SCALES.player.width * 0.65,
        height: SPRITE_SCALES.player.height * 0.9,
        velocityX: 0,
        velocityY: 0,
        onGround: false,
        sprite: 'characterStand',
        jumpCount: 0, // Track jumps for double jump
        maxJumps: 2 // Allow double jump
    };
        
        // Create ground platforms with proper tile spacing
        // Ensure ground extends far enough to reach the flag on all devices
        const levelMinWidth = 3200; // Must cover flag at x=2800 with some buffer
        const totalGroundWidth = Math.max(GAME_CONFIG.width * 4, levelMinWidth);
        const numTiles = Math.ceil(totalGroundWidth / floorTileWidth);
        for (let i = 0; i < numTiles; i++) {
            platforms.push({
                x: i * floorTileWidth,
                y: groundY,
                width: floorTileWidth,
                height: floorTileHeight,
                type: 'ground',
                spriteOffsetX: floorSpriteOffsetX,
                spriteOffsetY: floorSpriteOffsetY,
                spriteWidth: floorSpriteVisibleWidth,
                spriteHeight: floorSpriteVisibleHeight
            });
        }
        
        // Create floating platforms
        const platformData = [
            { x: 300, y: groundY - 100 },
            { x: 600, y: groundY - 150 },
            { x: 900, y: groundY - 80 },
            { x: 1200, y: groundY - 120 },
            { x: 1500, y: groundY - 100 },
            { x: 1800, y: groundY - 140 },
            { x: 2100, y: groundY - 90 },
            { x: 2400, y: groundY - 110 }
        ];
        
        platformData.forEach(platform => {
            platforms.push({
                x: platform.x,
                y: platform.y,
                width: SPRITE_SCALES.platform.width,
                height: SPRITE_SCALES.platform.height,
                type: 'floating'
            });
        });
        
        // Create enemies
        const enemyData = [
            { x: 400, y: groundY - SPRITE_SCALES.enemy.height, platformIndex: 0 },
            { x: 800, y: groundY - SPRITE_SCALES.enemy.height - 150, platformIndex: 1 },
            { x: 1400, y: groundY - SPRITE_SCALES.enemy.height - 80, platformIndex: 3 },
            { x: 2000, y: groundY - SPRITE_SCALES.enemy.height - 140, platformIndex: 5 }
        ];
        
        enemyData.forEach(enemy => {
            enemies.push({
                x: enemy.x,
                y: enemy.y,
                width: SPRITE_SCALES.enemy.width * 0.7,
                height: SPRITE_SCALES.enemy.height,
                direction: 1,
                speed: 30,
                platformIndex: enemy.platformIndex,
                alive: true
            });
        });
        
        // Create antennas (43px empty at bottom, so position higher)
        const antennaData = [
            { x: 500, y: groundY - SPRITE_SCALES.antenna.height + 43 },
            { x: 1000, y: groundY - SPRITE_SCALES.antenna.height + 43 },
            { x: 1600, y: groundY - SPRITE_SCALES.antenna.height + 43 },
            { x: 2200, y: groundY - SPRITE_SCALES.antenna.height + 43 }
        ];
        
        antennaData.forEach(antenna => {
            antennas.push({
                x: antenna.x,
                y: antenna.y,
                width: SPRITE_SCALES.antenna.width,
                height: SPRITE_SCALES.antenna.height - 43, // Remove empty bottom pixels (140-43=97px visible)
                spriteOffsetY: 0 // No offset needed since we positioned it correctly
            });
        });
        
        // Create flag
        flag = {
            x: 2800,
            y: groundY - SPRITE_SCALES.flag.height,
            width: SPRITE_SCALES.flag.width,
            height: SPRITE_SCALES.flag.height
        };
        
        // Create tiled backgrounds for parallax with 2px overlap (use 3 tiles to avoid gaps)
        backgrounds = [];
        const bgTiles = 3;
        for (let i = 0; i < bgTiles; i++) {
            backgrounds.push({
                x: i * (GAME_CONFIG.width - 2),
                image: images.background,
                mirrored: i % 2 === 1
            });
        }
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Game initialization error:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Don't prevent default if user is typing in an input field (like email input)
        const target = e.target;
        const isInputField = target && (
            target.tagName === 'INPUT' || 
            target.tagName === 'TEXTAREA' || 
            target.isContentEditable
        );
        
        // Only prevent default for game controls, not when typing in inputs
        if (!isInputField && gameState.currentScene === 'play') {
            e.preventDefault();
        }
        
        keys[e.key.toLowerCase()] = true;
        enableAudio(); // Enable audio on first keyboard input
    });
    
    document.addEventListener('keyup', (e) => {
        // Don't prevent default if user is typing in an input field
        const target = e.target;
        const isInputField = target && (
            target.tagName === 'INPUT' || 
            target.tagName === 'TEXTAREA' || 
            target.isContentEditable
        );
        
        // Only prevent default for game controls, not when typing in inputs
        if (!isInputField && gameState.currentScene === 'play') {
            e.preventDefault();
        }
        
        keys[e.key.toLowerCase()] = false;
    });
    
    // UI buttons
    document.getElementById('start-btn').addEventListener('click', () => {
        enableAudio(); // Enable audio on first button click
        startGame();
    });
    
    document.getElementById('restart-btn').addEventListener('click', () => {
        enableAudio(); // Enable audio on first button click
        startGame();
    });
    
    document.getElementById('play-again-btn').addEventListener('click', () => {
        enableAudio(); // Enable audio on first button click
        startGame();
    });
    
    // Victory email submit button
    const emailSubmitBtn = document.getElementById('victory-email-submit');
    if (emailSubmitBtn) {
        emailSubmitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleVictoryEmailSubmit();
        });
    }
    
    // Allow Enter key to submit email form
    const emailInput = document.getElementById('victory-email-input');
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleVictoryEmailSubmit();
            }
        });
    }
    
    // Mobile controls
    if (gameState.isMobile) {
        document.getElementById('btn-left').addEventListener('touchstart', (e) => {
            e.preventDefault();
            enableAudio(); // Enable audio on first touch
            mobileControls.left = true;
        }, { passive: false });
        
        document.getElementById('btn-left').addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileControls.left = false;
        }, { passive: false });
        
        document.getElementById('btn-right').addEventListener('touchstart', (e) => {
            e.preventDefault();
            enableAudio(); // Enable audio on first touch
            mobileControls.right = true;
        }, { passive: false });
        
        document.getElementById('btn-right').addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileControls.right = false;
        }, { passive: false });
        
        document.getElementById('btn-jump').addEventListener('touchstart', (e) => {
            e.preventDefault();
            enableAudio(); // Enable audio on first touch
            mobileControls.jump = true;
        }, { passive: false });
        
        document.getElementById('btn-jump').addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileControls.jump = false;
        }, { passive: false });
        
        document.getElementById('btn-crouch').addEventListener('touchstart', (e) => {
            e.preventDefault();
            mobileControls.crouch = true;
        }, { passive: false });
        
        document.getElementById('btn-crouch').addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileControls.crouch = false;
        }, { passive: false });
    }
}

// Start game
function startGame() {
    // Ensure no lingering end-state sounds when starting/restarting
    stopEndSounds();

    // Reset lives
    gameState.lives = 3;
    // Reset score and coins
    score = 0;
    coins = [];

    gameState.currentScene = 'play';
    gameState.gameStarted = true;
    gameState.gameOver = false;
    gameState.victory = false;
    
    // Hide overlays
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('victory').classList.add('hidden');
    
    // Show mobile controls if needed
    if (gameState.isMobile) {
        document.getElementById('mobile-controls').classList.remove('hidden');
    }
    
    // Reset player position
    // On mobile, account for iPhone URL input field height (44px upward shift)
    const mobileOffset = gameState.isMobile ? 44 : 0;
    const groundY = GAME_CONFIG.height * 0.8 - 50 + mobileOffset; // Use same floorTileHeight as initialization, avoid mobile controls
    player.x = 50;
    player.y = groundY - SPRITE_SCALES.player.height; // Remove physics box offset - character stands directly on ground
    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround = false;
    player.sprite = 'characterStand';
    player.jumpCount = 0; // Reset jump count
    gameState.playerState = 'standing';
    // Reset invulnerability
    player.invulnerableUntil = 0;
    // Update HUD
    try { updateLivesHUD(gameState.lives); } catch (e) {}
    
    // Reset camera
    camera.x = 0;
    camera.targetX = 0;
    
    // Reset enemies
    enemies.forEach(enemy => {
        enemy.alive = true;
    });

    // Spawn coins (5 collectibles, avoid overlaps)
    try {
        // On mobile, account for iPhone URL input field height (44px upward shift)
        const mobileOffset = gameState.isMobile ? 44 : 0;
        const groundY = GAME_CONFIG.height * 0.8 - 50 + mobileOffset;
        spawnCoins(groundY);
    } catch (e) {
        console.error('Error spawning coins:', e);
    }
}

// Game over
function gameOver() {
    gameState.gameOver = true;
    gameState.currentScene = 'gameOver';
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    
    // Play game over sound
    if (audioEnabled && sounds.gameover) {
        // Stop win sound if it was playing
        try { if (sounds.win) { sounds.win.pause(); sounds.win.currentTime = 0; } } catch (e) {}
        sounds.gameover.currentTime = 0;
        sounds.gameover.play().catch(() => {});
    }
}

// Victory
function victory() {
    gameState.victory = true;
    gameState.currentScene = 'victory';
    
    // Get references to all elements first
    const victoryOverlay = document.getElementById('victory');
    const emailForm = document.getElementById('victory-email-form');
    const promoSection = document.getElementById('victory-promo-section');
    const emailInput = document.getElementById('victory-email-input');
    const emailError = document.getElementById('victory-email-error');
    const messageEl = document.getElementById('victory-message');
    const scoreEl = document.getElementById('victory-score');
    const promoEl = document.getElementById('victory-promo');
    
    // Hide promo section FIRST (before showing overlay)
    if (promoSection) {
        promoSection.classList.add('hidden');
    }
    
    // Show email form
    if (emailForm) {
        emailForm.classList.remove('hidden');
    }
    
    // Show overlay
    if (victoryOverlay) {
        victoryOverlay.classList.remove('hidden');
    }
    document.getElementById('mobile-controls').classList.add('hidden');
    
    // Update victory message with score
    try {
        if (messageEl) {
            messageEl.textContent = `Great job scoring ${score} points!`;
        }
        
        // Prepare promo code and discount text (but don't show yet)
        if (scoreEl) {
            scoreEl.textContent = `Final Score: ${score}`;
        }
        if (promoEl) {
            const discount = Math.floor(score * 0.1);
            promoEl.innerHTML = `Your Swisscom promotion code: <strong>SWISSCOM2025</strong><br/>You have <strong>${discount}%</strong> off your next purchase !`;
        }
        
        // Reset email input and error
        if (emailInput) {
            emailInput.value = '';
            emailInput.disabled = false;
        }
        if (emailError) {
            emailError.classList.add('hidden');
        }
        
        // Focus email input after a short delay to ensure overlay is fully visible
        setTimeout(() => {
            if (emailInput) {
                emailInput.focus();
            }
        }, 100);
    } catch (e) {
        // Non-fatal if DOM update fails
        console.error('Error updating victory UI:', e);
    }

    // Play win sound
    if (audioEnabled && sounds.win) {
        // Stop game over sound if it was playing
        try { if (sounds.gameover) { sounds.gameover.pause(); sounds.gameover.currentTime = 0; } } catch (e) {}
        sounds.win.currentTime = 0;
        sounds.win.play().catch(() => {});
    }
}

// Handle email submission for victory screen
function handleVictoryEmailSubmit() {
    try {
        const emailInput = document.getElementById('victory-email-input');
        const emailError = document.getElementById('victory-email-error');
        const emailForm = document.getElementById('victory-email-form');
        const promoSection = document.getElementById('victory-promo-section');
        const instructionText = document.getElementById('victory-instruction');
        
        if (!emailInput || !emailError || !emailForm || !promoSection) {
            return;
        }
        
        const email = emailInput.value.trim();
        
        // Basic email validation (something@domain.tld)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email || !emailRegex.test(email)) {
            // Show error
            emailError.classList.remove('hidden');
            emailInput.focus();
            return;
        }
        
        // Valid email - hide error, hide instruction text, hide email form, show promo code
        emailError.classList.add('hidden');
        if (instructionText) {
            instructionText.classList.add('hidden');
        }
        emailForm.classList.add('hidden');
        promoSection.classList.remove('hidden');
    } catch (e) {
        console.error('Error handling email submit:', e);
    }
}

// Handle input
function handleInput() {
    if (gameState.currentScene !== 'play') return;
    
    // Horizontal movement
    if (keys['arrowleft'] || keys['a'] || mobileControls.left) {
        player.velocityX = -GAME_CONFIG.playerSpeed;
    } else if (keys['arrowright'] || keys['d'] || mobileControls.right) {
        player.velocityX = GAME_CONFIG.playerSpeed;
    } else {
        player.velocityX = 0;
    }
    
    // Jump (including double jump)
    if ((keys['arrowup'] || keys['w'] || mobileControls.jump) && (player.onGround || player.jumpCount < player.maxJumps)) {
        // Make double jump twice as strong
        const jumpPower = player.jumpCount === 0 ? GAME_CONFIG.jumpVelocity : GAME_CONFIG.jumpVelocity * 2;
        player.velocityY = jumpPower;
        player.onGround = false;
        player.jumpCount++;
        gameState.playerState = 'jumping';
        player.sprite = 'characterJump';
        
        // Play jump sound (if enabled and not already playing)
        if (audioEnabled && sounds.jump && sounds.jump.paused) {
            sounds.jump.currentTime = 0;
            sounds.jump.play().catch(() => {});
        }
    }
    
    // Crouch
    if (keys['arrowdown'] || keys['s'] || mobileControls.crouch) {
        gameState.playerState = 'crouching';
        player.sprite = 'characterCrouch';
        player.height = SPRITE_SCALES.player.height * 0.6; // Reduce height when crouching
    } else {
        gameState.playerState = 'standing';
        player.sprite = 'characterStand';
        player.height = SPRITE_SCALES.player.height * 0.9;
    }
}

// Update game logic
function update(deltaTime) {
    try {
        if (gameState.currentScene !== 'play') return;
        
        handleInput();
        
        // Track previous frame values for stomp detection
        player.prevY = player.y;
        player.prevVelY = player.velocityY;
        player.prevBottom = player.prevY + player.height;
        
        // Update player physics
        player.velocityY += GAME_CONFIG.gravity * deltaTime;
        player.x += player.velocityX * deltaTime;
        player.y += player.velocityY * deltaTime;
        
        // Update camera to keep player in left 25% of screen
        const targetPlayerScreenX = GAME_CONFIG.width * 0.25; // Left 25% of screen
        camera.targetX = player.x - targetPlayerScreenX;
        
        // Smooth camera following
        camera.x += (camera.targetX - camera.x) * camera.followSpeed * deltaTime;
        
        // Update player sprite based on state
        if (!player.onGround && player.velocityY !== 0) {
            player.sprite = 'characterJump';
            gameState.playerState = 'jumping';
        } else if (gameState.playerState === 'crouching') {
            player.sprite = 'characterCrouch';
        } else {
            player.sprite = 'characterStand';
            gameState.playerState = 'standing';
        }
        
        // Check ground collision
        player.onGround = false;
        platforms.forEach(platform => {
            if (checkCollision(player, platform)) {
                if (player.velocityY > 0 && player.y < platform.y) {
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.onGround = true;
                    player.jumpCount = 0; // Reset jump count when landing
                    if (gameState.playerState === 'jumping') {
                        gameState.playerState = 'standing';
                        player.sprite = 'characterStand';
                    }
                }
            }
        });
        
        // Update enemies
        enemies.forEach((enemy, index) => {
            if (!enemy.alive) return;
            
            const platform = platforms[platforms.length - enemies.length + index];
            const patrolRange = 100;
            const centerX = platform.x + platform.width / 2;
            
            if (enemy.x < centerX - patrolRange) {
                enemy.direction = 1;
            } else if (enemy.x > centerX + patrolRange) {
                enemy.direction = -1;
            }
            
            enemy.x += enemy.direction * enemy.speed * deltaTime;
        });
        
        // Update backgrounds for seamless parallax scrolling with 2px overlap
        backgrounds.forEach(bg => {
            // If a tile scrolled completely past the left edge, move it after the rightmost tile
            const screenX = bg.x - camera.x * GAME_CONFIG.backgroundScrollSpeed;
            if (screenX <= -GAME_CONFIG.width) {
                const rightmost = backgrounds.reduce((max, b) => Math.max(max, b.x), -Infinity);
                bg.x = rightmost + (GAME_CONFIG.width - 2);
            }
        });
        
        // Check collisions
        checkCollisions();

        // Coin pickup collision (world coordinates)
        const playerCollisionBox = {
            x: player.x,
            y: player.y,
            width: player.width,
            height: player.height
        };
        coins.forEach(c => {
            if (!c.alive) return;
            if (checkCollision(playerCollisionBox, c)) {
                c.alive = false;
                score += 10;
                if (audioEnabled && sounds.coins) {
                    try {
                        sounds.coins.currentTime = 0;
                        sounds.coins.play().catch(() => {});
                    } catch (e) {}
                }
            }
        });
    } catch (error) {
        console.error('Update error:', error);
    }
}

// Check collisions
function checkCollisions() {
    // Create player collision box using WORLD position (not screen position)
    const playerCollisionBox = {
        x: player.x,  // Use world position for collision detection
        y: player.y,
        width: player.width,
        height: player.height
    };
    
    // Enemy collisions (with stomp detection and lives)
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        // Enemy collision box in world coordinates
        const enemyCollisionBox = {
            x: enemy.x,
            y: enemy.y,
            width: enemy.width,
            height: enemy.height
        };
        
        if (checkCollision(playerCollisionBox, enemyCollisionBox)) {
            // Mario-style stomp detection for standard enemies
            const playerBottomPrev = (typeof player.prevBottom === 'number') ? player.prevBottom : (player.y + player.height);
            const enemyTop = enemy.y;
            const downward = (player.prevVelY > 0) || (player.velocityY > 0);
            const fromAbove = playerBottomPrev <= enemyTop + 4; // small tolerance
            
            if (downward && fromAbove) {
                // Stomp success: defeat enemy and bounce
                enemy.alive = false;
                // Add score for defeating enemy
                score += 100;
                player.velocityY = GAME_CONFIG.jumpVelocity * 0.7;
                if (typeof player.jumpCount === 'number') {
                    player.jumpCount = Math.min(player.jumpCount, 1);
                }
                // Play stomp sound
                if (audioEnabled && sounds.stomp) {
                    try {
                        sounds.stomp.currentTime = 0;
                        sounds.stomp.play().catch(() => {});
                    } catch (e) {}
                }
                return; // Do not trigger gameOver this frame for this collision
            } else {
                // Side/bottom contact: lose a life unless invulnerable
                const now = performance.now();
                if (!player.invulnerableUntil || now >= player.invulnerableUntil) {
                    loseLife(enemy);
                }
            }
        }
    });
    
    // Antenna collisions
    antennas.forEach(antenna => {
        // Antenna collision box in world coordinates
        const antennaCollisionBox = {
            x: antenna.x,
            y: antenna.y,
            width: antenna.width,
            height: antenna.height
        };
        
        if (checkCollision(playerCollisionBox, antennaCollisionBox)) {
            const now = performance.now();
            if (!player.invulnerableUntil || now >= player.invulnerableUntil) {
                loseLife(antenna);
            }
        }
    });
    
    // Flag collision
    const flagCollisionBox = {
        x: flag.x,
        y: flag.y,
        width: flag.width,
        height: flag.height
    };
    
    if (checkCollision(playerCollisionBox, flagCollisionBox)) {
        victory();
    }
}

// Collision detection
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function loseLife(source) {
    try {
        if (gameState.currentScene !== 'play') return;
        // Prevent multi-hit within the invulnerability window
        const now = performance.now();
        if (player.invulnerableUntil && now < player.invulnerableUntil) return;
        
        gameState.lives = Math.max(0, (gameState.lives || 0) - 1);
        // Update HUD immediately
        try { updateLivesHUD(gameState.lives); } catch (e) {}
        
        // Set invulnerability (~800ms)
        player.invulnerableUntil = now + 800;
        
        // Apply small knockback and upward bounce
        const knockDir = (source && source.x && player.x > source.x) ? 1 : -1;
        player.velocityX = 250 * knockDir;
        player.velocityY = GAME_CONFIG.jumpVelocity * 0.6;
        player.onGround = false;
        gameState.playerState = 'jumping';
        player.sprite = 'characterJump';
        
        // Trigger game over if no lives left
        if (gameState.lives <= 0) {
            gameOver();
        }
    } catch (e) {
        console.error('loseLife error:', e);
    }
}

// Spawn coins avoiding overlaps with enemies, antennas, platforms, and flag
function spawnCoins(groundY) {
    const numCoins = 5;
    const minX = 500;
    const maxX = 2700;
    const minY = groundY - 220;
    const maxY = groundY - 120;
    const coinSize = 40;
    const maxAttempts = 50;
    
    coins = [];
    for (let i = 0; i < numCoins; i++) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts++ < maxAttempts) {
            const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
            const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
            const candidate = { x, y, width: coinSize, height: coinSize, alive: true, bobPhase: Math.random() * Math.PI * 2 };
            
            // Check overlap against platforms
            let overlaps = platforms.some(p => checkCollision(candidate, p));
            // Enemies
            if (!overlaps) overlaps = enemies.some(e => e.alive && checkCollision(candidate, e));
            // Antennas: avoid any collision AND avoid same x coordinate
            if (!overlaps) overlaps = antennas.some(a => checkCollision(candidate, a) || candidate.x === a.x);
            // Flag
            if (!overlaps) overlaps = checkCollision(candidate, flag);
            
            if (!overlaps) {
                coins.push(candidate);
                placed = true;
            }
        }
        if (!placed) {
            // Fallback: push even if overlapping to avoid infinite loop
            coins.push({ x: minX + i * ((maxX - minX) / numCoins), y: minY, width: coinSize, height: coinSize, alive: true, bobPhase: Math.random() * Math.PI * 2 });
        }
    }
}

// Render game
function render() {
    try {
        // Clear canvas
        ctx.fillStyle = '#001155';
        ctx.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        
        // Only render game objects if in play mode and game is initialized
        if (gameState.currentScene === 'play' && player) {
        // Draw backgrounds with camera offset
        backgrounds.forEach(bg => {
            const bgX = bg.x - camera.x * GAME_CONFIG.backgroundScrollSpeed;
            if (bg.mirrored) {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(bg.image, -bgX - GAME_CONFIG.width, 0, GAME_CONFIG.width, GAME_CONFIG.height);
                ctx.restore();
            } else {
                ctx.drawImage(bg.image, bgX, 0, GAME_CONFIG.width, GAME_CONFIG.height);
            }
        });
            
            // Draw platforms with camera offset
            platforms.forEach(platform => {
                const platformX = platform.x - camera.x;
                if (platform.type === 'ground') {
                    // Draw floor tile with sprite offset to show only the visible content
                    if (platform.spriteWidth && platform.spriteHeight) {
                        ctx.drawImage(
                            images.floor, 
                            platform.spriteOffsetX, 
                            platform.spriteOffsetY, 
                            platform.spriteWidth, 
                            platform.spriteHeight,
                            platformX, 
                            platform.y, 
                            platform.width, 
                            platform.height
                        );
                    } else {
                        ctx.drawImage(images.floor, platformX, platform.y, platform.width, platform.height);
                    }
                } else {
                    ctx.drawImage(images.obstacle, platformX, platform.y, platform.width, platform.height);
                }
            });
            
            // Draw enemies with camera offset
            enemies.forEach(enemy => {
                if (enemy.alive) {
                    ctx.drawImage(images.enemy, enemy.x - camera.x, enemy.y, enemy.width, enemy.height);
                }
            });
            
            // Draw coins with bobbing (world -> screen transform)
            if (images.coin) {
                const t = performance.now();
                const amplitude = 7; // ~6–8px
                const speed = 0.002; // radians per ms
                coins.forEach(c => {
                    if (!c.alive) return;
                    const bob = Math.sin(t * speed + (c.bobPhase || 0)) * amplitude;
                    ctx.drawImage(images.coin, c.x - camera.x, c.y + bob, c.width, c.height);
                });
            }
            
            // Draw antennas with camera offset
            antennas.forEach(antenna => {
                ctx.drawImage(images.antenna, antenna.x - camera.x, antenna.y, antenna.width, antenna.height);
            });
            
            // Draw flag with camera offset
            ctx.drawImage(images.flag, flag.x - camera.x, flag.y, flag.width, flag.height);
            
            // Draw player (no camera offset - player stays in fixed screen position)
            const playerScreenX = GAME_CONFIG.width * 0.25; // Left 25% of screen
            // Flash player during invulnerability (~every 100ms)
            const now = performance.now();
            const flashing = player.invulnerableUntil && now < player.invulnerableUntil && (Math.floor(now / 100) % 2 === 0);
            if (flashing) {
                ctx.save();
                ctx.globalAlpha = 0.4;
            }
            ctx.drawImage(images[player.sprite], playerScreenX, player.y, player.width, player.height);
            if (flashing) {
                ctx.restore();
            }
        }
        
        // Draw Heart UI (top-left, pinned to viewport) - disabled for simplified death system
        // Hearts remain visible in assets but not displayed (lives system disabled)
        // if (images.heart && gameState.currentScene !== 'start') {
        //     const heartW = Math.min(60, GAME_CONFIG.width * 0.08);
        //     const ratio = images.heart.height > 0 ? (images.heart.height / images.heart.width) : 1;
        //     const heartH = heartW * ratio;
        //     const spacing = 12;
        //     const margin = 16;
        //     // On mobile, push HUD a bit lower to keep it fully visible
        //     const hudTop = gameState.isMobile ? 64 : margin;
        //     for (let i = 0; i < (gameState.lives || 0); i++) {
        //         const x = margin + i * (heartW + spacing);
        //         const y = hudTop;
        //         ctx.drawImage(images.heart, x, y, heartW, heartH);
        //     }
        // }

        // Draw Score HUD (top-right, pinned to viewport)
        if (gameState.currentScene !== 'start') {
            const text = `Score: ${score}`;
            ctx.font = '32px Arial';
            ctx.textBaseline = 'top';
            const margin = 16;
            const x = GAME_CONFIG.width - margin;
            // On mobile, push HUD a bit lower to keep it fully visible
            const y = gameState.isMobile ? 64 : margin;
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.fillStyle = '#3aa0ff';
            const metrics = ctx.measureText(text);
            // Stroke and fill aligned right
            ctx.strokeText(text, x - metrics.width, y);
            ctx.fillText(text, x - metrics.width, y);
        }
    } catch (error) {
        console.error('Render error:', error);
    }
}

// Game loop
function gameLoop() {
    try {
        const currentTime = performance.now();
        const deltaTime = (currentTime - (gameLoop.lastTime || currentTime)) / 1000;
        gameLoop.lastTime = currentTime;
        
        // Limit delta time to prevent large jumps
        const clampedDeltaTime = Math.min(deltaTime, 0.1);
        
        // Only run update/render if images are loaded and game is initialized
        if (imagesLoaded && player && gameState.currentScene === 'play') {
            update(clampedDeltaTime);
            render();
        } else if (gameState.currentScene === 'start') {
            // Just render the start screen background
            render();
        }
        
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Game loop error:', error);
        // Stop the game loop on error to prevent crashes
    }
}