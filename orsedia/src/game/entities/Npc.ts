import Phaser from 'phaser';
import type { NpcDefinition } from '../data/npcs';

/** 会話可能なNPC。Phase 1 では定位置に立っているだけ。 */
export class Npc extends Phaser.Physics.Arcade.Sprite {
  readonly def: NpcDefinition;
  private readonly nameLabel: Phaser.GameObjects.Text;
  private readonly talkHint: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, def: NpcDefinition, x: number, y: number) {
    super(scene, x, y, 'npc');
    this.def = def;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // 動かない

    this.nameLabel = scene.add
      .text(x, y - 24, def.name, { fontSize: '11px', color: '#ffe9a8' })
      .setOrigin(0.5, 1)
      .setDepth(20);

    this.talkHint = scene.add
      .text(x, y + 18, '[E] はなす', { fontSize: '10px', color: '#ffffff' })
      .setOrigin(0.5, 0)
      .setDepth(20)
      .setVisible(false);
  }

  /** プレイヤーが会話可能な距離にいるか。ヒント表示も切り替える。 */
  checkInRange(playerX: number, playerY: number, range = 48): boolean {
    const inRange = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY) <= range;
    this.talkHint.setVisible(inRange);
    return inRange;
  }

  destroy(fromScene?: boolean): void {
    this.nameLabel.destroy();
    this.talkHint.destroy();
    super.destroy(fromScene);
  }
}
