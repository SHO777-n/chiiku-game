/**
 * 敵データ(ロジック禁止。データのみ)。
 */
import type { EnemyAiParams } from '../../core/enemyAi';

export interface EnemyDefinition {
  type: string;
  name: string;
  maxHp: number;
  /** 巡回時の移動速度 px/s */
  patrolSpeed: number;
  /** 追跡時の移動速度 px/s */
  chaseSpeed: number;
  /** 接触ダメージ */
  touchDamage: number;
  ai: EnemyAiParams;
}

export const echoShard: EnemyDefinition = {
  type: 'echoShard',
  name: '残響のかけら',
  maxHp: 6,
  patrolSpeed: 40,
  chaseSpeed: 110,
  touchDamage: 2,
  ai: {
    detectRadius: 120,
    loseRadius: 220,
    leashRadius: 320,
    homeArriveRadius: 8,
  },
};

export const enemyDefinitions: Record<string, EnemyDefinition> = {
  echoShard,
};

export interface EnemySpawn {
  /** セーブの撃破記録に使う一意ID */
  id: string;
  type: keyof typeof enemyDefinitions;
  /** タイル座標 */
  col: number;
  row: number;
  /** 巡回先(タイル座標)。初期位置と往復する */
  patrolTo: { col: number; row: number };
}

/** ハルベナ村はずれの敵配置 */
export const halvenaEnemySpawns: EnemySpawn[] = [
  { id: 'shard-1', type: 'echoShard', col: 8, row: 3, patrolTo: { col: 14, row: 3 } },
  { id: 'shard-2', type: 'echoShard', col: 19, row: 9, patrolTo: { col: 19, row: 14 } },
  { id: 'shard-3', type: 'echoShard', col: 6, row: 12, patrolTo: { col: 3, row: 9 } },
];
