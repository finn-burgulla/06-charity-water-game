// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

// Game state variables
let score = 0; // Player's score
let timer = 60; // Time left in seconds
let gameRunning = false; // Is the game running?
let timerInterval; // To store the timer interval
let dropInterval; // To store the drop creation interval
let lastMilestoneScore = 0; // To track milestones

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy:   { timer: 60, dropInterval: 1200 },
  normal: { timer: 45, dropInterval: 900 },
  hard:   { timer: 30, dropInterval: 600 }
};

// Milestone scores and messages
const MILESTONES = [
  { score: 10, message: "Great start!" },
  { score: 25, message: "You're doing great!" },
  { score: 50, message: "Halfway there!" },
  { score: 100, message: "Amazing progress!" },
  { score: 200, message: "Incredible! Keep going!" }
];

// Get DOM elements
const scoreSpan = document.getElementById('score');
const timerSpan = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const gameArea = document.getElementById('game-area');
const difficultySelect = document.getElementById('difficulty-select'); // new

// Sound effects
const soundClean = document.getElementById('sound-clean');
const soundBad = document.getElementById('sound-bad');

// Function to create a new water drop and make it fall
// Drops can be clean (blue) or polluted (gray)
function createDrop() {
  // Only create drops if the game is running
  if (!gameRunning) return;
  
  // Create a new drop element
  const drop = document.createElement('div');
  
  // Randomly decide if the drop is clean (70% chance) or polluted (30% chance)
  const isClean = Math.random() < 0.7;
  
  // Add the correct classes for styling
  drop.classList.add('water-drop');
  drop.classList.add(isClean ? 'clean-drop' : 'polluted-drop');
  
  // Set a random horizontal position for the drop
  const gameAreaWidth = gameArea.offsetWidth;
  const dropWidth = 30; // Width of drop from CSS
  const randomX = Math.floor(Math.random() * (gameAreaWidth - dropWidth));
  drop.style.left = `${randomX}px`;
  
  // Set a random fall duration between 3 and 6 seconds
  const fallDuration = Math.random() * 3 + 3;
  drop.style.animationDuration = `${fallDuration}s`;
  
  // When the drop is clicked
  drop.addEventListener('click', (event) => {
    // Only process click if the game is running
    if (!gameRunning) return;
    
    // Remove the drop from the game area
    drop.remove();
    
    if (isClean) {
      // Clean drop: add 10 points
      score += 10;
      // Play clean sound
      if (soundClean) {
        soundClean.currentTime = 0;
        soundClean.play();
      }
    } else {
      // Polluted drop: subtract 5 points and show "Oops!" message
      score -= 5;
      // Play bad sound
      if (soundBad) {
        soundBad.currentTime = 0;
        soundBad.play();
      }
      showOopsMessage(event.clientX, event.clientY);
    }
    
    // Update the score display
    scoreSpan.textContent = score;
    
    // Check for milestone
    checkMilestone();
  });
  
  // Add the drop to the game area
  gameArea.appendChild(drop);
  
  // When the drop reaches the bottom (animation ends)
  drop.addEventListener('animationend', () => {
    // If the drop is still in the game area
    if (drop.parentNode === gameArea) {
      // If it's a polluted drop, penalize the player
      if (!isClean) {
        score -= 10; // Bigger penalty for missing polluted drops
        scoreSpan.textContent = score;
        // Show a red -10 at the bottom
        const splash = document.createElement('div');
        splash.textContent = '-10';
        splash.classList.add('oops-message');
        splash.style.bottom = '10px';
        splash.style.left = drop.style.left;
        gameArea.appendChild(splash);
        setTimeout(() => {
          if (splash.parentNode === gameArea) {
            gameArea.removeChild(splash);
          }
        }, 1000);
      }
      // Remove the drop from the DOM
      gameArea.removeChild(drop);
    }
  });
}

// Function to show a red "Oops!" message when a polluted drop is clicked
function showOopsMessage(x, y) {
  // Create the message element
  const oops = document.createElement('div');
  oops.textContent = 'Oops!';
  oops.classList.add('oops-message');
  // Position the message near the click
  const gameAreaRect = gameArea.getBoundingClientRect();
  const posX = x - gameAreaRect.left;
  const posY = y - gameAreaRect.top;
  oops.style.left = `${posX - 20}px`;
  oops.style.top = `${posY - 20}px`;
  // Add and remove the message
  gameArea.appendChild(oops);
  setTimeout(() => {
    if (oops.parentNode === gameArea) {
      gameArea.removeChild(oops);
    }
  }, 1000);
}

