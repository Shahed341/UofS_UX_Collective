// Games available in the Game Corner, with the score ceilings used to reject impossible submissions.
export const GAMES = {
  aim: { name: 'Aim Trainer', maxScore: 45 },
  color: { name: 'Colour Eye', maxScore: 120 },
  pixel: { name: 'Pixel Perfect', maxScore: 800 },
};

// Monday 00:00 of the current week in Saskatoon time, as a MySQL DATETIME string (UTC, matching CURRENT_TIMESTAMP).
export function weekStartUtc() {
  const now = new Date(Date.now() - 6 * 60 * 60 * 1000); // Saskatoon wall clock
  const day = (now.getUTCDay() + 6) % 7; // 0 = Monday
  const monday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day);
  return new Date(monday + 6 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
}

export const LEADERBOARD_ORDER = 'score DESC, accuracy IS NULL, accuracy DESC, time_ms IS NULL, time_ms ASC, created_at ASC';
