import * as SocketClient from './socket.js';
import * as Renderer from './renderer.js';
import * as UI from './ui.js';
import * as Utils from './utils.js';

// App state
const AppState = {
  HOME: 'home',
  SEARCHING: 'searching',
  COUNTDOWN: 'countdown',
  PLAYING: 'playing',
  GAMEOVER: 'gameover'
};

let currentState = AppState.HOME;
let currentUsername = '';
let currentGameId = null;
let myPlayerId = null;
let players = [];

// Initialize app
function init() {
  console.log('Initializing 3D Snake Game...');

  // Connect to server
  SocketClient.connect();

  // Setup socket event handlers
  setupSocketHandlers();

  // Setup DOM event handlers
  setupDOMHandlers();

  // Load last username
  const lastUsername = Utils.getLastUsername();
  if (lastUsername) {
    document.getElementById('username-input').value = lastUsername;
    // Load and display stats
    const stats = Utils.getStats(lastUsername);
    UI.updateStats(stats);
  }
}

function setupSocketHandlers() {
  SocketClient.onSearching(() => {
    console.log('Searching for opponent...');
    currentState = AppState.SEARCHING;
    UI.showScreen('searching-screen');
  });

  SocketClient.onMatchFound((data) => {
    console.log('Match found!', data);
    currentState = AppState.COUNTDOWN;
    currentGameId = data.gameId;
    players = data.players;
    myPlayerId = SocketClient.getSocketId();

    UI.showScreen('countdown-screen');
    UI.showMatchFound(players[0], players[1]);
  });

  SocketClient.onCountdown((data) => {
    console.log('Countdown:', data.count);
    UI.showCountdown(data.count);
  });

  SocketClient.onGameStarted((data) => {
    console.log('Game started!');
    currentState = AppState.PLAYING;
    UI.showScreen('game-screen');

    // Initialize renderer
    Renderer.init();

    // Setup HUD
    UI.setupGameHUD(players[0], players[1], myPlayerId);

    // Enable keyboard controls
    window.addEventListener('keydown', handleKeyPress);
  });

  SocketClient.onGameState((gameState) => {
    if (currentState === AppState.PLAYING) {
      Renderer.updateGameState(gameState);
    }
  });

  SocketClient.onGameOver((data) => {
    console.log('Game over!', data);
    currentState = AppState.GAMEOVER;

    // Determine if I won
    const iWon = data.winnerId === myPlayerId;
    const isDraw = !data.winnerId;

    // Update stats
    const updatedStats = isDraw
      ? Utils.updateStats(currentUsername, false) // Treat draw as loss for win streak
      : Utils.updateStats(currentUsername, iWon);

    // Disable keyboard controls
    window.removeEventListener('keydown', handleKeyPress);

    // Cleanup renderer
    Renderer.cleanup();

    // Show game over screen
    UI.showScreen('gameover-screen');
    UI.showGameOver(data.winnerId, myPlayerId, updatedStats);
  });

  SocketClient.onPlayerDisconnected(() => {
    console.log('Opponent disconnected');
    // Treat as win
    const updatedStats = Utils.updateStats(currentUsername, true);

    window.removeEventListener('keydown', handleKeyPress);
    Renderer.cleanup();

    currentState = AppState.GAMEOVER;
    UI.showScreen('gameover-screen');
    document.getElementById('result-message').textContent = 'Opponent Disconnected - You Win!';
    UI.showGameOver(myPlayerId, myPlayerId, updatedStats);
  });

  SocketClient.onMatchmakingCancelled(() => {
    console.log('Matchmaking cancelled');
    currentState = AppState.HOME;
    UI.showScreen('home-screen');
    UI.enableInput();
  });
}

function setupDOMHandlers() {
  // Find Match button
  document.getElementById('find-match-btn').addEventListener('click', () => {
    const username = document.getElementById('username-input').value.trim();

    if (!Utils.validateUsername(username)) {
      alert('Please enter a username (1-20 characters)');
      return;
    }

    currentUsername = username;
    Utils.saveUsername(username);

    // Load stats
    const stats = Utils.getStats(username);
    UI.updateStats(stats);

    // Start matchmaking
    UI.disableInput();
    SocketClient.findMatch(username);
  });

  // Cancel button
  document.getElementById('cancel-btn').addEventListener('click', () => {
    SocketClient.cancelMatchmaking();
  });

  // Play Again button
  document.getElementById('play-again-btn').addEventListener('click', () => {
    currentState = AppState.HOME;
    currentGameId = null;
    myPlayerId = null;
    players = [];

    UI.showScreen('home-screen');
    UI.enableInput();

    // Reload stats
    const stats = Utils.getStats(currentUsername);
    UI.updateStats(stats);
  });

  // Enter key on username input
  document.getElementById('username-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('find-match-btn').click();
    }
  });
}

function handleKeyPress(e) {
  if (currentState !== AppState.PLAYING) return;

  const direction = Utils.getDirectionFromKey(e.key);
  if (direction) {
    e.preventDefault();
    SocketClient.changeDirection(direction);
  }
}

// Start app when page loads
init();
