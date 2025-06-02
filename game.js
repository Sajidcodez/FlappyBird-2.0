document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('overlay');
    const finalScoreElement = document.getElementById('final-score');

    // Set canvas dimensions to match the Java version
    const boardWidth = 800;
    const boardHeight = 600;
    canvas.width = boardWidth;
    canvas.height = boardHeight;

    // Load images
    const backgroundImage = new Image();
    backgroundImage.src = 'flappybirdbg.png';
    
    const birdImage = new Image();
    birdImage.src = 'flappybird.png';
    
    const topPipeImage = new Image();
    topPipeImage.src = 'toppipe.png';
    
    const bottomPipeImage = new Image();
    bottomPipeImage.src = 'bottompipe.png';

    // Bird properties (matching Java version)
    const birdX = boardWidth / 8;
    const birdY = boardHeight / 2;
    const birdWidth = 32;
    const birdHeight = 26;

    // Pipe properties (matching Java version)
    const pipeWidth = 64;
    const pipeHeight = 512;
    
    // Game state
    let bird = {
        x: birdX,
        y: birdY,
        width: birdWidth,
        height: birdHeight
    };
    
    let pipes = [];
    let gravity = 0.7;  // controls how fast the bird falls
    let velocityX = -3; // controls how fast the pipes move
    let velocityY = 0;
    let score = 0;
    let gameover = false;
    let gameStarted = false;
    
    // Game timers
    let gameLoop;
    let placePipeTimer;

    // Initialize game
    function init() {
        bird = {
            x: birdX,
            y: birdY,
            width: birdWidth,
            height: birdHeight
        };
        
        pipes = [];
        velocityY = 0;
        score = 0;
        gameover = false;
        gameStarted = false;
        
        clearInterval(gameLoop);
        clearInterval(placePipeTimer);
        
        // Set up game loop (60 FPS like Java version)
        gameLoop = setInterval(update, 1000 / 60);
        
        // Place pipes every 1800ms (increased from 1350ms to make pipes appear less frequently)
        placePipeTimer = setInterval(placePipes, 1800);
        
        // Ensure game over overlay is hidden
        overlay.classList.add('hidden');
        
        // Start animation
        draw();
    }

    // Place pipes function (matches Java version)
    function placePipes() {
        if (!gameStarted || gameover) return;
        
        const pipeY = 0;
        const randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
        const openingSpace = boardHeight / 3.5; // Increased from /4 to make the opening larger
        
        // Top pipe
        const topPipe = {
            x: boardWidth,
            y: randomPipeY,
            width: pipeWidth,
            height: pipeHeight,
            image: topPipeImage,
            gotThru: false
        };
        
        // Bottom pipe
        const bottomPipe = {
            x: boardWidth,
            y: topPipe.y + pipeHeight + openingSpace,
            width: pipeWidth,
            height: pipeHeight,
            image: bottomPipeImage,
            gotThru: false
        };
        
        pipes.push(topPipe, bottomPipe);
    }

    // Update game state (matches Java version's move method)
    function update() {
        if (gameover) return;
        
        // Update bird position
        velocityY += gravity;
        bird.y += velocityY;
        bird.y = Math.max(bird.y, 0);
        
        // Update pipes and check collisions
        for (let i = 0; i < pipes.length; i++) {
            const pipe = pipes[i];
            pipe.x += velocityX;
            
            // Check if bird passed the pipe for scoring
            if (!pipe.gotThru && bird.x > pipe.x + pipe.width) {
                score += 0.5; // Same scoring as Java version
                pipe.gotThru = true;
            }
            
            // Check collision
            if (collision(bird, pipe)) {
                gameOver();
            }
        }
        
        // Clean up pipes that are off-screen
        pipes = pipes.filter(pipe => pipe.x > -pipe.width);
        
        // Check if bird hit the ground
        if (bird.y > boardHeight) {
            gameOver();
        }
    }

    // Collision detection (exactly matches Java version)
    function collision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    // Game over function
    function gameOver() {
        gameover = true;
        clearInterval(placePipeTimer);
        clearInterval(gameLoop);
        
        // Update score and show overlay
        finalScoreElement.textContent = `Score: ${Math.floor(score)}`;
        overlay.classList.remove('hidden');
    }

    // Draw function (matches Java version's draw method)
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, boardWidth, boardHeight);
        
        // Draw background
        ctx.drawImage(backgroundImage, 0, 0, boardWidth, boardHeight);
        
        // Draw instructions if game hasn't started
        if (!gameStarted && !gameover) {
            ctx.fillStyle = 'white';
            ctx.font = '38px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Press SPACEBAR to jump', boardWidth / 2, boardHeight / 2);
        }
        
        // Draw bird
        ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
        
        // Draw pipes
        pipes.forEach(pipe => {
            ctx.drawImage(pipe.image, pipe.x, pipe.y, pipe.width, pipe.height);
        });
        
        // Draw score
        ctx.fillStyle = 'white';
        ctx.font = '32px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${Math.floor(score)}`, 10, 35);
        
        // Request next frame
        requestAnimationFrame(draw);
    }

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (gameover) {
                init(); // Restart game
            } else {
                velocityY = -7; // Reduced from -9 to make jumps less extreme
                gameStarted = true;
            }
        }
    });

    // Initialize game when all images are loaded
    Promise.all([
        new Promise(resolve => backgroundImage.onload = resolve),
        new Promise(resolve => birdImage.onload = resolve),
        new Promise(resolve => topPipeImage.onload = resolve),
        new Promise(resolve => bottomPipeImage.onload = resolve)
    ]).then(() => {
        // Make sure overlay is hidden before initializing
        overlay.classList.add('hidden');
        init();
    });
});
