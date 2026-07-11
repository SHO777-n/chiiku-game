import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { buildGameConfig } from './game/config';
import { Hud } from './ui/Hud';

/**
 * アプリシェル。Phaser ゲームのマウントと React 製 HUD の重ね合わせを行う。
 */
export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    gameRef.current = new Phaser.Game(buildGameConfig(containerRef.current));
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="app">
      <div className="game-wrapper">
        <div ref={containerRef} className="game-container" />
        <Hud />
      </div>
    </div>
  );
}
