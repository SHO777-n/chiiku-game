import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { buildGameConfig } from './game/config';
import { Hud } from './ui/Hud';
import { Menu } from './ui/Menu';
import { Shop } from './ui/Shop';
import { TouchControls } from './ui/TouchControls';

/** アプリシェル。Phaser ゲームと React 製 UI(HUD/メニュー/ショップ)の重ね合わせ。 */
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
        <TouchControls />
        <Menu />
        <Shop />
      </div>
    </div>
  );
}
