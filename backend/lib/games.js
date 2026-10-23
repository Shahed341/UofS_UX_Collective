// Games available on the Fun page, with the score ceilings used to reject impossible submissions.
export const GAMES = {
  aim: { name: 'Aim Trainer', maxScore: 45 },
  pattern: { name: 'Pattern', maxScore: 560 },
  pixel: { name: 'Pixel Perfect', maxScore: 800 },
};

export const LEADERBOARD_ORDER = 'score DESC, accuracy IS NULL, accuracy DESC, time_ms IS NULL, time_ms ASC, created_at ASC';
