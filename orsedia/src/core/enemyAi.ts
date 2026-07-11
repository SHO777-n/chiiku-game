/**
 * 敵AIの状態遷移(純粋ロジック、Phaser非依存)。
 * patrol(巡回)→ chase(追跡)→ return(帰還)→ patrol
 * 実際の移動・距離計算は Enemy エンティティ側が行い、ここは判断だけを担当する。
 */

export type EnemyAiState = 'patrol' | 'chase' | 'return';

export interface EnemyAiParams {
  /** この距離以内でプレイヤーを発見する */
  detectRadius: number;
  /** 追跡中、この距離を超えると見失う */
  loseRadius: number;
  /** 初期位置からこの距離を超えると追跡を諦める */
  leashRadius: number;
  /** 帰還時、初期位置にこの距離まで近づけば到着とみなす */
  homeArriveRadius: number;
}

export interface EnemyAiInput {
  state: EnemyAiState;
  /** プレイヤーとの距離 */
  distToPlayer: number;
  /** 初期位置(ホーム)との距離 */
  distToHome: number;
}

/** 現在の状況から次の状態を返す。 */
export function nextEnemyState(input: EnemyAiInput, params: EnemyAiParams): EnemyAiState {
  switch (input.state) {
    case 'patrol':
      return input.distToPlayer <= params.detectRadius ? 'chase' : 'patrol';
    case 'chase':
      if (input.distToPlayer > params.loseRadius || input.distToHome > params.leashRadius) {
        return 'return';
      }
      return 'chase';
    case 'return':
      if (input.distToHome <= params.homeArriveRadius) {
        return 'patrol';
      }
      return 'return';
  }
}
