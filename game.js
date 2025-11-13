document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('overlay');
    const winOverlay = document.getElementById('win-overlay');
    const finalScoreElement = document.getElementById('final-score');
    const finalStageScoreElement = document.getElementById('final-stage-score');
    const homePage = document.getElementById('home-page');
    const gameContainer = document.getElementById('game-container');
    const scoreDashboard = document.getElementById('score-dashboard');
    const howToPlay = document.getElementById('how-to-play');
    const difficultyPage = document.getElementById('difficulty-page');
    const scoreList = document.getElementById('score-list');
    const stageText = document.getElementById('stage-text');
    const startButton = document.getElementById('start-button');
    const scoreButton = document.getElementById('score-button');
    const backButton = document.getElementById('back-button');
    const backToHomeButton = document.getElementById('back-to-home');
    const backToHomeWinButton = document.getElementById('back-to-home-win');
    const backToHomeInstructionsButton = document.getElementById('back-to-home-instructions');
    const howToPlayButton = document.getElementById('how-to-play-button');
    const easyButton = document.getElementById('easy-button');
    const mediumButton = document.getElementById('medium-button');
    const hardButton = document.getElementById('hard-button');
    const infiniteButton = document.getElementById('infinite-button');

    // Initialize scores array - retrieve from localStorage if available
    let scoreHistory = JSON.parse(localStorage.getItem('flappyBirdScores')) || [];

    // Difficulty settings
    let currentDifficulty = 'medium';
    let isInfiniteMode = false;
    const difficultySettings = {
        easy: { velocityX: -2, pipeDelay: 2000, gravity: 0.6 },
        medium: { velocityX: -3, pipeDelay: 1600, gravity: 0.7 },
        hard: { velocityX: -5, pipeDelay: 1300, gravity: 0.8 }
    };

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
    let gravity = difficultySettings.medium.gravity;
    let velocityX = difficultySettings.medium.velocityX;
    let velocityY = 0;
    let score = 0;
    let currentStage = 1;
    let gameover = false;
    let gameStarted = false;
    let gameWon = false;
    
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
        currentStage = 1;
        gameover = false;
        gameStarted = false;
        gameWon = false;
        
        clearInterval(gameLoop);
        clearInterval(placePipeTimer);
        
        // Set up game loop (60 FPS)
        gameLoop = setInterval(update, 1000 / 60);
        
        // Pipes appear based on difficulty
        placePipeTimer = setInterval(placePipes, difficultySettings[currentDifficulty].pipeDelay);
        
        // Ensure overlays are hidden
        overlay.classList.add('hidden');
        winOverlay.classList.add('hidden');
        stageText.textContent = `Stage: ${currentStage}`;
        
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
        if (gameover || gameWon) return;
        
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
                
                // Check for stage progression
                updateStage();
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

    // Update stage based on score
    function updateStage() {
        // Skip stage updates in infinite mode
        if (isInfiniteMode) return;
        
        let newStage = 1;
        if (score >= 100) {
            newStage = 5;
            gameWon = true;
            showWinScreen();
        } else if (score >= 75) {
            newStage = 4;
        } else if (score >= 50) {
            newStage = 3;
        } else if (score >= 25) {
            newStage = 2;
        }
        
        if (newStage !== currentStage) {
            currentStage = newStage;
            stageText.textContent = `Stage: ${currentStage}`;
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

    // Show win screen
    function showWinScreen() {
        clearInterval(placePipeTimer);
        clearInterval(gameLoop);
        
        // Save winning score to history
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
        
        // Update score and show win overlay
        finalStageScoreElement.textContent = `Final Score: ${currentScore}`;
        winOverlay.classList.remove('hidden');
    }

    // Draw function 
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, boardWidth, boardHeight);
        
        // Draw background
        ctx.drawImage(backgroundImage, 0, 0, boardWidth, boardHeight);
        
        // Draw instructions if game hasn't started
        if (!gameStarted && !gameover && !gameWon) {
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
        
        // Draw stage in top right (only if not in infinite mode)
        if (!isInfiniteMode) {
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`Stage: ${currentStage}`, boardWidth - 15, 35);
        }
        
        // Request next frame
        requestAnimationFrame(draw);
    }    // Navigation and button handlers
    startButton.addEventListener('click', () => {
        homePage.classList.add('hidden');
        gameContainer.classList.add('hidden');
        scoreDashboard.classList.add('hidden');
        howToPlay.classList.add('hidden');
        difficultyPage.classList.remove('hidden');
    });

    scoreButton.addEventListener('click', () => {
        homePage.classList.add('hidden');
        gameContainer.classList.add('hidden');
        difficultyPage.classList.add('hidden');
        howToPlay.classList.add('hidden');
        scoreDashboard.classList.remove('hidden');
        displayScores();
    });

    howToPlayButton.addEventListener('click', () => {
        homePage.classList.add('hidden');
        gameContainer.classList.add('hidden');
        scoreDashboard.classList.add('hidden');
        difficultyPage.classList.add('hidden');
        howToPlay.classList.remove('hidden');
    });

    backButton.addEventListener('click', () => {
        homePage.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        scoreDashboard.classList.add('hidden');
        howToPlay.classList.add('hidden');
        difficultyPage.classList.add('hidden');
    });

    backToHomeInstructionsButton.addEventListener('click', () => {
        homePage.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        scoreDashboard.classList.add('hidden');
        howToPlay.classList.add('hidden');
        difficultyPage.classList.add('hidden');
    });

    // Difficulty selection handlers
    easyButton.addEventListener('click', () => {
        currentDifficulty = 'easy';
        gravity = difficultySettings.easy.gravity;
        velocityX = difficultySettings.easy.velocityX;
        startGame();
    });

    mediumButton.addEventListener('click', () => {
        currentDifficulty = 'medium';
        gravity = difficultySettings.medium.gravity;
        velocityX = difficultySettings.medium.velocityX;
        startGame();
    });

    hardButton.addEventListener('click', () => {
        currentDifficulty = 'hard';
        isInfiniteMode = false;
        gravity = difficultySettings.hard.gravity;
        velocityX = difficultySettings.hard.velocityX;
        startGame();
    });

    infiniteButton.addEventListener('click', () => {
        currentDifficulty = 'medium';
        isInfiniteMode = true;
        gravity = difficultySettings.medium.gravity;
        velocityX = difficultySettings.medium.velocityX;
        startGame();
    });

    function startGame() {
        homePage.classList.add('hidden');
        difficultyPage.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        scoreDashboard.classList.add('hidden');
        howToPlay.classList.add('hidden');
        init();
    }

    backToHomeButton.addEventListener('click', () => {
        homePage.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        scoreDashboard.classList.add('hidden');
        howToPlay.classList.add('hidden');
        difficultyPage.classList.add('hidden');
        overlay.classList.add('hidden');
        winOverlay.classList.add('hidden');
    });

    backToHomeWinButton.addEventListener('click', () => {
        homePage.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        scoreDashboard.classList.add('hidden');
        howToPlay.classList.add('hidden');
        difficultyPage.classList.add('hidden');
        overlay.classList.add('hidden');
        winOverlay.classList.add('hidden');
    });

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !gameover && !gameWon && gameContainer.classList.contains('hidden') === false) {
            velocityY = -7; // Reduced from -9 to make jumps less extreme
            gameStarted = true;
        }
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
        howToPlay.classList.add('hidden');
        difficultyPage.classList.add('hidden');
        overlay.classList.add('hidden');
        winOverlay.classList.add('hidden');
        
        // Set up animation frame
        requestAnimationFrame(draw);
    });
});
