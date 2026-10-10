document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const miniGrid = document.querySelector('.mini-grid');
    const scoreDisplay = document.querySelector('#score');
    const linesDisplay = document.querySelector('#lines');
    const levelDisplay = document.querySelector('#level');
    const gameOverDisplay = document.querySelector('#gameOver');
    const finalScore = document.querySelector('#finalScore');
    const restart = document.querySelector('#restartBtn');

    const width = 10;
    const height = 20;
    const displayWidth = 4;

    let squares= [];
    let squareDisplay = [];

    let timerId = null;
    let score = 0;
    let lines = 0;
    let isGameOver =false;

    let currentRow = 0;
    let currentCol = 3;
    let random = 0;
    let nextRandom = 0;
    let current = [];

    const colors = ['orange', 'red', 'purple', 'yellow', 'cyan', 'green', 'blue'];

    const J = [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ];

    const Z = [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ];

    const T = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ];

    const O = [
        [1, 1],
        [1, 1]
    ];

    const I = [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    const S = [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ];

    const L = [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ];

    const theBlock = [J, Z, T, O, I, S, L];

    function createGrid(){
        grid.innerHTML = '';
        squares = [];

        for (let i = 0; i < width * height; i++){
            const square = document.createElement('div');
            grid.appendChild(square);
            squares.push(square);
        }

        for (let i = 0; i < width; i++){
            const square = document.createElement('div');
            square.classList.add('taken', 'floor');
            grid.appendChild(square);
            squares.push(square);
        }
    }

    function createMiniGrid() {
        miniGrid.innerHTML = '';
        squareDisplay = [];

        for (let i = 0; i < displayWidth * displayWidth; i++) {
            const square = document.createElement('div');
            miniGrid.appendChild(square);
            squareDisplay.push(square);
        }
    }

    function draw() {
        for (let row = 0; row < current.length; row++) {
            for (let col = 0; col < current[row].length; col++) {
                if (current[row][col] === 1) {
                    const newRow = currentRow + row;
                    const newCol = currentCol + col;

                    if (newRow >= 0 && newRow < height &&
                        newCol >= 0 && newCol < width) {
                        const index = newRow * width + newCol;

                        squares[index].classList.add('tetromino');
                        squares[index].style.backgroundColor = colors[random];
                    }
                }
            }
        }
    }

    function undraw() {
        for (let row = 0; row < current.length; row++) {
            for (let col = 0; col < current[row].length; col++) {
                if (current[row][col] === 1) {
                    const newRow = currentRow + row;
                    const newCol = currentCol + col;

                    if (newRow >= 0 && newRow < height &&
                        newCol >= 0 && newCol < width) {
                        const index = newRow * width + newCol;
                        squares[index].classList.remove('tetromino');
                        squares[index].style.backgroundColor = '';
                    }
                }
            }
        }
    }

    function isValidPosition(matrix, positionRow, positionCol) {
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] === 1) {
                    const newRow = positionRow + row;
                    const newCol = positionCol + col;
                    if (newCol < 0 || newCol >= width) {
                        return false;
                    }
                    if (newRow >= height) {
                        return false;
                    }
                    if (newRow >= 0) {
                        const index = newRow * width + newCol;
                        if (squares[index].classList.contains('taken')) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    function move(row, col) {
        if (isGameOver) return;

        if (isValidPosition(current, currentRow + row, currentCol + col)) {
            undraw();
            currentRow += row;
            currentCol += col;
            draw();
        }
        else if (row === 1 && col === 0) {
            freeze();
        }
    }

    function rotateMatrix(matrix) {
        const size = matrix.length;
        const rotated = [];

        for (let row = 0; row < size; row++) {
            rotated[row] = [];
            for (let col = 0; col < size; col++) {
                rotated[row][col] = matrix[size - 1 - col][row];
            }
        }

        return rotated;
    }

    function rotate() {
        if (isGameOver) return;

        const rotated = rotateMatrix(current);
        let newCol = currentCol;
        if (!isValidPosition(rotated, currentRow, newCol)) {
            if (isValidPosition(rotated, currentRow, newCol - 1)) {
                newCol--;
            }
            else if (isValidPosition(rotated, currentRow, newCol + 1)) {
                newCol++;
            }
            else {
                return;
            }
        }

        undraw();
        current = rotated;
        currentCol = newCol;
        draw();
    }

    function freeze() {
        let aboveBoard = false;

        for (let row = 0; row < current.length; row++) {
            for (let col = 0; col < current[row].length; col++) {
                if (current[row][col] === 1) {
                    const newRow = currentRow + row;
                    const newCol = currentCol + col;
                    if (newRow < 0) {
                        aboveBoard = true;
                    } else {
                        const index = newRow * width + newCol;
                        squares[index].classList.add('taken');
                    }
                }
            }
        }
        if (aboveBoard) {
            gameOver();
            return;
        }

        addScore();

        random = nextRandom;
        nextRandom = Math.floor(Math.random() * theBlock.length);
        current = theBlock[random];
        currentRow = 0;
        currentCol = 3;

        displayShape();

        if (!isValidPosition(current, currentRow, currentCol)) {
            gameOver();
            return;
        }

        draw();
    }

    function displayShape() {
        for (let i = 0; i < squareDisplay.length; i++) {
            squareDisplay[i].classList.remove('tetromino');
            squareDisplay[i].style.backgroundColor = '';
        }

        const shape = theBlock[nextRandom];

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const index = row * displayWidth + col;
                    squareDisplay[index].classList.add('tetromino');
                    squareDisplay[index].style.backgroundColor = colors[nextRandom];
                }
            }
        }
    }

    function addScore() {
        let clearedLines = 0;

        for (let row = height - 1; row >= 0; row--) {
            let fullRow = true;

            for (let col = 0; col < width; col++) {
                const index = row * width + col;
                if (!squares[index].classList.contains('taken')) {
                    fullRow = false;
                    break;
                }
            }

            if (fullRow) {
                clearedLines++;
                const startIndex = row * width;
                const removedSquares = squares.splice(startIndex, width);

                for (let i = 0; i < removedSquares.length; i++) {
                    removedSquares[i].classList.remove('taken', 'tetromino');
                    removedSquares[i].style.backgroundColor = '';
                }
                squares = removedSquares.concat(squares);
                for (let i = 0; i < squares.length; i++) {
                    grid.appendChild(squares[i]);
                }
                row++;
            }
        }

        if (clearedLines > 0) {
            const points = [0, 100, 300, 500, 800];
            score += points[clearedLines];
            lines += clearedLines;
            scoreDisplay.textContent = score;
            linesDisplay.textContent = lines;
        }
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(timerId);
        timerId = null;
        finalScore.textContent = score;
        gameOverDisplay.style.display = 'flex';
    }

    function control(e) {
        if (isGameOver) return;

        if (e.key === 'ArrowLeft' ||
            e.key === 'ArrowRight' ||
            e.key === 'ArrowUp' ||
            e.key === 'ArrowDown' ||
            e.code === 'Space') {
            e.preventDefault();
        }

        if (e.key === 'ArrowLeft') {
            move(0, -1);
        } else if (e.key === 'ArrowRight') {
            move(0, 1);
        } else if (e.key === 'ArrowUp') {
            rotate();
        } else if (e.key === 'ArrowDown') {
            move(1, 0);
        } else if (e.code === 'Space') {
            undraw();
            while (isValidPosition(current, currentRow + 1, currentCol)) {
                currentRow++;
            }

            draw();
            freeze();
        }
    }

    function startGame() {
        clearInterval(timerId);
        createGrid();
        createMiniGrid();

        score = 0;
        lines = 0;
        isGameOver = false;
        currentRow = 0;
        currentCol = 3;
        random = Math.floor(Math.random() * theBlock.length);
        nextRandom = Math.floor(Math.random() * theBlock.length);
        current = theBlock[random];
        scoreDisplay.textContent = score;
        linesDisplay.textContent = lines;
        gameOverDisplay.style.display = 'none';

        draw();
        displayShape();
        timerId = setInterval(() => move(1, 0), 1000);
    }

    document.addEventListener('keydown', control);
    restart.addEventListener('click', startGame);

    startGame();
});
