const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const playAgainButton = document.getElementById('playAgainButton');

// Game variables.
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece = null;
let score = 0;
let gameActive = true;
let dropTime = 0;
let dropInterval = 500;  // Milliseconds between drops.

// Tetromino shapes (I, O, T, S, Z, J, L).
const SHAPES = [
    [[1, 1, 1, 1]],  // I
    [[1, 1], [1, 1]],  // O
    [[0, 1, 0], [1, 1, 1]],  // T
    [[0, 1, 1], [1, 1, 0]],  // S
    [[1, 1, 0], [0, 1, 1]],  // Z
    [[1, 0, 0], [1, 1, 1]],  // J
    [[0, 0, 1], [1, 1, 1]]   // L
];
const COLORS = ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'];

// Function to resize canvas.
function resizeCanvas() {
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
}
resizeCanvas();

// Function to create a new piece.
function createPiece() {
    const index = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[index],
        color: COLORS[index],
        x: Math.floor(COLS / 2) - 1,
        y: 0
    };
}

// Function to draw the board.
function drawBoard() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#000';
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

// Function to draw the current piece.
function drawPiece(piece) {
    ctx.fillStyle = piece.color;
    piece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                ctx.fillRect((piece.x + dx) * BLOCK_SIZE, (piece.y + dy) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#000';
                ctx.strokeRect((piece.x + dx) * BLOCK_SIZE, (piece.y + dy) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

// Function to check collision.
function collide(piece, board, dx = 0, dy = 0) {
    return piece.shape.some((row, dy2) => {
        return row.some((value, dx2) => {
            if (value) {
                const x = piece.x + dx2 + dx;
                const y = piece.y + dy2 + dy;
                return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x]);
            }
            return false;
        });
    });
}

// Function to merge piece into board.
function merge(piece, board) {
    piece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                board[piece.y + dy][piece.x + dx] = piece.color;
            }
        });
    });
}

// Function to clear lines.
function clearLines(board) {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;  // Check the same row again.
        }
    }
    return linesCleared;
}

// Function to rotate piece.
function rotate(piece) {
    const rotated = piece.shape[0].map((_, index) => piece.shape.map(row => row[index]).reverse());
    const rotatedPiece = { ...piece, shape: rotated };
    if (!collide(rotatedPiece, board)) {
        piece.shape = rotated;
    }
}

// Function to update game.
function update(time = 0) {
    if (!gameActive) return;

    const deltaTime = time - dropTime;
    if (deltaTime > dropInterval) {
        if (!collide(currentPiece, board, 0, 1)) {
            currentPiece.y++;
        } else {
            merge(currentPiece, board);
            const lines = clearLines(board);
            score += lines * 100;  // Score per line.
            scoreElement.textContent = `Score: ${score}`;
            currentPiece = createPiece();
            if (collide(currentPiece, board)) {
                gameActive = false;
                modalMessage.textContent = `Game Over! Score: ${score}`;
                modal.style.display = 'block';
            }
        }
        dropTime = time;
    }

    draw();
    requestAnimationFrame(update);
}

// Function to draw everything.
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    if (currentPiece) drawPiece(currentPiece);
}

// Event listeners.
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    if (e.key === 'ArrowLeft' && !collide(currentPiece, board, -1, 0)) currentPiece.x--;
    if (e.key === 'ArrowRight' && !collide(currentPiece, board, 1, 0)) currentPiece.x++;
    if (e.key === 'ArrowDown' && !collide(currentPiece, board, 0, 1)) currentPiece.y++;
    if (e.key === 'ArrowUp') rotate(currentPiece);
    draw();
});

playAgainButton.addEventListener('click', () => {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentPiece = createPiece();
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameActive = true;
    modal.style.display = 'none';
    update();
});

// Start the game.
currentPiece = createPiece();
update();