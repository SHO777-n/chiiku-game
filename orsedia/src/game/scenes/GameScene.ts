import Phaser from 'phaser';
import { halvenaOutskirts, isBlockingTile, TILE_WALL } from '../data/maps';
import { halvenaNpcs } from '../data/npcs';
import { enemyDefinitions, halvenaEnemySpawns } from '../data/enemies';
import { dialogues } from '../data/dialogues';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Npc } from '../entities/Npc';
import { DialogueBox } from '../systems/DialogueBox';
import { SaveManager } from '../systems/SaveManager';
import { eventBus } from '../EventBus';

interface GameSceneData {
  loadSave?: boolean;
}

/** メインのフィールドシーン。 */
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private npcs: Npc[] = [];
  private enemies!: Phaser.Physics.Arcade.Group;
  private dialogueBox!: DialogueBox;
  private defeatedEnemyIds = new Set<string>();
  private toastText!: Phaser.GameObjects.Text;

  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    attack: Phaser.Input.Keyboard.Key;
    attackAlt: Phaser.Input.Keyboard.Key;
    talk: Phaser.Input.Keyboard.Key;
    talkAlt: Phaser.Input.Keyboard.Key;
    save: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super('game');
  }

  create(data: GameSceneData): void {
    eventBus.emit('scene-changed', { scene: 'game' });
    this.npcs = [];
    this.defeatedEnemyIds = new Set();

    const map = halvenaOutskirts;
    const ts = map.tileSize;
    const worldWidth = map.tiles[0].length * ts;
    const worldHeight = map.tiles.length * ts;

    // --- マップ描画と衝突体 ---
    const walls = this.physics.add.staticGroup();
    map.tiles.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        const x = colIndex * ts + ts / 2;
        const y = rowIndex * ts + ts / 2;
        if (isBlockingTile(tile)) {
          const key = tile === TILE_WALL ? 'tile-wall' : 'tile-water';
          walls.create(x, y, key);
        } else {
          this.add.image(x, y, 'tile-floor');
        }
      });
    });

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // --- プレイヤー ---
    const save = data.loadSave ? SaveManager.load() : null;
    const spawnX = map.playerSpawn.col * ts + ts / 2;
    const spawnY = map.playerSpawn.row * ts + ts / 2;
    this.player = new Player(this, spawnX, spawnY);
    if (save) {
      this.player.restoreState(save.player.x, save.player.y, save.player.hp);
      save.defeatedEnemyIds.forEach((id) => this.defeatedEnemyIds.add(id));
    }
    this.emitHp();

    // --- NPC ---
    halvenaNpcs.forEach((def) => {
      this.npcs.push(new Npc(this, def, def.col * ts + ts / 2, def.row * ts + ts / 2));
    });

    // --- 敵 ---
    this.enemies = this.physics.add.group();
    halvenaEnemySpawns.forEach((spawn) => {
      if (this.defeatedEnemyIds.has(spawn.id)) return;
      const def = enemyDefinitions[spawn.type];
      const enemy = new Enemy(
        this,
        spawn.id,
        def,
        spawn.col * ts + ts / 2,
        spawn.row * ts + ts / 2,
        spawn.patrolTo.col * ts + ts / 2,
        spawn.patrolTo.row * ts + ts / 2,
      );
      this.enemies.add(enemy);
    });

    // --- 衝突・接触 ---
    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.enemies, walls);
    this.physics.add.overlap(this.player, this.enemies, (_player, enemyObj) => {
      const enemy = enemyObj as Enemy;
      this.onPlayerTouched(enemy);
    });

    // --- カメラ ---
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    // --- UI ---
    this.dialogueBox = new DialogueBox(this);
    this.toastText = this.add
      .text(320, 20, '', { fontSize: '13px', color: '#a8ffb8' })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);

    // --- 入力 ---
    const kb = this.input.keyboard;
    if (!kb) throw new Error('キーボード入力を初期化できませんでした');
    this.keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      attack: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      attackAlt: kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      talk: kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      talkAlt: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      save: kb.addKey(Phaser.Input.Keyboard.KeyCodes.K),
    };

    // --- 新規開始時の導入 ---
    if (!save) {
      this.dialogueBox.open(dialogues.intro);
    }
  }

  update(): void {
    const now = this.time.now;
    const talkPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.talk) ||
      Phaser.Input.Keyboard.JustDown(this.keys.talkAlt);

    // 会話中は移動・戦闘を止める
    if (this.dialogueBox.isOpen) {
      this.player.stopMoving();
      if (talkPressed) this.dialogueBox.advance();
      return;
    }

    // 移動
    this.player.applyMoveIntent({
      up: this.keys.up.isDown || this.keys.w.isDown,
      down: this.keys.down.isDown || this.keys.s.isDown,
      left: this.keys.left.isDown || this.keys.a.isDown,
      right: this.keys.right.isDown || this.keys.d.isDown,
    });

    // 会話開始
    if (talkPressed) {
      const nearNpc = this.npcs.find((npc) => npc.checkInRange(this.player.x, this.player.y));
      if (nearNpc) {
        this.player.stopMoving();
        this.dialogueBox.open(dialogues[nearNpc.def.dialogueId]);
        return;
      }
    }
    this.npcs.forEach((npc) => npc.checkInRange(this.player.x, this.player.y));

    // 攻撃
    if (
      Phaser.Input.Keyboard.JustDown(this.keys.attack) ||
      Phaser.Input.Keyboard.JustDown(this.keys.attackAlt)
    ) {
      this.performAttack(now);
    }

    // 敵AI
    this.enemies.getChildren().forEach((child) => {
      (child as Enemy).updateAi(this.player.x, this.player.y);
    });

    // セーブ
    if (Phaser.Input.Keyboard.JustDown(this.keys.save)) {
      this.saveGame();
    }
  }

  private performAttack(now: number): void {
    const hitbox = this.player.tryAttack(now);
    if (!hitbox) return;

    // 斬撃エフェクト
    const slash = this.add
      .image(hitbox.centerX, hitbox.centerY, 'slash')
      .setAlpha(0.7)
      .setDepth(30);
    this.time.delayedCall(90, () => slash.destroy());

    // 命中判定
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (!enemy.active) return;
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemy.getBounds())) {
        const died = enemy.takeDamage(3);
        if (died) {
          this.defeatedEnemyIds.add(enemy.spawnId);
          enemy.destroy();
        }
      }
    });
  }

  private onPlayerTouched(enemy: Enemy): void {
    if (!enemy.active) return;
    const applied = this.player.takeDamage(enemy.def.touchDamage, this.time.now);
    if (!applied) return;

    this.emitHp();
    this.cameras.main.shake(120, 0.004);

    if (this.player.hp <= 0) {
      this.scene.start('gameover');
    }
  }

  private saveGame(): void {
    const result = SaveManager.save(
      {
        x: this.player.x,
        y: this.player.y,
        hp: this.player.hp,
        maxHp: this.player.maxHp,
      },
      [...this.defeatedEnemyIds],
    );
    this.showToast(result ? '記録した(つづきからで再開できる)' : '保存に失敗した……');
    if (result) {
      eventBus.emit('save-done', { savedAt: result.savedAt });
    }
  }

  private showToast(message: string): void {
    this.toastText.setText(message).setVisible(true);
    this.time.delayedCall(2000, () => this.toastText.setVisible(false));
  }

  private emitHp(): void {
    eventBus.emit('hp-changed', { hp: this.player.hp, maxHp: this.player.maxHp });
  }
}
