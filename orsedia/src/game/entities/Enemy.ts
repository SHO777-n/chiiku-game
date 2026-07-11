import Phaser from 'phaser';
import { nextEnemyState, type EnemyAiState } from '../../core/enemyAi';
import { applyDamage, calculateDamage, isDead } from '../../core/combat';
import type { Element } from '../../core/effects';
import type { EnemyDefinition } from '../data/enemies';

export interface EnemyHitResult {
  died: boolean;
  damage: number;
}

/** 敵。AI判断は core/enemyAi、ボスは追加で弾幕を撃つ。 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  readonly spawnId: string;
  readonly def: EnemyDefinition;

  private hp: number;
  private aiState: EnemyAiState = 'patrol';
  private readonly home: Phaser.Math.Vector2;
  private readonly patrolTarget: Phaser.Math.Vector2;
  private patrolDestination: Phaser.Math.Vector2;
  private nextVolleyAt = 0;
  private readonly hpBar: Phaser.GameObjects.Rectangle | null = null;
  private readonly hpBarBg: Phaser.GameObjects.Rectangle | null = null;

  /** ボスが弾を撃ちたい時に呼ぶ(シーンが設定) */
  onVolley: ((enemy: Enemy) => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    spawnId: string,
    def: EnemyDefinition,
    x: number,
    y: number,
    patrolToX: number,
    patrolToY: number,
  ) {
    super(scene, x, y, `${def.texture}-0`);
    this.spawnId = spawnId;
    this.def = def;
    this.hp = def.maxHp;
    this.home = new Phaser.Math.Vector2(x, y);
    this.patrolTarget = new Phaser.Math.Vector2(patrolToX, patrolToY);
    this.patrolDestination = this.patrolTarget;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (def.scale) this.setScale(def.scale);
    this.setSize(this.width * 0.7, this.height * 0.7);
    this.anims.play(`${def.texture}-anim`);
    this.setDepth(y);

    if (def.isBoss) {
      this.hpBarBg = scene.add
        .rectangle(x, y - this.displayHeight / 2 - 10, 60, 6, 0x0b0f16, 0.8)
        .setDepth(90);
      this.hpBar = scene.add
        .rectangle(x - 29, y - this.displayHeight / 2 - 10, 58, 4, 0xd84a5a)
        .setOrigin(0, 0.5)
        .setDepth(91);
    }
  }

  get currentHp(): number {
    return this.hp;
  }

  updateAi(playerX: number, playerY: number, now: number): void {
    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    const distToHome = Phaser.Math.Distance.Between(this.x, this.y, this.home.x, this.home.y);

    this.aiState = nextEnemyState({ state: this.aiState, distToPlayer, distToHome }, this.def.ai);

    switch (this.aiState) {
      case 'patrol':
        this.moveToward(this.patrolDestination, this.def.patrolSpeed);
        if (
          Phaser.Math.Distance.Between(
            this.x,
            this.y,
            this.patrolDestination.x,
            this.patrolDestination.y,
          ) < 6
        ) {
          this.patrolDestination =
            this.patrolDestination === this.patrolTarget ? this.home : this.patrolTarget;
        }
        break;
      case 'chase':
        this.moveToward(new Phaser.Math.Vector2(playerX, playerY), this.def.chaseSpeed);
        if (this.def.isBoss && now >= this.nextVolleyAt) {
          this.nextVolleyAt = now + (this.hp < this.def.maxHp / 2 ? 1700 : 2600);
          this.onVolley?.(this);
        }
        break;
      case 'return':
        this.moveToward(this.home, this.def.patrolSpeed * 1.5);
        break;
    }

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) this.setFlipX(body.velocity.x < -1);
    this.setDepth(this.y);
    if (this.hpBar && this.hpBarBg) {
      this.hpBarBg.setPosition(this.x, this.y - this.displayHeight / 2 - 10);
      this.hpBar.setPosition(this.x - 29, this.y - this.displayHeight / 2 - 10);
      this.hpBar.width = 58 * (this.hp / this.def.maxHp);
    }
  }

  private moveToward(target: Phaser.Math.Vector2, speed: number): void {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) {
      this.setVelocity(0, 0);
      return;
    }
    this.setVelocity((dx / dist) * speed, (dy / dist) * speed);
  }

  /** 攻撃を受ける。 */
  hit(base: number, attack: number, multiplier: number, element: Element): EnemyHitResult {
    const damage = calculateDamage({
      base,
      attack,
      multiplier,
      element,
      targetProfile: this.def.profile,
      targetDefense: this.def.defense,
    });
    this.hp = applyDamage(this.hp, damage);

    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });

    return { died: isDead(this.hp), damage };
  }

  destroy(fromScene?: boolean): void {
    this.hpBar?.destroy();
    this.hpBarBg?.destroy();
    super.destroy(fromScene);
  }
}
