// get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// set canvas dimensions
canvas.width = 480;
canvas.height = 640;

// sound effects
const soundJump = new Audio('sounds/flap.wav');
const soundScore = new Audio('sounds/score.wav');
const soundGameOver = new Audio('sounds/game_over.wav');

// game variables
let score = 0;
let highScore = 0;
let gameSpeed = 2;
let gravity = 0.25;
let gameRunning = true;
let gameOverDisplayed = false;
let isMuted = false; // initial volume state

// determine the time of day for background
function getTimeOfDay() {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
}

// update the background based on time of day
function updateBackground() {
    const timeOfDay = getTimeOfDay();
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.className = ''; // clear previous classes
    gameContainer.classList.add(`background-${timeOfDay}`);
}

// bird object
const bird = {
    x: 150,
    y: canvas.height / 2,
    size: 20,
    velocity: 0,
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    },
    update() {
        this.velocity += gravity;
        this.y += this.velocity;

        if (this.y + this.size > canvas.height || this.y - this.size < 0) { // ground or ceiling collision
            gameOver();
        }
    }
};

// pipes
const pipes = [];
const pipeWidth = 60;
const pipeGap = 150; // consistent gap size
const pipeInterval = 2000; // how often to spawn pipes
const upperPipeMargin = 80; // minimum distance of the top pipe from the canvas top
const lowerPipeMargin = 80; // minimum distance of the bottom pipe from the canvas bottom

// global variable for the pipe spawn timer
let pipeSpawnTimer;

// adjusted spawnPipes function
function spawnPipes() {
    if (!gameRunning) return;

    clearTimeout(pipeSpawnTimer); // clear any existing timer

    const gapPosition = Math.random() * (canvas.height - lowerPipeMargin - pipeGap - upperPipeMargin) + upperPipeMargin;

    pipes.push({
        x: canvas.width,
        y: gapPosition - canvas.height / 2,
        scored: false
    });

    pipeSpawnTimer = setTimeout(spawnPipes, pipeInterval); // set a new timer
}

// draw pipes and handle game logic
function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = 'green';
        // top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, canvas.height / 2 + pipe.y);
        // bottom pipe
        ctx.fillRect(pipe.x, canvas.height / 2 + pipe.y + pipeGap, pipeWidth, canvas.height);

        // move pipes
        pipe.x -= gameSpeed;

        // collision detection
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.size > pipe.x &&
            (bird.y < canvas.height / 2 + pipe.y || bird.y + bird.size > canvas.height / 2 + pipe.y + pipeGap)
        ) {
            gameOver();
        }

        // score
        if (pipe.x + pipeWidth < bird.x && !pipe.scored) {
            score++;
            pipe.scored = true; // prevent multiple score increments per pipe
            if (!isMuted) soundScore.play();
            if (score > highScore) {
                highScore = score; // update high score if current score is greater
            }
        }
    });
}

// listen for key presses to control the bird
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameRunning && gameOverDisplayed) {
            restartGame();
        } else {
            bird.velocity = -5; // adjust for jump strength
            if (!isMuted) soundJump.play();
        }
    }
});

// game over
function gameOver() {
    gameRunning = false;
    gameOverDisplayed = true;
    if (!isMuted) soundGameOver.play();
    setTimeout(drawGameOver, 100); // ensure game over text is drawn last
}

// draw game over text and scores
function drawGameOver() {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Game Over', canvas.width / 2 - 90, canvas.height / 2);
    ctx.fillText('Score: ' + score, canvas.width / 2 - 90, canvas.height / 2 + 40);
    ctx.fillText('High Score: ' + highScore, canvas.width / 2 - 90, canvas.height / 2 + 80);
    ctx.fillText('Press Space to Restart', canvas.width / 2 - 150, canvas.height / 2 + 120);
}

// restart the game
function restartGame() {
    clearTimeout(pipeSpawnTimer); // ensure no timers are left running
    gameRunning = true;
    gameOverDisplayed = false;
    pipes.length = 0; // clear pipes
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    score = 0;
    spawnPipes();
    animate();
}

// toggle sound
function toggleSound() {
    isMuted = !isMuted;
    // no need to adjust each sound's volume individually since they're controlled by isMuted flag during play calls
    updateVolumeButton(); // update the volume button without reinitializing the animation loop
}

// draw the volume button
function drawVolumeButton() {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(isMuted ? '🔇' : '🔊', canvas.width - 50, 40);
}

// update only the volume button area
function updateVolumeButton() {
    ctx.clearRect(canvas.width - 60, 0, 60, 50); // clear the area where the volume button is drawn
    drawVolumeButton(); // redraw the volume button
}

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // determine the scale factor for x
    const scaleY = canvas.height / rect.height; // determine the scale factor for y
    const x = (event.clientX - rect.left) * scaleX; // adjust click x coordinate
    const y = (event.clientY - rect.top) * scaleY; // adjust click y coordinate

    // check if the click is within the bounds of the volume button
    if (x >= canvas.width - 60 && x <= canvas.width && y >= 0 && y <= 50) {
        toggleSound();
    }
});

// display the current score
function displayScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 20, 30);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
    bird.update();
    bird.draw();
    drawPipes();
    displayScore(); // display the current score
    drawVolumeButton();
    if (gameRunning) {
        requestAnimationFrame(animate); // create an infinite loop
    }
    if (gameOverDisplayed) {
        drawGameOver();
    }
}

// call to set the background based on the current time
updateBackground();

// initial call to start the game
spawnPipes();
animate();
