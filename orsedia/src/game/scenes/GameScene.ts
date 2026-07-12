import Phaser from 'phaser';
import { maps, TILE_SIZE, type MapDef, type PortalDef } from '../data/maps';
import { parseMap, type Cell } from '../../core/map';
import { npcs } from '../data/npcs';
import { enemyDefinitions } from '../data/enemies';
import { dialogues, type DialogueNode } from '../data/dialogues';
import { shops } from '../data/items';
import { skills } from '../data/skills';
import { calculateDamage } from '../../core/combat';
import { advanceClock, darknessLevel, dayPhase } from '../../core/time';
import { questStatus } from '../../core/quests';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Npc } from '../entities/Npc';
import { Companion } from '../entities/Companion';
import { DialogueBox } from '../systems/DialogueBox';
import { SaveManager } from '../systems/SaveManager';
import { AudioSystem } from '../systems/AudioSystem';
import { gameState, evaluateConditions, getDerivedStats } from '../systems/GameState';
import { eventBus } from '../EventBus';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, GATE_FLAGS } from '../config';

interface GameSceneData {
  loadSave?: boolean;
  spawnCol?: number;
  spawnRow?: number;
}

interface Interactable {
  kind: 'ore' | 'herb' | 'echo' | 'sheep';
  sprite: Phaser.GameObjects.Image;
  col: number;
  row: number;
  meta?: number;
}

