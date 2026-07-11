/**
 * マップデータ(ロジック禁止。データのみ)。
 * 凡例: 0 = 床(草地) / 1 = 壁(岩・木) / 2 = 水(通行不可)
 * Phase 2 でマップが複雑化したら Tiled 導入を検討(ROADMAP 将来候補)。
 */

export const TILE_FLOOR = 0;
export const TILE_WALL = 1;
export const TILE_WATER = 2;

export interface MapDefinition {
  id: string;
  name: string;
  tileSize: number;
  /** tiles[row][col] */
  tiles: number[][];
  /** タイル座標でのプレイヤー初期位置 */
  playerSpawn: { col: number; row: number };
}

const W = TILE_WALL;
const _ = TILE_FLOOR;
const O = TILE_WATER;

/** Phase 1 のフィールド: ハルベナ村はずれの野原(25 x 19 タイル) */
export const halvenaOutskirts: MapDefinition = {
  id: 'halvena-outskirts',
  name: 'ハルベナ村はずれ',
  tileSize: 32,
  playerSpawn: { col: 3, row: 15 },
  tiles: [
    [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
    [W, _, _, _, _, _, W, W, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W],
    [W, _, _, _, _, _, _, W, _, _, _, _, _, _, _, _, _, W, W, _, _, _, _, _, W],
    [W, _, _, W, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W, W, _, _, _, _, W],
    [W, _, _, W, W, _, _, _, _, _, O, O, O, _, _, _, _, _, _, _, _, _, _, _, W],
    [W, _, _, _, W, _, _, _, _, O, O, O, O, O, _, _, _, _, _, _, _, W, _, _, W],
    [W, _, _, _, _, _, _, _, _, O, O, O, O, O, _, _, _, _, _, _, W, W, _, _, W],
    [W, _, _, _, _, _, _, _, _, _, O, O, O, _, _, _, _, _, _, _, _, W, _, _, W],
    [W, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W],
    [W, _, _, _, _, _, W, _, _, _, _, _, _, _, _, _, W, _, _, _, _, _, _, _, W],
    [W, _, _, _, _, W, W, _, _, _, _, _, _, _, _, _, W, W, _, _, _, _, _, _, W],
    [W, _, _, _, _, _, W, _, _, _, _, _, _, _, _, _, _, W, _, _, _, _, _, _, W],
    [W, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W],
    [W, _, _, _, _, _, _, _, _, _, _, W, W, _, _, _, _, _, _, _, _, _, _, _, W],
    [W, _, _, _, _, _, _, _, _, _, _, W, W, _, _, _, _, _, _, _, W, _, _, _, W],
    [W, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W, W, _, _, _, W],
    [W, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W, _, _, _, W],
    [W, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W],
    [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  ],
};

/** 通行不可タイルか */
export function isBlockingTile(tile: number): boolean {
  return tile === TILE_WALL || tile === TILE_WATER;
}
