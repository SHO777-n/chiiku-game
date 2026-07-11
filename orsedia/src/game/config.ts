/**
 * ゲーム全体の定数と Phaser 設定。
 */
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 480;

export const PLAYER = {
  maxHp: 20,
  speed: 160,
  attackDamage: 3,
  attackCooldownMs: 400,
  attackRange: 30,
  invulnerableMs: 800,
} as const;

export const SAVE_STORAGE_KEY = 'orsedia.save';

export function buildGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#101418',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, TitleScene, GameScene, GameOverScene],
  };
}
