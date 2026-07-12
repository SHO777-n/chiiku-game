/** 属性と状態異常(純粋ロジック)。 */

export type Element = 'physical' | 'fire' | 'ice' | 'echo';

export interface ElementProfile {
  weak: Element[];
  resist: Element[];
}

/** 弱点 1.5倍 / 耐性 0.5倍 / それ以外 1.0倍 */
export function elementMultiplier(attackElement: Element, profile: ElementProfile): number {
  if (profile.weak.includes(attackElement)) return 1.5;
  if (profile.resist.includes(attackElement)) return 0.5;
  return 1;
}

export type StatusType = 'poison' | 'stun';

export interface StatusEffect {
  type: StatusType;
  /** 効果が切れる時刻(ms) */
  untilMs: number;
  /** poison: 次のダメージ発生時刻(ms) */
  nextTickMs?: number;
}

export function applyStatus(
  statuses: StatusEffect[],
  type: StatusType,
  now: number,
  durationMs: number,
): StatusEffect[] {
  const untilMs = now + durationMs;
  const rest = statuses.filter((s) => s.type !== type);
  const effect: StatusEffect =
    type === 'poison' ? { type, untilMs, nextTickMs: now + 1000 } : { type, untilMs };
  return [...rest, effect];
}

export interface StatusTickResult {
  statuses: StatusEffect[];
  poisonDamage: number;
  stunned: boolean;
}

/** 経過処理: 毒ダメージ算出・期限切れ除去・スタン判定。毒は1秒ごとに1ダメージ。 */
export function tickStatuses(statuses: StatusEffect[], now: number): StatusTickResult {
  let poisonDamage = 0;
  const next: StatusEffect[] = [];
  let stunned = false;
  for (const s of statuses) {
    if (now >= s.untilMs) continue;
    if (s.type === 'poison') {
      let nextTickMs = s.nextTickMs ?? now + 1000;
      while (now >= nextTickMs) {
        poisonDamage += 1;
        nextTickMs += 1000;
      }
      next.push({ ...s, nextTickMs });
    } else {
      if (s.type === 'stun') stunned = true;
      next.push(s);
    }
  }
  return { statuses: next, poisonDamage, stunned };
}

export function hasStatus(statuses: StatusEffect[], type: StatusType): boolean {
  return statuses.some((s) => s.type === type);
}
