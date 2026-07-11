import { describe, expect, it } from 'vitest';
import { applyDamage, calculateDamage, heal, isDead, isInvulnerable } from './combat';

describe('calculateDamage', () => {
  it('基礎値+攻撃力から防御力を引く', () => {
    expect(calculateDamage({ base: 3, attack: 4, targetDefense: 2 })).toBe(5);
  });

  it('倍率を適用する', () => {
    expect(calculateDamage({ base: 4, multiplier: 1.5 })).toBe(6);
  });

  it('弱点属性で1.5倍、耐性で0.5倍', () => {
    const profile = { weak: ['fire' as const], resist: ['ice' as const] };
    expect(calculateDamage({ base: 10, element: 'fire', targetProfile: profile })).toBe(15);
    expect(calculateDamage({ base: 10, element: 'ice', targetProfile: profile })).toBe(5);
    expect(calculateDamage({ base: 10, element: 'physical', targetProfile: profile })).toBe(10);
  });

  it('最低 1 ダメージを保証する', () => {
    expect(calculateDamage({ base: 2, targetDefense: 10 })).toBe(1);
  });
});

describe('applyDamage / heal', () => {
  it('HPからダメージを引き、0未満にならない', () => {
    expect(applyDamage(20, 3)).toBe(17);
    expect(applyDamage(2, 5)).toBe(0);
    expect(applyDamage(10, -5)).toBe(10);
  });

  it('回復は最大HPを超えない', () => {
    expect(heal(15, 20, 30)).toBe(20);
    expect(heal(5, 20, 3)).toBe(8);
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
