import Phaser from 'phaser';
import type { NpcDefinition } from '../data/npcs';
import type { DayPhase } from '../../core/time';
import { TILE_SIZE } from '../data/maps';

/** 会話可能なNPC。昼夜で立ち位置を変える(スケジュール)。 */
export class Npc extends Phaser.Physics.Arcade.Sprite {
  readonly def: NpcDefinition;
  private readonly nameLabel: Phaser.GameObjects.Text;
  private readonly talkHint: Phaser.GameObjects.Text;
  private currentPhaseNight = false;

  constructor(scene: Phaser.Scene, def: NpcDefinition, x: number, y: number) {
    super(scene, x, y, def.texture, 1);
    this.def = def;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.anims.play(`${def.texture}-idle-down`);
    this.setDepth(y);

    this.nameLabel = scene.add
      .text(x, y - 26, def.name, {
        fontSize: '11px',
        color: '#ffe9a8',
        stroke: '#10121a',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setDepth(95);

    this.talkHint = scene.add
      .text(x, y + 20, '[E] はなす', {
        fontSize: '10px',
        color: '#ffffff',
        stroke: '#10121a',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0)
      .setDepth(95)
      .setVisible(false);
  }

  /** 昼夜で位置を切り替える */
  applySchedule(phase: DayPhase): void {
    if (!this.def.night) return;
    const night = phase === 'night';
    if (night === this.currentPhaseNight) return;
    this.currentPhaseNight = night;
    const pos = night ? this.def.night : { col: this.def.col, row: this.def.row };
    const x = pos.col * TILE_SIZE + TILE_SIZE / 2;
    const y = pos.row * TILE_SIZE + TILE_SIZE / 2;
    this.setPosition(x, y);
    (this.body as Phaser.Physics.Arcade.StaticBody | null)?.updateFromGameObject();
    this.nameLabel.setPosition(x, y - 26);
    this.talkHint.setPosition(x, y + 20);
    this.setDepth(y);
  }

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
