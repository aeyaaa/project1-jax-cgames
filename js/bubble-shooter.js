const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const playAgainButton = document.getElementById('playAgainButton');

// Game variables.
const BUBBLE_RADIUS = 15;
const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
let ROWS, COLS;
let bubbles = [];
let shooter = { x: 0, y: 0, angle: -Math.PI / 2 };
let currentBubble = null;
let score = 0;
let gameActive = true;
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

// Function to resize canvas and calculate grid.
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    shooter.x = canvas.width / 2;
    shooter.y = canvas.height - 50;
    COLS = Math.floor(canvas.width / BUBBLE_DIAMETER);
    ROWS = Math.floor((canvas.height - 100) / BUBBLE_DIAMETER);
}
window.addEventListener('resize', () => {
    resizeCanvas();
    createBubbles();
});
resizeCanvas();

// Function to create bubbles grid.
function createBubbles() {
    bubbles = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (Math.random() < 0.7) {
                const x = col * BUBBLE_DIAMETER + BUBBLE_RADIUS;
                const y = row * BUBBLE_DIAMETER + BUBBLE_RADIUS;
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                bubbles.push({ x, y, color, row, col, flash: false });  // Add flash property.
            }
        }
    }
}

// Function to draw bubbles (with flash effect).
function drawBubbles() {
    bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = bubble.flash ? 'white' : bubble.color;  // Flash white if hit.
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        if (bubble.flash) bubble.flash = false;  // Reset flash after one frame.
    });
}

// Function to draw shooter.
function drawShooter() {
    ctx.beginPath();
    ctx.arc(shooter.x, shooter.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();
    const endX = shooter.x + Math.cos(shooter.angle) * 50;
    const endY = shooter.y + Math.sin(shooter.angle) * 50;
    ctx.beginPath();
    ctx.moveTo(shooter.x, shooter.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'white';
    ctx.stroke();
}

// Function to shoot bubble.
function shootBubble() {
    if (!currentBubble) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        currentBubble = { x: shooter.x, y: shooter.y, vx: Math.cos(shooter.angle) * 10, vy: Math.sin(shooter.angle) * 10, color };
    }
}

// Function to update bubble movement (bang effect on hit, no bounce back).
function updateBubble() {
    if (currentBubble) {
        currentBubble.x += currentBubble.vx;
        currentBubble.y += currentBubble.vy;
        // Check collision with bubbles.
        for (let bubble of bubbles) {
            const dx = currentBubble.x - bubble.x;
            const dy = currentBubble.y - bubble.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < BUBBLE_DIAMETER) {
                // Bang effect: Flash the hit bubble white.
                bubble.flash = true;
                // No bounce back - just snap the shot bubble immediately.
                const col = Math.round((currentBubble.x - BUBBLE_RADIUS) / BUBBLE_DIAMETER);
                const row = Math.round((currentBubble.y - BUBBLE_RADIUS) / BUBBLE_DIAMETER);
                currentBubble.x = col * BUBBLE_DIAMETER + BUBBLE_RADIUS;
                currentBubble.y = row * BUBBLE_DIAMETER + BUBBLE_RADIUS;
                currentBubble.row = row;
                currentBubble.col = col;
                bubbles.push(currentBubble);
                checkMatches(currentBubble);
                currentBubble = null;
                break;
            }
        }
        // Check boundaries.
        if (currentBubble && (currentBubble.x < 0 || currentBubble.x > canvas.width || currentBubble.y < 0)) {
            currentBubble = null;
        }
    }
}

// Function to check matches.
function checkMatches(bubble) {
    const matches = [];
    const visited = new Set();
    function dfs(b, color) {
        if (visited.has(b) || b.color !== color) return;
        visited.add(b);
        matches.push(b);
        const neighbors = bubbles.filter(nb => {
            const dx = Math.abs(nb.x - b.x);
            const dy = Math.abs(nb.y - b.y);
            return dx <= BUBBLE_DIAMETER && dy <= BUBBLE_DIAMETER && (dx > 0 || dy > 0);
        });
        neighbors.forEach(nb => dfs(nb, color));
    }
    dfs(bubble, bubble.color);
    if (matches.length >= 3) {
        matches.forEach(m => {
            const index = bubbles.indexOf(m);
            if (index > -1) bubbles.splice(index, 1);
        });
        score += matches.length * 10;
        scoreElement.textContent = `Score: ${score}`;
        checkFloating();
    }
}

// Function to check floating bubbles.
function checkFloating() {
    const visited = new Set();
    function dfs(b) {
        visited.add(b);
        const neighbors = bubbles.filter(nb => {
            const dx = Math.abs(nb.x - b.x);
            const dy = Math.abs(nb.y - b.y);
            return dx <= BUBBLE_DIAMETER && dy <= BUBBLE_DIAMETER && (dx > 0 || dy > 0);
        });
        neighbors.forEach(nb => {
            if (!visited.has(nb)) dfs(nb);
        });
    }
    const topBubbles = bubbles.filter(b => b.row === 0);
    topBubbles.forEach(b => dfs(b));
    bubbles = bubbles.filter(b => visited.has(b));
}

// Function to draw everything.
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBubbles();
    drawShooter();
    if (currentBubble) {
        ctx.beginPath();
        ctx.arc(currentBubble.x, currentBubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = currentBubble.color;
        ctx.fill();
        ctx.stroke();
    }
}

// Main game loop.
function gameLoop() {
    updateBubble();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

// Event listeners.
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    shooter.angle = Math.atan2(mouseY - shooter.y, mouseX - shooter.x);
});

canvas.addEventListener('click', shootBubble);

playAgainButton.addEventListener('click', () => {
    createBubbles();
    currentBubble = null;
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameActive = true;
    modal.style.display = 'none';
    gameLoop();
});

// Start the game.
createBubbles();
gameLoop();