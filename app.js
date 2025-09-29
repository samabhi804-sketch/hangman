// Game data
const gameData = {
  easy_words: ["cat", "dog", "sun", "hat", "run", "bed", "fish", "tree", "ball", "star", "book", "jump", "frog", "cake", "rain", "door", "ship", "kite", "nose", "ring", "baby", "blue", "hand", "milk", "leaf", "duck", "lamp", "moon", "shoe", "doll", "bird", "bear", "boat", "car", "farm", "game", "gold", "home", "king", "lion", "love", "park", "play", "road", "song", "swim", "town", "walk", "wind", "work"],
  medium_words: ["garden", "banana", "castle", "school", "orange", "purple", "yellow", "dragon", "flower", "planet", "forest", "animal", "bridge", "corner", "mother", "window", "pencil", "turkey", "summer", "winter", "friend", "family", "nature", "picture", "spider", "monkey", "rabbit", "turtle", "bottle", "kitten", "circle", "square", "basket", "butter", "candle", "dinner", "finger", "guitar", "handle", "island", "jungle", "kernel", "ladder", "marble", "number", "office", "person", "quiver"],
  hard_words: ["jazz", "quiz", "fizz", "buzz", "jinx", "lynx", "sphinx", "rhythm", "glyph", "crypt", "fjord", "psalm", "yacht", "azure", "pixel", "quartz", "zombie", "zephyr", "xylophone", "waltz", "vortex", "squeeze", "quirky", "oxygen", "enzyme", "blizzard", "freezing", "puzzled", "dazzling", "whizzing", "buzzer", "fizzle", "gizzard", "grizzly", "muzzle", "nuzzle", "sizzle", "drizzle", "frazzle", "fuzzball", "jazzier", "puzzler", "quizzed", "razzled", "sizzler"],
  hangman_parts: ["gallows-base", "gallows-pole", "gallows-beam", "noose", "head", "body", "left-arm", "right-arm", "left-leg", "right-leg"],
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
};

// Game state
let currentGame = {
  word: '',
  guessedLetters: new Set(),
  wrongGuesses: 0,
  difficulty: 'easy',
  isGameOver: false,
  hasWon: false
};

// Statistics
let gameStats = {
  wins: 0,
  losses: 0,
  streak: 0
};

// DOM elements
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const wordDisplay = document.getElementById('word-display');
const wrongCountElement = document.getElementById('wrong-count');
const wrongLettersElement = document.getElementById('wrong-letters');
const keyboard = document.getElementById('keyboard');
const modal = document.getElementById('game-over-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const playAgainBtn = document.getElementById('play-again-btn');
const changeDifficultyBtn = document.getElementById('change-difficulty-btn');
const statsElements = {
  wins: document.getElementById('wins'),
  losses: document.getElementById('losses'),
  streak: document.getElementById('streak'),
  difficulty: document.getElementById('current-difficulty')
};

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  createKeyboard();
  startNewGame();
  updateStatsDisplay();
});

// Setup event listeners
function setupEventListeners() {
  // Difficulty button listeners
  difficultyButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      selectDifficulty(this.dataset.difficulty);
    });
  });

  // Modal button listeners
  playAgainBtn.addEventListener('click', startNewGame);
  changeDifficultyBtn.addEventListener('click', function() {
    hideModal();
    // Focus will naturally go to difficulty selection
  });

  // Keyboard event listener for physical keyboard
  document.addEventListener('keydown', function(e) {
    if (currentGame.isGameOver) return;
    
    const letter = e.key.toUpperCase();
    if (gameData.alphabet.includes(letter) && !currentGame.guessedLetters.has(letter)) {
      guessLetter(letter);
    }
  });
}

// Create on-screen keyboard
function createKeyboard() {
  keyboard.innerHTML = '';
  gameData.alphabet.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'letter-btn';
    btn.textContent = letter;
    btn.dataset.letter = letter;
    btn.addEventListener('click', function() {
      if (!this.disabled && !currentGame.isGameOver) {
        guessLetter(letter);
      }
    });
    keyboard.appendChild(btn);
  });
}

// Select difficulty level
function selectDifficulty(difficulty) {
  currentGame.difficulty = difficulty;
  
  // Update button states
  difficultyButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.difficulty === difficulty) {
      btn.classList.add('active');
    }
  });
  
  // Update stats display
  statsElements.difficulty.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  
  // Start new game with selected difficulty
  startNewGame();
}

// Start a new game
function startNewGame() {
  // Reset game state
  currentGame.word = getRandomWord(currentGame.difficulty).toUpperCase();
  currentGame.guessedLetters.clear();
  currentGame.wrongGuesses = 0;
  currentGame.isGameOver = false;
  currentGame.hasWon = false;
  
  // Reset UI
  hideModal();
  resetKeyboard();
  resetHangman();
  displayWord();
  updateGameInfo();
}

