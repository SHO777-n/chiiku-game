import Phaser from 'phaser';
import { normalizeDirection, resolveFacing, type Facing } from '../../core/movement';
import { isInvulnerable } from '../../core/combat';
import { PLAYER } from '../config';
import { gameState, getDerivedStats } from '../systems/GameState';
import type { Element } from '../../core/effects';

export interface MoveIntent {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface AttackData {
  hitbox: Phaser.Geom.Rectangle;
  element: Element;
  attack: number;
  multiplier: number;
}

/** プレイヤー。HP/MP等の状態は GameState が持ち、ここは表現と入力反映のみ。 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  facing: Facing = 'down';

  private attackReadyAt = 0;
  private invulnerableUntil = 0;
  private readonly shadow: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player', 1);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(16, 18).setOffset(4, 12);
    this.setCollideWorldBounds(true);
    this.setDepth(y);
    this.shadow = scene.add.image(x, y + 14, 'fx-shadow').setDepth(1);
  }

  applyMoveIntent(intent: MoveIntent, stunned: boolean): void {
    if (stunned) {
      this.setVelocity(0, 0);
      this.playIdle();
      return;
    }
    const rawX = (intent.right ? 1 : 0) - (intent.left ? 1 : 0);
    const rawY = (intent.down ? 1 : 0) - (intent.up ? 1 : 0);
    const dir = normalizeDirection(rawX, rawY);
    this.setVelocity(dir.x * PLAYER.speed, dir.y * PLAYER.speed);
    this.facing = resolveFacing(rawX, rawY, this.facing);

    if (rawX !== 0 || rawY !== 0) {
      this.playWalk();
    } else {
      this.playIdle();
    }
    this.setDepth(this.y);
    this.shadow.setPosition(this.x, this.y + 14);
  }

  private animDir(): string {
    if (this.facing === 'left' || this.facing === 'right') {
      this.setFlipX(this.facing === 'right');
      return 'side';
    }
    this.setFlipX(false);
    return this.facing;
  }

  private playWalk(): void {
    this.anims.play(`player-walk-${this.animDir()}`, true);
  }

  private playIdle(): void {
    this.anims.play(`player-idle-${this.animDir()}`, true);
  }

  stopMoving(): void {
    this.setVelocity(0, 0);
    this.playIdle();
  }

  /** 通常攻撃。クールダウン中は null。 */
  tryAttack(now: number): AttackData | null {
    if (now < this.attackReadyAt) return null;
    this.attackReadyAt = now + PLAYER.attackCooldownMs;

    const derived = getDerivedStats(gameState.s);
    const range = PLAYER.attackRange;
    const size = 34;
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
    return {
      hitbox: new Phaser.Geom.Rectangle(cx - size / 2, cy - size / 2, size, size),
      element: derived.weaponElement,
      attack: derived.attack,
      multiplier: 1,
    };
  }

  /** ダメージを受ける。無敵中は null、死亡時 true。 */
  takeDamage(amount: number, now: number): boolean | null {
    if (isInvulnerable(now, this.invulnerableUntil)) return null;
    this.invulnerableUntil = now + PLAYER.invulnerableMs;
    const died = gameState.damagePlayer(amount);

    this.scene.tweens.add({
      targets: this,
      alpha: 0.25,
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => this.setAlpha(1),
    });
    return died;
  }

  destroy(fromScene?: boolean): void {
    this.shadow.destroy();
    super.destroy(fromScene);
  }
}
