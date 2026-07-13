/**
 * タッチ操作の共有入力状態。
 * React(ui/TouchControls)が書き込み、Phaser(GameScene)が毎フレーム読む。
 * ボタンは「押した回数カウンタ」方式にして、1フレーム未満の短いタップも取りこぼさない。
 */

export interface TouchInputState {
  /** ジョイスティック方向(-1..1)。非操作時は0 */
  dirX: number;
  dirY: number;
  /** 攻撃は押している間 true(クールダウンは戦闘側が管理) */
  attackDown: boolean;
  /** 押した回数(GameSceneが前フレームとの差分で「押した瞬間」を検出) */
  talkPresses: number;
  menuPresses: number;
  savePresses: number;
  skillPresses: [number, number, number, number];
}

export const touchInput: TouchInputState = {
  dirX: 0,
  dirY: 0,
  attackDown: false,
  talkPresses: 0,
  menuPresses: 0,
  savePresses: 0,
  skillPresses: [0, 0, 0, 0],
};

/** タッチ主体の端末か(コントロール表示の判定に使う) */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window;
}
