/**
 * セーブデータの整形・検証(純粋ロジック、Phaser非依存)。
 * 保存先(localStorage)へのアクセスは game/systems/SaveManager が担当する。
 * 将来のマイグレーションのため version を必須とする(TDD.md §4.3)。
 */

export const SAVE_VERSION = 1 as const;

export interface SaveDataV1 {
  version: typeof SAVE_VERSION;
  player: {
    x: number;
    y: number;
    hp: number;
    maxHp: number;
  };
  defeatedEnemyIds: string[];
  savedAt: string; // ISO 8601
}

export interface SavePlayerState {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
}

export function createSaveData(
  player: SavePlayerState,
  defeatedEnemyIds: string[],
  now: Date = new Date(),
): SaveDataV1 {
  return {
    version: SAVE_VERSION,
    player: { ...player },
    defeatedEnemyIds: [...defeatedEnemyIds],
    savedAt: now.toISOString(),
  };
}

export function serializeSave(data: SaveDataV1): string {
  return JSON.stringify(data);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * 生文字列を検証付きでパースする。
 * 壊れたデータ・未知バージョンは null を返し、呼び出し側は新規開始として扱う。
 */
export function parseSave(raw: string | null | undefined): SaveDataV1 | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;
  const obj = parsed as Record<string, unknown>;

  if (obj.version !== SAVE_VERSION) return null;

  const player = obj.player as Record<string, unknown> | undefined;
  if (typeof player !== 'object' || player === null) return null;
  if (
    !isFiniteNumber(player.x) ||
    !isFiniteNumber(player.y) ||
    !isFiniteNumber(player.hp) ||
    !isFiniteNumber(player.maxHp)
  ) {
    return null;
  }
  if (player.maxHp <= 0 || player.hp < 0 || player.hp > player.maxHp) return null;

  if (
    !Array.isArray(obj.defeatedEnemyIds) ||
    !obj.defeatedEnemyIds.every((id) => typeof id === 'string')
  ) {
    return null;
  }

  if (typeof obj.savedAt !== 'string') return null;

  return {
    version: SAVE_VERSION,
    player: {
      x: player.x,
      y: player.y,
      hp: player.hp,
      maxHp: player.maxHp,
    },
    defeatedEnemyIds: obj.defeatedEnemyIds as string[],
    savedAt: obj.savedAt,
  };
}