// Add milestone message element to DOM if not present
let milestoneMsgElem = document.getElementById('milestone-message');
if (!milestoneMsgElem) {
  milestoneMsgElem = document.createElement('div');
  milestoneMsgElem.id = 'milestone-message';
  milestoneMsgElem.style.position = 'fixed';
  milestoneMsgElem.style.top = '60px';
  milestoneMsgElem.style.left = '50%';
  milestoneMsgElem.style.transform = 'translateX(-50%)';
  milestoneMsgElem.style.background = '#FFC907';
  milestoneMsgElem.style.color = '#2E9DF7';
  milestoneMsgElem.style.fontWeight = 'bold';
  milestoneMsgElem.style.fontSize = '1.3rem';
  milestoneMsgElem.style.padding = '14px 32px';
  milestoneMsgElem.style.borderRadius = '24px';
  milestoneMsgElem.style.boxShadow = '0 2px 12px rgba(46,157,247,0.10)';
  milestoneMsgElem.style.opacity = '0';
  milestoneMsgElem.style.transition = 'opacity 0.5s';
  milestoneMsgElem.style.zIndex = '200';
  document.body.appendChild(milestoneMsgElem);
}

// Function to show the milestone banner at the top
function showMilestoneBanner() {
  const banner = document.getElementById('milestone-banner');
  banner.classList.add('show');
  // Hide the banner after 3 seconds
  setTimeout(() => {
    banner.classList.remove('show');
  }, 3000);
}

// Function to show milestone message with fade-in/out
function showMilestoneMessage(text) {
  milestoneMsgElem.textContent = text;
  milestoneMsgElem.style.opacity = '1';
  setTimeout(() => {
    milestoneMsgElem.style.opacity = '0';
  }, 2000);
}

// Function to check if a new milestone is reached
function checkMilestone() {
  // Show banner for every +50 points (legacy)
  if (score >= lastMilestoneScore + 50) {
    lastMilestoneScore = Math.floor(score / 50) * 50;
    showMilestoneBanner();
  }
  // Show custom message for defined milestones
  for (const milestone of MILESTONES) {
    if (score === milestone.score) {
      showMilestoneMessage(milestone.message);
      break;
    }
  }
}

// Function to create a confetti effect at Game Over if score > 200
function createConfetti() {
  const confettiContainer = document.getElementById('confetti-container');
  const colors = ['#FFC907', '#2E9DF7', '#8BD1CB', '#4FCB53', '#FF902A'];
  // Create 50 confetti pieces
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    // Random position, color, size, and delay
    const left = Math.random() * 100;
    const size = Math.random() * 10 + 10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const delay = Math.random() * 3;
    confetti.style.left = `${left}%`;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = color;
    confetti.style.animationDelay = `${delay}s`;
    confettiContainer.appendChild(confetti);
  }
  // Remove confetti after animation
  setTimeout(() => {
    confettiContainer.innerHTML = '';
  }, 7000);
}

// Function to start the game when Start button is clicked
function startGame() {
  // Get selected difficulty
  const difficulty = difficultySelect.value;
  const settings = DIFFICULTY_SETTINGS[difficulty];

  // Reset game state
  score = 0;
  timer = settings.timer;
  gameRunning = true;
  lastMilestoneScore = 0;
  // Update displays
  scoreSpan.textContent = score;
  timerSpan.textContent = timer;
  // Hide Start button and difficulty selector
  startBtn.style.display = 'none';
  difficultySelect.disabled = true;
  // Clear drops
  gameArea.innerHTML = '';
  // Start the countdown timer
  timerInterval = setInterval(() => {
    timer--;
    timerSpan.textContent = timer;
    // If timer reaches 0, end the game
    if (timer <= 0) {
      endGame();
    }
  }, 1000);
  // Start creating drops at the selected interval
  dropInterval = setInterval(createDrop, settings.dropInterval);
}

// Function to end the game and show Game Over screen
function endGame() {
  gameRunning = false;
  clearInterval(timerInterval);
  clearInterval(dropInterval);
  // Get Game Over elements
  const gameOverScreen = document.getElementById('game-over');
  const finalScoreSpan = document.getElementById('final-score');
  const playAgainBtn = document.getElementById('play-again-btn');
  // Update final score
  finalScoreSpan.textContent = score;
  // Show Game Over screen
  gameOverScreen.style.display = 'flex';
  // If score is above 200, show confetti
  if (score > 200) {
    createConfetti();
  }
  // Add event listener to Play Again button
  playAgainBtn.onclick = () => {
    // Hide Game Over screen
    gameOverScreen.style.display = 'none';
    // Reset game state
    score = 0;
    timer = DIFFICULTY_SETTINGS[difficultySelect.value].timer;
    lastMilestoneScore = 0;
    // Update displays
    scoreSpan.textContent = score;
    timerSpan.textContent = timer;
    // Show Start button and enable difficulty selector
    startBtn.style.display = 'inline-block';
    difficultySelect.disabled = false;
    // Clear drops
    gameArea.innerHTML = '';
  };
}

// Add event listener to Start button to begin the game
startBtn.addEventListener('click', startGame);
