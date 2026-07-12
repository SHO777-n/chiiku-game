/**
 * セーブデータの整形・検証・マイグレーション(純粋ロジック)。
 * v1(Phase 1)→ v2(Phase 2以降)への移行を parseSave 内で自動実行する。
 */
import type { ItemStack } from './inventory';
import type { QuestProgress, QuestStatus } from './quests';

export const SAVE_VERSION = 2 as const;

export type FlagValue = boolean | number | string;

export interface SaveDataV2 {
  version: typeof SAVE_VERSION;
  mapId: string;
  player: {
    x: number;
    y: number;
    hp: number;
    mp: number;
    level: number;
    xp: number;
    skillPoints: number;
  };
  learnedSkills: string[];
  equipment: { weapon: string | null; armor: string | null; charm: string | null };
  inventory: ItemStack[];
  gold: number;
  flags: Record<string, FlagValue>;
  quests: QuestProgress[];
  defeatedEnemyIds: string[];
  clockMin: number;
  savedAt: string;
}

export function serializeSave(data: SaveDataV2): string {
  return JSON.stringify(data);
}

function isNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}
function isStrArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((s) => typeof s === 'string');
}

const QUEST_STATUSES: QuestStatus[] = ['inactive', 'active', 'completed', 'rewarded'];

function parseV2(obj: Record<string, unknown>): SaveDataV2 | null {
  const p = obj.player as Record<string, unknown> | undefined;
  if (typeof p !== 'object' || p === null) return null;
  if (![p.x, p.y, p.hp, p.mp, p.level, p.xp, p.skillPoints].every(isNum)) return null;
  if (typeof obj.mapId !== 'string') return null;
  if (!isStrArray(obj.learnedSkills) || !isStrArray(obj.defeatedEnemyIds)) return null;
  if (!isNum(obj.gold) || !isNum(obj.clockMin)) return null;
  if (typeof obj.savedAt !== 'string') return null;

  const eq = obj.equipment as Record<string, unknown> | undefined;
  if (typeof eq !== 'object' || eq === null) return null;
  const slot = (v: unknown): string | null => (typeof v === 'string' ? v : null);

  if (!Array.isArray(obj.inventory)) return null;
  const inventory: ItemStack[] = [];
  for (const s of obj.inventory as unknown[]) {
    const stack = s as Record<string, unknown>;
    if (typeof stack?.itemId !== 'string' || !isNum(stack.count) || stack.count <= 0) return null;
    inventory.push({ itemId: stack.itemId, count: stack.count });
  }

  if (!Array.isArray(obj.quests)) return null;
  const quests: QuestProgress[] = [];
  for (const q of obj.quests as unknown[]) {
    const quest = q as Record<string, unknown>;
    if (typeof quest?.id !== 'string') return null;
    if (!QUEST_STATUSES.includes(quest.status as QuestStatus)) return null;
    const counts: Record<string, number> = {};
    if (typeof quest.counts !== 'object' || quest.counts === null) return null;
    for (const [k, v] of Object.entries(quest.counts as Record<string, unknown>)) {
      if (!isNum(v)) return null;
      counts[k] = v;
    }
    quests.push({ id: quest.id, status: quest.status as QuestStatus, counts });
  }

  const flags: Record<string, FlagValue> = {};
  if (typeof obj.flags !== 'object' || obj.flags === null) return null;
  for (const [k, v] of Object.entries(obj.flags as Record<string, unknown>)) {
    if (typeof v !== 'boolean' && !isNum(v) && typeof v !== 'string') return null;
    flags[k] = v as FlagValue;
  }

  return {
    version: SAVE_VERSION,
    mapId: obj.mapId,
    player: {
      x: p.x as number,
      y: p.y as number,
      hp: p.hp as number,
      mp: p.mp as number,
      level: p.level as number,
      xp: p.xp as number,
      skillPoints: p.skillPoints as number,
    },
    learnedSkills: obj.learnedSkills,
    equipment: { weapon: slot(eq.weapon), armor: slot(eq.armor), charm: slot(eq.charm) },
    inventory,
    gold: obj.gold,
    flags,
    quests,
    defeatedEnemyIds: obj.defeatedEnemyIds,
    clockMin: obj.clockMin,
    savedAt: obj.savedAt,
  };
}

/** v1(Phase 1形式)→ v2。位置とHPのみ引き継ぎ、他は初期値。 */
function migrateV1(obj: Record<string, unknown>): SaveDataV2 | null {
  const p = obj.player as Record<string, unknown> | undefined;
  if (typeof p !== 'object' || p === null) return null;
  if (![p.x, p.y, p.hp, p.maxHp].every(isNum)) return null;
  if (!isStrArray(obj.defeatedEnemyIds)) return null;
  return {
    version: SAVE_VERSION,
    mapId: 'forest',
    player: {
      x: p.x as number,
      y: p.y as number,
      hp: Math.min(p.hp as number, 20),
      mp: 10,
      level: 1,
      xp: 0,
      skillPoints: 0,
    },
    learnedSkills: [],
    equipment: { weapon: null, armor: null, charm: null },
    inventory: [],
    gold: 0,
    flags: {},
    quests: [],
    defeatedEnemyIds: obj.defeatedEnemyIds,
    clockMin: 8 * 60,
    savedAt: typeof obj.savedAt === 'string' ? obj.savedAt : new Date().toISOString(),
  };
}

/** 生文字列を検証付きでパースする。壊れたデータは null(新規開始)。 */
export function parseSave(raw: string | null | undefined): SaveDataV2 | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const obj = parsed as Record<string, unknown>;
  if (obj.version === SAVE_VERSION) return parseV2(obj);
  if (obj.version === 1) return migrateV1(obj);
  return null;
}
