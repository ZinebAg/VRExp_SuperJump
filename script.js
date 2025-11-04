// Theme Toggle Functionality
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }
    
    init() {
        // Set initial theme
        this.setTheme(this.currentTheme);
        
        // Add event listener
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update toggle button state
        this.updateToggleButton();
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
    
    updateToggleButton() {
        const lightIcon = this.themeToggle.querySelector('.light-icon');
        const darkIcon = this.themeToggle.querySelector('.dark-icon');
        
        if (this.currentTheme === 'dark') {
            lightIcon.style.opacity = '0';
            darkIcon.style.opacity = '1';
        } else {
            lightIcon.style.opacity = '1';
            darkIcon.style.opacity = '0';
        }
    }
}

// Smooth scrolling and animations
class AnimationManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Add scroll animations
        this.setupScrollAnimations();
        
        // Add hover effects
        this.setupHoverEffects();
        
        // Add loading animation
        this.setupLoadingAnimation();
    }
    
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
    
    setupHoverEffects() {
        // Add hover effects to interactive elements
        document.querySelectorAll('.feature-card, .theme-toggle-btn').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-2px)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0)';
            });
        });
    }
    
    setupLoadingAnimation() {
        // Add a subtle loading animation to the game preview
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            gameArea.style.opacity = '0';
            gameArea.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                gameArea.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                gameArea.style.opacity = '1';
                gameArea.style.transform = 'scale(1)';
            }, 500);
        }
    }
}

// Performance optimization
class PerformanceManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Optimize animations for better performance
        this.optimizeAnimations();
        
        // Add lazy loading for future content
        this.setupLazyLoading();
    }
    
    optimizeAnimations() {
        // Use requestAnimationFrame for smooth animations
        const animate = () => {
            // Any custom animations can be added here
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    setupLazyLoading() {
        // Prepare for future image lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });
            
            // Observe any lazy images in the future
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager
    new ThemeManager();
    
    // Initialize animation manager
    new AnimationManager();
    
    // Initialize performance manager
    new PerformanceManager();
    
    // Add a subtle entrance animation
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
    }, 100);
});

// Add keyboard accessibility
document.addEventListener('keydown', (e) => {
    // Toggle theme with Ctrl/Cmd + T
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        document.getElementById('theme-toggle').click();
    }
});

// Add touch gestures for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Swipe up to toggle theme (mobile gesture)
    if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
        document.getElementById('theme-toggle').click();
    }
    
    touchStartX = 0;
    touchStartY = 0;
});
