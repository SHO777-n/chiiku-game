import Phaser from 'phaser';
import type { Dialogue } from '../data/dialogues';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

/**
 * 画面下部の会話ウィンドウ。カメラに固定表示される。
 * ページ送りは advance()、全ページ表示後に閉じる。
 */
export class DialogueBox {
  private readonly container: Phaser.GameObjects.Container;
  private readonly speakerText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly nextIndicator: Phaser.GameObjects.Text;

  private dialogue: Dialogue | null = null;
  private pageIndex = 0;
  private onClose: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    const boxHeight = 110;
    const margin = 12;
    const y = GAME_HEIGHT - boxHeight - margin;

    const bg = scene.add
      .rectangle(0, 0, GAME_WIDTH - margin * 2, boxHeight, 0x0b0f14, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x8fb3d9);

    this.speakerText = scene.add.text(14, 10, '', {
      fontSize: '13px',
      color: '#ffe9a8',
      fontStyle: 'bold',
    });

    this.bodyText = scene.add.text(14, 32, '', {
      fontSize: '14px',
      color: '#eef2f6',
      lineSpacing: 6,
      wordWrap: { width: GAME_WIDTH - margin * 2 - 28 },
    });

    this.nextIndicator = scene.add
      .text(GAME_WIDTH - margin * 2 - 18, boxHeight - 20, '▼', {
        fontSize: '12px',
        color: '#8fb3d9',
      })
      .setOrigin(0.5);

    this.container = scene.add
      .container(margin, y, [bg, this.speakerText, this.bodyText, this.nextIndicator])
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);
  }

  get isOpen(): boolean {
    return this.container.visible;
  }

  open(dialogue: Dialogue, onClose?: () => void): void {
    this.dialogue = dialogue;
    this.pageIndex = 0;
    this.onClose = onClose ?? null;
    this.container.setVisible(true);
    this.renderPage();
  }

  /** ページ送り。最終ページの後は閉じる。 */
  advance(): void {
    if (!this.dialogue) return;
    if (this.pageIndex < this.dialogue.pages.length - 1) {
      this.pageIndex += 1;
      this.renderPage();
    } else {
      this.close();
    }
  }

  private close(): void {
    this.container.setVisible(false);
    this.dialogue = null;
    const cb = this.onClose;
    this.onClose = null;
    cb?.();
  }

  private renderPage(): void {
    if (!this.dialogue) return;
    this.speakerText.setText(this.dialogue.speaker);
    this.bodyText.setText(this.dialogue.pages[this.pageIndex]);
    const isLast = this.pageIndex >= this.dialogue.pages.length - 1;
    this.nextIndicator.setText(isLast ? '✕' : '▼');
  }
}
