const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scale = 30;
const rows = canvas.height / scale;
const cols = canvas.width / scale;

const tetrominoes = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1], [1, 1]], // O
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

let board = Array.from({ length: rows }, () => Array(cols).fill(0));
let currentTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
let x = Math.floor(cols / 2) - Math.floor(currentTetromino[0].length / 2);
let y = 0;

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col]) {
                ctx.fillRect(col * scale, row * scale, scale, scale);
            }
        }
    }
}

function drawTetromino() {
    ctx.fillStyle = '#f00';
    for (let row = 0; row < currentTetromino.length; row++) {
        for (let col = 0; col < currentTetromino[row].length; col++) {
            if (currentTetromino[row][col]) {
                ctx.fillRect((x + col) * scale, (y + row) * scale, scale, scale);
            }
        }
    }
}

function gameLoop() {
    drawBoard();
    drawTetromino();
    y++;
    if (y + currentTetromino.length > rows) {
        y = 0;
        x = Math.floor(cols / 2) - Math.floor(currentTetromino[0].length / 2);
        currentTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    }
}

setInterval(gameLoop, 1000);
