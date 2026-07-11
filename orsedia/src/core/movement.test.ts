import { describe, expect, it } from 'vitest';
import { normalizeDirection, resolveFacing } from './movement';

describe('normalizeDirection', () => {
  it('入力なしはゼロベクトルを返す', () => {
    expect(normalizeDirection(0, 0)).toEqual({ x: 0, y: 0 });
  });

  it('単一方向はそのまま単位ベクトルになる', () => {
    expect(normalizeDirection(1, 0)).toEqual({ x: 1, y: 0 });
    expect(normalizeDirection(0, -1)).toEqual({ x: 0, y: -1 });
  });

  it('斜め入力でも長さが1になる(速度が上がらない)', () => {
    const v = normalizeDirection(1, 1);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(1);
    const v2 = normalizeDirection(-1, 1);
    expect(Math.hypot(v2.x, v2.y)).toBeCloseTo(1);
  });
});

describe('resolveFacing', () => {
  it('左右を優先する', () => {
    expect(resolveFacing(-1, 1, 'down')).toBe('left');
    expect(resolveFacing(1, -1, 'down')).toBe('right');
  });

  it('縦入力のみなら上下を返す', () => {
    expect(resolveFacing(0, -1, 'down')).toBe('up');
    expect(resolveFacing(0, 1, 'up')).toBe('down');
  });

  it('入力なしは現在の向きを維持する', () => {
    expect(resolveFacing(0, 0, 'left')).toBe('left');
  });
});
