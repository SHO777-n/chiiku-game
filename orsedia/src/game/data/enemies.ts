/** 敵データ(ロジック禁止)。 */
import type { EnemyAiParams } from '../../core/enemyAi';
import type { Element, ElementProfile, StatusType } from '../../core/effects';

export interface EnemyDefinition {
  type: string;
  name: string;
  maxHp: number;
  attack: number;
  defense: number;
  patrolSpeed: number;
  chaseSpeed: number;
  touchDamage: number;
  xp: number;
  gold: number;
  element: Element;
  profile: ElementProfile;
  /** 接触時に付与する状態異常 */
  inflicts?: { type: StatusType; durationMs: number; chance: number };
  drop?: { itemId: string; chance: number };
  ai: EnemyAiParams;
  /** 見た目のテクスチャキー */
  texture: string;
  scale?: number;
  isBoss?: boolean;
}

const defaultAi: EnemyAiParams = {
  detectRadius: 130,
  loseRadius: 240,
  leashRadius: 340,
  homeArriveRadius: 8,
};

export const enemyDefinitions: Record<string, EnemyDefinition> = {
  echoShard: {
    type: 'echoShard',
    name: '残響のかけら',
    maxHp: 8,
    attack: 2,
    defense: 0,
    patrolSpeed: 40,
    chaseSpeed: 105,
    touchDamage: 2,
    xp: 8,
    gold: 5,
    element: 'echo',
    profile: { weak: ['physical'], resist: ['echo'] },
    drop: { itemId: 'herb', chance: 0.3 },
    ai: defaultAi,
    texture: 'enemy-shard',
  },
  shadowWolf: {
    type: 'shadowWolf',
    name: '影狼',
    maxHp: 14,
    attack: 4,
    defense: 1,
    patrolSpeed: 55,
    chaseSpeed: 150,
    touchDamage: 3,
    xp: 14,
    gold: 8,
    element: 'physical',
    profile: { weak: ['fire'], resist: [] },
    drop: { itemId: 'fang', chance: 0.6 },
    ai: { ...defaultAi, detectRadius: 160 },
    texture: 'enemy-wolf',
  },
  stoneSentinel: {
    type: 'stoneSentinel',
    name: '石の哨兵',
    maxHp: 26,
    attack: 6,
    defense: 3,
    patrolSpeed: 25,
    chaseSpeed: 70,
    touchDamage: 4,
    xp: 30,
    gold: 18,
    element: 'physical',
    profile: { weak: ['echo'], resist: ['physical'] },
    inflicts: { type: 'stun', durationMs: 900, chance: 0.35 },
    drop: { itemId: 'ore', chance: 0.5 },
    ai: { ...defaultAi, detectRadius: 110 },
    texture: 'enemy-sentinel',
    scale: 1.2,
  },
  cryptWraith: {
    type: 'cryptWraith',
    name: '聖堂の怨霊',
    maxHp: 22,
    attack: 5,
    defense: 1,
    patrolSpeed: 45,
    chaseSpeed: 120,
    touchDamage: 3,
    xp: 26,
    gold: 15,
    element: 'echo',
    profile: { weak: ['fire'], resist: ['physical'] },
    inflicts: { type: 'poison', durationMs: 5000, chance: 0.5 },
    drop: { itemId: 'herb', chance: 0.4 },
    ai: { ...defaultAi, detectRadius: 150 },
    texture: 'enemy-wraith',
  },
  wailingEcho: {
    type: 'wailingEcho',
    name: '哭きの残響',
    maxHp: 90,
    attack: 6,
    defense: 2,
    patrolSpeed: 30,
    chaseSpeed: 85,
    touchDamage: 4,
    xp: 120,
    gold: 100,
    element: 'echo',
    profile: { weak: ['physical'], resist: ['echo'] },
    ai: { detectRadius: 400, loseRadius: 800, leashRadius: 900, homeArriveRadius: 8 },
    texture: 'enemy-boss1',
    scale: 2,
    isBoss: true,
  },
  enforcer: {
    type: 'enforcer',
    name: '黙の会の執行者',
    maxHp: 130,
    attack: 8,
    defense: 3,
    patrolSpeed: 40,
    chaseSpeed: 130,
    touchDamage: 5,
    xp: 200,
    gold: 200,
    element: 'physical',
    profile: { weak: ['echo'], resist: ['ice'] },
    inflicts: { type: 'stun', durationMs: 700, chance: 0.25 },
    ai: { detectRadius: 400, loseRadius: 800, leashRadius: 900, homeArriveRadius: 8 },
    texture: 'enemy-boss2',
    scale: 1.6,
    isBoss: true,
  },
};
