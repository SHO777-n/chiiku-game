/** スキルとスキルツリーのデータ(ロジック禁止)。 */
import type { Element } from '../../core/effects';

export interface SkillDef {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  kind: 'attack' | 'heal' | 'passive';
  /** attack: 基礎威力 / heal: 回復量 */
  power: number;
  element?: Element;
  /** attack: プレイヤー中心の効果半径(px) */
  radius?: number;
  /** ツリーの前提スキル */
  requires?: string;
  passive?: { maxHpBonus?: number; maxMpBonus?: number };
  /** 発動キー(表示用) */
  hotkey?: string;
}

export const skills: Record<string, SkillDef> = {
  powerStrike: {
    id: 'powerStrike',
    name: '残響斬',
    description: '周囲の敵を薙ぎ払う(残響属性)',
    mpCost: 4,
    kind: 'attack',
    power: 6,
    element: 'echo',
    radius: 70,
    hotkey: '1',
  },
  heal: {
    id: 'heal',
    name: '癒しの共鳴',
    description: 'HPを25回復する',
    mpCost: 5,
    kind: 'heal',
    power: 25,
    hotkey: '2',
  },
  fireSlash: {
    id: 'fireSlash',
    name: '火閃',
    description: '炎をまとう広範囲斬撃',
    mpCost: 6,
    kind: 'attack',
    power: 9,
    element: 'fire',
    radius: 85,
    requires: 'powerStrike',
    hotkey: '3',
  },
  iceBurst: {
    id: 'iceBurst',
    name: '氷晶',
    description: '冷気を放つ広範囲攻撃',
    mpCost: 6,
    kind: 'attack',
    power: 9,
    element: 'ice',
    radius: 85,
    requires: 'powerStrike',
    hotkey: '4',
  },
  vigor: {
    id: 'vigor',
    name: '体力錬成',
    description: '最大HP+10(パッシブ)',
    mpCost: 0,
    kind: 'passive',
    power: 0,
    requires: 'heal',
    passive: { maxHpBonus: 10 },
  },
  attune: {
    id: 'attune',
    name: '精霊の加護',
    description: '最大MP+8(パッシブ)',
    mpCost: 0,
    kind: 'passive',
    power: 0,
    requires: 'heal',
    passive: { maxMpBonus: 8 },
  },
};

export const skillTreeOrder: string[] = [
  'powerStrike',
  'heal',
  'fireSlash',
  'iceBurst',
  'vigor',
  'attune',
];
