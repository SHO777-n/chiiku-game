import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { touchInput, isTouchDevice } from '../game/touchInput';
import { eventBus } from '../game/EventBus';
import { gameState } from '../game/systems/GameState';
import { skills } from '../game/data/skills';

const STICK_RADIUS = 44;

/**
 * スマホ用バーチャルコントロール(タッチ端末のゲーム中のみ表示)。
 * 入力は game/touchInput の共有状態に書き込む。
 */
export function TouchControls() {
  const state = useSyncExternalStore(gameState.subscribe, gameState.getSnapshot);
  const [inGame, setInGame] = useState(false);
  const [touch] = useState(isTouchDevice);
  const baseRef = useRef<HTMLDivElement>(null);
  const stickPointer = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onSceneChanged = (p: { scene: string }) => setInGame(p.scene === 'game');
    eventBus.on('scene-changed', onSceneChanged);
    return () => eventBus.off('scene-changed', onSceneChanged);
  }, []);

  if (!touch || !inGame) return null;

  const updateStick = (e: ReactPointerEvent) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    let dx = e.clientX - (rect.left + rect.width / 2);
    let dy = e.clientY - (rect.top + rect.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > STICK_RADIUS) {
      dx = (dx / len) * STICK_RADIUS;
      dy = (dy / len) * STICK_RADIUS;
    }
    setKnob({ x: dx, y: dy });
    touchInput.dirX = dx / STICK_RADIUS;
    touchInput.dirY = dy / STICK_RADIUS;
  };

  const resetStick = () => {
    stickPointer.current = null;
    setKnob({ x: 0, y: 0 });
    touchInput.dirX = 0;
    touchInput.dirY = 0;
  };

  const activeSkills = state.learnedSkills
    .map((id) => skills[id])
    .filter((s) => s && s.kind !== 'passive')
    .slice(0, 4);

  const press = (fn: () => void) => (e: ReactPointerEvent) => {
    e.preventDefault();
    fn();
  };

  return (
    <div className="touch-controls">
      {/* 左: ジョイスティック */}
      <div
        ref={baseRef}
        className="stick-base"
        onPointerDown={(e) => {
          stickPointer.current = e.pointerId;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // 合成イベント等でキャプチャできなくても操作は継続できる
          }
          updateStick(e);
        }}
        onPointerMove={(e) => {
          if (stickPointer.current === e.pointerId) updateStick(e);
        }}
        onPointerUp={resetStick}
        onPointerCancel={resetStick}
      >
        <div className="stick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      </div>

      {/* 右: アクションボタン */}
      <div className="touch-buttons">
        <div className="skill-row">
          {activeSkills.map((s, i) => (
            <button
              key={s.id}
              className="touch-btn skill-btn"
              onPointerDown={press(() => (touchInput.skillPresses[i] += 1))}
              onContextMenu={(e) => e.preventDefault()}
            >
              {s.name.slice(0, 2)}
            </button>
          ))}
        </div>
        <div className="main-row">
          <button
            className="touch-btn talk-btn"
            onPointerDown={press(() => (touchInput.talkPresses += 1))}
            onContextMenu={(e) => e.preventDefault()}
          >
            はなす
            <br />
            しらべる
          </button>
          <button
            className="touch-btn attack-btn"
            onPointerDown={press(() => (touchInput.attackDown = true))}
            onPointerUp={press(() => (touchInput.attackDown = false))}
            onPointerCancel={press(() => (touchInput.attackDown = false))}
            onContextMenu={(e) => e.preventDefault()}
          >
            ⚔
          </button>
        </div>
      </div>

      {/* 右上: メニュー・セーブ */}
      <div className="touch-corner">
        <button
          className="touch-btn corner-btn"
          onPointerDown={press(() => (touchInput.menuPresses += 1))}
        >
          ≡
        </button>
        <button
          className="touch-btn corner-btn"
          onPointerDown={press(() => (touchInput.savePresses += 1))}
        >
          記録
        </button>
      </div>
    </div>
  );
}
