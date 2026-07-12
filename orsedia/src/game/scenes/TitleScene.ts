import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SaveManager } from '../systems/SaveManager';
import { AudioSystem } from '../systems/AudioSystem';
import { eventBus } from '../EventBus';

/** タイトル画面。 */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    eventBus.emit('scene-changed', { scene: 'title' });
    const cx = GAME_WIDTH / 2;

    // 背景: 夜空風グラデーション+光の粒
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0d16, 0x0a0d16, 0x1a2438, 0x141c2e);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.add.particles(0, 0, 'fx-firefly', {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: 0, max: GAME_HEIGHT },
      lifespan: 4000,
      alpha: { start: 0.8, end: 0 },
      speedY: { min: -12, max: -4 },
      quantity: 1,
      frequency: 300,
      blendMode: Phaser.BlendModes.ADD,
    });

    const glow = this.add
      .image(cx, GAME_HEIGHT * 0.3, 'fx-glow')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x86b2ff)
      .setScale(6)
      .setAlpha(0.4);
    this.tweens.add({ targets: glow, alpha: 0.7, duration: 2000, yoyo: true, repeat: -1 });

    this.add
      .text(cx, GAME_HEIGHT * 0.28, '残響のオルセディア', {
        fontSize: '42px',
        color: '#eef2f6',
        fontStyle: 'bold',
        stroke: '#0a0d16',
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.add
      .text(cx, GAME_HEIGHT * 0.28 + 40, '- Echoes of Orsedia -', {
        fontSize: '15px',
        color: '#8fb3d9',
      })
      .setOrigin(0.5);

    const hasSave = SaveManager.hasSave();
    const start = this.add
      .text(cx, GAME_HEIGHT * 0.58, '[ENTER] はじめから', { fontSize: '19px', color: '#ffe9a8' })
      .setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

    if (hasSave) {
      this.add
        .text(cx, GAME_HEIGHT * 0.58 + 36, '[C] つづきから', { fontSize: '19px', color: '#a8d8ff' })
        .setOrigin(0.5);
    }

    this.add
      .text(cx, GAME_HEIGHT * 0.9, 'WASD/矢印: 移動  SPACE: 攻撃  E: 会話  M: メニュー  K: セーブ', {
        fontSize: '12px',
        color: '#5a6a7a',
      })
      .setOrigin(0.5);

    AudioSystem.playBgm('title');

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
