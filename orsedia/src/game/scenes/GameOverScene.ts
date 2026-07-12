import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { eventBus } from '../EventBus';

/** ゲームオーバー画面。 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('gameover');
  }

  create(): void {
    eventBus.emit('scene-changed', { scene: 'gameover' });
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0a0608).setOrigin(0, 0);

    const text = this.add
      .text(cx, GAME_HEIGHT * 0.4, '力尽きた……', {
        fontSize: '32px',
        color: '#d86a6a',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: text, alpha: 1, duration: 1200 });

    this.add
      .text(cx, GAME_HEIGHT * 0.6, '[ENTER] タイトルへもどる', {
        fontSize: '16px',
        color: '#eef2f6',
      })
      .setOrigin(0.5);
    this.add
      .text(cx, GAME_HEIGHT * 0.6 + 30, 'セーブしていれば「つづきから」で再開できる', {
        fontSize: '12px',
        color: '#8a94a0',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start('title');
    });
  }
}
