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
let score = 0;
let linesCleared = 0;
let level = 1;
let dropInterval = 1000; // Drop interval in milliseconds
let dropSpeed = 1000; // Initial drop speed
let isPaused = false;
let gameInterval;

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

function drawSpecialEffects() {
    ctx.fillStyle = '#ff0';
    for (let row = 0; row < rows; row++) {
        if (board[row].every(cell => cell)) {
            for (let col = 0; col < cols; col++) {
                ctx.fillRect(col * scale, row * scale, scale, scale);
            }
        }
    }
}

function isCollision(xOffset, yOffset) {
    for (let row = 0; row < currentTetromino.length; row++) {
        for (let col = 0; col < currentTetromino[row].length; col++) {
            if (currentTetromino[row][col]) {
                const newX = x + col + xOffset;
                const newY = y + row + yOffset;
                if (newX < 0 || newX >= cols || newY >= rows || board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function mergeTetromino() {
    for (let row = 0; row < currentTetromino.length; row++) {
        for (let col = 0; col < currentTetromino[row].length; col++) {
            if (currentTetromino[row][col]) {
                board[y + row][x + col] = 1;
            }
        }
    }
}

function rotateTetromino() {
    const rotated = currentTetromino[0].map((_, i) =>
        currentTetromino.map(row => row[i]).reverse()
    );
    const originalTetromino = currentTetromino;
    currentTetromino = rotated;
    if (isCollision(0, 0)) {
        currentTetromino = originalTetromino;
    }
}

function moveTetromino(dx, dy) {
    if (!isCollision(dx, dy)) {
        x += dx;
        y += dy;
    }
}

function clearLines() {
    let linesToClear = [];
    for (let row = 0; row < rows; row++) {
        if (board[row].every(cell => cell)) {
            linesToClear.push(row);
        }
    }
    linesToClear.forEach(row => {
        board.splice(row, 1);
        board.unshift(Array(cols).fill(0));
    });
    linesCleared += linesToClear.length;
    score += linesToClear.length * 100;
    updateScore();
    drawSpecialEffects();
    updateLevel();
}

function dropTetromino() {
    if (!isCollision(0, 1)) {
        y++;
    } else {
        mergeTetromino();
        clearLines();
        currentTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
        x = Math.floor(cols / 2) - Math.floor(currentTetromino[0].length / 2);
        y = 0;
        if (isCollision(0, 0)) {
            // Game over logic could be added here
            clearInterval(gameInterval);
            console.log('Game Over');
        }
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('lines').textContent = linesCleared;
}

function updateLevel() {
    level = Math.floor(linesCleared / 10) + 1;
    dropSpeed = Math.max(500, 1000 - (level - 1) * 50); // Adjust drop speed
    document.getElementById('level').textContent = level;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, dropSpeed);
}

function gameLoop() {
    if (!isPaused) {
        drawBoard();
        drawTetromino();
        dropTetromino();
    }
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('status').textContent = isPaused ? 'Paused' : 'Running';
    document.getElementById('pause-btn').style.display = isPaused ? 'none' : 'inline';
    document.getElementById('resume-btn').style.display = isPaused ? 'inline' : 'none';
    if (!isPaused) {
        updateLevel();
    }
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowLeft') moveTetromino(-1, 0);
    if (event.code === 'ArrowRight') moveTetromino(1, 0);
    if (event.code === 'ArrowDown') dropTetromino();
    if (event.code === 'ArrowUp') rotateTetromino();
});

document.getElementById('pause-btn').addEventListener('click', togglePause);
document.getElementById('resume-btn').addEventListener('click', togglePause);

gameInterval = setInterval(gameLoop, dropSpeed);
