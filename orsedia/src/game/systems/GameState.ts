/**
 * ゲーム進行状態の唯一のストア。
 * Phaser側は直接読み書きし、React側は subscribe/getSnapshot で購読する(ADR-007)。
 * 純粋な計算は core/ に委譲する。
 */
import { statsForLevel, gainXp, xpForNextLevel } from '../../core/stats';
import { addItem, removeItem, countItem, type ItemStack } from '../../core/inventory';
import {
  startQuest,
  recordProgress,
  markRewarded,
  questStatus,
  type QuestProgress,
} from '../../core/quests';
import {
  applyStatus,
  tickStatuses,
  hasStatus,
  type StatusEffect,
  type StatusType,
  type Element,
} from '../../core/effects';
import { applyDamage, heal } from '../../core/combat';
import { craft } from '../../core/crafting';
import type { SaveDataV2, FlagValue } from '../../core/save';
import { items, recipes } from '../data/items';
import { skills } from '../data/skills';
import { quests } from '../data/quests';
import type { Condition } from '../data/npcs';
import { eventBus } from '../EventBus';

export interface UiState {
  menuOpen: boolean;
  shopId: string | null;
}

export interface RuntimeState {
  mapId: string;
  player: { hp: number; mp: number; level: number; xp: number; skillPoints: number };
  learnedSkills: string[];
  equipment: { weapon: string | null; armor: string | null; charm: string | null };
  inventory: ItemStack[];
  gold: number;
  flags: Record<string, FlagValue>;
  quests: QuestProgress[];
  defeatedEnemyIds: string[];
  clockMin: number;
  statuses: StatusEffect[];
  ui: UiState;
}

export interface DerivedStats {
  maxHp: number;
  maxMp: number;
  attack: number;
  defense: number;
  weaponElement: Element;
  resistStatuses: StatusType[];
}

function initialState(): RuntimeState {
  return {
    mapId: 'village',
    player: { hp: 20, mp: 10, level: 1, xp: 0, skillPoints: 1 },
    learnedSkills: [],
    equipment: { weapon: null, armor: null, charm: null },
    inventory: [
      { itemId: 'potion', count: 2 },
      { itemId: 'travelKnife', count: 1 },
    ],
    gold: 50,
    flags: {},
    quests: [],
    defeatedEnemyIds: [],
    clockMin: 8 * 60,
    statuses: [],
    ui: { menuOpen: false, shopId: null },
  };
}

export function getDerivedStats(s: RuntimeState): DerivedStats {
  const base = statsForLevel(s.player.level);
  let maxHp = base.maxHp;
  let maxMp = base.maxMp;
  let attack = base.attack;
  let defense = base.defense;
  let weaponElement: Element = 'physical';
  const resistStatuses: StatusType[] = [];

  for (const skillId of s.learnedSkills) {
    const p = skills[skillId]?.passive;
    if (p?.maxHpBonus) maxHp += p.maxHpBonus;
    if (p?.maxMpBonus) maxMp += p.maxMpBonus;
  }
  for (const slot of ['weapon', 'armor', 'charm'] as const) {
    const id = s.equipment[slot];
    const eq = id ? items[id]?.equip : undefined;
    if (!eq) continue;
    attack += eq.attack ?? 0;
    defense += eq.defense ?? 0;
    if (eq.element) weaponElement = eq.element;
    if (eq.resist) resistStatuses.push(eq.resist);
  }
  return { maxHp, maxMp, attack, defense, weaponElement, resistStatuses };
}

export function evaluateConditions(conds: Condition[], s: RuntimeState): boolean {
  return conds.every((c) => {
    switch (c.type) {
      case 'flag':
        return s.flags[c.key] === (c.value ?? true);
      case 'notFlag':
        return s.flags[c.key] === undefined || s.flags[c.key] === false;
      case 'quest': {
        const st = questStatus(s.quests, c.id);
        return Array.isArray(c.status) ? c.status.includes(st) : st === c.status;
      }
      case 'hasItem':
        return countItem(s.inventory, c.itemId) >= c.count;
    }
  });
}

class GameStateStore {
  private state: RuntimeState = initialState();
  private listeners = new Set<() => void>();
  private lastMinute = -1;

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getSnapshot = (): RuntimeState => this.state;

  get s(): RuntimeState {
    return this.state;
  }

  private commit(next: Partial<RuntimeState>): void {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((fn) => fn());
  }

  // ---------- ライフサイクル ----------

  newGame(): void {
    this.state = initialState();
    this.commit({});
  }

  fromSave(save: SaveDataV2): void {
    this.state = {
      ...initialState(),
      mapId: save.mapId,
      player: { ...save.player },
      learnedSkills: [...save.learnedSkills],
      equipment: { ...save.equipment },
      inventory: save.inventory.map((s) => ({ ...s })),
      gold: save.gold,
      flags: { ...save.flags },
      quests: save.quests.map((q) => ({ ...q, counts: { ...q.counts } })),
      defeatedEnemyIds: [...save.defeatedEnemyIds],
      clockMin: save.clockMin,
    };
    this.commit({});
  }

