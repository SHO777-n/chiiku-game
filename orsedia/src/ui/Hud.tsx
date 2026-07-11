import { useEffect, useState } from 'react';
import { eventBus } from '../game/EventBus';

/**
 * ゲーム画面上のHUD(HP表示)。
 * Phaser側とは EventBus 経由でのみ通信する(ADR-004)。
 */
export function Hud() {
  const [hp, setHp] = useState({ hp: 0, maxHp: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onHpChanged = (payload: { hp: number; maxHp: number }) => setHp(payload);
    const onSceneChanged = (payload: { scene: string }) => setVisible(payload.scene === 'game');
    eventBus.on('hp-changed', onHpChanged);
    eventBus.on('scene-changed', onSceneChanged);
    return () => {
      eventBus.off('hp-changed', onHpChanged);
      eventBus.off('scene-changed', onSceneChanged);
    };
  }, []);

  if (!visible || hp.maxHp === 0) return null;

  const ratio = hp.hp / hp.maxHp;

  return (
    <div className="hud">
      <div className="hud-hp-label">
        HP {hp.hp} / {hp.maxHp}
      </div>
      <div className="hud-hp-bar">
        <div
          className="hud-hp-fill"
          style={{
            width: `${ratio * 100}%`,
            backgroundColor: ratio > 0.5 ? '#4caf50' : ratio > 0.25 ? '#ff9800' : '#f44336',
          }}
        />
      </div>
    </div>
  );
}
