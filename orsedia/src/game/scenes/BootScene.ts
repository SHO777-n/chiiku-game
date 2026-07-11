import Phaser from 'phaser';

/**
 * 起動シーン。Phase 1 は画像アセットを使わず、
 * すべてのテクスチャをここで動的生成する(ADR-006)。
 * 差し替え時はテクスチャキーを維持したまま画像ロードに置き換える。
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    this.createTileTextures();
    this.createCharacterTextures();
    this.scene.start('title');
  }

  private createTileTextures(): void {
    const size = 32;
    const g = this.add.graphics();

    // 床(草地): ベース+ノイズ風ドット
    g.fillStyle(0x2f5e3a).fillRect(0, 0, size, size);
    g.fillStyle(0x376b43);
    for (let i = 0; i < 6; i++) {
      g.fillRect((i * 13) % size, (i * 7 + 4) % size, 3, 3);
    }
    g.generateTexture('tile-floor', size, size);
    g.clear();

    // 壁(岩): ベース+ハイライト
    g.fillStyle(0x4a4a55).fillRect(0, 0, size, size);
    g.fillStyle(0x5b5b68).fillRect(3, 3, size - 6, size - 6);
    g.fillStyle(0x3a3a44).fillRect(6, 20, 20, 8);
    g.generateTexture('tile-wall', size, size);
    g.clear();

    // 水
    g.fillStyle(0x27506e).fillRect(0, 0, size, size);
    g.fillStyle(0x33648a);
    for (let i = 0; i < 4; i++) {
      g.fillRect(4 + i * 7, (i * 11 + 6) % size, 5, 2);
    }
    g.generateTexture('tile-water', size, size);
    g.destroy();
  }

  private createCharacterTextures(): void {
    const g = this.add.graphics();

    // プレイヤー(青の旅装)
    g.fillStyle(0x3d7dd8).fillRect(2, 6, 20, 18); // 体
    g.fillStyle(0xf0c8a0).fillRect(6, 0, 12, 10); // 顔
    g.fillStyle(0x2a5aa0).fillRect(2, 20, 20, 8); // 脚
    g.generateTexture('player', 24, 28);
    g.clear();

    // NPC(暖色の服)
    g.fillStyle(0xd8863d).fillRect(2, 6, 20, 18);
    g.fillStyle(0xf0c8a0).fillRect(6, 0, 12, 10);
    g.fillStyle(0xa05e2a).fillRect(2, 20, 20, 8);
    g.generateTexture('npc', 24, 28);
    g.clear();

    // 敵: 残響のかけら(紫の震えるかたまり)
    g.fillStyle(0x8a4dc8).fillCircle(10, 10, 9);
    g.fillStyle(0xb07de8).fillCircle(7, 7, 3);
    g.generateTexture('enemy', 20, 20);
    g.clear();

    // 攻撃エフェクト(白い斬撃)
    g.fillStyle(0xffffff, 0.85).fillRect(0, 0, 28, 28);
    g.generateTexture('slash', 28, 28);
    g.destroy();
  }
}
