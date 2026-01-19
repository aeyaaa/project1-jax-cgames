const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const playAgainButton = document.getElementById('playAgainButton');

// Game variables.
let car = { x: 50, y: 150, width: 150, height: 45, speed: 8 };  // Car position, size, and speed. Adjust width/height to match your image.
let obstacles = [];
let score = 0;
let gameActive = true;
let keys = {};

// Load images (uncomment and update filenames as needed).
const carImage = new Image();  // Creates a new Image object for the car.
carImage.src = '/images/car.png';  // Sets the source to your uploaded car image file. Change 'car.png' to your filename (e.g., 'my-car.jpg').
let carImageLoaded = false;  // Flag to check if image is loaded.
carImage.onload = () => { carImageLoaded = true; console.log('Car image loaded'); };  // Logs when image is ready. Add error handling if needed: carImage.onerror = () => console.error('Failed to load car image');

// Optional: Load obstacle images (uncomment for stones/ramps).
// const stoneImage = new Image();
// stoneImage.src = 'stone.png';  // Upload and set your stone image.
// const rampImage = new Image();
// rampImage.src = 'ramp.png';  // Upload and set your ramp image.

// Function to draw the car.
function drawCar() {
    if (carImageLoaded) {
        ctx.drawImage(carImage, car.x, car.y, car.width, car.height);  // Draws the image if loaded, scaled to car size.
    } else {
        ctx.fillStyle = 'red';  // Fallback: Draws a red rectangle if image isn't loaded yet.
        ctx.fillRect(car.x, car.y, car.width, car.height);
    }
}

// Function to draw obstacles (keeps rectangles for now; uncomment image lines for custom graphics).
function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'stone') {
            ctx.fillStyle = 'gray';  // Gray rectangle for stone.
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            // Uncomment for image: if (stoneImage.complete) ctx.drawImage(stoneImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else if (obstacle.type === 'ramp') {
            ctx.fillStyle = 'brown';  // Brown rectangle for ramp.
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            // Uncomment for image: if (rampImage.complete) ctx.drawImage(rampImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    });
}

// Function to update game state (unchanged).
function update() {
    if (!gameActive) return;

    if (keys['ArrowUp'] && car.y > 0) car.y -= car.speed;
    if (keys['ArrowDown'] && car.y < canvas.height - car.height) car.y += car.speed;

    obstacles.forEach(obstacle => {
        obstacle.x -= 5;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x > -obstacle.width);

    if (Math.random() < 0.04) {
        const type = Math.random() < 0.5 ? 'stone' : 'ramp';
        obstacles.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 50),
            width: 60,
            height: 30,
            type: type
        });
    }

    obstacles.forEach(obstacle => {
        if (car.x < obstacle.x + obstacle.width &&
            car.x + car.width > obstacle.x &&
            car.y < obstacle.y + obstacle.height &&
            car.y + car.height > obstacle.y) {
            gameActive = false;
            modalMessage.textContent = `Game Over! Score: ${score}`;
            modal.style.display = 'block';
        }
    });

    score++;
    scoreElement.textContent = `Score: ${score}`;
}

// Function to draw everything (unchanged).
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCar();
    drawObstacles();
}

// Main game loop (unchanged).
function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

// Event listeners (unchanged).
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);
playAgainButton.addEventListener('click', () => {
    car.y = 150;
    obstacles = [];
    score = 0;
    gameActive = true;
    modal.style.display = 'none';
    gameLoop();
});

// Start the game (unchanged).
gameLoop();