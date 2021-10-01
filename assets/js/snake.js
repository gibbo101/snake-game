document.addEventListener("DOMContentLoaded", function () {
    let gameMessage = document.getElementById("game-message");
    let paused = document.getElementById('paused');
    let gameSound;


    // define gameboard
    let gameBoard = document.getElementById("snakeBoard");
    parent = gameBoard.parentNode;
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

    // set initial variables that are dynamic
    let startSpeed = 200;
    let snakeColor = "#008000";
    let snakeBorder = "#000";
    let canvasBg = "#c0c0c0";
    let pageBg = "#f5f5f5";
    let scorePerFood = 30;
    let resetGame = false;
    let clearGameMessage = true;
    resetVariables();

    // settings form submitted changes
    let settingsForm = document.getElementById("settings-form");
    settingsForm.addEventListener('submit', handleSettingsSubmit);
    let difficultySetting = document.getElementById("difficulty-mode");

    /**
     * Handles user input changes and restarts that game
     */
    function handleSettingsSubmit() {
        event.preventDefault();
        startSpeed = settingsForm.elements.difficulty.value;
        console.log(speed);
        if (startSpeed == 100) {
            scorePerFood = 50;
            difficultySetting.innerHTML = `<i class="fas fa-star"></i> <i class="fas fa-star"></i> <i class="fas fa-star"></i>`;
        } else if (startSpeed == 200) {
            scorePerFood = 30;
            difficultySetting.innerHTML = `<i class="fas fa-star"></i> <i class="fas fa-star"></i> <i class="far fa-star"></i>`;
        } else if (startSpeed == 300) {
            scorePerFood = 20;
            difficultySetting.innerHTML = `<i class="fas fa-star"></i> <i class="far fa-star"></i> <i class="far fa-star"></i>`;
        }
        snakeColor = settingsForm.elements['snakeColor'].value;
        snakeBorder = settingsForm.elements['snakeBorder'].value;
        canvasBg = settingsForm.elements['canvasBg'].value;
        pageBg = settingsForm.elements['pageBg'].value;
        document.body.style.backgroundColor = pageBg;
        gameMessage.style.borderColor = pageBg;
        gameMessage.style.backgroundColor = pageBg;
        document.getElementById('settings-modal').style.display = "none";
        resetGame = true;
    }

    let beginGame = document.getElementById('startGame');
    beginGame.addEventListener('click', startGameNow);
    document.addEventListener("keydown", startGameWithSpacebar);

    /**
     * Starts the game if spacebar pressed
     * @param {spacebar} event 
     */
    function startGameWithSpacebar(event) {
        let spaceBar = 32;
        let SpacePressed = event.keyCode;
        if (startGame === false && SpacePressed === spaceBar) {
            startGame = true;
            pause = true;
            beginGame.style = "display:none;";
            gameSound = new sound("assets/sound/game-start.mp3");
            gameSound.play();
        }
    }

    /**
     * Set starGame to true and hides the start game button
     */
    function startGameNow() {
        if (startGame === false) {
            startGame = true;
            pause = false;
            beginGame.style = "display:none;";
            gameSound = new sound("assets/sound/game-start.mp3");
            gameSound.play();
        }
    }

    playGame();
    generateFood();
    generateBonusFood();
    document.addEventListener("keydown", changeSnakeDirection);

    /**
     * sets the play area and sets background color and border
     */
    function drawCanvas() {
        // background color of canvas
        gameBoardCtx.fillStyle = canvasBg;
        // canvas border color
        gameBoardCtx.strokeStyle = '#000';
        gameBoardCtx.lineWidth = (pixelSize * 2) - 2;
        // Draw a filled rectangle to cover the canvas
        gameBoardCtx.fillRect(0, 0, gameBoard.width, gameBoard.height);
        // draw the canvas border
        gameBoardCtx.strokeRect(0, 0, gameBoard.width, gameBoard.height);
    }

    /**
     * 
     * @returns refreshes game at speed dependent on speed variable. If snake has crashed, resets the game, recalls initial variables, records high score and shows player a message that its game over.
     */
    function playGame() {
        if (resetGame === true || collisionDetection()) { // game is over. Reset some variables back to default
            if (collisionDetection()) {
                Swal.fire({
                    position: 'top',
                    icon: 'warning',
                    title: `Game Over! You reached level ${level} with a score of ${currentScore}. Game reloading...`,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 2000
                });
            } else if (resetGame === true) {
                Swal.fire({
                    position: 'top',
                    icon: 'warning',
                    title: `Settings changed successfully. Game reloading...`,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 2000
                });
            }
            resetGame = false;
            pause = false;
            paused.style.display = "none";
            highScore = document.getElementById('newHighScore').innerHTML;
            if (highScore < currentScore) {
                document.getElementById('newHighScore').innerHTML = currentScore;
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
     * @param {*} draws the snake to the canvas from co-ordinates given in drawSnake 
     */
    function drawEachSnakeSection(snakeSection) {
        // background color of snake section
        gameBoardCtx.fillStyle = snakeColor;
        // border of snake section
        gameBoardCtx.strokeStyle = snakeBorder;
        gameBoardCtx.lineWidth = 1;
        // Define size of each section
        gameBoardCtx.fillRect(snakeSection.x, snakeSection.y, pixelSize, pixelSize);
        // draw the canvas border
        gameBoardCtx.strokeRect(snakeSection.x, snakeSection.y, pixelSize, pixelSize);
    }

    /**
     * 
     * @returns detects if snake has collided with an object to call game over
     */
    function collisionDetection() {
        for (let i = 4; i < snake.length; i++) { //start at 4 as length of starting snake
            if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true; //if snake hits itself
        }
        let collideLeftWall = snake[0].x < pixelSize;
        let collideRightWall = snake[0].x > (gameBoard.width - pixelSize) - dx;
        let collideToptWall = snake[0].y < pixelSize;
        let collideBottomWall = snake[0].y > (gameBoard.width - pixelSize) - dy;
        return collideLeftWall || collideRightWall || collideToptWall || collideBottomWall;
    }

    /**
     * 
     * @param {*} event key press
     * @returns listens for a key press and either turns the snake in the correct direction or pauses the game
     */
    function changeSnakeDirection(event) {
        if (startGame) {
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
            if (changingSnakeDirection) return;
            changingSnakeDirection = true;
            let keyPressed = event.keyCode;

            //define what action to take depending on snake direction
            let leftDir = dx === -pixelSize;
            let rightDir = dx === pixelSize;
            let upDir = dy === -pixelSize;
            let downDir = dy === pixelSize;

            if (keyPressed === arrowLeft && !rightDir) {
                dx = -pixelSize;
                dy = 0;
            }

            if (keyPressed === arrowRight && !leftDir) {
                dx = pixelSize;
                dy = 0;
            }

            if (keyPressed === arrowUp && !downDir) {
                dx = 0;
                dy = -pixelSize;
            }

            if (keyPressed === arrowDown && !upDir) {
                dx = 0;
                dy = pixelSize;
            }

            if (keyPressed === keyA && !rightDir) {
                dx = -pixelSize;
                dy = 0;
            }

            if (keyPressed === keyD && !leftDir) {
                dx = pixelSize;
                dy = 0;
            }

            if (keyPressed === keyW && !downDir) {
                dx = 0;
                dy = -pixelSize;
            }

            if (keyPressed === keyS && !upDir) {
                dx = 0;
                dy = pixelSize;
            }

            if (keyPressed === spaceBar) {
                if (pause === false) {
                    pause = true;
                    paused.style.display = "inline-block";
                } else {
                    pause = false;
                    paused.style.display = "none";
                }
            }
        }
    }

    /**
     * 
     * @returns touch / click controls for buttons
     */
    function touchControlsClicked() {
        if (startGame) {
            Haptics.vibrate(100);
            if (changingSnakeDirection) return;
            changingSnakeDirection = true;

            //define what action to take depending on snake direction
            let leftDir = dx === -pixelSize;
            let rightDir = dx === pixelSize;
            let upDir = dy === -pixelSize;
            let downDir = dy === pixelSize;

            if (this.getAttribute("id") === "btn-left" && !rightDir) {
                dx = -pixelSize;
                dy = 0;
            }

            if (this.getAttribute("id") === "btn-right" && !leftDir) {
                dx = pixelSize;
                dy = 0;
            }

            if (this.getAttribute("id") === "btn-up" && !downDir) {
                dx = 0;
                dy = -pixelSize;
            }

            if (this.getAttribute("id") === "btn-down" && !upDir) {
                dx = 0;
                dy = pixelSize;
            }

            if (this.getAttribute("id") === "pause") {
                if (pause === false) {
                    pause = true;
                    paused.style.display = "inline-block";
                } else {
                    pause = false;
                    paused.style.display = "none";
                }
            }
        }
    }

    let touchControls = document.getElementsByClassName('btnControls');
    for (let i = 0; i < touchControls.length; i++) {
        touchControls[i].addEventListener('click', touchControlsClicked);
    }

    /**
     * Move the snake by updating the snake array. Check if leveling up and call to generate bonus food. Update score.
     */
    function moveSnake() {
        if (pause === false && startGame == true) {
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
                gameSound = new sound("assets/sound/food.mp3");
                gameSound.play();
                if (eatCount % 5 === 0) {
                    if (speed > 50) {
                        speed -= 10;
                    }
                    ++level;
                    bonusScore = 0;
                    gameSound = new sound("assets/sound/level-up.mp3");
                    gameSound.play();
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
                    gameMessage.innerHTML = `<strong><font color="green">Bonus Mode! +10 score per food eaten!</font></strong>`;
                    gameSound = new sound("assets/sound/bonus-food.mp3");
                    gameSound.play();
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
                let bonusSnakeEaten = part.x == bonusFoodX && part.y == bonusFoodX;
                if (bonusSnakeEaten) generateBonusFood();
            });
        } else {
            bonusFoodX = "";
            bonusFoodY = "";
        }
    }

    /**
     * Take generated co-ordinates and draw food to the canvas
     */
    function drawFood() {
        gameBoardCtx.fillStyle = 'red';
        gameBoardCtx.strokeStyle = 'black';
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
            gameBoardCtx.fillStyle = 'green';
            gameBoardCtx.strokeStyle = 'black';
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
        }
        this.stop = function () {
            this.sound.pause();
        }
    }

}) //end DOM loaded function