// Get random word based on difficulty
function getRandomWord(difficulty) {
  const words = gameData[difficulty + '_words'];
  return words[Math.floor(Math.random() * words.length)];
}

// Display the word with guessed letters
function displayWord() {
  wordDisplay.innerHTML = '';
  
  for (let letter of currentGame.word) {
    const letterBox = document.createElement('div');
    letterBox.className = 'letter-box';
    
    if (currentGame.guessedLetters.has(letter)) {
      letterBox.textContent = letter;
      letterBox.classList.add('revealed');
    }
    
    wordDisplay.appendChild(letterBox);
  }
}

// Handle letter guess
function guessLetter(letter) {
  if (currentGame.guessedLetters.has(letter) || currentGame.isGameOver) {
    return;
  }
  
  currentGame.guessedLetters.add(letter);
  
  const letterBtn = document.querySelector(`[data-letter="${letter}"]`);
  letterBtn.disabled = true;
  
  if (currentGame.word.includes(letter)) {
    // Correct guess
    letterBtn.classList.add('correct');
    displayWord();
    checkWin();
  } else {
    // Wrong guess
    letterBtn.classList.add('incorrect');
    currentGame.wrongGuesses++;
    showHangmanPart(currentGame.wrongGuesses - 1);
    updateGameInfo();
    checkLoss();
  }
}

// Show hangman part
function showHangmanPart(partIndex) {
  if (partIndex < gameData.hangman_parts.length) {
    const part = document.getElementById(gameData.hangman_parts[partIndex]);
    if (part) {
      part.classList.add('visible');
    }
  }
}

// Check win condition
function checkWin() {
  const hasGuessedAllLetters = [...currentGame.word].every(letter => 
    currentGame.guessedLetters.has(letter)
  );
  
  if (hasGuessedAllLetters) {
    currentGame.isGameOver = true;
    currentGame.hasWon = true;
    gameStats.wins++;
    gameStats.streak++;
    updateStatsDisplay();
    showGameOverModal(true);
  }
}

// Check loss condition
function checkLoss() {
  if (currentGame.wrongGuesses >= 6) {
    currentGame.isGameOver = true;
    currentGame.hasWon = false;
    gameStats.losses++;
    gameStats.streak = 0;
    updateStatsDisplay();
    showGameOverModal(false);
    revealWord();
  }
}

// Reveal the word when game is lost
function revealWord() {
  const letterBoxes = wordDisplay.querySelectorAll('.letter-box');
  [...currentGame.word].forEach((letter, index) => {
    if (!currentGame.guessedLetters.has(letter)) {
      letterBoxes[index].textContent = letter;
      letterBoxes[index].style.color = 'var(--color-error)';
    }
  });
}

// Show game over modal
function showGameOverModal(won) {
  const difficultyText = currentGame.difficulty.charAt(0).toUpperCase() + currentGame.difficulty.slice(1);
  
  if (won) {
    modalTitle.textContent = '🎉 Congratulations!';
    modalTitle.style.color = 'var(--color-success)';
    modalMessage.textContent = `You guessed "${currentGame.word}" correctly! Great job on ${difficultyText} difficulty!`;
  } else {
    modalTitle.textContent = '💀 Game Over';
    modalTitle.style.color = 'var(--color-error)';
    modalMessage.textContent = `The word was "${currentGame.word}". Better luck next time on ${difficultyText} difficulty!`;
  }
  
  modal.classList.remove('hidden');
}

// Hide modal
function hideModal() {
  modal.classList.add('hidden');
}

// Reset keyboard
function resetKeyboard() {
  const letterBtns = document.querySelectorAll('.letter-btn');
  letterBtns.forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('correct', 'incorrect');
  });
}

// Reset hangman drawing
function resetHangman() {
  const hangmanParts = document.querySelectorAll('.hangman-part');
  hangmanParts.forEach(part => {
    part.classList.remove('visible');
  });
}

// Update game info display
function updateGameInfo() {
  wrongCountElement.textContent = currentGame.wrongGuesses;
  
  const wrongLetters = [...currentGame.guessedLetters]
    .filter(letter => !currentGame.word.includes(letter))
    .join(', ');
  wrongLettersElement.textContent = wrongLetters;
}

// Update statistics display
function updateStatsDisplay() {
  statsElements.wins.textContent = gameStats.wins;
  statsElements.losses.textContent = gameStats.losses;
  statsElements.streak.textContent = gameStats.streak;
  
  // Add animation to updated stats
  Object.values(statsElements).forEach(element => {
    element.style.transform = 'scale(1.1)';
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 200);
  });
}

// Add some visual feedback animations
function addLetterRevealAnimation() {
  const revealedBoxes = document.querySelectorAll('.letter-box.revealed');
  revealedBoxes.forEach((box, index) => {
    setTimeout(() => {
      box.style.animation = 'letterReveal 0.3s ease-out';
    }, index * 100);
  });
}