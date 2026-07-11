import { describe, expect, it } from 'vitest';
import { gainXp, statsForLevel, xpForNextLevel, MAX_LEVEL } from './stats';
import { addItem, removeItem, countItem } from './inventory';
import { startQuest, recordProgress, markRewarded, questStatus, type QuestDef } from './quests';
import { applyStatus, tickStatuses, elementMultiplier } from './effects';
import { canCraft, craft, type RecipeDef } from './crafting';
import { advanceClock, dayPhase, darknessLevel, clockLabel } from './time';

describe('stats', () => {
  it('XPを得てレベルアップする', () => {
    const base = { ...statsForLevel(1), xp: 0 };
    const result = gainXp(base, 25);
    expect(result.stats.level).toBe(2);
    expect(result.levelsGained).toBe(1);
    expect(result.stats.maxHp).toBeGreaterThan(base.maxHp);
  });

  it('一度に複数レベル上がる', () => {
    const base = { ...statsForLevel(1), xp: 0 };
    expect(gainXp(base, 200).stats.level).toBe(5);
  });

  it('最大レベルで頭打ちになる', () => {
    const base = { ...statsForLevel(MAX_LEVEL), xp: 99999 };
    expect(gainXp(base, 99999).stats.level).toBe(MAX_LEVEL);
    expect(xpForNextLevel(MAX_LEVEL)).toBe(Infinity);
  });
});

describe('inventory', () => {
  it('追加はスタックされる', () => {
    const inv = addItem(addItem([], 'potion', 2), 'potion', 3);
    expect(countItem(inv, 'potion')).toBe(5);
    expect(inv).toHaveLength(1);
  });

  it('99を超えると新スタックになる', () => {
    const inv = addItem(addItem([], 'herb', 99), 'herb', 2);
    expect(inv).toHaveLength(2);
    expect(countItem(inv, 'herb')).toBe(101);
  });

  it('不足時の削除は null(部分消費しない)', () => {
    const inv = addItem([], 'potion', 2);
    expect(removeItem(inv, 'potion', 3)).toBeNull();
    expect(removeItem(inv, 'potion', 2)).toEqual([]);
  });
});

const questDef: QuestDef = {
  id: 'sq1',
  name: '迷い羊を追って',
  description: '',
  isMain: false,
  objectives: [{ id: 'sheep', label: '羊を連れ戻す', required: 3 }],
};

describe('quests', () => {
  it('開始→進行→完了→報酬受取', () => {
    let list = startQuest([], 'sq1');
    expect(questStatus(list, 'sq1')).toBe('active');
    list = recordProgress(list, questDef, 'sheep', 2);
    expect(questStatus(list, 'sq1')).toBe('active');
    list = recordProgress(list, questDef, 'sheep', 1);
    expect(questStatus(list, 'sq1')).toBe('completed');
    list = markRewarded(list, 'sq1');
    expect(questStatus(list, 'sq1')).toBe('rewarded');
  });

  it('required を超えてカウントしない', () => {
    let list = startQuest([], 'sq1');
    list = recordProgress(list, questDef, 'sheep', 10);
    expect(list[0].counts.sheep).toBe(3);
  });
});

describe('effects', () => {
  it('毒は1秒ごとに1ダメージ分を返す', () => {
    const statuses = applyStatus([], 'poison', 0, 5000);
    const t1 = tickStatuses(statuses, 2500);
    expect(t1.poisonDamage).toBe(2);
    const t2 = tickStatuses(t1.statuses, 3500);
    expect(t2.poisonDamage).toBe(1);
  });

  it('期限切れで解除される', () => {
    const statuses = applyStatus([], 'stun', 0, 1000);
    expect(tickStatuses(statuses, 500).stunned).toBe(true);
    expect(tickStatuses(statuses, 1500).stunned).toBe(false);
    expect(tickStatuses(statuses, 1500).statuses).toHaveLength(0);
  });

  it('属性補正', () => {
    const profile = { weak: ['fire' as const], resist: ['echo' as const] };
    expect(elementMultiplier('fire', profile)).toBe(1.5);
    expect(elementMultiplier('echo', profile)).toBe(0.5);
    expect(elementMultiplier('physical', profile)).toBe(1);
  });
});

const recipe: RecipeDef = {
  id: 'potionRecipe',
  name: '回復薬の調合',
  result: { itemId: 'potion', count: 1 },
  materials: [{ itemId: 'herb', count: 2 }],
};

describe('crafting', () => {
  it('素材が足りればクラフトできる', () => {
    const inv = addItem([], 'herb', 3);
    expect(canCraft(recipe, inv)).toBe(true);
    const next = craft(recipe, inv);
    expect(next).not.toBeNull();
    expect(countItem(next!, 'herb')).toBe(1);
    expect(countItem(next!, 'potion')).toBe(1);
  });

  it('素材不足なら null', () => {
    const inv = addItem([], 'herb', 1);
    expect(canCraft(recipe, inv)).toBe(false);
    expect(craft(recipe, inv)).toBeNull();
  });
});

describe('time', () => {
  it('時間が進み、1日で一周する', () => {
    expect(advanceClock(1439, 60000)).toBeLessThan(1440);
    expect(clockLabel(8 * 60 + 5)).toBe('08:05');
  });

  it('時間帯の判定', () => {
    expect(dayPhase(6 * 60)).toBe('dawn');
    expect(dayPhase(12 * 60)).toBe('day');
    expect(dayPhase(18 * 60)).toBe('dusk');
    expect(dayPhase(23 * 60)).toBe('night');
  });

  it('暗さは昼0・夜1・薄明で中間', () => {
    expect(darknessLevel(12 * 60)).toBe(0);
    expect(darknessLevel(23 * 60)).toBe(1);
    const dusk = darknessLevel(18 * 60);
    expect(dusk).toBeGreaterThan(0);
    expect(dusk).toBeLessThan(1);
  });
});
