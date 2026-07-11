import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { eventBus } from '../EventBus';

/** ゲームオーバー画面。ENTERでタイトルへ戻る。 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('gameover');
  }

  create(): void {
    eventBus.emit('scene-changed', { scene: 'gameover' });

    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, GAME_HEIGHT * 0.4, '力尽きた……', {
        fontSize: '28px',
        color: '#d86a6a',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, GAME_HEIGHT * 0.6, '[ENTER] タイトルへもどる', {
        fontSize: '16px',
        color: '#eef2f6',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start('title');
    });
  }
}
