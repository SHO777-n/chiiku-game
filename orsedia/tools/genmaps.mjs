/**
 * マップデータ生成スクリプト。
 * 実行: node tools/genmaps.mjs  → src/game/data/maps.ts を上書きする。
 * マップを変更する場合はこのスクリプトを編集して再生成すること。
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const grid = (w, h, fill = '.') => Array.from({ length: h }, () => Array(w).fill(fill));
const put = (m, x, y, ch) => {
  m[y][x] = ch;
};
const rect = (m, x, y, w, h, ch) => {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) m[j][i] = ch;
};
const border = (m, ch) => {
  const h = m.length;
  const w = m[0].length;
  rect(m, 0, 0, w, 1, ch);
  rect(m, 0, h - 1, w, 1, ch);
  rect(m, 0, 0, 1, h, ch);
  rect(m, w - 1, 0, 1, h, ch);
};
const hline = (m, y, x1, x2, ch) => {
  for (let i = x1; i <= x2; i++) m[y][i] = ch;
};
const vline = (m, x, y1, y2, ch) => {
  for (let j = y1; j <= y2; j++) m[j][x] = ch;
};
/** 家: 屋根1段 + 壁2段、壁最下段にドア */
const house = (m, x, y, w, doorOffset) => {
  rect(m, x, y, w, 1, 'r');
  rect(m, x, y + 1, w, 2, 'W');
  put(m, x + doorOffset, y + 2, 'D');
};
const scatter = (m, coords, ch) => coords.forEach(([x, y]) => put(m, x, y, ch));
const rows = (m) => m.map((r) => r.join(''));

// ---------- ハルベナ村 (28x20) ----------
const village = grid(28, 20);
border(village, '#');
scatter(village, [[2, 1], [25, 1], [1, 18], [26, 18], [2, 17], [25, 5]], ',');
house(village, 7, 1, 5, 2); // 民家A ドア(9,3)
house(village, 16, 1, 5, 2); // 民家B ドア(18,3)
house(village, 3, 12, 6, 3); // 鍛冶屋 ドア(6,14)
house(village, 21, 12, 5, 2); // 宿屋 ドア(23,14)
rect(village, 13, 12, 4, 2, '~'); // 池
vline(village, 9, 4, 8, ':');
vline(village, 18, 4, 8, ':');
hline(village, 9, 1, 26, ':'); // メイン通り
vline(village, 6, 15, 16, ':');
vline(village, 23, 15, 16, ':');
scatter(village, [[4, 5], [23, 5], [8, 17], [19, 17]], 'L');
scatter(village, [[4, 16], [24, 16]], 'H');
scatter(village, [[3, 6], [24, 7], [12, 16], [20, 16]], ',');
put(village, 27, 9, ':'); // 東出口

// ---------- 躁ぎの森 (36x24) ----------
const forest = grid(36, 24);
border(forest, '#');
// 木立
[[4, 3, 4, 2], [10, 6, 3, 3], [27, 3, 5, 2], [5, 17, 3, 3], [30, 17, 4, 3], [13, 15, 3, 2]].forEach(
  ([x, y, w, h]) => rect(forest, x, y, w, h, '#'),
);
// 小川と橋
vline(forest, 22, 1, 22, '~');
vline(forest, 23, 1, 22, '~');
put(forest, 22, 12, '=');
put(forest, 23, 12, '=');
// 道: 村(西)→道(東)、鐘楼(北)
hline(forest, 12, 1, 34, ':');
put(forest, 0, 12, ':');
put(forest, 35, 12, ':');
vline(forest, 17, 3, 12, ':');
// 鐘楼の入口(石の台座+封の扉)
rect(forest, 15, 1, 5, 2, 's');
put(forest, 17, 2, 'G');
put(forest, 17, 1, 's');
// 残響ポイント(北東の開けた場所)
rect(forest, 28, 6, 3, 3, ',');
put(forest, 29, 7, 'E');
// 採取物
scatter(forest, [[5, 8], [3, 18], [31, 21], [12, 21]], 'o');
scatter(forest, [[8, 8], [26, 16], [6, 15], [29, 10], [14, 18]], 'H');
scatter(forest, [[8, 4], [26, 20], [3, 9], [32, 14]], 'R');
scatter(forest, [[6, 5], [12, 9], [25, 8], [9, 19], [28, 18], [20, 16]], ',');

// ---------- 眠らぬ鐘楼 (26x22) ----------
const tower = grid(26, 22, 's');
border(tower, 'S');
rect(tower, 1, 1, 2, 20, '_');
rect(tower, 23, 1, 2, 20, '_');
// ボスの間(北)と封の扉
hline(tower, 6, 3, 22, 'S');
put(tower, 13, 6, 'G');
// 通路の壁
[[5, 9, 8, 1], [13, 12, 8, 1], [5, 15, 8, 1], [16, 9, 5, 1], [8, 18, 10, 1]].forEach(
  ([x, y, w, h]) => rect(tower, x, y, w, h, 'S'),
);
scatter(tower, [[6, 13], [19, 16]], 'O');
scatter(tower, [[4, 4], [21, 4]], 'L');
put(tower, 13, 21, 's'); // 入口

