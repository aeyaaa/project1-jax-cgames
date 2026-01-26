const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const playAgainButton = document.getElementById('playAgainButton');

// Game variables.
const ROWS = 12;
const COLS = 15;
const BUBBLE_RADIUS = 15;
let bubbles = [];
let shooter = { x: canvas.width / 2, y: canvas.height - 50, angle: 0 };
let currentBubble = null;
let score = 0;
let gameActive = true;
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

// Function to resize canvas.
function resizeCanvas() {
    canvas.width = COLS * BUBBLE_RADIUS * 2;
    canvas.height = ROWS * BUBBLE_RADIUS * 2 + 100;  // Extra for shooter.
}
resizeCanvas();

// Function to create bubbles grid.
function createBubbles() {
    bubbles = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (Math.random() < 0.7) {  // 70% chance for bubble.
                const x = col * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS;
                const y = row * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS;
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                bubbles.push({ x, y, color, row, col });
            }
        }
    }
}

// Function to draw bubbles.
function drawBubbles() {
    bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    });
}

// Function to draw shooter.
function drawShooter() {
    ctx.beginPath();
    ctx.arc(shooter.x, shooter.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();
    // Aim line.
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
        currentBubble = { x: shooter.x, y: shooter.y, vx: Math.cos(shooter.angle) * 5, vy: Math.sin(shooter.angle) * 5, color };
    }
}

// Function to update bubble movement.
function updateBubble() {
    if (currentBubble) {
        currentBubble.x += currentBubble.vx;
        currentBubble.y += currentBubble.vy;
        // Check collision with bubbles.
        for (let bubble of bubbles) {
            const dx = currentBubble.x - bubble.x;
            const dy = currentBubble.y - bubble.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < BUBBLE_RADIUS * 2) {
                // Snap to grid.
                const col = Math.round((currentBubble.x - BUBBLE_RADIUS) / (BUBBLE_RADIUS * 2));
                const row = Math.round((currentBubble.y - BUBBLE_RADIUS) / (BUBBLE_RADIUS * 2));
                currentBubble.x = col * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS;
                currentBubble.y = row * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS;
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
        // Check neighbors.
        const neighbors = bubbles.filter(nb => {
            const dx = Math.abs(nb.x - b.x);
            const dy = Math.abs(nb.y - b.y);
            return dx <= BUBBLE_RADIUS * 2 && dy <= BUBBLE_RADIUS * 2 && (dx > 0 || dy > 0);
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
        // Check for floating bubbles.
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
            return dx <= BUBBLE_RADIUS * 2 && dy <= BUBBLE_RADIUS * 2 && (dx > 0 || dy > 0);
        });
        neighbors.forEach(nb => {
            if (!visited.has(nb)) dfs(nb);
        });
    }
    // Start from top row.
    const topBubbles = bubbles.filter(b => b.row === 0);
    topBubbles.forEach(b => dfs(b));
    // Remove unvisited (floating).
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