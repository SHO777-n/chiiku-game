/** ゲーム全体の定数と Phaser 設定。 */
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { EndingScene } from './scenes/EndingScene';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 560;

export const PLAYER = {
  speed: 165,
  attackBase: 3,
  attackCooldownMs: 380,
  attackRange: 32,
  invulnerableMs: 800,
} as const;

export const SAVE_STORAGE_KEY = 'orsedia.save';

/** マップごとの G(封の扉)を開くフラグ */
export const GATE_FLAGS: Record<string, string> = {
  forest: 'towerOpen',
  tower: 'towerBossGate',
  crypt: 'cryptBossGate',
};

export function buildGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#0a0d12',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, TitleScene, GameScene, GameOverScene, EndingScene],
  };
}
