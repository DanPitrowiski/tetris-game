if (document.readyState !== 'loading') {
    console.log('document is already ready, just execute code here');
    myInitCode();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        console.log('document was not ready, place code here');
        // debugger;
        myInitCode();
    });
}

// document.addEventListener('DOMContentLoaded', function () {
//     myInitCode();
// })

function myInitCode() {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    const pausePlayBtn = document.querySelector('#pause-play-button');
    const gameOverMessage = document.querySelector('.game-message');
    let nextRandom = 0;
    let timerId;
    let score = 0;
    let colors = ['#66CBFF', '#CC00FF', '#FFFF01', '#01FF02', '#FF6501', '#FE0000']

    // Adding Event Listener for the Keystrokes

    document.onkeydown = KeyCheck;
    function KeyCheck(event) {
        var KeyID = event.keyCode;

        switch (KeyID) {
            case 37:
                moveLeft();
                break;

            case 38:
                rotate();
                break

            case 39:
                moveRight();
                break;

            case 40:
                moveDown();
                break;
        }
    }

    //The Tetrominoes

    const width = 10;

    const jTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ]

    const lTetromino = [
        [1, width + 1, width * 2 + 1, width * 2 + 2],
        [width + 0, width + 1, width + 2, width * 2],
        [0, 1, width + 1, width * 2 + 1],
        [2, width, width + 1, width + 2]
    ]

    const sTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ]

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ]

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ]

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ]

    const tetrominoShapes = [lTetromino, sTetromino, tTetromino, oTetromino, iTetromino, jTetromino];

    let currentPosition = 4;
    let currentRotation = 0;

    //Draw the Game

    let random = Math.floor(Math.random() * tetrominoShapes.length);
    let current = tetrominoShapes[random][0];

    // Draw the Tetromino

    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundColor = colors[random];
        })
    }

    // Undraw the Tetromino

    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].style.backgroundColor = '';
        })
    }

    function freeze() {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'))
        //start a new tetromino falling
        random = nextRandom
        nextRandom = Math.floor(Math.random() * tetrominoShapes.length)
        current = tetrominoShapes[random][currentRotation]
        currentPosition = 4
        draw()
        displayUpNext()
        addScore()
        gameOver()
    }

    // Move Tetromino down
    function moveDown() {
        if (!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            undraw()
            currentPosition += width
            draw()
        } else {
            freeze();
        }
    }

    // Move Tetromino Left and Right
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    // Rotate
    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) {
            currentRotation = 0;
        }
        current = tetrominoShapes[random][currentRotation];
        draw();
    }

    // Show up-next for the Tetris Shape
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    const displayIndex = 0;

    // Show Tetris Shape without rotation
    const upNextTetromino = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2], //jTetromino
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //sTetromino
        [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
        [0, 1, displayWidth, displayWidth + 1], //oTetromino
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], //iTetromino
        [1, displayWidth + 1, displayWidth * 2 + 1, 2] //lTetromino
    ]

    // Display up-next shape in mini-grid

    function displayUpNext() {
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = '';
        })
        upNextTetromino[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
        })
    }

    startBtn.addEventListener('click', () => {
        // if (timerId) {
        //     clearInterval(timerId)
        //     timerId = null;
        // } else {
        resetGame();
        gameOverMessage.style.display = "none";
        draw();
        startBtn.style.display = "none";
        pausePlayBtn.classList.add("pause");
        pausePlayBtn.style.display = "block"
        timerId = setInterval(moveDown, 1000);
        nextRandom = Math.floor(Math.random() * tetrominoShapes.length);
        displayUpNext();
    })

    pausePlayBtn.addEventListener('click', () => {
        checkText = pausePlayBtn.innerHTML;
        if (checkText === 'PLAY') {
            pausePlayBtn.innerHTML = "PAUSE";
            pausePlayBtn.classList.add("pause");
            timerId = setInterval(moveDown, 1000);
        } else {
            pausePlayBtn.innerHTML = "PLAY";
            pausePlayBtn.classList.remove("pause");
            clearInterval(timerId)
            timerId = null;
        }
    })

    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 100;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('tetromino')
                    squares[index].style.backgroundColor = '';
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    // Game Over
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            gameOverMessage.style.display = "block";
            startBtn.style.display = "block";
            startBtn.innerHTML = 'NEW GAME'
            pausePlayBtn.style.display = "none"
            clearInterval(timerId)
        }
    }

    // Clear the Tetris Board
    function resetGame() {
        let i = 0;
        for(let el of squares) {
            i++;
            el.classList.remove('tetromino')
            el.classList.remove('taken')
            el.style.backgroundColor = '';
            if (i >= 200) {break;}
          };
          draw()
    }
}