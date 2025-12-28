// ============================================
// ENHANCED STARFIELD WITH PROCEDURAL GENERATION
// 150 stars with randomized positions, sizes, and animation timings
// ============================================

const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let stars = [];
let animationFrameId;

// Star colors from the palette
const starColors = [
    '#e8e6e1', // starlight (primary) - 80%
    '#c9c5bc', // moonbeam - 10%
    '#22d3ee', // aurora cyan - 5%
    '#2dd4bf', // seafoam - 5%
];

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}

// Enhanced Star class with more variation
class Star {
    constructor() {
        // Random position (0-100%)
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        // Random size (1-3px) with weighted distribution
        // 70% small, 25% medium, 5% large
        const sizeRoll = Math.random();
        if (sizeRoll < 0.7) {
            this.radius = Math.random() * 0.8 + 0.4; // Small stars (0.4-1.2px)
        } else if (sizeRoll < 0.95) {
            this.radius = Math.random() * 1 + 1.2; // Medium stars (1.2-2.2px)
        } else {
            this.radius = Math.random() * 1 + 2.2; // Large stars (2.2-3.2px)
        }

        // Random animation duration (2-6 seconds)
        this.twinkleDuration = Math.random() * 4 + 2;
        this.twinkleSpeed = (1 / (this.twinkleDuration * 60)) * 2; // Adjust for ~60fps

        // Random animation delay (0-4 seconds) so stars don't all twinkle together
        this.animationOffset = Math.random() * 4;
        this.time = this.animationOffset;

        // Opacity range
        this.minOpacity = Math.random() * 0.2 + 0.1;
        this.maxOpacity = Math.random() * 0.6 + 0.4;
        this.opacity = this.minOpacity;

        // Star color with weighted distribution
        // 80% starlight, 10% moonbeam, 5% aurora cyan, 5% seafoam
        const colorRoll = Math.random();
        if (colorRoll < 0.8) {
            this.color = starColors[0]; // 80% starlight
        } else if (colorRoll < 0.9) {
            this.color = starColors[1]; // 10% moonbeam
        } else if (colorRoll < 0.95) {
            this.color = starColors[2]; // 5% aurora cyan
        } else {
            this.color = starColors[3]; // 5% seafoam
        }

        // Very subtle drift movement for dynamic feel
        this.velocityX = (Math.random() - 0.5) * 0.03;
        this.velocityY = (Math.random() - 0.5) * 0.03;
    }

    update() {
        // Smooth twinkle effect using sine wave
        this.time += this.twinkleSpeed;
        const phase = (Math.sin(this.time) + 1) / 2; // Convert sine (-1 to 1) to (0 to 1)
        this.opacity = this.minOpacity + (this.maxOpacity - this.minOpacity) * phase;

        // Subtle drift movement
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add subtle glow for larger stars
        if (this.radius > 1.5) {
            ctx.globalAlpha = this.opacity * 0.25;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// Initialize stars
function initStars() {
    stars = [];
    // Fixed star count of 150 stars (as specified)
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.update();
        star.draw();
    });

    animationFrameId = requestAnimationFrame(animate);
}

// Handle window resize
window.addEventListener('resize', () => {
    cancelAnimationFrame(animationFrameId);
    resizeCanvas();
    animate();
});

// Initialize
resizeCanvas();
animate();
