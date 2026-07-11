import { useEffect, useState, useSyncExternalStore } from 'react';
import { eventBus } from '../game/EventBus';
import { gameState, getDerivedStats } from '../game/systems/GameState';
import { clockLabel, dayPhase } from '../core/time';
import { quests } from '../game/data/quests';
import { xpForNextLevel } from '../core/stats';

const PHASE_LABEL: Record<string, string> = {
  dawn: '夜明け',
  day: '昼',
  dusk: '夕暮れ',
  night: '夜',
};

/** ゲーム画面上のHUD。GameState を購読して表示する。 */
export function Hud() {
  const state = useSyncExternalStore(gameState.subscribe, gameState.getSnapshot);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onSceneChanged = (p: { scene: string }) => setVisible(p.scene === 'game');
    eventBus.on('scene-changed', onSceneChanged);
    return () => eventBus.off('scene-changed', onSceneChanged);
  }, []);

  if (!visible) return null;

  const derived = getDerivedStats(state);
  const hpRatio = state.player.hp / derived.maxHp;
  const mpRatio = state.player.mp / derived.maxMp;
  const xpNext = xpForNextLevel(state.player.level);
  const activeQuest = state.quests.find(
    (q) => q.status === 'active' && quests[q.id]?.isMain,
  ) ?? state.quests.find((q) => q.status === 'active');
  const questDef = activeQuest ? quests[activeQuest.id] : null;
  const nextObjective = questDef?.objectives.find(
    (o) => (activeQuest?.counts[o.id] ?? 0) < o.required,
  );

  return (
    <div className="hud">
      <div className="hud-panel">
        <div className="hud-row">
          <span className="hud-level">Lv{state.player.level}</span>
          <div className="hud-bars">
            <div className="hud-bar">
              <div
                className="hud-bar-fill"
                style={{
                  width: `${hpRatio * 100}%`,
                  backgroundColor: hpRatio > 0.5 ? '#4caf50' : hpRatio > 0.25 ? '#ff9800' : '#f44336',
                }}
              />
              <span className="hud-bar-label">
                HP {state.player.hp}/{derived.maxHp}
              </span>
            </div>
            <div className="hud-bar hud-bar-mp">
              <div
                className="hud-bar-fill"
                style={{ width: `${mpRatio * 100}%`, backgroundColor: '#5a8ad8' }}
              />
              <span className="hud-bar-label">
                MP {state.player.mp}/{derived.maxMp}
              </span>
            </div>
          </div>
        </div>
        <div className="hud-sub">
          <span>💰 {state.gold}</span>
          <span>
            ✨ {state.player.xp}
            {Number.isFinite(xpNext) ? `/${xpNext}` : ''}
          </span>
          <span>
            🕐 {clockLabel(state.clockMin)}({PHASE_LABEL[dayPhase(state.clockMin)]})
          </span>
        </div>
        {state.statuses.length > 0 && (
          <div className="hud-status">
            {state.statuses.map((s) => (
              <span key={s.type} className={`hud-status-tag hud-status-${s.type}`}>
                {s.type === 'poison' ? '毒' : 'しびれ'}
              </span>
            ))}
          </div>
        )}
      </div>
      {questDef && (
        <div className="hud-quest">
          <div className="hud-quest-name">
            {questDef.isMain ? '★' : '・'}{questDef.name}
          </div>
          {nextObjective && (
            <div className="hud-quest-obj">
              {nextObjective.label}({activeQuest?.counts[nextObjective.id] ?? 0}/
              {nextObjective.required})
            </div>
          )}
        </div>
      )}
      <div className="hud-keys">M: メニュー / K: セーブ</div>
    </div>
  );
}
