import { useEffect, useState, useSyncExternalStore } from 'react';
import { gameState, getDerivedStats } from '../game/systems/GameState';
import { items, recipes } from '../game/data/items';
import { skills, skillTreeOrder } from '../game/data/skills';
import { quests } from '../game/data/quests';
import { countItem } from '../core/inventory';
import { canCraft } from '../core/crafting';

type Tab = 'items' | 'equip' | 'skills' | 'quests' | 'craft';

const TABS: { id: Tab; label: string }[] = [
  { id: 'items', label: 'アイテム' },
  { id: 'equip', label: '装備' },
  { id: 'skills', label: 'スキル' },
  { id: 'quests', label: 'クエスト' },
  { id: 'craft', label: '調合・鍛冶' },
];

/** M キーで開くメニュー(React オーバーレイ)。 */
export function Menu() {
  const state = useSyncExternalStore(gameState.subscribe, gameState.getSnapshot);
  const [tab, setTab] = useState<Tab>('items');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!state.ui.menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
        gameState.closeMenu();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.ui.menuOpen]);

  if (!state.ui.menuOpen) return null;

  const derived = getDerivedStats(state);

  return (
    <div className="overlay">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? 'tab active' : 'tab'}
                onClick={() => {
                  setTab(t.id);
                  setMessage('');
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button className="close-btn" onClick={() => gameState.closeMenu()}>
            ✕ 閉じる
          </button>
        </div>

        <div className="panel-stats">
          Lv{state.player.level} / HP {state.player.hp}/{derived.maxHp} / MP {state.player.mp}/
          {derived.maxMp} / 攻撃 {derived.attack} / 防御 {derived.defense} / 💰{state.gold}リン / SP{' '}
          {state.player.skillPoints}
        </div>
        {message && <div className="panel-message">{message}</div>}

        <div className="panel-body">
          {tab === 'items' && (
            <ul className="list">
              {state.inventory.length === 0 && <li className="muted">なにも持っていない</li>}
              {state.inventory.map((stack, i) => {
                const def = items[stack.itemId];
                if (!def) return null;
                const usable = def.effect || def.equip;
                return (
                  <li key={`${stack.itemId}-${i}`}>
                    <span className="item-name">
                      {def.name} ×{stack.count}
                    </span>
                    <span className="item-desc">{def.description}</span>
                    {usable && (
                      <button
                        onClick={() => {
                          const result = gameState.useItem(stack.itemId);
                          setMessage(result ?? '今は使えない');
                        }}
                      >
                        {def.equip ? '装備' : '使う'}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {tab === 'equip' && (
            <ul className="list">
              {(['weapon', 'armor', 'charm'] as const).map((slot) => {
                const id = state.equipment[slot];
                const label = { weapon: '武器', armor: '防具', charm: '装身具' }[slot];
                return (
                  <li key={slot}>
                    <span className="item-name">{label}</span>
                    <span className="item-desc">
                      {id ? `${items[id]?.name}(${items[id]?.description})` : '── なし ──'}
                    </span>
                    {id && <button onClick={() => gameState.unequip(slot)}>はずす</button>}
                  </li>
                );
              })}
              <li className="muted">装備の変更は「アイテム」タブから行う</li>
            </ul>
          )}

          {tab === 'skills' && (
            <ul className="list">
              {skillTreeOrder.map((id) => {
                const def = skills[id];
                const learned = state.learnedSkills.includes(id);
                const prereqOk = !def.requires || state.learnedSkills.includes(def.requires);
                const canLearn = !learned && prereqOk && state.player.skillPoints > 0;
                return (
                  <li key={id} className={learned ? 'learned' : prereqOk ? '' : 'locked'}>
                    <span className="item-name">
                      {learned ? '✓ ' : ''}
                      {def.name}
                      {def.kind !== 'passive' && def.hotkey ? `(キー${def.hotkey})` : ''}
                    </span>
                    <span className="item-desc">
                      {def.description}
                      {def.mpCost > 0 ? ` / MP${def.mpCost}` : ''}
                      {def.requires ? ` / 要:${skills[def.requires].name}` : ''}
                    </span>
                    {canLearn && (
                      <button onClick={() => gameState.learnSkill(id)}>習得(SP1)</button>
                    )}
                  </li>
                );
              })}
              <li className="muted">
                攻撃・回復スキルは習得順に 1〜4 キーへ割り当てられる
              </li>
            </ul>
          )}

          {tab === 'quests' && (
            <ul className="list">
              {state.quests.length === 0 && <li className="muted">クエストはまだない</li>}
              {[...state.quests]
                .sort((a, b) => (a.status === 'active' ? -1 : 1) - (b.status === 'active' ? -1 : 1))
                .map((q) => {
                  const def = quests[q.id];
                  if (!def) return null;
                  const done = q.status === 'rewarded' || q.status === 'completed';
                  return (
                    <li key={q.id} className={done ? 'learned' : ''}>
                      <span className="item-name">
                        {def.isMain ? '★' : '・'}
                        {def.name}
                        {q.status === 'completed' ? '(報告する)' : done ? '(完了)' : ''}
                      </span>
                      <span className="item-desc">
                        {def.description}
                        <br />
                        {def.objectives
                          .map((o) => `${o.label} ${Math.min(q.counts[o.id] ?? 0, o.required)}/${o.required}`)
                          .join(' / ')}
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}

          {tab === 'craft' && (
            <ul className="list">
              {recipes.map((r) => {
                const ok = canCraft(r, state.inventory);
                return (
                  <li key={r.id} className={ok ? '' : 'locked'}>
                    <span className="item-name">{r.name}</span>
                    <span className="item-desc">
                      {items[r.result.itemId].name} ×{r.result.count} ←{' '}
                      {r.materials
                        .map(
                          (m) =>
                            `${items[m.itemId].name} ${countItem(state.inventory, m.itemId)}/${m.count}`,
                        )
                        .join('、')}
                    </span>
                    {ok && (
                      <button
                        onClick={() => {
                          gameState.craftRecipe(r.id);
                          setMessage(`${items[r.result.itemId].name}を作った`);
                        }}
                      >
                        作る
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
