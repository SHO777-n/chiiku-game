/**
 * NPCデータ(ロジック禁止。データのみ)。
 */
import type { DialogueId } from './dialogues';

export interface NpcDefinition {
  id: string;
  name: string;
  /** タイル座標 */
  col: number;
  row: number;
  dialogueId: DialogueId;
}

export const halvenaNpcs: NpcDefinition[] = [
  { id: 'mire', name: 'ミレ', col: 15, row: 12, dialogueId: 'mire' },
];