// ---------- 王国街道 (36x12) ----------
const road = grid(36, 12);
border(road, '#');
hline(road, 5, 1, 34, ':');
hline(road, 6, 1, 34, ':');
put(road, 0, 5, ':');
put(road, 0, 6, ':');
put(road, 35, 5, ':');
put(road, 35, 6, ':');
scatter(road, [[8, 2], [20, 9], [29, 2]], 'R');
scatter(road, [[6, 5], [18, 6], [30, 5]], 'L');
scatter(road, [[11, 3], [24, 8]], 'H');
scatter(road, [[4, 3], [15, 9], [27, 3], [33, 8]], ',');
rect(road, 13, 1, 3, 2, '#');
rect(road, 22, 9, 3, 2, '#');

// ---------- 街ヴェルディン (28x20) ----------
const town = grid(28, 20);
border(town, 'W');
rect(town, 1, 1, 26, 18, ':');
// 聖堂(北中央)
rect(town, 10, 1, 8, 1, 'r');
rect(town, 10, 2, 8, 3, 'W');
put(town, 13, 4, 'D');
rect(town, 11, 5, 6, 1, 's');
// 書庫
house(town, 20, 5, 5, 2); // ドア(22,7)
// 商店
house(town, 3, 4, 5, 2); // ドア(5,6)
// 宿屋
house(town, 20, 12, 5, 2); // ドア(22,14)
// 民家
house(town, 3, 12, 5, 2); // ドア(5,14)
// 広場の噴水(水)
rect(town, 12, 10, 4, 2, '~');
scatter(town, [[8, 9], [19, 9], [8, 16], [19, 16]], 'L');
scatter(town, [[2, 17], [25, 17], [2, 2]], ',');
put(town, 0, 10, ':'); // 西門

// ---------- 地下聖堂 (30x20) ----------
const crypt = grid(30, 20, 's');
border(crypt, 'S');
rect(crypt, 1, 1, 28, 1, '_');
// 祭壇の間(東)ゲート
vline(crypt, 20, 2, 17, 'S');
put(crypt, 20, 10, 'G');
// 通路の壁
[[4, 5, 10, 1], [8, 9, 9, 1], [4, 13, 10, 1], [16, 5, 1, 4], [6, 16, 12, 1]].forEach(
  ([x, y, w, h]) => rect(crypt, x, y, w, h, 'S'),
);
scatter(crypt, [[3, 3], [17, 15]], 'L');
scatter(crypt, [[10, 7], [14, 15]], 'O');
put(crypt, 2, 2, 's'); // 入口