  toSave(x: number, y: number): SaveDataV2 {
    const s = this.state;
    return {
      version: 2,
      mapId: s.mapId,
      player: { x, y, ...s.player },
      learnedSkills: [...s.learnedSkills],
      equipment: { ...s.equipment },
      inventory: s.inventory.map((st) => ({ ...st })),
      gold: s.gold,
      flags: { ...s.flags },
      quests: s.quests.map((q) => ({ ...q, counts: { ...q.counts } })),
      defeatedEnemyIds: [...s.defeatedEnemyIds],
      clockMin: s.clockMin,
      savedAt: new Date().toISOString(),
    };
  }

  // ---------- プレイヤー ----------

  /** 戻り値: 死亡したか */
  damagePlayer(amount: number): boolean {
    const hp = applyDamage(this.state.player.hp, amount);
    this.commit({ player: { ...this.state.player, hp } });
    return hp <= 0;
  }

  healPlayer(amount: number): void {
    const { maxHp } = getDerivedStats(this.state);
    this.commit({
      player: { ...this.state.player, hp: heal(this.state.player.hp, maxHp, amount) },
    });
  }

  healMp(amount: number): void {
    const { maxMp } = getDerivedStats(this.state);
    this.commit({
      player: { ...this.state.player, mp: heal(this.state.player.mp, maxMp, amount) },
    });
  }

  spendMp(amount: number): boolean {
    if (this.state.player.mp < amount) return false;
    this.commit({ player: { ...this.state.player, mp: this.state.player.mp - amount } });
    return true;
  }

  /** 戻り値: 上がったレベル数 */
  gainXp(amount: number): number {
    const p = this.state.player;
    const before = statsForLevel(p.level);
    const result = gainXp({ ...before, xp: p.xp, level: p.level }, amount);
    const levels = result.levelsGained;
    const next = {
      ...p,
      xp: result.stats.xp,
      level: result.stats.level,
      skillPoints: p.skillPoints + levels,
    };
    if (levels > 0) {
      const derived = getDerivedStats({ ...this.state, player: next });
      next.hp = derived.maxHp;
      next.mp = derived.maxMp;
      this.notify(`レベル ${next.level} になった!(スキルポイント+${levels})`);
    }
    this.commit({ player: next });
    return levels;
  }

  // ---------- インベントリ・装備・お金 ----------

  giveItem(itemId: string, count = 1): void {
    this.commit({ inventory: addItem(this.state.inventory, itemId, count) });
  }

  takeItem(itemId: string, count = 1): boolean {
    const next = removeItem(this.state.inventory, itemId, count);
    if (!next) return false;
    this.commit({ inventory: next });
    return true;
  }

  addGold(amount: number): void {
    this.commit({ gold: this.state.gold + amount });
  }

  spendGold(amount: number): boolean {
    if (this.state.gold < amount) return false;
    this.commit({ gold: this.state.gold - amount });
    return true;
  }

  /** 消費アイテム使用。戻り値は結果メッセージ(使えない時 null)。 */
  useItem(itemId: string): string | null {
    const def = items[itemId];
    if (!def) return null;
    if (def.effect) {
      if (def.effect.cure && !hasStatus(this.state.statuses, def.effect.cure)) {
        if (!def.effect.healHp && !def.effect.healMp) return null;
      }
      if (!this.takeItem(itemId, 1)) return null;
      if (def.effect.healHp) this.healPlayer(def.effect.healHp);
      if (def.effect.healMp) this.healMp(def.effect.healMp);
      if (def.effect.cure) {
        this.commit({
          statuses: this.state.statuses.filter((st) => st.type !== def.effect?.cure),
        });
      }
      return `${def.name}を使った`;
    }
    if (def.equip) return this.equipItem(itemId) ? `${def.name}を装備した` : null;
    return null;
  }

  equipItem(itemId: string): boolean {
    const def = items[itemId];
    if (!def?.equip) return false;
    if (!this.takeItem(itemId, 1)) return false;
    const slot = def.equip.slot;
    const prev = this.state.equipment[slot];
    let inventory = this.state.inventory;
    if (prev) inventory = addItem(inventory, prev, 1);
    this.commit({ inventory, equipment: { ...this.state.equipment, [slot]: itemId } });
    return true;
  }

  unequip(slot: 'weapon' | 'armor' | 'charm'): void {
    const prev = this.state.equipment[slot];
    if (!prev) return;
    this.commit({
      inventory: addItem(this.state.inventory, prev, 1),
      equipment: { ...this.state.equipment, [slot]: null },
    });
  }

