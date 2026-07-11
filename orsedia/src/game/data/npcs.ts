/**
 * NPCデータと会話選択ルール(宣言的データ。評価は game/systems 側)。
 * rules は上から順に評価し、最初に条件を満たした会話を使う。
 */
import type { QuestStatus } from '../../core/quests';
import type { FlagValue } from '../../core/save';

export type Condition =
  | { type: 'flag'; key: string; value?: FlagValue }
  | { type: 'notFlag'; key: string }
  | { type: 'quest'; id: string; status: QuestStatus | QuestStatus[] }
  | { type: 'hasItem'; itemId: string; count: number };

export interface DialogueRule {
  conditions: Condition[];
  dialogueId: string;
}

export interface NpcDefinition {
  id: string;
  name: string;
  mapId: string;
  col: number;
  row: number;
  /** 夜の位置(未指定なら移動しない) */
  night?: { col: number; row: number };
  /** これらの条件をすべて満たすと非表示 */
  hiddenWhen?: Condition[];
  texture: string;
  rules: DialogueRule[];
  defaultDialogue: string;
}

export const npcs: NpcDefinition[] = [
  {
    id: 'mire',
    name: 'ミレ',
    mapId: 'village',
    col: 22,
    row: 15,
    night: { col: 23, row: 15 },
    texture: 'npc-mire',
    rules: [
      {
        conditions: [
          { type: 'quest', id: 'sq3', status: 'active' },
          { type: 'flag', key: 'sq3AskedVeil', value: true },
        ],
        dialogueId: 'mireSq3End',
      },
      {
        conditions: [
          { type: 'quest', id: 'mq3', status: 'rewarded' },
          { type: 'quest', id: 'sq3', status: 'inactive' },
        ],
        dialogueId: 'mireSq3Start',
      },
      {
        conditions: [{ type: 'flag', key: 'towerChoice', value: 'release' }],
        dialogueId: 'mireGrateful',
      },
      {
        conditions: [{ type: 'flag', key: 'towerChoice', value: 'seal' }],
        dialogueId: 'mireSad',
      },
      {
        conditions: [{ type: 'quest', id: 'mq1', status: 'active' }],
        dialogueId: 'mireIntro',
      },
    ],
    defaultDialogue: 'mireChat',
  },
  {
    id: 'balga',
    name: '村長バルガ',
    mapId: 'village',
    col: 13,
    row: 8,
    night: { col: 9, row: 4 },
    texture: 'npc-balga',
    rules: [
      {
        conditions: [{ type: 'quest', id: 'mq3', status: 'rewarded' }],
        dialogueId: 'balgaAfter',
      },
      {
        conditions: [{ type: 'flag', key: 'towerOpen', value: true }],
        dialogueId: 'balgaWorried',
      },
    ],
    defaultDialogue: 'balgaCold',
  },
  {
    id: 'gand',
    name: 'ガンド',
    mapId: 'village',
    col: 5,
    row: 15,
    texture: 'npc-gand',
    rules: [
      {
        conditions: [
          { type: 'quest', id: 'mq2', status: 'active' },
          { type: 'hasItem', itemId: 'ore', count: 3 },
        ],
        dialogueId: 'gandOpen',
      },
      {
        conditions: [{ type: 'quest', id: 'mq2', status: 'active' }],
        dialogueId: 'gandNeedOre',
      },
      {
        conditions: [
          { type: 'quest', id: 'sq2', status: 'active' },
          { type: 'hasItem', itemId: 'ore', count: 3 },
        ],
        dialogueId: 'gandSq2Done',
      },
      {
        conditions: [{ type: 'quest', id: 'sq2', status: 'inactive' }],
        dialogueId: 'gandSq2Offer',
      },
    ],
    defaultDialogue: 'gandShop',
  },
  {
    id: 'tomma',
    name: '行商人トマ',
    mapId: 'village',
    col: 14,
    row: 16,
    texture: 'npc-tomma',
    rules: [],
    defaultDialogue: 'tommaShop',
  },
  {
    id: 'veil',
    name: 'シスター・ヴェイル',
    mapId: 'village',
    col: 17,
    row: 7,
    texture: 'npc-veil',
    hiddenWhen: [{ type: 'flag', key: 'veilMoved', value: true }],
    rules: [
      {
        conditions: [
          { type: 'quest', id: 'sq3', status: 'active' },
          { type: 'notFlag', key: 'sq3AskedVeil' },
        ],
        dialogueId: 'veilSq3',
      },
      {
        conditions: [{ type: 'quest', id: 'mq3', status: 'rewarded' }],
        dialogueId: 'veilInvite',
      },
    ],
    defaultDialogue: 'veilTalk',
  },
  {
    id: 'lena',
    name: 'レナ婆さん',
    mapId: 'village',
    col: 3,
    row: 16,
    texture: 'npc-lena',
    rules: [
      {
        conditions: [{ type: 'quest', id: 'sq1', status: 'completed' }],
        dialogueId: 'lenaReward',
      },
      {
        conditions: [{ type: 'quest', id: 'sq1', status: 'active' }],
        dialogueId: 'lenaWait',
      },
      {
        conditions: [{ type: 'quest', id: 'sq1', status: 'rewarded' }],
        dialogueId: 'lenaThanks',
      },
    ],
    defaultDialogue: 'lenaOffer',
  },
  // ---------- 街ヴェルディン ----------
  {
    id: 'veilTown',
    name: 'シスター・ヴェイル',
    mapId: 'town',
    col: 13,
    row: 6,
    texture: 'npc-veil',
    hiddenWhen: [{ type: 'notFlag', key: 'veilMoved' }],
    rules: [
      {
        conditions: [
          { type: 'quest', id: 'mq4', status: 'active' },
          { type: 'notFlag', key: 'mq4TalkedVeil' },
        ],
        dialogueId: 'veilTownMq4',
      },
      {
        conditions: [{ type: 'quest', id: 'mq5', status: 'active' }],
        dialogueId: 'veilTownMq5',
      },
    ],
    defaultDialogue: 'veilTownChat',
  },
  {
    id: 'archivist',
    name: '書記官オルム',
    mapId: 'town',
    col: 22,
    row: 8,
    texture: 'npc-archivist',
    rules: [
      {
        conditions: [
          { type: 'quest', id: 'mq4', status: 'active' },
          { type: 'flag', key: 'mq4TalkedVeil', value: true },
        ],
        dialogueId: 'archivistMq4',
      },
    ],
    defaultDialogue: 'archivistChat',
  },
  {
    id: 'sera',
    name: '癒し手セラ',
    mapId: 'town',
    col: 6,
    row: 10,
    texture: 'npc-sera',
    rules: [
      {
        conditions: [
          { type: 'quest', id: 'sq4', status: 'active' },
          { type: 'hasItem', itemId: 'herb', count: 5 },
        ],
        dialogueId: 'seraDone',
      },
      {
        conditions: [{ type: 'quest', id: 'sq4', status: 'active' }],
        dialogueId: 'seraWait',
      },
      {
        conditions: [{ type: 'quest', id: 'sq4', status: 'inactive' }],
        dialogueId: 'seraOffer',
      },
    ],
    defaultDialogue: 'seraChat',
  },
  {
    id: 'dolk',
    name: '衛兵ドルク',
    mapId: 'town',
    col: 2,
    row: 9,
    texture: 'npc-dolk',
    rules: [
      {
        conditions: [{ type: 'quest', id: 'sq5', status: 'completed' }],
        dialogueId: 'dolkReward',
      },
      {
        conditions: [
          { type: 'quest', id: 'sq5', status: 'inactive' },
          { type: 'flag', key: 'cryptOpen', value: true },
        ],
        dialogueId: 'dolkOffer',
      },
      {
        conditions: [{ type: 'quest', id: 'sq5', status: 'active' }],
        dialogueId: 'dolkWait',
      },
    ],
    defaultDialogue: 'dolkChat',
  },
  {
    id: 'marle',
    name: '宿屋のマール',
    mapId: 'town',
    col: 22,
    row: 15,
    texture: 'npc-marle',
    rules: [],
    defaultDialogue: 'marleInn',
  },
  {
    id: 'merchant',
    name: '商人ベルタ',
    mapId: 'town',
    col: 5,
    row: 7,
    texture: 'npc-merchant',
    rules: [],
    defaultDialogue: 'merchantShop',
  },
];