/** メインのフィールド/ダンジョンシーン。gameState.s.mapId のマップを構築する。 */
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private companion: Companion | null = null;
  private npcSprites: Npc[] = [];
  private enemies!: Phaser.Physics.Arcade.Group;
  private orbs!: Phaser.Physics.Arcade.Group;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private dialogueBox!: DialogueBox;
  private interactables: Interactable[] = [];
  private mapDef!: MapDef;
  private cells!: Cell[][];
  private nightOverlay!: Phaser.GameObjects.Rectangle;
  private lampGlows: Phaser.GameObjects.Image[] = [];
  private fireflyEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private toastText!: Phaser.GameObjects.Text;
  private toastTimer: Phaser.Time.TimerEvent | null = null;
  private bossActive = false;
  private lastSkillAt = 0;
  private notifyHandler = (p: { message: string }) => this.showToast(p.message);

  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  constructor() {
    super('game');
  }

  init(data: GameSceneData): void {
    if (data.loadSave !== undefined) {
      if (data.loadSave) {
        const save = SaveManager.load();
        if (save) gameState.fromSave(save);
        else gameState.newGame();
      } else {
        gameState.newGame();
      }
    }
  }

  create(data: GameSceneData): void {
    eventBus.emit('scene-changed', { scene: 'game' });
    eventBus.on('notify', this.notifyHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventBus.off('notify', this.notifyHandler);
    });

    this.npcSprites = [];
    this.interactables = [];
    this.lampGlows = [];
    this.companion = null;
    this.bossActive = false;

    const mapId = gameState.s.mapId;
    this.mapDef = maps[mapId];
    this.cells = parseMap(this.mapDef.rows);
    AudioSystem.playBgm(this.mapDef.music as 'village');

    this.buildMap();
    this.spawnPlayer(data);
    this.spawnNpcs(mapId);
    this.spawnEnemies(mapId);
    this.spawnCompanion();
    this.setupWeatherAndLight();
    this.setupUiObjects();
    this.setupInput();
    this.setupPhysics();

    // 新規開始の導入
    if (mapId === 'village' && gameState.s.quests.length === 0) {
      this.openDialogue(dialogues.intro);
    }
    this.cameras.main.fadeIn(400, 10, 13, 18);
  }

  // ---------- 構築 ----------

  private buildMap(): void {
    const ts = TILE_SIZE;
    this.walls = this.physics.add.staticGroup();
    const gateOpen = gameState.s.flags[GATE_FLAGS[gameState.s.mapId]] === true;

    this.cells.forEach((row, r) => {
      row.forEach((cell, c) => {
        const x = c * ts + ts / 2;
        const y = r * ts + ts / 2;
        // 地面
        switch (cell.ground) {
          case 'grass':
            this.add.image(x, y, `tile-grass-${(c * 7 + r * 13) % 3}`).setDepth(0);
            break;
          case 'flower':
            this.add.image(x, y, 'tile-flower').setDepth(0);
            break;
          case 'path':
            this.add.image(x, y, 'tile-path').setDepth(0);
            break;
          case 'wood':
            this.add.image(x, y, 'tile-wood').setDepth(0);
            break;
          case 'stone':
            this.add.image(x, y, 'tile-stone').setDepth(0);
            break;
          case 'void':
            this.add.image(x, y, 'tile-void').setDepth(0);
            break;
          case 'water': {
            const w = this.add.sprite(x, y, 'tile-water-0').setDepth(0);
            w.anims.play({ key: 'water-anim', startFrame: (c + r) % 4 });
            this.addBlocker(x, y, ts, ts);
            break;
          }
        }
        // オブジェクト
        switch (cell.object) {
          case 'tree': {
            const tree = this.add.image(x, y - 8, 'decor-tree').setDepth(y + 8);
            void tree;
            this.addBlocker(x, y, 26, 22);
            break;
          }
          case 'rock':
            this.add.image(x, y, 'decor-rock').setDepth(y);
            this.addBlocker(x, y, 26, 20);
            break;
          case 'wall':
            this.add
              .image(x, y, cell.ground === 'stone' ? 'tile-stonewall' : 'tile-wall')
              .setDepth(1);
            this.addBlocker(x, y, ts, ts);
            break;
          case 'roof':
            this.add.image(x, y, 'tile-roof').setDepth(1);
            this.addBlocker(x, y, ts, ts);
            break;
          case 'door':
            this.add.image(x, y, 'tile-door').setDepth(1);
            this.addBlocker(x, y, ts, ts);
            break;
          case 'lamp': {
            this.add.image(x, y, 'decor-lamp').setDepth(y);
            this.addBlocker(x, y, 10, 10);
            const glow = this.add
              .image(x, y - 8, 'fx-glow')
              .setBlendMode(Phaser.BlendModes.ADD)
              .setScale(1.6)
              .setDepth(60)
              .setAlpha(0);
            this.lampGlows.push(glow);
            break;
          }
          case 'gate':
            if (!gateOpen) {
              this.add.image(x, y, 'tile-gate').setDepth(1);
              this.addBlocker(x, y, ts, ts);
            }
            break;
          case 'ore':
            this.interactables.push({
              kind: 'ore',
              col: c,
              row: r,
              sprite: this.add.image(x, y, 'decor-ore').setDepth(y),
            });
            break;
          case 'herb':
            this.interactables.push({
              kind: 'herb',
              col: c,
              row: r,
              sprite: this.add.image(x, y, 'decor-herb').setDepth(y),
            });
            break;
          case 'echo': {
            const sprite = this.add.image(x, y, 'decor-echo').setDepth(y);
            this.tweens.add({
              targets: sprite,
              alpha: 0.6,
              duration: 900,
              yoyo: true,
              repeat: -1,
            });
            const glow = this.add
              .image(x, y, 'fx-glow')
              .setBlendMode(Phaser.BlendModes.ADD)
              .setTint(0x86e2ff)
              .setScale(1.2)
              .setDepth(60)
              .setAlpha(0.5);
            this.lampGlows.push(glow);
            this.interactables.push({ kind: 'echo', col: c, row: r, sprite });
            break;
          }
        }
      });
    });

    // 羊(sq1)
    if (this.mapDef.sheepSpots && questStatus(gameState.s.quests, 'sq1') === 'active') {
      this.mapDef.sheepSpots.forEach((spot, i) => {
        if (gameState.s.flags[`sheep${i}`]) return;
        const x = spot.col * TILE_SIZE + TILE_SIZE / 2;
        const y = spot.row * TILE_SIZE + TILE_SIZE / 2;
        this.interactables.push({
          kind: 'sheep',
          col: spot.col,
          row: spot.row,
          meta: i,
          sprite: this.add.image(x, y, 'decor-sheep').setDepth(y),
        });
      });
    }

    const worldWidth = this.cells[0].length * ts;
    const worldHeight = this.cells.length * ts;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
  }

  private addBlocker(x: number, y: number, w: number, h: number): void {
    const zone = this.add.zone(x, y, w, h);
    this.physics.add.existing(zone, true);
    this.walls.add(zone);
  }

  private spawnPlayer(data: GameSceneData): void {
    const save = data.loadSave ? SaveManager.load() : null;
    let x: number;
    let y: number;
    if (data.spawnCol !== undefined && data.spawnRow !== undefined) {
      x = data.spawnCol * TILE_SIZE + TILE_SIZE / 2;
      y = data.spawnRow * TILE_SIZE + TILE_SIZE / 2;
    } else if (data.loadSave && save) {
      x = save.player.x;
      y = save.player.y;
    } else {
      x = this.mapDef.playerSpawn.col * TILE_SIZE + TILE_SIZE / 2;
      y = this.mapDef.playerSpawn.row * TILE_SIZE + TILE_SIZE / 2;
    }
    this.player = new Player(this, x, y);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
  }

  private spawnNpcs(mapId: string): void {
    npcs
      .filter((n) => n.mapId === mapId)
      .filter((n) => !(n.hiddenWhen && evaluateConditions(n.hiddenWhen, gameState.s)))
      .forEach((def) => {
        const x = def.col * TILE_SIZE + TILE_SIZE / 2;
        const y = def.row * TILE_SIZE + TILE_SIZE / 2;
        this.npcSprites.push(new Npc(this, def, x, y));
      });
  }

  private spawnEnemies(mapId: string): void {
    this.enemies = this.physics.add.group();
    this.orbs = this.physics.add.group();
    this.mapDef.enemySpawns.forEach((spawn) => {
      const def = enemyDefinitions[spawn.type];
      if (!def) return;
      if (def.isBoss) {
        if (gameState.s.defeatedEnemyIds.includes(spawn.id)) return;
        const questId = mapId === 'tower' ? 'mq3' : 'mq5';
        if (questStatus(gameState.s.quests, questId) !== 'active') return;
      }
      const enemy = new Enemy(
        this,
        spawn.id,
        def,
        spawn.col * TILE_SIZE + TILE_SIZE / 2,
        spawn.row * TILE_SIZE + TILE_SIZE / 2,
        spawn.patrolTo.col * TILE_SIZE + TILE_SIZE / 2,
        spawn.patrolTo.row * TILE_SIZE + TILE_SIZE / 2,
      );
      enemy.onVolley = (e) => this.bossVolley(e);
      this.enemies.add(enemy);
    });
  }

  private spawnCompanion(): void {
    if (gameState.s.flags.companion !== true) return;
    this.companion = new Companion(this, this.player.x - 30, this.player.y + 10);
    if (gameState.s.flags.companionGreeted !== true) {
      gameState.setFlag('companionGreeted', true);
      this.openDialogue(dialogues.companionJoin);
    }
  }

  private setupWeatherAndLight(): void {
    this.nightOverlay = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0a1030, 0)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(70);

    if (this.mapDef.outdoor) {
      // 30%の確率で雨(マップ入場ごと)
      if (Math.random() < 0.3) {
        this.add
          .particles(0, 0, 'fx-rain', {
            x: { min: 0, max: GAME_WIDTH },
            y: -10,
            lifespan: 900,
            speedY: { min: 380, max: 460 },
            speedX: { min: -40, max: -20 },
            quantity: 4,
            alpha: { start: 0.7, end: 0.3 },
          })
          .setScrollFactor(0)
          .setDepth(72);
      }
      this.fireflyEmitter = this.add
        .particles(0, 0, 'fx-firefly', {
          x: { min: 0, max: GAME_WIDTH },
          y: { min: 0, max: GAME_HEIGHT },
          lifespan: 3000,
          alpha: { start: 0.9, end: 0 },
          speed: { min: 5, max: 20 },
          quantity: 1,
          frequency: 600,
          blendMode: Phaser.BlendModes.ADD,
        })
        .setScrollFactor(0)
        .setDepth(71);
      this.fireflyEmitter.stop();
    } else {
      // 屋内は常時薄暗い
      this.nightOverlay.setFillStyle(0x06080f, 0.35);
      this.lampGlows.forEach((glow) => glow.setAlpha(0.8));
    }
  }

  private setupUiObjects(): void {
    this.dialogueBox = new DialogueBox(this);
    this.toastText = this.add
      .text(GAME_WIDTH / 2, 46, '', {
        fontSize: '14px',
        color: '#d8ffe0',
        stroke: '#10121a',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(110)
      .setVisible(false);

    // マップ名表示
    const label = this.add
      .text(GAME_WIDTH / 2, 16, this.mapDef.name, {
        fontSize: '16px',
        color: '#eef2f6',
        stroke: '#10121a',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(110);
    this.tweens.add({ targets: label, alpha: 0, delay: 2200, duration: 800 });
  }

  private setupInput(): void {
    const kb = this.input.keyboard;
    if (!kb) throw new Error('キーボード入力を初期化できませんでした');
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      up: kb.addKey(K.UP),
      down: kb.addKey(K.DOWN),
      left: kb.addKey(K.LEFT),
      right: kb.addKey(K.RIGHT),
      w: kb.addKey(K.W),
      a: kb.addKey(K.A),
      s: kb.addKey(K.S),
      d: kb.addKey(K.D),
      attack: kb.addKey(K.SPACE),
      attackAlt: kb.addKey(K.J),
      talk: kb.addKey(K.E),
      talkAlt: kb.addKey(K.ENTER),
      save: kb.addKey(K.K),
      menu: kb.addKey(K.M),
      skill1: kb.addKey(K.ONE),
      skill2: kb.addKey(K.TWO),
      skill3: kb.addKey(K.THREE),
      skill4: kb.addKey(K.FOUR),
    };
  }

  private setupPhysics(): void {
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);
    if (this.companion) this.physics.add.collider(this.companion, this.walls);
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => {
      this.onPlayerTouched(e as Enemy);
    });
    this.physics.add.overlap(this.player, this.orbs, (_p, orbObj) => {
      const orb = orbObj as Phaser.Physics.Arcade.Image;
      if (!orb.active) return;
      orb.destroy();
      this.hurtPlayer(4);
    });
  }

  // ---------- 更新 ----------

  update(_time: number, deltaMs: number): void {
    const now = this.time.now;

    // 時間・昼夜・天候
    gameState.advanceClock(advanceClock(gameState.s.clockMin, deltaMs));
    this.updateLighting();

    // 状態異常
    const tick = gameState.tick(now);
    if (tick.died) {
      this.onPlayerDeath();
      return;
    }

    const justTalk =
      Phaser.Input.Keyboard.JustDown(this.keys.talk) ||
      Phaser.Input.Keyboard.JustDown(this.keys.talkAlt);

    // 会話中
    if (this.dialogueBox.isOpen) {
      this.player.stopMoving();
      if (Phaser.Input.Keyboard.JustDown(this.keys.up) || Phaser.Input.Keyboard.JustDown(this.keys.w))
        this.dialogueBox.moveChoice(-1);
      if (
        Phaser.Input.Keyboard.JustDown(this.keys.down) ||
        Phaser.Input.Keyboard.JustDown(this.keys.s)
      )
        this.dialogueBox.moveChoice(1);
      if (justTalk) this.dialogueBox.advance();
      return;
    }

    // React UI(メニュー/ショップ)表示中は停止
    if (gameState.uiBlocking) {
      this.player.stopMoving();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.menu)) {
      gameState.openMenu();
      return;
    }

    // 移動
    this.player.applyMoveIntent(
      {
        up: this.keys.up.isDown || this.keys.w.isDown,
        down: this.keys.down.isDown || this.keys.s.isDown,
        left: this.keys.left.isDown || this.keys.a.isDown,
        right: this.keys.right.isDown || this.keys.d.isDown,
      },
      tick.stunned,
    );

    // 会話・調べる
    if (justTalk) {
      if (this.tryTalk()) return;
      this.tryInteract();
    }

    // 攻撃・スキル
    if (
      Phaser.Input.Keyboard.JustDown(this.keys.attack) ||
      Phaser.Input.Keyboard.JustDown(this.keys.attackAlt)
    ) {
      this.performAttack(now);
    }
    const hotkeys: [Phaser.Input.Keyboard.Key, number][] = [
      [this.keys.skill1, 0],
      [this.keys.skill2, 1],
      [this.keys.skill3, 2],
      [this.keys.skill4, 3],
    ];
    hotkeys.forEach(([key, idx]) => {
      if (Phaser.Input.Keyboard.JustDown(key)) this.useSkillByIndex(idx, now);
    });

    // 敵・仲間
    this.enemies.getChildren().forEach((child) => {
      (child as Enemy).updateAi(this.player.x, this.player.y, now);
    });
    if (this.companion) {
      this.companion.follow(this.player.x, this.player.y);
      this.companion.tryShoot(now, this.enemies.getChildren() as Enemy[], (target) =>
        this.companionShot(target),
      );
    }

    // NPCヒント・スケジュール
    const phase = dayPhase(gameState.s.clockMin);
    this.npcSprites.forEach((npc) => {
      npc.checkInRange(this.player.x, this.player.y);
      npc.applySchedule(phase);
    });

    // ポータル
    this.checkPortals();

    // セーブ
    if (Phaser.Input.Keyboard.JustDown(this.keys.save)) this.saveGame();

    // ボスBGM
    this.updateBossMusic();
  }

  private updateLighting(): void {
    if (!this.mapDef.outdoor) return;
    const darkness = darknessLevel(gameState.s.clockMin);
    this.nightOverlay.setFillStyle(0x0a1030, darkness * 0.55);
    this.lampGlows.forEach((glow) => glow.setAlpha(darkness * 0.9));
    if (this.fireflyEmitter) {
      if (darkness > 0.6) this.fireflyEmitter.start();
      else this.fireflyEmitter.stop();
    }
  }

  private updateBossMusic(): void {
    const boss = (this.enemies.getChildren() as Enemy[]).find((e) => e.active && e.def.isBoss);
    if (boss && !this.bossActive) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, boss.x, boss.y);
      if (dist < 300) {
        this.bossActive = true;
        AudioSystem.playBgm('boss');
      }
    }
  }

  // ---------- 会話・調べる ----------

  private tryTalk(): boolean {
    const near = this.npcSprites.find((n) => n.checkInRange(this.player.x, this.player.y));
    if (!near) return false;
    this.player.stopMoving();
    const rule = near.def.rules.find((r) => evaluateConditions(r.conditions, gameState.s));
    const id = rule?.dialogueId ?? near.def.defaultDialogue;
    this.openDialogue(dialogues[id]);
    return true;
  }

  private tryInteract(): void {
    const near = this.interactables.find(
      (it) =>
        it.sprite.active &&
        Phaser.Math.Distance.Between(this.player.x, this.player.y, it.sprite.x, it.sprite.y) < 44,
    );
    if (!near) return;
    this.player.stopMoving();
    switch (near.kind) {
      case 'ore':
        near.sprite.destroy();
        gameState.giveItem('ore', 1);
        AudioSystem.playSe('pickup');
        this.openDialogue(dialogues.oreMined);
        break;
      case 'herb':
        near.sprite.destroy();
        gameState.giveItem('herb', 1);
        AudioSystem.playSe('pickup');
        this.openDialogue(dialogues.herbPicked);
        break;
      case 'sheep': {
        near.sprite.destroy();
        gameState.setFlag(`sheep${near.meta}`, true);
        gameState.progressQuest('sq1', 'sheep', 1);
        AudioSystem.playSe('pickup');
        this.openDialogue(dialogues.sheepFound);
        break;
      }
      case 'echo': {
        const mq1 = questStatus(gameState.s.quests, 'mq1');
        const investigated = gameState.s.flags.echoInvestigated === true;
        if (mq1 === 'active' && !investigated) {
          gameState.setFlag('echoInvestigated', true);
          this.cameras.main.flash(600, 140, 210, 255);
          this.openDialogue(dialogues.echoVision);
        } else {
          this.openDialogue(dialogues.echoIdle);
        }
        break;
      }
    }
  }

  private openDialogue(node: DialogueNode): void {
    this.dialogueBox.open(node, (action) => {
      if (action) this.runActions(action);
    });
  }

  // ---------- スクリプト ----------

  private runActions(script: string): void {
    script.split(';').forEach((raw) => {
      const [cmd, ...args] = raw.trim().split(':');
      switch (cmd) {
        case 'startQuest':
          gameState.startQuest(args[0]);
          break;
        case 'progress':
          gameState.progressQuest(args[0], args[1], args[2] ? Number(args[2]) : 1);
          break;
        case 'reward':
          gameState.rewardQuest(args[0]);
          break;
        case 'setFlag':
          gameState.setFlag(args[0], args[1] === 'true' ? true : args[1]);
          break;
        case 'giveItem':
          gameState.giveItem(args[0], Number(args[1] ?? 1));
          AudioSystem.playSe('pickup');
          break;
        case 'takeItem':
          gameState.takeItem(args[0], Number(args[1] ?? 1));
          break;
        case 'openShop':
          if (shops[args[0]]) gameState.openShop(args[0]);
          break;
        case 'rest':
          if (gameState.rest(Number(args[0] ?? 10))) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(600, () => this.cameras.main.fadeIn(600, 0, 0, 0));
          } else {
            gameState.notify('お金が足りない……');
          }
          break;
        case 'notify':
          gameState.notify(args.join(':'));
          break;
        case 'ending':
          this.startEnding();
          break;
      }
    });
    // フラグ変化でゲートが開いた場合に反映するため再構築
    if (script.includes('setFlag:towerOpen') || script.includes('cryptOpen')) {
      AudioSystem.playSe('door');
    }
  }

  private startEnding(): void {
    AudioSystem.stopBgm();
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.time.delayedCall(1000, () => this.scene.start('ending'));
  }

  // ---------- 戦闘 ----------

  private performAttack(now: number): void {
    const attack = this.player.tryAttack(now);
    if (!attack) return;
    AudioSystem.playSe('attack');

    const slash = this.add
      .sprite(attack.hitbox.centerX, attack.hitbox.centerY, 'fx-slash-0')
      .setDepth(this.player.y + 20);
    slash.setRotation(
      { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[this.player.facing],
    );
    slash.play('slash-anim');
    slash.once('animationcomplete', () => slash.destroy());

    this.hitEnemiesIn(attack.hitbox, PLAYER.attackBase, attack.attack, 1, attack.element);
  }

  private useSkillByIndex(index: number, now: number): void {
    const learned = gameState.s.learnedSkills
      .map((id) => skills[id])
      .filter((s) => s && s.kind !== 'passive');
    const skill = learned[index];
    if (!skill) return;
    if (now < this.lastSkillAt + 500) return;
    if (!gameState.spendMp(skill.mpCost)) {
      gameState.notify('MPが足りない……');
      return;
    }
    this.lastSkillAt = now;

    if (skill.kind === 'heal') {
      gameState.healPlayer(skill.power);
      AudioSystem.playSe('levelup');
      const ring = this.add
        .image(this.player.x, this.player.y, 'fx-glow')
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0x8affb0)
        .setDepth(this.player.y + 21);
      this.tweens.add({
        targets: ring,
        scale: 2.2,
        alpha: 0,
        duration: 500,
        onComplete: () => ring.destroy(),
      });
      return;
    }

    AudioSystem.playSe('attack');
    const radius = skill.radius ?? 70;
    const fxKey = skill.element === 'fire' ? 'fx-fire' : skill.element === 'ice' ? 'fx-ice' : 'fx-echo-ring';
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const fx = this.add
        .image(this.player.x, this.player.y, fxKey)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(this.player.y + 22);
      this.tweens.add({
        targets: fx,
        x: this.player.x + Math.cos(angle) * radius,
        y: this.player.y + Math.sin(angle) * radius,
        alpha: 0,
        duration: 350,
        onComplete: () => fx.destroy(),
      });
    }
    const derived = getDerivedStats(gameState.s);
    const circle = new Phaser.Geom.Circle(this.player.x, this.player.y, radius);
    (this.enemies.getChildren() as Enemy[]).forEach((enemy) => {
      if (!enemy.active) return;
      if (Phaser.Geom.Circle.Contains(circle, enemy.x, enemy.y)) {
        this.applyHit(enemy, skill.power, derived.attack, 1, skill.element ?? 'physical');
      }
    });
  }

  private hitEnemiesIn(
    rect: Phaser.Geom.Rectangle,
    base: number,
    attack: number,
    multiplier: number,
    element: Parameters<Enemy['hit']>[3],
  ): void {
    (this.enemies.getChildren() as Enemy[]).forEach((enemy) => {
      if (!enemy.active) return;
      if (Phaser.Geom.Intersects.RectangleToRectangle(rect, enemy.getBounds())) {
        this.applyHit(enemy, base, attack, multiplier, element);
      }
    });
  }

  private applyHit(
    enemy: Enemy,
    base: number,
    attack: number,
    multiplier: number,
    element: Parameters<Enemy['hit']>[3],
  ): void {
    const result = enemy.hit(base, attack, multiplier, element);
    AudioSystem.playSe('hit');
    this.showDamageNumber(enemy.x, enemy.y - 14, result.damage);
    if (result.died) this.onEnemyDefeated(enemy);
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.add
      .text(x, y, String(damage), {
        fontSize: '14px',
        color: '#ffe9a8',
        stroke: '#10121a',
        strokeThickness: 3,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(120);
    this.tweens.add({
      targets: text,
      y: y - 22,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy(),
    });
  }

  private onEnemyDefeated(enemy: Enemy): void {
    const def = enemy.def;
    // 消滅エフェクト
    for (let i = 0; i < 6; i++) {
      const spark = this.add
        .image(enemy.x, enemy.y, 'fx-spark')
        .setDepth(enemy.y + 10)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: spark,
        x: enemy.x + Phaser.Math.Between(-24, 24),
        y: enemy.y + Phaser.Math.Between(-24, 24),
        alpha: 0,
        duration: 400,
        onComplete: () => spark.destroy(),
      });
    }

    gameState.addGold(def.gold);
    gameState.gainXp(def.xp);
    if (def.drop && Math.random() < def.drop.chance) {
      gameState.giveItem(def.drop.itemId, 1);
      gameState.notify(`${def.name}が何かを落とした`);
    }
    if (def.type === 'cryptWraith') gameState.progressQuest('sq5', 'wraith', 1);

    if (def.isBoss) {
      gameState.markDefeated(enemy.spawnId);
      AudioSystem.playSe('bossDown');
      AudioSystem.playBgm(this.mapDef.music as 'dungeon');
      this.bossActive = false;
      this.cameras.main.shake(400, 0.008);
      this.orbs.clear(true, true);
      if (def.type === 'wailingEcho') {
        gameState.progressQuest('mq3', 'boss', 1);
        this.time.delayedCall(700, () => this.openDialogue(dialogues.towerChoice));
      } else if (def.type === 'enforcer') {
        gameState.progressQuest('mq5', 'boss', 1);
        this.time.delayedCall(700, () => this.openDialogue(dialogues.finalChoice));
      }
    }
    enemy.destroy();
  }

  private bossVolley(boss: Enemy): void {
    const count = boss.currentHp < boss.def.maxHp / 2 ? 12 : 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const orb = this.orbs.create(boss.x, boss.y, 'fx-orb') as Phaser.Physics.Arcade.Image;
      orb.setDepth(boss.y + 30).setBlendMode(Phaser.BlendModes.ADD);
      orb.setVelocity(Math.cos(angle) * 130, Math.sin(angle) * 130);
      this.time.delayedCall(2400, () => {
        if (orb.active) orb.destroy();
      });
    }
  }

  private companionShot(target: Enemy): void {
    if (!this.companion) return;
    const orb = this.add
      .image(this.companion.x, this.companion.y - 8, 'fx-orb')
      .setTint(0xa8d8ff)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(200);
    this.tweens.add({
      targets: orb,
      x: target.x,
      y: target.y,
      duration: 220,
      onComplete: () => {
        orb.destroy();
        if (target.active) this.applyHit(target, 2, gameState.s.player.level, 1, 'echo');
      },
    });
  }

  private onPlayerTouched(enemy: Enemy): void {
    if (!enemy.active) return;
    this.hurtPlayer(
      calculateDamage({
        base: enemy.def.touchDamage,
        attack: enemy.def.attack,
        targetDefense: getDerivedStats(gameState.s).defense,
      }),
      enemy,
    );
  }

  private hurtPlayer(damage: number, enemy?: Enemy): void {
    const died = this.player.takeDamage(damage, this.time.now);
    if (died === null) return;
    AudioSystem.playSe('playerHit');
    this.cameras.main.shake(120, 0.004);

    if (enemy?.def.inflicts && Math.random() < enemy.def.inflicts.chance) {
      const applied = gameState.addStatus(
        enemy.def.inflicts.type,
        this.time.now,
        enemy.def.inflicts.durationMs,
      );
      if (applied) {
        gameState.notify(
          enemy.def.inflicts.type === 'poison' ? '毒を受けた!' : 'しびれて動けない!',
        );
      }
    }
    if (died) this.onPlayerDeath();
  }

  private onPlayerDeath(): void {
    AudioSystem.stopBgm();
    this.scene.start('gameover');
  }

  // ---------- 移動・セーブ ----------

  private checkPortals(): void {
    const col = Math.floor(this.player.x / TILE_SIZE);
    const row = Math.floor(this.player.y / TILE_SIZE);
    const portal = this.mapDef.portals.find(
      (p) => col >= p.col && col < p.col + p.width && row >= p.row && row < p.row + p.height,
    );
    if (!portal) return;
    if (portal.requiresFlag && gameState.s.flags[portal.requiresFlag] !== true) {
      // 少し押し戻してメッセージ
      this.player.setPosition(this.player.x + (portal.col === 0 ? 24 : -24), this.player.y);
      if (portal.lockedMessage) gameState.notify(portal.lockedMessage);
      return;
    }
    this.transitionTo(portal);
  }

  private transitionTo(portal: PortalDef): void {
    AudioSystem.playSe('door');
    gameState.setMap(portal.target.mapId);
    this.cameras.main.fadeOut(300, 10, 13, 18);
    this.time.delayedCall(320, () => {
      this.scene.restart({
        spawnCol: portal.target.col,
        spawnRow: portal.target.row,
      } satisfies GameSceneData);
    });
  }

  private saveGame(): void {
    const ok = SaveManager.save(gameState.toSave(this.player.x, this.player.y));
    AudioSystem.playSe('save');
    this.showToast(ok ? '記録した(つづきからで再開できる)' : '保存に失敗した……');
    if (ok) eventBus.emit('save-done', { savedAt: new Date().toISOString() });
  }

  private showToast(message: string): void {
    this.toastText.setText(message).setVisible(true);
    this.toastTimer?.remove();
    this.toastTimer = this.time.delayedCall(2200, () => this.toastText.setVisible(false));
  }
}
