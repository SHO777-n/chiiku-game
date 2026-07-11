import Phaser from 'phaser';
import type { DialogueNode, DialogueChoice } from '../data/dialogues';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { AudioSystem } from './AudioSystem';

/**
 * 画面下部の会話ウィンドウ(選択肢対応)。
 * 選択肢は ↑↓ で選び、E/Enter で決定。選んだ choice の action を onAction で返す。
 */
export class DialogueBox {
  private readonly container: Phaser.GameObjects.Container;
  private readonly speakerText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly nextIndicator: Phaser.GameObjects.Text;
  private readonly choiceTexts: Phaser.GameObjects.Text[] = [];

  private node: DialogueNode | null = null;
  private pageIndex = 0;
  private choiceIndex = 0;
  private showingChoices = false;
  private onAction: ((action: string | undefined) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    const boxHeight = 132;
    const margin = 14;
    const y = GAME_HEIGHT - boxHeight - margin;

    const bg = scene.add
      .rectangle(0, 0, GAME_WIDTH - margin * 2, boxHeight, 0x0b0f16, 0.94)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x9db8d8);

    this.speakerText = scene.add.text(16, 10, '', {
      fontSize: '14px',
      color: '#ffe9a8',
      fontStyle: 'bold',
    });

    this.bodyText = scene.add.text(16, 34, '', {
      fontSize: '15px',
      color: '#eef2f6',
      lineSpacing: 7,
      wordWrap: { width: GAME_WIDTH - margin * 2 - 32 },
    });

    this.nextIndicator = scene.add
      .text(GAME_WIDTH - margin * 2 - 20, boxHeight - 22, '▼', {
        fontSize: '13px',
        color: '#9db8d8',
      })
      .setOrigin(0.5);

    const children: Phaser.GameObjects.GameObject[] = [
      bg,
      this.speakerText,
      this.bodyText,
      this.nextIndicator,
    ];
    for (let i = 0; i < 3; i++) {
      const t = scene.add.text(30, 40 + i * 26, '', { fontSize: '15px', color: '#eef2f6' });
      this.choiceTexts.push(t);
      children.push(t);
    }

    this.container = scene.add
      .container(margin, y, children)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);
  }

  get isOpen(): boolean {
    return this.container.visible;
  }

  open(node: DialogueNode, onAction?: (action: string | undefined) => void): void {
    this.node = node;
    this.pageIndex = 0;
    this.choiceIndex = 0;
    this.showingChoices = false;
    this.onAction = onAction ?? null;
    this.container.setVisible(true);
    this.renderPage();
  }

  /** ページ送り/決定。 */
  advance(): void {
    if (!this.node) return;
    AudioSystem.playSe('choice');
    if (this.showingChoices) {
      const choice = this.currentChoices()[this.choiceIndex];
      this.close(choice?.action);
      return;
    }
    if (this.pageIndex < this.node.pages.length - 1) {
      this.pageIndex += 1;
      this.renderPage();
    } else if (this.node.choices && this.node.choices.length > 0) {
      this.showingChoices = true;
      this.renderChoices();
    } else {
      this.close(this.node.action);
    }
  }

  moveChoice(delta: number): void {
    if (!this.showingChoices) return;
    const n = this.currentChoices().length;
    this.choiceIndex = (this.choiceIndex + delta + n) % n;
    this.renderChoices();
    AudioSystem.playSe('choice');
  }

  private currentChoices(): DialogueChoice[] {
    return this.node?.choices ?? [];
  }

  private close(action: string | undefined): void {
    this.container.setVisible(false);
    this.node = null;
    const cb = this.onAction;
    this.onAction = null;
    cb?.(action);
  }

  private renderPage(): void {
    if (!this.node) return;
    this.speakerText.setText(this.node.speaker);
    this.bodyText.setText(this.node.pages[this.pageIndex]).setVisible(true);
    this.choiceTexts.forEach((t) => t.setText(''));
    const isLast = this.pageIndex >= this.node.pages.length - 1;
    this.nextIndicator.setText(isLast && !this.node.choices ? '✕' : '▼');
  }

  private renderChoices(): void {
    this.bodyText.setVisible(false);
    this.nextIndicator.setText('');
    this.currentChoices().forEach((c, i) => {
      this.choiceTexts[i]
        .setText(`${i === this.choiceIndex ? '▶ ' : '   '}${c.label}`)
        .setColor(i === this.choiceIndex ? '#ffe9a8' : '#c8d2dc');
    });
  }
}
