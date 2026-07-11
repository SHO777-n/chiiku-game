/** レベル・経験値・能力値(純粋ロジック)。 */

export interface CharacterStats {
  level: number;
  xp: number;
  maxHp: number;
  maxMp: number;
  attack: number;
  defense: number;
}

export const MAX_LEVEL = 10;

/** そのレベルに到達するのに必要な累計XP(index = level) */
export const XP_TABLE = [0, 0, 20, 55, 110, 190, 300, 450, 650, 910, 1240];

export function xpForNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return Infinity;
  return XP_TABLE[level + 1];
}

export function statsForLevel(level: number): Omit<CharacterStats, 'xp'> {
  const l = Math.min(Math.max(level, 1), MAX_LEVEL);
  return {
    level: l,
    maxHp: 20 + (l - 1) * 6,
    maxMp: 10 + (l - 1) * 3,
    attack: 3 + (l - 1) * 2,
    defense: 0 + (l - 1),
  };
}

export interface GainXpResult {
  stats: CharacterStats;
  levelsGained: number;
}

/** XPを加算し、必要ならレベルアップを適用する。 */
export function gainXp(stats: CharacterStats, amount: number): GainXpResult {
  const xp = stats.xp + Math.max(0, amount);
  let level = stats.level;
  let levelsGained = 0;
  while (level < MAX_LEVEL && xp >= XP_TABLE[level + 1]) {
    level += 1;
    levelsGained += 1;
  }
  const base = statsForLevel(level);
  return { stats: { ...base, xp }, levelsGained };
}
