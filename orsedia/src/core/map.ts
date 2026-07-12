/** マップ文字列のパースと判定(純粋ロジック)。 */

export type Ground = 'grass' | 'flower' | 'path' | 'wood' | 'stone' | 'water' | 'void';
export type MapObject =
  | 'tree'
  | 'rock'
  | 'wall'
  | 'roof'
  | 'door'
  | 'lamp'
  | 'ore'
  | 'herb'
  | 'echo'
  | 'gate'
  | null;

export interface Cell {
  ground: Ground;
  object: MapObject;
}

/** マップ文字の凡例 */
const LEGEND: Record<string, Cell> = {
  '.': { ground: 'grass', object: null },
  ',': { ground: 'flower', object: null },
  ':': { ground: 'path', object: null },
  '=': { ground: 'wood', object: null },
  s: { ground: 'stone', object: null },
  '~': { ground: 'water', object: null },
  _: { ground: 'void', object: null },
  '#': { ground: 'grass', object: 'tree' },
  R: { ground: 'grass', object: 'rock' },
  W: { ground: 'grass', object: 'wall' },
  r: { ground: 'grass', object: 'roof' },
  D: { ground: 'grass', object: 'door' },
  L: { ground: 'grass', object: 'lamp' },
  o: { ground: 'grass', object: 'ore' },
  O: { ground: 'stone', object: 'ore' },
  H: { ground: 'grass', object: 'herb' },
  E: { ground: 'grass', object: 'echo' },
  G: { ground: 'stone', object: 'gate' },
  S: { ground: 'stone', object: 'wall' },
};

/** 文字列の行からセル配列を作る。不明な文字・行長不一致は例外。 */
export function parseMap(rows: string[]): Cell[][] {
  if (rows.length === 0) throw new Error('マップが空です');
  const width = rows[0].length;
  return rows.map((row, ri) => {
    if (row.length !== width) {
      throw new Error(`行 ${ri} の長さが不一致です(期待 ${width}、実際 ${row.length})`);
    }
    return [...row].map((ch, ci) => {
      const cell = LEGEND[ch];
      if (!cell) throw new Error(`不明なマップ文字 "${ch}"(行 ${ri}, 列 ${ci})`);
      return { ...cell };
    });
  });
}

const BLOCKING_OBJECTS: MapObject[] = ['tree', 'rock', 'wall', 'roof', 'door', 'lamp', 'gate'];

/** 通行不可か。gate はフラグ開放で通行可になる(開放判定は呼び出し側)。 */
export function isBlockingCell(cell: Cell, gateOpen = false): boolean {
  if (cell.ground === 'water' || cell.ground === 'void') return true;
  if (cell.object === 'gate') return !gateOpen;
  return BLOCKING_OBJECTS.includes(cell.object);
}

/** 歩行可能か(スポーン位置検証用) */
export function isWalkable(cells: Cell[][], col: number, row: number): boolean {
  const cell = cells[row]?.[col];
  if (!cell) return false;
  return !isBlockingCell(cell, true) && cell.object !== 'ore' && cell.object !== 'herb';
}
