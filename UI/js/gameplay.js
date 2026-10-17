document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const miniGrid = document.querySelector('.mini-grid');
    const scoreDisplay = document.querySelector('#score');
    const linesDisplay = document.querySelector('#lines');
    const levelDisplay = document.querySelector('#level');
    const gameOverDisplay = document.querySelector('#gameOver');
    const finalScore = document.querySelector('#finalScore');
    const restart = document.querySelector('#restartBtn');
    const levelUpDisplay = document.querySelector('#gameLevelUp');

    const width = 10;
    const height = 20;
    const displayWidth = 4;

    let squares= [];
    let squareDisplay = [];

    let timerId = null;
    let score = 0;
    let level = 1;
    let lines = 0;
    let isGameOver =false;

    let currentRow = 0;
    let currentCol = 3;
    let random = 0;
    let nextRandom = 0;
    let current = [];

    let isLuckyBlock;
    let luckyRow;
    let luckyCol;
    let chaoRemain = 0;
    let chaoActive = false;
    let rotateTime = null;
    let countBlock = 0;

    const colors = ['orange', 'red', 'purple', 'yellow', 'cyan', 'green', 'blue'];
    const levelScore = [1000, 2000, 3500, 4500];

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

                    if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
                        const index = newRow * width + newCol;
                        squares[index].classList.add('tetromino');
                        if(isLuckyBlock && row === luckyRow && col === luckyCol){
                            squares[index].style.backgroundColor = 'gold';
                            squares[index].textContent = '?';
                        }else{
                            squares[index].style.backgroundColor = colors[random];
                        }
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
                        squares[index].textContent = '';
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
        if (isGameOver ||  isLevelUp) return;

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
        if (isGameOver || isLevelUp) return;

        const rotated = rotateMatrix(current);
        let newCol = currentCol;
        if (!isValidPosition(rotated, currentRow, newCol)) {
            if (isValidPosition(rotated, currentRow, newCol - 1)) {
                newCol--;
            }
            else if (isValidPosition(rotated, currentRow, newCol + 1)) {
                newCol++;
            }
            else if (isValidPosition(rotated, currentRow, newCol - 2)) {
                newCol -= 2;
            }
            else if (isValidPosition(rotated, currentRow, newCol + 2)) {
                newCol += 2;
            }
            else {
                return;
            }
        }

        undraw();

        if (isLuckyBlock){
            const newLuckyRow = luckyCol;
            const newLuckyCol = current.length - 1 - luckyRow;

            luckyRow = newLuckyRow;
            luckyCol = newLuckyCol;
        }

        current = rotated;
        currentCol = newCol;
        draw();
    }

    function freeze() {
        clearInterval(rotateTime);
        rotateTime = null;
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
                        if (isLuckyBlock && row === luckyRow && col === luckyCol) {
                            squares[index].classList.add('lucky');
                        }
                    }
                }
            }
        }
        if (aboveBoard) {
            gameOver();
            return;
        }
        if (chaoActive && chaoRemain > 0) {
            chaoRemain--;
        }

        addScore();
        if (isLevelUp){
            return;
        }

        random = nextRandom;
        nextRandom = Math.floor(Math.random() * theBlock.length);
        current = theBlock[random];
        currentRow = 0;
        currentCol = 3;
        prepareNewBlock();

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
        const luckyPosition = [];
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
                for (let col = 0; col < width; col++) {
                    const index = row * width + col;
                    if (squares[index].classList.contains('lucky')) {
                        luckyPosition.push([row, col]);
                    }
                }
                clearedLines++;
                const startIndex = row * width;
                const removedSquares = squares.splice(startIndex, width);
                for (let i = 0; i < removedSquares.length; i++) {
                    removedSquares[i].classList.remove('taken', 'tetromino', 'lucky');
                    removedSquares[i].style.backgroundColor = '';
                    removedSquares[i].textContent = '';
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
            countBlock = 0
            scoreDisplay.textContent = score;
            linesDisplay.textContent = lines;
            for (let i = 0; i < luckyPosition.length; i++) {
                const effect = Math.floor(Math.random() * 2) + 1;
                if (effect === 1) {
                    explosionBlock(luckyPosition[i][0], luckyPosition[i][1]);
                } else {
                    activityChao();
                }
            }
            checkLevel();
        } else if (level >= 3 && clearedLines === 0){
            countBlock += 1;
            if (countBlock === 5){
                addLastRow();
                countBlock = 0;
            }
        }
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(timerId);
        clearInterval(rotateTime);
        rotateTime = null;
        timerId = null;
        finalScore.textContent = score;
        gameOverDisplay.style.display = 'flex';
    }

    function control(e) {
        if (isLevelUp){
            if (e.key === 'Enter'){
                nextLevel();
            }
            return;
        }
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
            if(level >= 2){
                autoRotateBlock();
            }
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
        clearInterval(rotateTime);
        createGrid();
        createMiniGrid();

        score = 0;
        lines = 0;
        level = 1;
        isLevelUp = false;
        isLuckyBlock = false;
        luckyRow = -1;
        luckyCol = -1;
        chaoRemain = 0;
        chaoActive = false;
        rotateTime = null;
        isGameOver = false;
        currentRow = 0;
        currentCol = 3;
        countBlock = 0;
        random = Math.floor(Math.random() * theBlock.length);
        nextRandom = Math.floor(Math.random() * theBlock.length);
        current = theBlock[random];
        scoreDisplay.textContent = score;
        linesDisplay.textContent = lines;
        gameOverDisplay.style.display = 'none';
        levelDisplay.textContent = level;
        levelUpDisplay.style.display = 'none';

        draw();
        displayShape();
        updateSpeed();
    }

    function checkLevel(){
        if (level <= levelScore.length && score >= levelScore[level-1]){
            level++;
            levelDisplay.textContent = level;
            levelUp();
        }
    }

    let isLevelUp = false;
    const levelGameUp = document.getElementById('levelUp');
    function levelUp() {
        isLevelUp = true;
        clearInterval(timerId);
        clearInterval(rotateTime);
        rotateTime = null;
        timerId = null;
        levelUpDisplay.style.display = 'flex';
        levelGameUp.textContent = level;
    }

    function nextLevel(){
        isLevelUp = false;
        levelUpDisplay.style.display = 'none';
        currentRow = 0;
        currentCol = 3;
        random = Math.floor(Math.random() * theBlock.length);
        nextRandom = Math.floor(Math.random() * theBlock.length);
        current = theBlock[random];

        displayShape();
        prepareNewBlock();
    }

    function randomLuckyBlock(){
        isLuckyBlock = false;

        if (level < 2){
            return;
        }

        const luckyBlock = Math.floor(Math.random() * 5) + 1;

        if(luckyBlock === 1){
            const tetrisBlock = [];
            for (let i = 0; i < current.length; i++) {
                for (let j = 0; j < current[i].length; j++) {
                    if (current[i][j] === 1) {
                        tetrisBlock.push([i, j]);
                    }
                }
            }

            const positionLucky = Math.floor(Math.random() * tetrisBlock.length);
            luckyRow = tetrisBlock[positionLucky][0];
            luckyCol = tetrisBlock[positionLucky][1];
            isLuckyBlock = true;
        }
    }

    function activityChao(){
        chaoRemain = 3;
    }

    function updateSpeed(){
        clearInterval(timerId);
        timerId = null;
        let speed = 1000;
        if (level >= 2){
            speed = 800;
        }
        if(chaoActive){
            speed = 200;
        }
        timerId = setInterval(() => move(1, 0), speed);
    }

    function autoRotateBlock(){
        clearInterval(rotateTime);
        rotateTime = null;

        if(level >= 2){
            rotateTime = setInterval(() => rotate(), 2000);
        }
    }

    function explosionBlock(centerRow, centerCol){
        for (let row = centerRow - 1; row <= centerRow + 1; row++) {
            for (let col = centerCol - 1; col <= centerCol + 1; col++) {
                if (row >= 0 && row < height && col >= 0 && col < width) {
                    const index = row * width + col;
                    squares[index].classList.remove('taken', 'tetromino', 'lucky');
                    squares[index].style.backgroundColor = '';
                    squares[index].textContent = '';
                }
            }
        }
    }

    function prepareNewBlock(){
        randomLuckyBlock();
        if(chaoRemain > 0){
            chaoActive = true;
        }else {
            chaoActive = false;
        }
        updateSpeed();
        autoRotateBlock();
    }

    function addLastRow(){
        const positionDivAdd = [];
        let countAdd = Math.floor(Math.random() * 5) + 5;
        while(positionDivAdd.length < countAdd){
            const random = Math.floor(Math.random() * 10);
            let different = true;
            for (let i = 0; i < positionDivAdd.length; i++) {
                if(positionDivAdd[i] === random){
                    different = false;
                    break;
                }
            }
            if (different){
                positionDivAdd.push(random);
            }
        }

        for(let i = 0; i < width; i++){
            if(squares[i].classList.contains('taken')){
                gameOver();
                return;
            }
        }

        const firstRow = squares.splice(0, width);
        squares.splice((height-1)*width, 0, ...firstRow);

        for (let i = 0; i < positionDivAdd.length; i++) {
            const index = (height - 1) * width + positionDivAdd[i];
            squares[index].classList.add('taken');
            squares[index].style.backgroundColor = 'gray';
        }

        for (let i = 0; i < squares.length; i++) {
            grid.appendChild(squares[i]);
        }
    }

    document.addEventListener('keydown', control);
    restart.addEventListener('click', startGame);

    startGame();
});
