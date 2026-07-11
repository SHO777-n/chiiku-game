import { describe, expect, it } from 'vitest';
import { applyDamage, calculateDamage, isDead, isInvulnerable } from './combat';

describe('calculateDamage', () => {
  it('基礎値のみならそのまま返す', () => {
    expect(calculateDamage({ base: 3 })).toBe(3);
  });

  it('倍率と加算を適用する', () => {
    expect(calculateDamage({ base: 4, multiplier: 1.5, bonus: 2 })).toBe(8);
  });

  it('最低 1 ダメージを保証する', () => {
    expect(calculateDamage({ base: 0 })).toBe(1);
    expect(calculateDamage({ base: 2, multiplier: 0 })).toBe(1);
  });
});

describe('applyDamage', () => {
  it('HPからダメージを引く', () => {
    expect(applyDamage(20, 3)).toBe(17);
  });

  it('0 未満にならない', () => {
    expect(applyDamage(2, 5)).toBe(0);
  });

  it('負のダメージは無視する(回復に使わせない)', () => {
    expect(applyDamage(10, -5)).toBe(10);
  });
});

describe('isDead / isInvulnerable', () => {
  it('HP 0 以下で死亡', () => {
    expect(isDead(0)).toBe(true);
    expect(isDead(1)).toBe(false);
  });

  it('無敵時間の判定', () => {
    expect(isInvulnerable(1000, 1500)).toBe(true);
    expect(isInvulnerable(1500, 1500)).toBe(false);
  });
});