// ---------- 出力 ----------
const mapDefs = {
  village: {
    name: 'ハルベナ村',
    outdoor: true,
    music: 'village',
    playerSpawn: { col: 5, row: 9 },
    rows: rows(village),
    portals: [
      {
        col: 27,
        row: 9,
        width: 1,
        height: 1,
        target: { mapId: 'forest', col: 2, row: 12 },
      },
    ],
    enemySpawns: [],
  },
  forest: {
    name: '躁ぎの森',
    outdoor: true,
    music: 'field',
    playerSpawn: { col: 2, row: 12 },
    rows: rows(forest),
    sheepSpots: [
      { col: 9, row: 5 },
      { col: 28, row: 20 },
      { col: 32, row: 8 },
    ],
    portals: [
      { col: 0, row: 12, width: 1, height: 1, target: { mapId: 'village', col: 26, row: 9 } },
      {
        col: 35,
        row: 12,
        width: 1,
        height: 1,
        target: { mapId: 'road', col: 1, row: 5 },
        requiresFlag: 'roadOpen',
        lockedMessage: '街道は封鎖されている。今は村の異変が先だ。',
      },
      {
        col: 17,
        row: 1,
        width: 1,
        height: 1,
        target: { mapId: 'tower', col: 13, row: 20 },
        requiresFlag: 'towerOpen',
        lockedMessage: '扉は古代の封で閉ざされている。強い共鳴が要る。',
      },
    ],
    enemySpawns: [
      { id: 'f-shard-1', type: 'echoShard', col: 8, row: 6, patrolTo: { col: 14, row: 6 } },
      { id: 'f-shard-2', type: 'echoShard', col: 27, row: 14, patrolTo: { col: 31, row: 12 } },
      { id: 'f-shard-3', type: 'echoShard', col: 10, row: 16, patrolTo: { col: 10, row: 20 } },
      { id: 'f-wolf-1', type: 'shadowWolf', col: 26, row: 4, patrolTo: { col: 33, row: 6 } },
      { id: 'f-wolf-2', type: 'shadowWolf', col: 5, row: 20, patrolTo: { col: 12, row: 20 } },
    ],
  },
  tower: {
    name: '眠らぬ鐘楼',
    outdoor: false,
    music: 'dungeon',
    playerSpawn: { col: 13, row: 20 },
    rows: rows(tower),
    portals: [
      { col: 13, row: 21, width: 1, height: 1, target: { mapId: 'forest', col: 17, row: 3 } },
    ],
    enemySpawns: [
      { id: 't-sent-1', type: 'stoneSentinel', col: 7, row: 11, patrolTo: { col: 11, row: 11 } },
      { id: 't-sent-2', type: 'stoneSentinel', col: 17, row: 14, patrolTo: { col: 17, row: 17 } },
      { id: 't-sent-3', type: 'stoneSentinel', col: 9, row: 17, patrolTo: { col: 5, row: 17 } },
      { id: 't-shard-1', type: 'echoShard', col: 19, row: 8, patrolTo: { col: 14, row: 8 } },
      { id: 't-shard-2', type: 'echoShard', col: 6, row: 8, patrolTo: { col: 10, row: 8 } },
      { id: 'boss-wailing', type: 'wailingEcho', col: 13, row: 3, patrolTo: { col: 13, row: 3 } },
    ],
  },
  road: {
    name: '王国街道',
    outdoor: true,
    music: 'field',
    playerSpawn: { col: 1, row: 5 },
    rows: rows(road),
    portals: [
      { col: 0, row: 5, width: 1, height: 2, target: { mapId: 'forest', col: 34, row: 12 } },
      { col: 35, row: 5, width: 1, height: 2, target: { mapId: 'town', col: 1, row: 10 } },
    ],
    enemySpawns: [
      { id: 'r-wolf-1', type: 'shadowWolf', col: 10, row: 3, patrolTo: { col: 16, row: 3 } },
      { id: 'r-wolf-2', type: 'shadowWolf', col: 20, row: 8, patrolTo: { col: 27, row: 8 } },
      { id: 'r-wolf-3', type: 'shadowWolf', col: 30, row: 3, patrolTo: { col: 33, row: 6 } },
    ],
  },
  town: {
    name: '街ヴェルディン',
    outdoor: true,
    music: 'town',
    playerSpawn: { col: 1, row: 10 },
    rows: rows(town),
    portals: [
      { col: 0, row: 10, width: 1, height: 1, target: { mapId: 'road', col: 34, row: 5 } },
      {
        col: 13,
        row: 4,
        width: 1,
        height: 1,
        target: { mapId: 'crypt', col: 2, row: 3 },
        requiresFlag: 'cryptOpen',
        lockedMessage: '聖堂の地下への扉は固く閉ざされている。',
      },
    ],
    enemySpawns: [],
  },
  crypt: {
    name: '地下聖堂',
    outdoor: false,
    music: 'dungeon',
    playerSpawn: { col: 2, row: 3 },
    rows: rows(crypt),
    portals: [
      { col: 2, row: 2, width: 1, height: 1, target: { mapId: 'town', col: 13, row: 5 } },
    ],
    enemySpawns: [
      { id: 'c-wraith-1', type: 'cryptWraith', col: 7, row: 7, patrolTo: { col: 13, row: 7 } },
      { id: 'c-wraith-2', type: 'cryptWraith', col: 12, row: 11, patrolTo: { col: 17, row: 11 } },
      { id: 'c-wraith-3', type: 'cryptWraith', col: 6, row: 15, patrolTo: { col: 12, row: 15 } },
      { id: 'c-wraith-4', type: 'cryptWraith', col: 17, row: 3, patrolTo: { col: 13, row: 3 } },
      { id: 'boss-enforcer', type: 'enforcer', col: 25, row: 10, patrolTo: { col: 25, row: 10 } },
    ],
  },
};

const header = `/**
 * マップデータ(ロジック禁止)。
 * このファイルは tools/genmaps.mjs により生成される。直接編集せず、
 * ジェネレータを編集して \`node tools/genmaps.mjs\` で再生成すること。
 */

export const TILE_SIZE = 32;

export interface PortalDef {
  col: number;
  row: number;
  width: number;
  height: number;
  target: { mapId: string; col: number; row: number };
  requiresFlag?: string;
  lockedMessage?: string;
}

export interface EnemySpawnDef {
  id: string;
  type: string;
  col: number;
  row: number;
  patrolTo: { col: number; row: number };
}

export interface MapDef {
  name: string;
  outdoor: boolean;
  music: string;
  playerSpawn: { col: number; row: number };
  rows: string[];
  portals: PortalDef[];
  enemySpawns: EnemySpawnDef[];
  sheepSpots?: { col: number; row: number }[];
}

export const maps: Record<string, MapDef> = `;

const body = JSON.stringify(mapDefs, null, 2);
const out = `${header}${body};\n`;
const dir = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(dir, '../src/game/data/maps.ts'), out);
console.log('generated src/game/data/maps.ts');
