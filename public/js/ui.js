// UI controller for screen management and DOM manipulation

export function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  // Show target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

export function updateStats(stats) {
  // Update home screen stats
  document.getElementById('stat-wins').textContent = stats.wins;
  document.getElementById('stat-losses').textContent = stats.losses;
  document.getElementById('stat-winstreak').textContent = stats.winStreak;

  // Show stats card
  const statsCard = document.getElementById('stats-display');
  if (stats.wins > 0 || stats.losses > 0) {
    statsCard.classList.remove('hidden');
  } else {
    statsCard.classList.add('hidden');
  }
}

export function showCountdown(count) {
  const countdownEl = document.getElementById('countdown-number');
  countdownEl.textContent = count;
  // Re-trigger animation
  countdownEl.style.animation = 'none';
  setTimeout(() => {
    countdownEl.style.animation = 'pulse 1s ease-in-out';
  }, 10);
}

export function showMatchFound(player1, player2) {
  document.getElementById('player1-name').textContent = player1.username || 'Player 1';
  document.getElementById('player2-name').textContent = player2.username || 'Player 2';
}

export function setupGameHUD(player1, player2, myPlayerId) {
  // Determine which player is "you"
  const isPlayer1 = player1.id === myPlayerId;

  if (isPlayer1) {
    document.getElementById('game-player1-name').textContent = `You (${player1.username || 'Player 1'})`;
    document.getElementById('game-player2-name').textContent = player2.username || 'Player 2';
  } else {
    document.getElementById('game-player1-name').textContent = player1.username || 'Player 1';
    document.getElementById('game-player2-name').textContent = `You (${player2.username || 'Player 2'})`;
  }
}

export function showGameOver(winnerId, myPlayerId, stats, isGuest = false) {
  const resultMessage = document.getElementById('result-message');
  const updatedStatsCard = document.getElementById('updated-stats');

  if (!winnerId) {
    resultMessage.textContent = 'Draw!';
  } else if (winnerId === myPlayerId) {
    resultMessage.textContent = 'You Win!';
  } else {
    resultMessage.textContent = 'You Lose!';
  }

  // hide stats for guests, show for registered users
  if (isGuest) {
    updatedStatsCard.classList.add('hidden');
  } else {
    updatedStatsCard.classList.remove('hidden');
    // update final stats
    document.getElementById('final-wins').textContent = stats.wins;
    document.getElementById('final-losses').textContent = stats.losses;
    document.getElementById('final-winstreak').textContent = stats.winStreak;
  }
}

export function enableInput() {
  document.getElementById('find-match-btn').disabled = false;
}

export function disableInput() {
  document.getElementById('find-match-btn').disabled = true;
}
