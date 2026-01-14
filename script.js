const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const message = document.getElementById('message');

let currentPlayer = 'X';
let gameBoard = Array(9).fill(null);
let gameActive = true;

function checkWinner() {
    const winningCombinations = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8]
        [2,4,6]
    ];

    //loops
    for (let combination of winningCombinations) {
        // Destructures the pattern into three indices
        //  (e.g., a=0, b=1, c=2 for the first pattern).
        const [a, b, c]= combination;
        //check
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return gameBoard[a]; // Return the winner ('X' or 'O')
        }
    }
    return null; // No winner yet
}
//function to check if the board is full
function isBoardFull() {
    return gameBoard.every(cell => cell !== null); //returns true if all cells are filled
}
//function to handle cell click
function handleCellClick(event) {
    const cell = event.target;
    const cellIndex = parseInt(cell.getAttribute('data-index'));

    //check if the cell is empty and the game is active
    if (gameBoard[cellIndex] === null && gameActive) {
        //update the board
        gameBoard[cellIndex] = currentPlayer;
        cell.textContent = currentPlayer;

        //check for a winner
        const winner = checkWinner();
        if (winner) {
            status.textContent = `Player ${winner} wins!`;
            message.textContent = `Congratulations Player ${winner}!`;
            gameActive = false;
            return;
        } else if (isBoardFull()) {
            status.textContent = `It's a draw!`;
            message.textContent = `Well played both!`;  
            gameActive = false;
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            status.textContent = `Player ${currentPlayer}'s turn`;
            message.textContent = `Player ${currentPlayer}'s turn`;
        }
    }
}
//
function initGame() {
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    status.textContent = `Player ${currentPlayer}'s turn`;
    message.textContent = `Player ${currentPlayer}'s turn`; 
}
initGame();



    