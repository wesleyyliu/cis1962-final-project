// Keyboard mapping
export function getDirectionFromKey(key) {
  const keyMap = {
    'ArrowUp': 'UP',
    'w': 'UP',
    'W': 'UP',
    'ArrowDown': 'DOWN',
    's': 'DOWN',
    'S': 'DOWN',
    'ArrowLeft': 'LEFT',
    'a': 'LEFT',
    'A': 'LEFT',
    'ArrowRight': 'RIGHT',
    'd': 'RIGHT',
    'D': 'RIGHT'
  };
  return keyMap[key];
}

// Username validation
export function validateUsername(username) {
  return username.trim().length >= 1 && username.trim().length <= 20;
}

// LocalStorage helpers for dummy stats
export function getStats(username) {
  const key = `snake_stats_${username}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    username,
    wins: 0,
    losses: 0,
    winStreak: 0
  };
}

export function updateStats(username, isWin) {
  const stats = getStats(username);

  if (isWin) {
    stats.wins++;
    stats.winStreak++;
  } else {
    stats.losses++;
    stats.winStreak = 0;
  }

  const key = `snake_stats_${username}`;
  localStorage.setItem(key, JSON.stringify(stats));
  return stats;
}

// Save/load username
export function saveUsername(username) {
  localStorage.setItem('snake_last_username', username);
}

export function getLastUsername() {
  return localStorage.getItem('snake_last_username') || '';
}
