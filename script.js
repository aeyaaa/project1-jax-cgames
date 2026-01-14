const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const playAgainButton = document.getElementById('playAgainButton');

let currentPlayer = 'X';
let gameBoard = Array(9).fill(null);
let gameActive = true;

function getPlayerName(symbol) {
    return symbol === 'X' ? 'Player 1' : 'Player 2';
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return gameBoard[a];
        }
    }
    return null;
}

function isDraw() {
    return gameBoard.every(cell => cell !== null);
}

function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute('data-index'));
    
    if (gameBoard[index] === null && gameActive) {
        gameBoard[index] = currentPlayer;
        cell.textContent = currentPlayer;
        
        const winner = checkWinner();
        if (winner) {
            modalMessage.textContent = `${getPlayerName(winner)} wins!`;
            modal.style.display = 'block';  // Shows modal
            gameActive = false;
            console.log('Winner detected, modal shown');  // Debug log
        } else if (isDraw()) {
            modalMessage.textContent = "It's a draw!";
            modal.style.display = 'block';  // Shows modal
            gameActive = false;
            console.log('Draw detected, modal shown');  // Debug log
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            message.textContent = `${getPlayerName(currentPlayer)}'s turn`;
        }
    }
}

function resetGame() {
    gameBoard = Array(9).fill(null);
    gameActive = true;
    currentPlayer = 'X';
    cells.forEach(cell => cell.textContent = '');
    message.textContent = `${getPlayerName(currentPlayer)}'s turn`;
    modal.style.display = 'none';  // Hides modal
    console.log('Game reset');  // Debug log
}

function initGame() {
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    playAgainButton.addEventListener('click', resetGame);
    message.textContent = `${getPlayerName(currentPlayer)}'s turn`;
    console.log('Game initialized');  // Debug log
}

initGame();