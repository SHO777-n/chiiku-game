import Phaser from 'phaser';
import { nextEnemyState, type EnemyAiState } from '../../core/enemyAi';
import { applyDamage, isDead } from '../../core/combat';
import type { EnemyDefinition } from '../data/enemies';

/**
 * 敵エンティティ。AIの「判断」は core/enemyAi の純関数に委譲し、
 * ここでは距離計算と実際の移動だけを行う。
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  readonly spawnId: string;
  readonly def: EnemyDefinition;

  private hp: number;
  private aiState: EnemyAiState = 'patrol';
  private readonly home: Phaser.Math.Vector2;
  private readonly patrolTarget: Phaser.Math.Vector2;
  /** 現在向かっている巡回先(home か patrolTarget) */
  private patrolDestination: Phaser.Math.Vector2;

  constructor(
    scene: Phaser.Scene,
    spawnId: string,
    def: EnemyDefinition,
    x: number,
    y: number,
    patrolToX: number,
    patrolToY: number,
  ) {
    super(scene, x, y, 'enemy');
    this.spawnId = spawnId;
    this.def = def;
    this.hp = def.maxHp;
    this.home = new Phaser.Math.Vector2(x, y);
    this.patrolTarget = new Phaser.Math.Vector2(patrolToX, patrolToY);
    this.patrolDestination = this.patrolTarget;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(18, 18);
    this.setDepth(5);
  }

  /** 毎フレームの更新。プレイヤー位置を受け取り、状態遷移と移動を行う。 */
  updateAi(playerX: number, playerY: number): void {
    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    const distToHome = Phaser.Math.Distance.Between(this.x, this.y, this.home.x, this.home.y);

    this.aiState = nextEnemyState(
      { state: this.aiState, distToPlayer, distToHome },
      this.def.ai,
    );

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
        break;
      case 'return':
        this.moveToward(this.home, this.def.patrolSpeed * 1.5);
        break;
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

  /** ダメージを与える。死亡した場合 true を返す(破棄は呼び出し側)。 */
  takeDamage(amount: number): boolean {
    this.hp = applyDamage(this.hp, amount);

    // 被弾フラッシュ
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });

    return isDead(this.hp);
  }
}
