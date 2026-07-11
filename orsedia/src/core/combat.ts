/**
 * 戦闘計算の純粋ロジック(Phaser非依存)。
 * ダメージ式: (基礎値 + 攻撃力) × 倍率 × 属性補正 − 防御力(最低1)
 */
import { elementMultiplier, type Element, type ElementProfile } from './effects';

export interface DamageInput {
  base: number;
  attack?: number;
  multiplier?: number;
  element?: Element;
  targetProfile?: ElementProfile;
  targetDefense?: number;
}

export function calculateDamage(input: DamageInput): number {
  const elem =
    input.element && input.targetProfile
      ? elementMultiplier(input.element, input.targetProfile)
      : 1;
  const raw =
    (input.base + (input.attack ?? 0)) * (input.multiplier ?? 1) * elem -
    (input.targetDefense ?? 0);
  return Math.max(1, Math.round(raw));
}

export function applyDamage(hp: number, damage: number): number {
  return Math.max(0, hp - Math.max(0, damage));
}

export function heal(hp: number, maxHp: number, amount: number): number {
  return Math.min(maxHp, hp + Math.max(0, amount));
}

export function isDead(hp: number): boolean {
  return hp <= 0;
}

export function isInvulnerable(now: number, invulnerableUntil: number): boolean {
  return now < invulnerableUntil;
}
