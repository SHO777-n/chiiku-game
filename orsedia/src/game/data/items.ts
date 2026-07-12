/** アイテム・装備・レシピのデータ(ロジック禁止)。 */
import type { Element, StatusType } from '../../core/effects';
import type { RecipeDef } from '../../core/crafting';

export type ItemCategory = 'consumable' | 'material' | 'weapon' | 'armor' | 'charm' | 'key';
export type EquipSlot = 'weapon' | 'armor' | 'charm';

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  buyPrice: number;
  sellPrice: number;
  effect?: { healHp?: number; healMp?: number; cure?: StatusType };
  equip?: {
    slot: EquipSlot;
    attack?: number;
    defense?: number;
    element?: Element;
    resist?: StatusType;
  };
}

export const items: Record<string, ItemDef> = {
  potion: {
    id: 'potion',
    name: '回復薬',
    category: 'consumable',
    description: 'HPを30回復する',
    buyPrice: 30,
    sellPrice: 12,
    effect: { healHp: 30 },
  },
  hiPotion: {
    id: 'hiPotion',
    name: '上回復薬',
    category: 'consumable',
    description: 'HPを80回復する',
    buyPrice: 90,
    sellPrice: 35,
    effect: { healHp: 80 },
  },
  ether: {
    id: 'ether',
    name: '精霊の雫',
    category: 'consumable',
    description: 'MPを20回復する',
    buyPrice: 60,
    sellPrice: 24,
    effect: { healMp: 20 },
  },
  antidote: {
    id: 'antidote',
    name: '解毒草',
    category: 'consumable',
    description: '毒を治す',
    buyPrice: 20,
    sellPrice: 8,
    effect: { cure: 'poison' },
  },
  herb: {
    id: 'herb',
    name: '薬草',
    category: 'material',
    description: '調合の材料になる野の草',
    buyPrice: 8,
    sellPrice: 3,
  },
  ore: {
    id: 'ore',
    name: '律鉄鉱',
    category: 'material',
    description: '残響を帯びた鉱石。鍛冶の材料',
    buyPrice: 15,
    sellPrice: 6,
  },
  fang: {
    id: 'fang',
    name: '影狼の牙',
    category: 'material',
    description: '硬く鋭い牙。素材や売り物に',
    buyPrice: 30,
    sellPrice: 12,
  },
  resonantShard: {
    id: 'resonantShard',
    name: '共鳴の欠片',
    category: 'key',
    description: '躁ぎの森の残響から得た欠片。鐘楼の封に共鳴する',
    buyPrice: 0,
    sellPrice: 0,
  },
  travelKnife: {
    id: 'travelKnife',
    name: '旅の短剣',
    category: 'weapon',
    description: '攻撃+2',
    buyPrice: 50,
    sellPrice: 20,
    equip: { slot: 'weapon', attack: 2 },
  },
  echoBlade: {
    id: 'echoBlade',
    name: '残響の剣',
    category: 'weapon',
    description: '攻撃+5 残響属性',
    buyPrice: 220,
    sellPrice: 88,
    equip: { slot: 'weapon', attack: 5, element: 'echo' },
  },
  forgedBlade: {
    id: 'forgedBlade',
    name: '鍛えられた剣',
    category: 'weapon',
    description: '攻撃+8(鍛冶でのみ入手)',
    buyPrice: 0,
    sellPrice: 150,
    equip: { slot: 'weapon', attack: 8 },
  },
  travelGarb: {
    id: 'travelGarb',
    name: '旅装',
    category: 'armor',
    description: '防御+1',
    buyPrice: 40,
    sellPrice: 16,
    equip: { slot: 'armor', defense: 1 },
  },
  leatherMail: {
    id: 'leatherMail',
    name: '革鎧',
    category: 'armor',
    description: '防御+3',
    buyPrice: 150,
    sellPrice: 60,
    equip: { slot: 'armor', defense: 3 },
  },
  hallowRobe: {
    id: 'hallowRobe',
    name: '聖布のローブ',
    category: 'armor',
    description: '防御+5',
    buyPrice: 300,
    sellPrice: 120,
    equip: { slot: 'armor', defense: 5 },
  },
  guardCharm: {
    id: 'guardCharm',
    name: '護りの護符',
    category: 'charm',
    description: '防御+2(鍛冶でのみ入手)',
    buyPrice: 0,
    sellPrice: 40,
    equip: { slot: 'charm', defense: 2 },
  },
  mireCharm: {
    id: 'mireCharm',
    name: 'ミレのお守り',
    category: 'charm',
    description: '毒を防ぐ。ミレの手作り',
    buyPrice: 0,
    sellPrice: 0,
    equip: { slot: 'charm', resist: 'poison' },
  },
};

export const recipes: RecipeDef[] = [
  {
    id: 'potionRecipe',
    name: '回復薬の調合',
    result: { itemId: 'potion', count: 1 },
    materials: [{ itemId: 'herb', count: 2 }],
  },
  {
    id: 'antidoteRecipe',
    name: '解毒草の調合',
    result: { itemId: 'antidote', count: 1 },
    materials: [
      { itemId: 'herb', count: 1 },
      { itemId: 'fang', count: 1 },
    ],
  },
  {
    id: 'guardCharmRecipe',
    name: '護りの護符',
    result: { itemId: 'guardCharm', count: 1 },
    materials: [
      { itemId: 'ore', count: 2 },
      { itemId: 'herb', count: 1 },
    ],
  },
  {
    id: 'forgedBladeRecipe',
    name: '剣の鍛え直し',
    result: { itemId: 'forgedBlade', count: 1 },
    materials: [
      { itemId: 'ore', count: 3 },
      { itemId: 'fang', count: 2 },
    ],
  },
];

export interface ShopDef {
  id: string;
  name: string;
  itemIds: string[];
}

export const shops: Record<string, ShopDef> = {
  gand: {
    id: 'gand',
    name: 'ガンドの鍛冶屋',
    itemIds: ['travelKnife', 'travelGarb', 'leatherMail', 'echoBlade'],
  },
  tomma: {
    id: 'tomma',
    name: 'トマの行商',
    itemIds: ['potion', 'antidote', 'herb', 'ether'],
  },
  veldrin: {
    id: 'veldrin',
    name: 'ヴェルディン商店',
    itemIds: ['potion', 'hiPotion', 'ether', 'antidote', 'hallowRobe', 'echoBlade'],
  },
};
