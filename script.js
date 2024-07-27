const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold-canvas');
const holdCtx = holdCanvas.getContext('2d');
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
let currentTetromino = getRandomTetromino();
let nextTetromino = getRandomTetromino();
let holdTetromino = null;
let x = Math.floor(cols / 2) - Math.floor(currentTetromino[0].length / 2);
let y = 0;
let score = 0;
let linesCleared = 0;
let level = 1;
let dropSpeed = 1000;
let isPaused = false;
let gameInterval;
let consecutiveLineClears = 0;
let gameLog = [];
let highScores = [];

function getRandomTetromino() {
    return tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col]) {
                ctx.fillStyle = '#f00'; // Change this to your preferred color
                ctx.fillRect(col * scale, row * scale, scale, scale);
                ctx.strokeRect(col * scale, row * scale, scale, scale); // Border around each block
            }
        }
    }
}

function drawTetromino(tetromino, offsetX, offsetY, context, previewMode = false) {
    context.fillStyle = '#f00'; // Tetromino color
    for (let row = 0; row < tetromino.length; row++) {
        for (let col = 0; col < tetromino[row].length; col++) {
            if (tetromino[row][col]) {
                context.fillRect((offsetX + col) * scale, (offsetY + row) * scale, scale, scale);
                context.strokeRect((offsetX + col) * scale, (offsetY + row) * scale, scale, scale); // Border around each block
            }
        }
    }
}

function isCollision(xOffset, yOffset, tetromino = currentTetromino) {
    for (let row = 0; row < tetromino.length; row++) {
        for (let col = 0; col < tetromino[row].length; col++) {
            if (tetromino[row][col]) {
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
    linesCleared += linesToClear.length;
    consecutiveLineClears = (linesToClear.length > 1) ? consecutiveLineClears + 1 : 0;
    const bonus = consecutiveLineClears * 100;
    score += linesToClear.length * 100 + bonus;
    linesToClear.forEach(row => {
        board.splice(row, 1);
        board.unshift(Array(cols).fill(0));
    });
    updateScore();
    drawBoard();
    drawTetromino(currentTetromino, x, y, ctx);
    drawSpecialEffects();
    updateLevel();
}

function dropTetromino() {
    if (!isCollision(0, 1)) {
        y++;
    } else {
        mergeTetromino();
        clearLines();
        currentTetromino = nextTetromino;
        x = Math.floor(cols / 2) - Math.floor(currentTetromino[0].length / 2);
        y = 0;
        nextTetromino = getRandomTetromino();
        if (isCollision(0, 0)) {
            clearInterval(gameInterval);
            logGameEvent('Game Over');
            saveHighScore();
        }
        drawNextTetromino();
    }
}

function drawNextTetromino() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawTetromino(nextTetromino, 0, 0, nextCtx, true);
}

function drawHoldTetromino() {
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (holdTetromino) {
        drawTetromino(holdTetromino, 0, 0, holdCtx, true);
    }
}

function holdTetrominoFunction() {
    if (holdTetromino === null) {
        holdTetromino = currentTetromino;
        currentTetromino = nextTetromino;
        nextTetromino = getRandomTetromino();
        x = Math.floor(cols / 2) - Math.floor(currentTetromino[0].length / 2);
        y = 0;
    } else {
        [currentTetromino, holdTetromino] = [holdTetromino, currentTetromino];
    }
    drawHoldTetromino();
    drawNextTetromino();
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('lines').textContent = linesCleared;
}

function updateLevel() {
    level = Math.floor(linesCleared / 10) + 1;
    dropSpeed = Math.max(100, 1000 - (level - 1) * 100); // Minimum dropSpeed
    document.getElementById('level').textContent = level;
    document.getElementById('speed').textContent = dropSpeed;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, dropSpeed);
}

function drawSpecialEffects() {
    ctx.fillStyle = '#ff0'; // Change this to your preferred effect color
    for (let row = 0; row < rows; row++) {
        if (board[row].every(cell => cell)) {
            for (let col = 0; col < cols; col++) {
                ctx.fillRect(col * scale, row * scale, scale, scale);
                ctx.strokeRect(col * scale, row * scale, scale, scale); // Border around each block
            }
        }
    }
}

function logGameEvent(message) {
    const log = document.getElementById('game-log');
    gameLog.push(message);
    log.innerHTML += `<div>${message}</div>`;
    log.scrollTop = log.scrollHeight;
}

function saveHighScore() {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5); // Keep only top 5 scores
    document.getElementById('high-scores').innerHTML = highScores.map(score => `<li>${score}</li>`).join('');
}

function gameLoop() {
    if (!isPaused) {
        drawBoard();
        drawTetromino(currentTetromino, x, y, ctx);
        dropTetromino();
    }
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').style.display = isPaused ? 'none' : 'inline-block';
    document.getElementById('resume-btn').style.display = isPaused ? 'inline-block' : 'none';
}

document.getElementById('pause-btn').addEventListener('click', togglePause);
document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('hold-btn').addEventListener('click', holdTetrominoFunction);

updateScore();
drawNextTetromino();
drawHoldTetromino();
gameInterval = setInterval(gameLoop, dropSpeed);