  craftRecipe(recipeId: string): boolean {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return false;
    const next = craft(recipe, this.state.inventory);
    if (!next) return false;
    this.commit({ inventory: next });
    this.notify(`${items[recipe.result.itemId].name}を作った`);
    return true;
  }

  learnSkill(skillId: string): boolean {
    const def = skills[skillId];
    if (!def) return false;
    if (this.state.learnedSkills.includes(skillId)) return false;
    if (this.state.player.skillPoints < 1) return false;
    if (def.requires && !this.state.learnedSkills.includes(def.requires)) return false;
    this.commit({
      learnedSkills: [...this.state.learnedSkills, skillId],
      player: { ...this.state.player, skillPoints: this.state.player.skillPoints - 1 },
    });
    this.notify(`スキル「${def.name}」を習得した`);
    return true;
  }

  // ---------- クエスト・フラグ ----------

  startQuest(id: string): void {
    if (!quests[id]) return;
    if (questStatus(this.state.quests, id) !== 'inactive') return;
    this.commit({ quests: startQuest(this.state.quests, id) });
    this.notify(`クエスト開始: ${quests[id].name}`);
  }

  progressQuest(id: string, objectiveId: string, amount = 1): void {
    const def = quests[id];
    if (!def) return;
    const before = questStatus(this.state.quests, id);
    const next = recordProgress(this.state.quests, def, objectiveId, amount);
    this.commit({ quests: next });
    if (before === 'active' && questStatus(next, id) === 'completed') {
      this.notify(`クエスト目標達成: ${def.name}`);
    }
  }

  rewardQuest(id: string): void {
    const def = quests[id];
    if (!def) return;
    if (questStatus(this.state.quests, id) !== 'completed') return;
    this.commit({ quests: markRewarded(this.state.quests, id) });
    const r = def.reward;
    if (r.gold) this.addGold(r.gold);
    r.items?.forEach((it) => this.giveItem(it.itemId, it.count));
    if (r.xp) this.gainXp(r.xp);
    this.notify(`クエスト完了: ${def.name}`);
  }

  setFlag(key: string, value: FlagValue): void {
    this.commit({ flags: { ...this.state.flags, [key]: value } });
  }

  getFlag(key: string): FlagValue | undefined {
    return this.state.flags[key];
  }

  markDefeated(id: string): void {
    if (this.state.defeatedEnemyIds.includes(id)) return;
    this.commit({ defeatedEnemyIds: [...this.state.defeatedEnemyIds, id] });
  }

  setMap(mapId: string): void {
    this.commit({ mapId });
  }

  // ---------- 状態異常・時間 ----------

  addStatus(type: StatusType, now: number, durationMs: number): boolean {
    if (getDerivedStats(this.state).resistStatuses.includes(type)) return false;
    this.commit({ statuses: applyStatus(this.state.statuses, type, now, durationMs) });
    return true;
  }

  /** 毎フレーム呼ぶ。毒ダメージ適用とスタン判定。戻り値: {died, stunned} */
  tick(now: number): { died: boolean; stunned: boolean } {
    const r = tickStatuses(this.state.statuses, now);
    let died = false;
    if (r.poisonDamage > 0 || r.statuses.length !== this.state.statuses.length) {
      this.commit({ statuses: r.statuses });
    }
    if (r.poisonDamage > 0) died = this.damagePlayer(r.poisonDamage);
    return { died, stunned: r.stunned };
  }

  advanceClock(clockMin: number): void {
    this.state = { ...this.state, clockMin };
    if (Math.floor(clockMin) !== this.lastMinute) {
      this.lastMinute = Math.floor(clockMin);
      this.listeners.forEach((fn) => fn());
    }
  }

  /** 宿屋: 全回復して翌朝7時へ */
  rest(cost: number): boolean {
    if (!this.spendGold(cost)) return false;
    const d = getDerivedStats(this.state);
    this.commit({
      player: { ...this.state.player, hp: d.maxHp, mp: d.maxMp },
      statuses: [],
      clockMin: 7 * 60,
    });
    this.notify('ぐっすり眠って全回復した');
    return true;
  }

  // ---------- UI ----------

  openMenu(): void {
    this.commit({ ui: { ...this.state.ui, menuOpen: true } });
  }

  closeMenu(): void {
    this.commit({ ui: { menuOpen: false, shopId: null } });
  }

  openShop(shopId: string): void {
    this.commit({ ui: { ...this.state.ui, shopId } });
  }

  get uiBlocking(): boolean {
    return this.state.ui.menuOpen || this.state.ui.shopId !== null;
  }

  notify(message: string): void {
    eventBus.emit('notify', { message });
  }

  xpToNext(): number {
    return xpForNextLevel(this.state.player.level);
  }
}

export const gameState = new GameStateStore();
