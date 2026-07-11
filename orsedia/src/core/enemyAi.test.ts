import { describe, expect, it } from 'vitest';
import { nextEnemyState, type EnemyAiParams } from './enemyAi';

const params: EnemyAiParams = {
  detectRadius: 120,
  loseRadius: 220,
  leashRadius: 320,
  homeArriveRadius: 8,
};

describe('nextEnemyState', () => {
  it('patrol: プレイヤーが索敵範囲外なら巡回を続ける', () => {
    expect(nextEnemyState({ state: 'patrol', distToPlayer: 200, distToHome: 0 }, params)).toBe(
      'patrol',
    );
  });

  it('patrol: プレイヤーが索敵範囲内なら追跡へ', () => {
    expect(nextEnemyState({ state: 'patrol', distToPlayer: 100, distToHome: 0 }, params)).toBe(
      'chase',
    );
  });

  it('chase: 範囲内なら追跡を続ける', () => {
    expect(nextEnemyState({ state: 'chase', distToPlayer: 150, distToHome: 100 }, params)).toBe(
      'chase',
    );
  });

  it('chase: プレイヤーを見失うと帰還へ', () => {
    expect(nextEnemyState({ state: 'chase', distToPlayer: 250, distToHome: 100 }, params)).toBe(
      'return',
    );
  });

  it('chase: ホームから離れすぎると帰還へ', () => {
    expect(nextEnemyState({ state: 'chase', distToPlayer: 50, distToHome: 400 }, params)).toBe(
      'return',
    );
  });

  it('return: ホーム未到着なら帰還を続ける(プレイヤーが近くても無視)', () => {
    expect(nextEnemyState({ state: 'return', distToPlayer: 10, distToHome: 100 }, params)).toBe(
      'return',
    );
  });

  it('return: ホームに着いたら巡回へ戻る', () => {
    expect(nextEnemyState({ state: 'return', distToPlayer: 500, distToHome: 5 }, params)).toBe(
      'patrol',
    );
  });
});
