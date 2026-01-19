const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const playAgainButton = document.getElementById('playAgainButton');

// Game variables.
let snake = [{ x: 100, y: 100 }];  // Start closer to top-left to ensure visibility.
let direction = { x: 20, y: 0 };
let food = { x: 300, y: 100 };
let score = 0;
let gameActive = true;
let keys = {};

// Function to resize canvas to match CSS.
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;  // Set drawing width to CSS width.
    canvas.height = canvas.offsetHeight;  // Set drawing height to CSS height.
}
window.addEventListener('resize', resizeCanvas);  // Handle window resize.
resizeCanvas();  // Initial resize.

// Function to draw the snake.
function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, 20, 20);
    });
}

// Function to draw the food.
function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, 20, 20);
}

// Function to update game state.
function update() {
    if (!gameActive) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = `Score: ${score}`;
        food = {
            x: Math.floor(Math.random() * (canvas.width / 20)) * 20,
            y: Math.floor(Math.random() * (canvas.height / 20)) * 20
        };
    } else {
        snake.pop();
    }

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        gameActive = false;
        modalMessage.textContent = `Game Over! Score: ${score}`;
        modal.style.display = 'block';
    }
}

// Function to draw everything.
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
}

// Main game loop.
function gameLoop() {
    update();
    draw();
    if (gameActive) setTimeout(gameLoop, 100);
}

// Event listeners.
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -20 };
    if (e.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: 20 };
    if (e.key === 'ArrowLeft' && direction.x === 0) direction = { x: -20, y: 0 };
    if (e.key === 'ArrowRight' && direction.x === 0) direction = { x: 20, y: 0 };
});

playAgainButton.addEventListener('click', () => {
    snake = [{ x: 100, y: 100 }];
    direction = { x: 20, y: 0 };
    food = { x: 300, y: 100 };
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameActive = true;
    modal.style.display = 'none';
    gameLoop();
});

// Start the game.
gameLoop();