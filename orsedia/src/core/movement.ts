/**
 * 移動関連の純粋ロジック(Phaser非依存)。
 */

export interface Vec2 {
  x: number;
  y: number;
}

/**
 * 入力方向を正規化する。斜め入力でも速度が一定になる。
 * 入力が無い場合はゼロベクトルを返す。
 */
export function normalizeDirection(x: number, y: number): Vec2 {
  const length = Math.hypot(x, y);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: x / length, y: y / length };
}

export type Facing = 'up' | 'down' | 'left' | 'right';

/**
 * 移動方向から向き(4方向)を決める。左右を縦より優先する。
 * 入力が無い場合は現在の向きを維持する。
 */
export function resolveFacing(dirX: number, dirY: number, current: Facing): Facing {
  if (dirX < 0) return 'left';
  if (dirX > 0) return 'right';
  if (dirY < 0) return 'up';
  if (dirY > 0) return 'down';
  return current;
}
