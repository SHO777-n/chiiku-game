/** クエスト定義(ロジック禁止)。進行処理は core/quests.ts。 */
import type { QuestDef } from '../../core/quests';

export interface QuestReward {
  xp?: number;
  gold?: number;
  items?: { itemId: string; count: number }[];
}

export interface QuestDefWithReward extends QuestDef {
  reward: QuestReward;
}

export const quests: Record<string, QuestDefWithReward> = {
  mq1: {
    id: 'mq1',
    name: '鐘の噂',
    description: '村人から話を聞き、躁ぎの森の残響を調べる',
    isMain: true,
    objectives: [
      { id: 'talkMire', label: 'ミレと話す', required: 1 },
      { id: 'investigate', label: '森の残響を調べる', required: 1 },
    ],
    reward: { xp: 25, gold: 30 },
  },
  mq2: {
    id: 'mq2',
    name: '眠らぬ鐘楼へ',
    description: '共鳴の欠片をガンドに見せ、鐘楼の封を開いてもらう',
    isMain: true,
    objectives: [
      { id: 'showShard', label: 'ガンドに欠片を見せる(律鉄鉱3つが要る)', required: 1 },
    ],
    reward: { xp: 30, gold: 0 },
  },
  mq3: {
    id: 'mq3',
    name: '哭きの残響',
    description: '鐘楼の最上部で異変の源と対峙する',
    isMain: true,
    objectives: [
      { id: 'boss', label: '哭きの残響を鎮める', required: 1 },
      { id: 'choice', label: '残響の行く末を選ぶ', required: 1 },
    ],
    reward: { xp: 120, gold: 100 },
  },
  mq4: {
    id: 'mq4',
    name: '静寂の招き',
    description: 'ヴェイルの招きで街ヴェルディンへ向かい、書庫の記録を調べる',
    isMain: true,
    objectives: [
      { id: 'talkVeil', label: '聖堂のヴェイルと話す', required: 1 },
      { id: 'archive', label: '書記官と古い記録を調べる', required: 1 },
    ],
    reward: { xp: 60, gold: 80 },
  },
  mq5: {
    id: 'mq5',
    name: '黙の会',
    description: '地下聖堂に潜む「黙の会」の執行者を追い、真実の扱いを決める',
    isMain: true,
    objectives: [
      { id: 'boss', label: '執行者を倒す', required: 1 },
      { id: 'choice', label: '真実の扱いを選ぶ', required: 1 },
    ],
    reward: { xp: 200, gold: 200 },
  },
  sq1: {
    id: 'sq1',
    name: '迷い羊を追って',
    description: 'レナ婆さんの羊が森へ逃げた。3匹を見つけて連れ戻す',
    isMain: false,
    objectives: [{ id: 'sheep', label: '羊を見つける', required: 3 }],
    reward: { xp: 30, gold: 40, items: [{ itemId: 'potion', count: 2 }] },
  },
  sq2: {
    id: 'sq2',
    name: '鍛冶屋の耳',
    description: 'ガンドが「石の残響」の研究に律鉄鉱を欲しがっている',
    isMain: false,
    objectives: [{ id: 'ore', label: '律鉄鉱を集める', required: 3 }],
    reward: { xp: 40, gold: 80 },
  },
  sq3: {
    id: 'sq3',
    name: '聴こえる少女',
    description: 'ミレに鐘が聴こえる理由を調べる。ヴェイルが何か知っているようだ',
    isMain: false,
    objectives: [
      { id: 'askVeil', label: 'ヴェイルに尋ねる', required: 1 },
      { id: 'tellMire', label: 'ミレに伝える', required: 1 },
    ],
    reward: { xp: 50, items: [{ itemId: 'mireCharm', count: 1 }] },
  },
  sq4: {
    id: 'sq4',
    name: '癒し手の薬草',
    description: 'ヴェルディンの癒し手セラが薬草を切らしている',
    isMain: false,
    objectives: [{ id: 'herb', label: '薬草を渡す', required: 5 }],
    reward: { xp: 45, gold: 60, items: [{ itemId: 'hiPotion', count: 2 }] },
  },
  sq5: {
    id: 'sq5',
    name: '地下聖堂の影',
    description: '衛兵ドルクが地下聖堂の怨霊の間引きを依頼している',
    isMain: false,
    objectives: [{ id: 'wraith', label: '聖堂の怨霊を倒す', required: 3 }],
    reward: { xp: 80, gold: 150 },
  },
};
