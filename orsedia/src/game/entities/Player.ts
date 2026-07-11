import Phaser from 'phaser';
import { normalizeDirection, resolveFacing, type Facing } from '../../core/movement';
import { applyDamage, isInvulnerable } from '../../core/combat';
import { PLAYER } from '../config';

export interface MoveIntent {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

/**
 * プレイヤーエンティティ。
 * 入力の解釈(キー→Intent)はシーン側、移動・戦闘状態の管理はここが担当する。
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number = PLAYER.maxHp;
  readonly maxHp: number = PLAYER.maxHp;
  facing: Facing = 'down';

  private attackReadyAt = 0;
  private invulnerableUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(20, 24);
    this.setCollideWorldBounds(true);
    this.setDepth(10);
  }

  /** 移動入力を適用する。会話中などは intent を全 false にして呼ぶ。 */
  applyMoveIntent(intent: MoveIntent): void {
    const rawX = (intent.right ? 1 : 0) - (intent.left ? 1 : 0);
    const rawY = (intent.down ? 1 : 0) - (intent.up ? 1 : 0);
    const dir = normalizeDirection(rawX, rawY);
    this.setVelocity(dir.x * PLAYER.speed, dir.y * PLAYER.speed);
    this.facing = resolveFacing(rawX, rawY, this.facing);
  }

  stopMoving(): void {
    this.setVelocity(0, 0);
  }

  /**
   * 攻撃を試みる。クールダウン中は null、
   * 成功時は向いている方向の攻撃判定矩形を返す。
   */
  tryAttack(now: number): Phaser.Geom.Rectangle | null {
    if (now < this.attackReadyAt) return null;
    this.attackReadyAt = now + PLAYER.attackCooldownMs;

    const range = PLAYER.attackRange;
    const size = 28;
    let cx = this.x;
    let cy = this.y;
    switch (this.facing) {
      case 'up':
        cy -= range;
        break;
      case 'down':
        cy += range;
        break;
      case 'left':
        cx -= range;
        break;
      case 'right':
        cx += range;
        break;
    }
    return new Phaser.Geom.Rectangle(cx - size / 2, cy - size / 2, size, size);
  }

  /** ダメージを受ける。無敵時間中は false を返す。 */
  takeDamage(amount: number, now: number): boolean {
    if (isInvulnerable(now, this.invulnerableUntil)) return false;
    this.hp = applyDamage(this.hp, amount);
    this.invulnerableUntil = now + PLAYER.invulnerableMs;

    // 被弾点滅
    this.scene.tweens.add({
      targets: this,
      alpha: 0.25,
      duration: 100,
      yoyo: true,
      repeat: Math.floor(PLAYER.invulnerableMs / 200) - 1,
      onComplete: () => this.setAlpha(1),
    });
    return true;
  }

  restoreState(x: number, y: number, hp: number): void {
    this.setPosition(x, y);
    this.hp = hp;
  }
}
