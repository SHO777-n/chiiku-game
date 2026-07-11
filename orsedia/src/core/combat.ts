/**
 * 戦闘計算の純粋ロジック(Phaser非依存)。
 * Phase 1 は固定値ダメージだが、将来の防御・属性追加に耐える形にしておく。
 */

export interface DamageInput {
  /** 基礎ダメージ */
  base: number;
  /** 倍率(クリティカル・スキル用。省略時 1) */
  multiplier?: number;
  /** 加算補正(装備用。省略時 0) */
  bonus?: number;
}

/** ダメージを計算する。最低 1 を保証する。 */
export function calculateDamage(input: DamageInput): number {
  const raw = input.base * (input.multiplier ?? 1) + (input.bonus ?? 0);
  return Math.max(1, Math.round(raw));
}

/** HPへダメージを適用する。0 未満にはならない。 */
export function applyDamage(hp: number, damage: number): number {
  return Math.max(0, hp - Math.max(0, damage));
}

export function isDead(hp: number): boolean {
  return hp <= 0;
}

/** 無敵時間中かどうか(now, until はミリ秒タイムスタンプ) */
export function isInvulnerable(now: number, invulnerableUntil: number): boolean {
  return now < invulnerableUntil;
}
