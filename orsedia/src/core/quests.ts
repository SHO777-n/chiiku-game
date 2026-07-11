/** クエスト進行(純粋ロジック)。定義は data/quests.ts、進行状態はここで扱う。 */

export type QuestStatus = 'inactive' | 'active' | 'completed' | 'rewarded';

export interface QuestObjectiveDef {
  id: string;
  label: string;
  required: number;
}

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  isMain: boolean;
  objectives: QuestObjectiveDef[];
}

export interface QuestProgress {
  id: string;
  status: QuestStatus;
  counts: Record<string, number>;
}

export function startQuest(list: QuestProgress[], id: string): QuestProgress[] {
  if (list.some((q) => q.id === id)) {
    return list.map((q) => (q.id === id && q.status === 'inactive' ? { ...q, status: 'active' } : q));
  }
  return [...list, { id, status: 'active', counts: {} }];
}

export function getQuest(list: QuestProgress[], id: string): QuestProgress | undefined {
  return list.find((q) => q.id === id);
}

/** 目標カウントを進め、全目標達成なら completed にする。 */
export function recordProgress(
  list: QuestProgress[],
  def: QuestDef,
  objectiveId: string,
  amount = 1,
): QuestProgress[] {
  return list.map((q) => {
    if (q.id !== def.id || q.status !== 'active') return q;
    const objective = def.objectives.find((o) => o.id === objectiveId);
    if (!objective) return q;
    const current = q.counts[objectiveId] ?? 0;
    const counts = { ...q.counts, [objectiveId]: Math.min(objective.required, current + amount) };
    const done = def.objectives.every((o) => (counts[o.id] ?? 0) >= o.required);
    return { ...q, counts, status: done ? 'completed' : 'active' };
  });
}

export function markRewarded(list: QuestProgress[], id: string): QuestProgress[] {
  return list.map((q) => (q.id === id && q.status === 'completed' ? { ...q, status: 'rewarded' } : q));
}

export function questStatus(list: QuestProgress[], id: string): QuestStatus {
  return getQuest(list, id)?.status ?? 'inactive';
}
