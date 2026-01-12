const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

// Utility for random range
const random = (min, max) => Math.random() * (max - min) + min;

// Easing function for smooth animation
const easeOutQuart = (t) => 1 - (--t) * t * t * t;

class Flower {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.targetSize = size;
        this.color = color;
        this.growth = 0;
        this.bloom = 0;
        this.maxHeight = random(height * 0.3, height * 0.7); // Taller stems

        // Control points for bezier curve stem
        this.cp1x = this.x + random(-50, 50);
        this.cp1y = this.y - this.maxHeight * 0.3;
        this.cp2x = this.x + random(-50, 50);
        this.cp2y = this.y - this.maxHeight * 0.6;
        this.endX = this.x + random(-30, 30);
        this.endY = this.y - this.maxHeight;

        this.stemThickness = random(2, 4);

        // Flower properties
        this.petalCount = Math.floor(random(5, 12));
        this.angleOffset = random(0, Math.PI * 2);

        // Sway properties
        this.swaySpeed = random(0.001, 0.003);
        this.swayOffset = random(0, Math.PI * 2);
        this.currentSway = 0;
    }

    update(time) {
        if (this.growth < 1) {
            this.growth += 0.005 + random(0.001, 0.003); // Slow stem growth
        } else if (this.bloom < 1) {
            this.bloom += 0.008 + random(0.001, 0.003); // Blooming
        }

        // Calculate sway based on time
        // Only sway significantly after some growth to avoid weird root movement
        if (this.growth > 0.5) {
            this.currentSway = Math.sin(time * this.swaySpeed + this.swayOffset) * 20 * this.growth;
        }
    }

    draw(ctx) {
        const growthEased = easeOutQuart(this.growth);

        // Apply sway to the end points and control points for a wind effect
        // The base (this.x, this.y) stays still.
        // The top moves the most.

        let swayX = this.currentSway;

        const currentEndX = this.x + (this.endX - this.x) * growthEased + swayX;
        const currentEndY = this.y + (this.endY - this.y) * growthEased;

        const currentCp1y = this.y + (this.cp1y - this.y) * growthEased;
        const currentCp2y = this.y + (this.cp2y - this.y) * growthEased;

        // Sway control points less than the tip
        const currentCp1x = this.cp1x + swayX * 0.3;
        const currentCp2x = this.cp2x + swayX * 0.6;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.bezierCurveTo(currentCp1x, currentCp1y, currentCp2x, currentCp2y, currentEndX, currentEndY);

        ctx.strokeStyle = '#2ecc71'; // Green stem
        ctx.lineWidth = this.stemThickness * (1 - this.growth * 0.5) + 1; // Taper slightly
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw Flower head if stem is done
        if (this.growth > 0.98) {
            const bloomEased = easeOutQuart(this.bloom);
            const currentSize = this.targetSize * bloomEased;

            ctx.save();
            ctx.translate(currentEndX, currentEndY); // Translate to the swaying tip

            // Add sway rotation to the flower head too
            // Rotate slightly with the sway direction
            const swayRotation = this.currentSway * 0.02;

            ctx.rotate(this.angleOffset + bloomEased * 0.5 + swayRotation);

            ctx.fillStyle = this.color;
            for (let i = 0; i < this.petalCount; i++) {
                ctx.save();
                ctx.rotate((Math.PI * 2 / this.petalCount) * i);
                ctx.beginPath();
                // Draw petal
                ctx.ellipse(0, currentSize / 2, currentSize / 4, currentSize / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Center
            ctx.beginPath();
            ctx.arc(0, 0, currentSize / 5, 0, Math.PI * 2);
            ctx.fillStyle = '#f1c40f'; // Yellow center
            ctx.fill();

            ctx.restore();
        }
    }
}

const flowers = [];
const flowerColors = [
    '#e74c3c', // Red
    '#9b59b6', // Purple
    '#3498db', // Blue
    '#e91e63', // Pink
    '#f39c12'  // Orange
];

function init() {
    const totalFlowers = Math.floor(width / 40); // Dense garden
    for (let i = 0; i < totalFlowers; i++) {
        const x = random(0, width);
        const y = height + 20;
        const size = random(20, 40);
        const color = flowerColors[Math.floor(random(0, flowerColors.length))];
        flowers.push(new Flower(x, y, size, color));
    }
    animate();

    // Trigger text logic
    // We assume most flowers take about 4-5 seconds to fully bloom
    setTimeout(() => {
        const title = document.getElementById('bdayText');
        const apology = document.getElementById('apologyText');
        if (title) title.classList.add('visible');
        if (apology) apology.classList.add('visible');
    }, 5000);
}

function animate(time) {
    ctx.clearRect(0, 0, width, height);

    flowers.forEach(flower => {
        flower.update(time); // Pass time to update function
        flower.draw(ctx);
    });

    requestAnimationFrame(animate);
}

init();
