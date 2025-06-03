document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('overlay');
    const finalScoreElement = document.getElementById('final-score');
    const homePage = document.getElementById('home-page');
    const gameContainer = document.getElementById('game-container');
    const scoreDashboard = document.getElementById('score-dashboard');
    const scoreList = document.getElementById('score-list');
    const startButton = document.getElementById('start-button');
    const scoreButton = document.getElementById('score-button');
    const backButton = document.getElementById('back-button');
    const backToHomeButton = document.getElementById('back-to-home');

    // Initialize scores array - retrieve from localStorage if available
    let scoreHistory = JSON.parse(localStorage.getItem('flappyBirdScores')) || [];

    // Set canvas dimensions
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

    // Bird properties 
    const birdX = boardWidth / 8;
    const birdY = boardHeight / 2;
    const birdWidth = 32;
    const birdHeight = 26;

    // Pipe properties 
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
        
        // Set up game loop (60 FPS)
        gameLoop = setInterval(update, 1000 / 60);
        
        // Pipes appear every 1600ms
        placePipeTimer = setInterval(placePipes, 1600);
        
        // Ensure game over overlay is hidden
        overlay.classList.add('hidden');
        
        // Start animation
        draw();
    }

    // Place pipes function 
    function placePipes() {
        if (!gameStarted || gameover) return;
        
        const pipeY = 0;
        const randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
        const openingSpace = boardHeight / 3.5; // Space between top and bottom pipes
        
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

    // Update game state 
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
                score += 0.5; 
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

    // Collision detection 
    function collision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }    // Game over function
    function gameOver() {
        gameover = true;
        clearInterval(placePipeTimer);
        clearInterval(gameLoop);
        
        // Save score to history
        const currentScore = Math.floor(score);
        const timestamp = new Date().toLocaleString();
        scoreHistory.push({ score: currentScore, date: timestamp });
        
        // Sort scores in descending order
        scoreHistory.sort((a, b) => b.score - a.score);
        
        // Keep only the top 10 scores
        if (scoreHistory.length > 10) {
            scoreHistory = scoreHistory.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem('flappyBirdScores', JSON.stringify(scoreHistory));
        
        // Update score and show overlay
        finalScoreElement.textContent = `Score: ${currentScore}`;
        overlay.classList.remove('hidden');
    }

    // Draw function 
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
    }    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !gameover && gameContainer.classList.contains('hidden') === false) {
            velocityY = -7; // Reduced from -9 to make jumps less extreme
            gameStarted = true;
        }
    });

    // Navigation and button handlers
    startButton.addEventListener('click', () => {
        homePage.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        scoreDashboard.classList.add('hidden');
        init();
    });

    scoreButton.addEventListener('click', () => {
        homePage.classList.add('hidden');
        gameContainer.classList.add('hidden');
        scoreDashboard.classList.remove('hidden');
        displayScores();
    });

    backButton.addEventListener('click', () => {
        homePage.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        scoreDashboard.classList.add('hidden');
    });

    backToHomeButton.addEventListener('click', () => {
        homePage.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        scoreDashboard.classList.add('hidden');
        overlay.classList.add('hidden');
    });

    // Function to display scores in the dashboard
    function displayScores() {
        // Clear previous scores
        scoreList.innerHTML = '';
        
        if (scoreHistory.length === 0) {
            const noScores = document.createElement('div');
            noScores.className = 'score-item';
            noScores.textContent = 'No scores yet. Play a game!';
            scoreList.appendChild(noScores);
        } else {
            // Add each score to the list
            scoreHistory.forEach((item, index) => {
                const scoreItem = document.createElement('div');
                scoreItem.className = 'score-item';
                
                const rank = document.createElement('span');
                rank.textContent = `#${index + 1}`;
                
                const scoreText = document.createElement('span');
                scoreText.textContent = `Score: ${item.score}`;
                
                const date = document.createElement('span');
                date.textContent = item.date;
                
                scoreItem.appendChild(rank);
                scoreItem.appendChild(scoreText);
                scoreItem.appendChild(date);
                
                scoreList.appendChild(scoreItem);
            });
        }
    }    // Initialize game when all images are loaded
    Promise.all([
        new Promise(resolve => backgroundImage.onload = resolve),
        new Promise(resolve => birdImage.onload = resolve),
        new Promise(resolve => topPipeImage.onload = resolve),
        new Promise(resolve => bottomPipeImage.onload = resolve)
    ]).then(() => {
        // Initially show home page
        homePage.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        scoreDashboard.classList.add('hidden');
        overlay.classList.add('hidden');
        
        // Set up animation frame
        requestAnimationFrame(draw);
    });
});
