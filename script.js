// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 480; // Match with CSS for consistency
canvas.height = 640; // Match with CSS for consistency

// Game variables
let score = 0;
let highScore = 0;
let gameSpeed = 2;
let gravity = 0.25;
let gameRunning = true;
let gameOverDisplayed = false;

// Bird object
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

        if (this.y + this.size > canvas.height || this.y - this.size < 0) { // Ground or ceiling collision
            gameOver();
        }
    }
};

// Pipes
const pipes = [];
const pipeWidth = 60;
const pipeGap = 150; // Consistent gap size
const pipeInterval = 2000; // How often to spawn pipes
const upperPipeMargin = 80; // Minimum distance of the top pipe from the canvas top
const lowerPipeMargin = 80; // Minimum distance of the bottom pipe from the canvas bottom

// Global variable for the pipe spawn timer
let pipeSpawnTimer;

// Adjusted spawnPipes function
function spawnPipes() {
    if (!gameRunning) return;

    clearTimeout(pipeSpawnTimer); // Clear any existing timer

    const gapPosition = Math.random() * (canvas.height - lowerPipeMargin - pipeGap - upperPipeMargin) + upperPipeMargin;

    pipes.push({
        x: canvas.width,
        y: gapPosition - canvas.height / 2,
        scored: false
    });

    pipeSpawnTimer = setTimeout(spawnPipes, pipeInterval); // Set a new timer
}



// Draw pipes and handle game logic
function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = 'green';
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, canvas.height / 2 + pipe.y);
        // Bottom pipe
        ctx.fillRect(pipe.x, canvas.height / 2 + pipe.y + pipeGap, pipeWidth, canvas.height);

        // Move pipes
        pipe.x -= gameSpeed;

        // Collision detection
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.size > pipe.x &&
            (bird.y < canvas.height / 2 + pipe.y || bird.y + bird.size > canvas.height / 2 + pipe.y + pipeGap)
        ) {
            gameOver();
        }

        // Score
        if (pipe.x + pipeWidth < bird.x && !pipe.scored) {
            score++;
            pipe.scored = true; // Prevent multiple score increments per pipe
            if (score > highScore) {
                highScore = score; // Update high score if current score is greater
            }
        }
    });
}

// Listen for key presses to control the bird
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameRunning && gameOverDisplayed) {
            restartGame();
        } else {
            bird.velocity = -5; // Adjust for jump strength
        }
    }
});

// Game over
function gameOver() {
    gameRunning = false;
    gameOverDisplayed = true;
    setTimeout(drawGameOver, 100); // Ensure game over text is drawn last
}

// Draw Game Over Text and scores
function drawGameOver() {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Game Over', canvas.width / 2 - 90, canvas.height / 2);
    ctx.fillText('Score: ' + score, canvas.width / 2 - 90, canvas.height / 2 + 40);
    ctx.fillText('High Score: ' + highScore, canvas.width / 2 - 90, canvas.height / 2 + 80);
    ctx.fillText('Press Space to Restart', canvas.width / 2 - 150, canvas.height / 2 + 120);
}

// Restart the game
function restartGame() {
    clearTimeout(pipeSpawnTimer); // Ensure no timers are left running
    gameRunning = true;
    gameOverDisplayed = false;
    pipes.length = 0; // Clear pipes
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    score = 0;
    spawnPipes();
    animate();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    bird.update();
    bird.draw();
    drawPipes();
    displayScore(); // Display the current score
    if (gameRunning) {
        requestAnimationFrame(animate); // Create an infinite loop
    }
    if (gameOverDisplayed) {
        drawGameOver();
    }
}

// Display the current score
function displayScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 20, 30);
}

// Initial call to start the game
spawnPipes();
animate();
