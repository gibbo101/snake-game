document.addEventListener("DOMContentLoaded", function () {
    // set initial variables
    let eatBonusFoodSound = new sound("assets/sound/bonus-food.mp3");
    let startGameSound = new sound("assets/sound/game-start.mp3");
    let gameOverSound = new sound("assets/sound/game-over.mp3");
    let gameMessage = document.getElementById("game-message");
    let levelUpSound = new sound("assets/sound/level-up.mp3");
    let eatFoodSound = new sound("assets/sound/food.mp3");
    let difficultySetting = document.getElementById("difficulty-mode");
    let beginGame = document.getElementById('startGame');
    let playButton = document.getElementById('pause');
    let paused = document.getElementById('paused');
    let localStorage = window.localStorage;
    let clearGameMessage = true;
    let stopControls = false;
    let resetGame = false;

    // event listeners for game inputs
    beginGame.addEventListener('click', gameStartOrPause);
    document.addEventListener("keydown", changeSnakeDirection);

    let settingsForm = document.getElementById("settings-form");
    settingsForm.addEventListener('submit', handleSettingsSubmit);

    let touchControls = document.getElementsByClassName('btnControls');
    for (let i = 0; i < touchControls.length; i++) {
        touchControls[i].addEventListener('click', touchControlsClicked);
    }

    // set initial variables that are dynamic
    if (!localStorage.getItem('startSpeed')) {
        startSpeed = 200;
    } else {
        startSpeed = localStorage.getItem('startSpeed');
        difficultySetting.innerHTML = localStorage.getItem('difficulty');
        document.getElementById(startSpeed).checked = true;
    }
    if (!localStorage.getItem('snakeColor')) {
        snakeColor = "#008000";
    } else {
        snakeColor = localStorage.getItem('snakeColor');
        document.getElementById('snakeColor').value = snakeColor;
    }
    if (!localStorage.getItem('snakeBorder')) {
        snakeBorder = "#000";
    } else {
        snakeBorder = localStorage.getItem('snakeBorder');
        document.getElementById('snakeBorder').value = snakeBorder;
    }
    if (!localStorage.getItem('canvasBg')) {
        canvasBg = "#c0c0c0";
    } else {
        canvasBg = localStorage.getItem('canvasBg');
        document.getElementById('canvasBg').value = canvasBg;
    }
    if (!localStorage.getItem('pageBg')) {
        pageBg = "#f5f5f5";
    } else {
        pageBg = localStorage.getItem('pageBg');
        document.getElementById('pageBg').value = pageBg;
        document.body.style.backgroundColor = pageBg;
        gameMessage.style.borderColor = pageBg;
        gameMessage.style.backgroundColor = pageBg;

    }
    if (!localStorage.getItem('scorePerFood')) {
        scorePerFood = 30;
    } else {
        scorePerFood = localStorage.getItem('scorePerFood');
        scorePerFood = parseInt(scorePerFood);
    }
    if (!localStorage.getItem('audio')) {
        audio = false;
    } else {
        audio = localStorage.getItem('audio');
        if (audio === "true") {
            document.getElementById("enable").checked = true;
        } else {
            document.getElementById("disable").checked = true;
        }
    }
    if (!localStorage.getItem('highScore')) {
        highScore = 0;
        document.getElementById('newHighScore').innerHTML = highScore;
    } else {
        highScore = localStorage.getItem('highScore');
        document.getElementById('newHighScore').innerHTML = highScore;

    }

    // define gameboard
    let gameBoard = document.getElementById("snakeBoard");
    let parent = gameBoard.parentNode;
    gameWidth = parent.offsetWidth;
    let pixelSize = 20;
    if (gameWidth < 450) {
        gameBoard.width = 300;
        gameBoard.height = 300;
        pixelSize = 10;
    } else if (gameWidth < 600) {
        gameBoard.width = 450;
        gameBoard.height = 450;
        pixelSize = 15;
    } else {
        gameBoard.width = gameWidth;
        gameBoard.height = gameWidth;
        pixelSize = 20;
    }
    snakeStart = gameBoard.width - (gameBoard.width / 5);
    let gameBoardCtx = gameBoard.getContext("2d");

    // get game started now all initial variables have been called
    resetVariables();
    playGame();
    generateFood();
    generateBonusFood();

    /**
     * 
     * @param {size of pixel for screen} pixelSize 
     * @param {location of snake at start} snakeStart 
     */
    function initialSnake(pixelSize, snakeStart) {
        snake = [{
                x: pixelSize * 5,
                y: snakeStart
            },
            {
                x: pixelSize * 4,
                y: snakeStart
            },
            {
                x: pixelSize * 3,
                y: snakeStart
            },
            {
                x: pixelSize * 2,
                y: snakeStart
            },
            {
                x: pixelSize,
                y: snakeStart
            }
        ];
    }

    /**
     * Calls variables to start game.
     */
    function resetVariables() {
        initialSnake(pixelSize, snakeStart);
        currentScore = 0;
        bonusScore = 0;
        changingSnakeDirection = false;
        dx = pixelSize;
        dy = 0;
        speed = startSpeed;
        level = 1;
        eatCount = 0;
        startGame = false;
        bonusFood = false;
        pause = true;
    }

    /**
     * Handles user input changes and restarts that game
     */
    function handleSettingsSubmit() {
        event.preventDefault();
        startSpeed = settingsForm.elements.difficulty.value;
        localStorage.setItem('startSpeed', startSpeed);
        if (startSpeed == 100) {
            scorePerFood = 50;
            difficultySetting.innerHTML = `<i class="fas fa-star"></i> <i class="fas fa-star"></i> <i class="fas fa-star"></i>`;
            localStorage.setItem('difficulty', `<i class="fas fa-star"></i> <i class="fas fa-star"></i> <i class="fas fa-star"></i>`);
            localStorage.setItem('scorePerFood', scorePerFood);
        } else if (startSpeed == 200) {
            scorePerFood = 30;
            difficultySetting.innerHTML = `<i class="fas fa-star"></i> <i class="fas fa-star"></i> <i class="far fa-star"></i>`;
            localStorage.setItem('difficulty', `<i class="fas fa-star"></i> <i class="fas fa-star"></i> <i class="far fa-star"></i>`);
            localStorage.setItem('scorePerFood', scorePerFood);
        } else if (startSpeed == 300) {
            scorePerFood = 20;
            difficultySetting.innerHTML = `<i class="fas fa-star"></i> <i class="far fa-star"></i> <i class="far fa-star"></i>`;
            localStorage.setItem('difficulty', `<i class="fas fa-star"></i> <i class="far fa-star"></i> <i class="far fa-star"></i>`);
            localStorage.setItem('scorePerFood', scorePerFood);
        }
        audio = settingsForm.elements.audio.value;
        localStorage.setItem('audio', audio);
        snakeColor = settingsForm.elements.snakeColor.value;
        localStorage.setItem('snakeColor', snakeColor);
        snakeBorder = settingsForm.elements.snakeBorder.value;
        localStorage.setItem('snakeBorder', snakeBorder);
        canvasBg = settingsForm.elements.canvasBg.value;
        localStorage.setItem('canvasBg', canvasBg);
        pageBg = settingsForm.elements.pageBg.value;
        localStorage.setItem('pageBg', pageBg);
        document.body.style.backgroundColor = pageBg;
        gameMessage.style.borderColor = pageBg;
        gameMessage.style.backgroundColor = pageBg;
        document.getElementById('settings-modal').style.display = "none";
        resetGame = true;
    }

    /**
     * 
     * @returns refreshes game at speed dependent on speed variable. If snake has crashed, resets the game, recalls initial variables, records high score and shows player a message that its game over.
     */
    function playGame() {
        if (resetGame || collisionDetection()) {
            stopControls = true;
            setTimeout(delayedController, 2000);
            // game is over. Reset some variables back to default
            if (collisionDetection()) {
                if (audio === "true") {
                    gameOverSound.play();
                }
                Swal.fire({
                    position: 'top',
                    icon: 'warning',
                    title: `Game Over! You reached level ${level} with a score of ${currentScore}. Game reloading...`,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 2000
                });
            } else if (resetGame) {
                Swal.fire({
                    position: 'top',
                    icon: 'warning',
                    title: `Settings changed successfully. Game reloading...`,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 2000
                });
            }
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            resetGame = false;
            pause = false;
            paused.style.display = "none";
            if (highScore < currentScore) {
                document.getElementById('newHighScore').innerHTML = currentScore;
                localStorage.setItem('highScore', currentScore);
            }
            gameMessage.textContent = "";
            gameMessage.style.backgroundColor = pageBg;
            gameMessage.style.borderColor = pageBg;
            beginGame.style = "display:;";
            document.getElementById('newScore').innerHTML = "0";
            document.getElementById('newLevel').innerHTML = "1";
            gameBoardCtx.clearRect(0, 0, gameBoard.width, gameBoard.height);
            drawCanvas();
            resetVariables();
            drawSnake();
            generateBonusFood();
            playGame();
            return;
        }
        changingSnakeDirection = false;
        setTimeout(function onTick() {
            drawCanvas();
            drawFood();
            drawBonusFood();
            moveSnake();
            drawSnake();
            playGame();
        }, speed);
    }

    /**
     * generate co-ordinates from snake array to pass to drawEachSnakeSection
     */
    function drawSnake() {
        snake.forEach(drawEachSnakeSection);
    }

    /**
     * 
     * @returns detects if snake has collided with an object to call game over
     */
    function collisionDetection() {
        for (let i = 4; i < snake.length; i++) { 
            if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
        }
        let collideLeftWall = snake[0].x < pixelSize;
        let collideRightWall = snake[0].x > (gameBoard.width - pixelSize) - dx;
        let collideToptWall = snake[0].y < pixelSize;
        let collideBottomWall = snake[0].y > (gameBoard.width - pixelSize) - dy;
        return collideLeftWall || collideRightWall || collideToptWall || collideBottomWall;
    }

    /**
     * Stops controls from functioning
     */
    function delayedController() {
        stopControls = false;
    }

    /**
     * Start game or pause game depending on game state
     */
    function gameStartOrPause() {
        if (!stopControls) {
            if (!startGame) {
                startGame = true;
                pause = false;
                beginGame.style = "display:none;";
                playButton.innerHTML = '<i class="fas fa-pause"></i>';
                if (audio === "true") {
                    startGameSound.play();
                }
            } else if (!pause && startGame) {
                pause = true;
                paused.style.display = "inline-block";
                playButton.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                pause = false;
                paused.style.display = "none";
                playButton.innerHTML = '<i class="fas fa-pause"></i>';
            }
        }
    }

    /**
     * Move Snake Up
     */
    function moveUp() {
        if (!stopControls) {
            stopControls = true;
            setTimeout(delayedController, 50);
            let downDir = dy === pixelSize;
            if (!downDir) {
                dx = 0;
                dy = -pixelSize;
            }
        }
    }

    /**
     * Move snake down
     */
    function moveDown() {
        if (!stopControls) {
            stopControls = true;
            setTimeout(delayedController, 50);
            let upDir = dy === -pixelSize;
            if (!upDir) {
                dx = 0;
                dy = pixelSize;
            }
        }
    }

    /**
     * Move snake left
     */
    function moveLeft() {
        if (!stopControls) {
            stopControls = true;
            setTimeout(delayedController, 50);
            let rightDir = dx === pixelSize;
            if (!rightDir) {
                dx = -pixelSize;
                dy = 0;
            }
        }
    }

    /**
     * move snake right
     */
    function moveRight() {
        if (!stopControls) {
            stopControls = true;
            setTimeout(delayedController, 50);
            let leftDir = dx === -pixelSize;
            if (!leftDir) {
                dx = pixelSize;
                dy = 0;
            }
        }
    }

    /**
     * 
     * @param {*} event key press
     * @returns listens for a key press and either turns the snake in the correct direction or pauses the game
     */
    function changeSnakeDirection(event) {
        // define key presses for directions
        let arrowLeft = 37;
        let arrowRight = 39;
        let arrowUp = 38;
        let arrowDown = 40;
        let keyA = 65;
        let keyD = 68;
        let keyW = 87;
        let keyS = 83;
        let spaceBar = 32;
        let enter = 13;
        if (changingSnakeDirection) return;
        changingSnakeDirection = true;
        let keyPressed = event.keyCode;

        if (keyPressed === arrowLeft || keyPressed === keyA) {
            moveLeft();
        }

        if (keyPressed === arrowRight || keyPressed === keyD) {
            moveRight();
        }

        if (keyPressed === arrowUp || keyPressed === keyW) {
            moveUp();
        }

        if (keyPressed === arrowDown || keyPressed === keyS) {
            moveDown();
        }

        if (keyPressed === spaceBar || keyPressed === enter) {
            gameStartOrPause();
        }
    }

    // inputs for gamepad controllers
    gameControl.on('connect', function (gamepad) {
            if (changingSnakeDirection) return;
            changingSnakeDirection = true;
            gamepad.on('button3', moveUp);
            gamepad.on('button0', moveDown);
            gamepad.on('button2', moveLeft);
            gamepad.on('button1', moveRight);
            gamepad.on('button12', moveUp);
            gamepad.on('button13', moveDown);
            gamepad.on('button14', moveLeft);
            gamepad.on('button15', moveRight);
            gamepad.on('up0', moveUp);
            gamepad.on('down0', moveDown);
            gamepad.on('left0', moveLeft);
            gamepad.on('right0', moveRight);
            gamepad.on('up1', moveUp);
            gamepad.on('down1', moveDown);
            gamepad.on('left1', moveLeft);
            gamepad.on('right1', moveRight);
            gamepad.before('button9', gameStartOrPause);
    });

    /**
     * 
     * @returns touch / click controls for buttons
     */
    function touchControlsClicked() {
        Haptics.vibrate(100);
        if (changingSnakeDirection) return;
        changingSnakeDirection = true;

        if (this.getAttribute("id") === "btn-left") {
            moveLeft();
        }

        if (this.getAttribute("id") === "btn-right") {
            moveRight();
        }

        if (this.getAttribute("id") === "btn-up") {
            moveUp();
        }

        if (this.getAttribute("id") === "btn-down") {
            moveDown();
        }

        if (this.getAttribute("id") === "pause") {
            gameStartOrPause();
        }
    }

    /**
     * Move the snake by updating the snake array. Check if leveling up and call to generate bonus food. Update score.
     */
    function moveSnake() {
        if (!pause && startGame == true) {
            let front = {
                x: snake[0].x + dx,
                y: snake[0].y + dy
            };
            snake.unshift(front);
            let snakeEaten = snake[0].x === foodX && snake[0].y === foodY;
            if (snakeEaten) {
                generateFood();
                currentScore += (scorePerFood + bonusScore);
                ++eatCount;
                if (audio === "true") {
                    eatFoodSound.play();
                }
                if (eatCount % 5 === 0) {
                    if (speed > 50) {
                        speed -= 10;
                    }
                    ++level;
                    bonusScore = 0;
                    if (audio === "true") {
                        levelUpSound.play();
                    }
                    gameMessage.style.backgroundColor = `#c0c0c0`;
                    gameMessage.style.border = `2px solid #000`;
                    gameMessage.style.borderRadius = `10px`;
                    gameMessage.innerHTML = `<strong>Level Up! Speed Increased!</strong>`;
                    bonusFood = true;
                    generateBonusFood();
                    clearGameMessage = true;
                    setTimeout(function () {
                        bonusFood = false;
                        generateBonusFood();
                        if (clearGameMessage) {
                            gameMessage.textContent = "";
                            gameMessage.style.backgroundColor = pageBg;
                            gameMessage.style.borderColor = pageBg;
                        }
                    }, 5000);
                }
                document.getElementById('newScore').innerHTML = currentScore;
                document.getElementById('newLevel').innerHTML = level;
            } else { // remove the last part of the body (if has eaten the snake will now grow in size)
                snake.pop();
            }
            if (bonusFood) {
                let bonusSnakeEaten = snake[0].x === bonusFoodX && snake[0].y === bonusFoodY; // chech snake head has just hit food
                if (bonusSnakeEaten) {
                    bonusFood = false;
                    generateBonusFood();
                    clearGameMessage = false;
                    bonusScore = 10;
                    gameMessage.innerHTML = `<strong><font color="#008000">Bonus Mode! +10 score per food eaten!</font></strong>`;
                    if (audio === "true") {
                        eatBonusFoodSound.play();
                    }
                }
            }
        }
    }

    /**
     * 
     * @param {0} min 
     * @param {num} max 
     * @returns a random co-ordinte to play food on the canvas
     */
    function generateFoodRandom(min, max) {
        return Math.round((Math.random() * (max - min) + min) / pixelSize) * pixelSize;
    }

    /**
     * generates co-ordinates for food from generateFoodRandom and cheks they don't clash with the snake co-ordinates
     */
    function generateFood() {
        foodX = generateFoodRandom(pixelSize, gameBoard.width - (pixelSize * 2));
        foodY = generateFoodRandom(pixelSize, gameBoard.width - (pixelSize * 2));
        snake.forEach(function hasSnakeEaten(part) {
            let snakeEaten = part.x == foodX && part.y == foodY;
            if (snakeEaten) generateFood();
        });
    }

    /**
     * generate bonus food. If not leveled up, set co-ordinates to null.
     */
    function generateBonusFood() {
        if (bonusFood) {
            bonusFoodX = generateFoodRandom(pixelSize, gameBoard.width - (pixelSize * 2));
            bonusFoodY = generateFoodRandom(pixelSize, gameBoard.width - (pixelSize * 2));
            snake.forEach(function hasBonusSnakeEaten(part) {
                let bonusSnakeEaten = part.x == bonusFoodX && part.y == bonusFoodY;
                if (bonusSnakeEaten) generateBonusFood();
            });
        } else {
            bonusFoodX = "";
            bonusFoodY = "";
        }
    }

    /**
     * sets the play area and sets background color and border
     */
     function drawCanvas() {
        gameBoardCtx.fillStyle = canvasBg;
        gameBoardCtx.strokeStyle = '#000';
        gameBoardCtx.lineWidth = (pixelSize * 2) - 1;
        gameBoardCtx.fillRect(0, 0, gameBoard.width, gameBoard.height);
        gameBoardCtx.strokeRect(0, 0, gameBoard.width, gameBoard.height);
    }

    /**
     * 
     * @param {*} draws the snake to the canvas from co-ordinates given in drawSnake 
     */
     function drawEachSnakeSection(snakeSection) {
        gameBoardCtx.fillStyle = snakeColor;
        gameBoardCtx.strokeStyle = snakeBorder;
        gameBoardCtx.lineWidth = 1;
        gameBoardCtx.fillRect(snakeSection.x, snakeSection.y, pixelSize, pixelSize);
        gameBoardCtx.strokeRect(snakeSection.x, snakeSection.y, pixelSize, pixelSize);
    }

    /**
     * Take generated co-ordinates and draw food to the canvas
     */
    function drawFood() {
        gameBoardCtx.fillStyle = '#C7372F';
        gameBoardCtx.strokeStyle = '#000';
        gameBoardCtx.lineWidth = 1;
        gameBoardCtx.beginPath();
        gameBoardCtx.arc(foodX + (pixelSize / 2), foodY + (pixelSize / 2), (pixelSize / 2), 0, 2 * Math.PI);
        gameBoardCtx.fill();
        gameBoardCtx.stroke();
    }

    /**
     * Take generated co-ordinates and draw bonus food to the canvas 
     */
    function drawBonusFood() {
        if (bonusFood) {
            gameBoardCtx.fillStyle = '#8DB600';
            gameBoardCtx.strokeStyle = '#000';
            gameBoardCtx.lineWidth = 1;
            gameBoardCtx.beginPath();
            gameBoardCtx.arc(bonusFoodX + (pixelSize / 2), bonusFoodY + (pixelSize / 2), (pixelSize / 2), 0, 2 * Math.PI);
            gameBoardCtx.fill();
            gameBoardCtx.stroke();
        }
    }

    /**
     * Plays soundeffects
     * @param {sound file} src 
     */
    function sound(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function () {
            this.sound.play();
        };
        this.stop = function () {
            this.sound.pause();
        };
    }

}); //end DOM loaded function