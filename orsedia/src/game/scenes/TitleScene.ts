import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SaveManager } from '../systems/SaveManager';
import { eventBus } from '../EventBus';

/** タイトル画面。「はじめる」/(セーブがあれば)「つづきから」。 */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    eventBus.emit('scene-changed', { scene: 'title' });

    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, GAME_HEIGHT * 0.28, '残響のオルセディア', {
        fontSize: '36px',
        color: '#eef2f6',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, GAME_HEIGHT * 0.28 + 34, '- Echoes of Orsedia -', {
        fontSize: '14px',
        color: '#8fb3d9',
      })
      .setOrigin(0.5);

    const hasSave = SaveManager.hasSave();

    this.add
      .text(cx, GAME_HEIGHT * 0.58, '[ENTER] はじめから', {
        fontSize: '18px',
        color: '#ffe9a8',
      })
      .setOrigin(0.5);

    if (hasSave) {
      this.add
        .text(cx, GAME_HEIGHT * 0.58 + 34, '[C] つづきから', {
          fontSize: '18px',
          color: '#a8d8ff',
        })
        .setOrigin(0.5);
    }

    this.add
      .text(cx, GAME_HEIGHT * 0.88, 'Phase 1 最小プレイアブル版', {
        fontSize: '11px',
        color: '#5a6a7a',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start('game', { loadSave: false });
    });

    if (hasSave) {
      this.input.keyboard?.once('keydown-C', () => {
        this.scene.start('game', { loadSave: true });
      });
    }
  }
}
