/** ゲーム内時間(純粋ロジック)。1日 = 1440分。 */

export const DAY_MINUTES = 1440;
/** 実時間1秒あたりのゲーム内分(1日 ≒ 8分) */
export const MINUTES_PER_REAL_SECOND = 3;

export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';

export function advanceClock(clockMin: number, deltaMs: number): number {
  return (clockMin + (deltaMs / 1000) * MINUTES_PER_REAL_SECOND) % DAY_MINUTES;
}

export function dayPhase(clockMin: number): DayPhase {
  const h = clockMin / 60;
  if (h >= 5 && h < 7) return 'dawn';
  if (h >= 7 && h < 17) return 'day';
  if (h >= 17 && h < 19) return 'dusk';
  return 'night';
}

export function clockLabel(clockMin: number): string {
  const h = Math.floor(clockMin / 60);
  const m = Math.floor(clockMin % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 夜の暗さ 0(昼)〜1(深夜)。dawn/duskは補間。 */
export function darknessLevel(clockMin: number): number {
  const h = clockMin / 60;
  if (h >= 7 && h < 17) return 0;
  if (h >= 5 && h < 7) return 1 - (h - 5) / 2;
  if (h >= 17 && h < 19) return (h - 17) / 2;
  return 1;
}
