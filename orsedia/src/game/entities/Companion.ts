import Phaser from 'phaser';
import type { Enemy } from './Enemy';

/**
 * 仲間(ミレ)。プレイヤーを追従し、近くの敵へ自動で共鳴弾を放つ。
 * 敵からダメージは受けない(Phase 3 仕様: サポート役)。
 */
export class Companion extends Phaser.Physics.Arcade.Sprite {
  private nextShotAt = 0;
  private readonly nameLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'npc-mire', 1);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(y);
    this.nameLabel = scene.add
      .text(x, y - 26, 'ミレ', {
        fontSize: '10px',
        color: '#a8d8ff',
        stroke: '#10121a',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setDepth(95);
  }

  follow(playerX: number, playerY: number): void {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    if (dist > 44) {
      const speed = dist > 120 ? 190 : 140;
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      this.setVelocity((dx / dist) * speed, (dy / dist) * speed);
      const dir = Math.abs(dx) > Math.abs(dy) ? 'side' : dy < 0 ? 'up' : 'down';
      this.setFlipX(dir === 'side' && dx > 0);
      this.anims.play(`npc-mire-walk-${dir}`, true);
    } else {
      this.setVelocity(0, 0);
      this.anims.play('npc-mire-idle-down', true);
    }
    this.setDepth(this.y);
    this.nameLabel.setPosition(this.x, this.y - 26);
  }

  /** 射程内の敵に共鳴弾を撃つ。命中処理はシーン側が行う。 */
  tryShoot(now: number, enemies: Enemy[], onShoot: (target: Enemy) => void): void {
    if (now < this.nextShotAt) return;
    const target = enemies
      .filter((e) => e.active)
      .find((e) => Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y) < 170);
    if (!target) return;
    this.nextShotAt = now + 1400;
    onShoot(target);
  }

  destroy(fromScene?: boolean): void {
    this.nameLabel.destroy();
    super.destroy(fromScene);
  }
}
