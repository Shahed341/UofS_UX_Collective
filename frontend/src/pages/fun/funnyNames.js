/**
 * UX Collective — frontend/src/pages/fun/funnyNames.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
// Default leaderboard names for players who don't type one. All fit the 24-character limit.
const FIRST = ['Gradient', 'Kerning', 'Pixel', 'Figma', 'Hex', 'Padding', 'Wireframe', 'Vector', 'Lorem', 'Drop Shadow', 'Auto Layout', 'Comic Sans', 'Bezier', 'Opacity', 'Grid'];
const SECOND = ['Goblin', 'Kid', 'Pusher', 'Ferret', 'Hamster', 'Panda', 'Wizard', 'Viking', 'Ipsum', 'Llama', 'Gremlin', 'Raccoon', 'Ninja', 'Potato', 'Goose'];

export function funnyName() {
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  return `${pick(FIRST)} ${pick(SECOND)}`;
}
