import Phaser from 'phaser';

/**
 * 起動シーン。全テクスチャとアニメーションを動的生成する(ADR-006)。
 * キャラクターは 24x32 × 9フレーム(下/上/横 × 歩行3コマ)のシートを
 * Canvas に描画して登録する。横向きは左向きで描き、右は flipX で表現する。
 */

interface CharPalette {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  accent?: string;
  hairStyle: 'short' | 'long' | 'hood' | 'bald' | 'cap';
  beard?: string;
}

const OUTLINE = '#10121a';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    this.createTileTextures();
    this.createDecorTextures();
    this.createCharacters();
    this.createEnemies();
    this.createEffectTextures();
    this.createAnimations();
    this.scene.start('title');
  }

  // ---------- タイル ----------

  private createTileTextures(): void {
    const g = this.add.graphics();
    const size = 32;

    // 草地3種
    const grassBases = [0x3a6b45, 0x386843, 0x3c6e47];
    grassBases.forEach((base, i) => {
      g.clear();
      g.fillStyle(base).fillRect(0, 0, size, size);
      g.fillStyle(0x447a50);
      for (let k = 0; k < 10; k++) {
        const x = (k * 7 + i * 5) % 30;
        const y = (k * 11 + i * 3) % 30;
        g.fillRect(x, y, 2, 3);
      }
      g.fillStyle(0x315c3b);
      for (let k = 0; k < 6; k++) {
        g.fillRect((k * 13 + i * 9) % 30, (k * 5 + 7) % 30, 2, 2);
      }
      g.generateTexture(`tile-grass-${i}`, size, size);
    });

    // 花の草地
    g.clear();
    g.fillStyle(0x3a6b45).fillRect(0, 0, size, size);
    g.fillStyle(0x447a50);
    for (let k = 0; k < 8; k++) g.fillRect((k * 9) % 30, (k * 7 + 3) % 30, 2, 3);
    [
      [6, 8, 0xffd4e5],
      [20, 6, 0xfff0a8],
      [12, 20, 0xd8c8ff],
      [24, 22, 0xffffff],
    ].forEach(([x, y, c]) => {
      g.fillStyle(c).fillRect(x, y, 3, 3);
      g.fillStyle(0xffe066).fillRect(x + 1, y + 1, 1, 1);
    });
    g.generateTexture('tile-flower', size, size);

    // 土の道
    g.clear();
    g.fillStyle(0x9a815c).fillRect(0, 0, size, size);
    g.fillStyle(0x8a7250);
    for (let k = 0; k < 8; k++) g.fillRect((k * 11) % 28, (k * 7 + 2) % 28, 3, 2);
    g.fillStyle(0xa8906a);
    for (let k = 0; k < 6; k++) g.fillRect((k * 9 + 4) % 28, (k * 13 + 6) % 28, 2, 2);
    g.generateTexture('tile-path', size, size);

    // 木の床
    g.clear();
    g.fillStyle(0x8a6a48).fillRect(0, 0, size, size);
    g.fillStyle(0x7a5c3e);
    for (let y = 0; y < 32; y += 8) g.fillRect(0, y, 32, 1);
    g.fillStyle(0x947450).fillRect(0, 3, 32, 1).fillRect(0, 19, 32, 1);
    g.generateTexture('tile-wood', size, size);

    // 石の床(ダンジョン)
    g.clear();
    g.fillStyle(0x4e5260).fillRect(0, 0, size, size);
    g.lineStyle(1, 0x3e424e);
    g.strokeRect(0, 0, 16, 16).strokeRect(16, 16, 16, 16);
    g.fillStyle(0x585c6c).fillRect(2, 2, 5, 3).fillRect(20, 18, 6, 3);
    g.fillStyle(0x3a3e48).fillRect(10, 24, 8, 2).fillRect(22, 6, 5, 2);
    g.generateTexture('tile-stone', size, size);

    // 奈落
    g.clear();
    g.fillStyle(0x07090d).fillRect(0, 0, size, size);
    g.fillStyle(0x0d1017).fillRect(4, 6, 3, 2).fillRect(20, 22, 4, 2);
    g.generateTexture('tile-void', size, size);

    // 水(4フレーム)
    for (let f = 0; f < 4; f++) {
      g.clear();
      g.fillStyle(0x2b5d86).fillRect(0, 0, size, size);
      g.fillStyle(0x336b9a);
      for (let k = 0; k < 4; k++) {
        const x = (k * 8 + f * 2) % 30;
        const y = (k * 9 + f * 3) % 30;
        g.fillRect(x, y, 6, 2);
      }
      g.fillStyle(0x74a8cc);
      g.fillRect((6 + f * 4) % 28, (10 + f) % 28, 4, 1);
      g.fillRect((18 + f * 5) % 28, (22 + f * 2) % 28, 5, 1);
      g.generateTexture(`tile-water-${f}`, size, size);
    }

    // 建物の壁(漆喰+木枠)
    g.clear();
    g.fillStyle(0xd8cbb0).fillRect(0, 0, size, size);
    g.fillStyle(0x6a4e34).fillRect(0, 0, 32, 3).fillRect(0, 29, 32, 3);
    g.fillRect(0, 0, 3, 32).fillRect(29, 0, 3, 32);
    g.fillStyle(0xc4b698).fillRect(6, 8, 8, 2).fillRect(18, 18, 9, 2);
    g.generateTexture('tile-wall', size, size);

    // 屋根(瓦)
    g.clear();
    g.fillStyle(0x9a4a3e).fillRect(0, 0, size, size);
    g.fillStyle(0x8a4036);
    for (let y = 0; y < 32; y += 8) {
      for (let x = (y / 8) % 2 === 0 ? 0 : 8; x < 32; x += 16) g.fillRect(x, y, 15, 7);
    }
    g.fillStyle(0xb05a4c);
    for (let y = 0; y < 32; y += 8) g.fillRect(0, y, 32, 1);
    g.generateTexture('tile-roof', size, size);

    // ドア
    g.clear();
    g.fillStyle(0xd8cbb0).fillRect(0, 0, size, size);
    g.fillStyle(0x5a422c).fillRect(6, 4, 20, 28);
    g.fillStyle(0x6e5236).fillRect(8, 6, 16, 24);
    g.fillStyle(0x4a3624).fillRect(15, 6, 2, 24);
    g.fillStyle(0xd8b040).fillRect(11, 18, 3, 3);
    g.generateTexture('tile-door', size, size);

    // 石壁(ダンジョン)
    g.clear();
    g.fillStyle(0x3a3e4c).fillRect(0, 0, size, size);
    g.fillStyle(0x4a4e5e).fillRect(1, 1, 14, 6).fillRect(17, 1, 14, 6);
    g.fillRect(1, 9, 9, 6).fillRect(12, 9, 12, 6).fillRect(26, 9, 5, 6);
    g.fillRect(1, 17, 14, 6).fillRect(17, 17, 14, 6);
    g.fillRect(1, 25, 9, 6).fillRect(12, 25, 19, 6);
    g.fillStyle(0x565a6c).fillRect(2, 2, 5, 2).fillRect(18, 10, 5, 2).fillRect(3, 18, 5, 2);
    g.generateTexture('tile-stonewall', size, size);

    // 封の扉(ゲート)
    g.clear();
    g.fillStyle(0x2e3240).fillRect(0, 0, size, size);
    g.fillStyle(0x3e4254).fillRect(3, 2, 26, 30);
    g.lineStyle(2, 0x86e2ff, 0.9);
    g.strokeCircle(16, 14, 7);
    g.lineBetween(16, 7, 16, 21);
    g.lineBetween(9, 14, 23, 14);
    g.fillStyle(0x86e2ff).fillRect(15, 26, 2, 4);
    g.generateTexture('tile-gate', size, size);

    g.destroy();
  }

  // ---------- 装飾オブジェクト ----------

  private createDecorTextures(): void {
    const g = this.add.graphics();

    // 木(32x48、上部が隣タイルへ張り出す)
    g.clear();
    g.fillStyle(0x5a422c).fillRect(13, 34, 6, 12);
    g.fillStyle(0x4a3624).fillRect(13, 34, 2, 12);
    g.fillStyle(0x2e5a38).fillCircle(16, 20, 14);
    g.fillStyle(0x38703f).fillCircle(11, 16, 9).fillCircle(22, 18, 9);
    g.fillStyle(0x4a8a50).fillCircle(14, 12, 7).fillCircle(20, 13, 5);
    g.fillStyle(0x5aa25c).fillRect(10, 8, 3, 2).fillRect(18, 6, 3, 2).fillRect(14, 16, 3, 2);
    g.generateTexture('decor-tree', 32, 48);

    // 岩
    g.clear();
    g.fillStyle(0x6a6e7a).fillEllipse(16, 20, 26, 18);
    g.fillStyle(0x7e828e).fillEllipse(13, 16, 16, 10);
    g.fillStyle(0x565a66).fillEllipse(20, 24, 14, 7);
    g.generateTexture('decor-rock', 32, 32);

    // 街灯
    g.clear();
    g.fillStyle(0x3a3630).fillRect(14, 8, 4, 22);
    g.fillStyle(0x4a4640).fillRect(12, 28, 8, 4);
    g.fillStyle(0x2e2a26).fillRect(10, 2, 12, 10);
    g.fillStyle(0xffdf8a).fillRect(12, 4, 8, 6);
    g.generateTexture('decor-lamp', 32, 32);

    // 鉱石の露頭
    g.clear();
    g.fillStyle(0x565a66).fillEllipse(16, 22, 24, 14);
    g.fillStyle(0x7ee2e6).fillTriangle(10, 18, 14, 6, 18, 18);
    g.fillStyle(0xa8f0f2).fillTriangle(12, 18, 14, 10, 16, 18);
    g.fillStyle(0x5ec2ce).fillTriangle(18, 20, 22, 10, 25, 20);
    g.generateTexture('decor-ore', 32, 32);

    // 薬草
    g.clear();
    g.fillStyle(0x3a8a48).fillRect(15, 16, 2, 12);
    g.fillStyle(0x4aa858);
    g.fillEllipse(10, 16, 9, 5).fillEllipse(22, 14, 9, 5).fillEllipse(16, 9, 6, 7);
    g.fillStyle(0x76d284).fillEllipse(16, 8, 3, 4);
    g.generateTexture('decor-herb', 32, 32);

    // 残響ポイント(渦の紋様石)
    g.clear();
    g.fillStyle(0x4e5260).fillEllipse(16, 24, 22, 10);
    g.lineStyle(2, 0x9ae6ff, 0.95);
    g.strokeCircle(16, 16, 9);
    g.strokeCircle(16, 16, 4);
    g.lineBetween(16, 4, 16, 8);
    g.generateTexture('decor-echo', 32, 32);

    // 羊
    g.clear();
    g.fillStyle(0xf2f0e8).fillEllipse(14, 11, 20, 13);
    g.fillStyle(0xffffff).fillEllipse(11, 8, 10, 7);
    g.fillStyle(0xd8d4c8).fillEllipse(22, 12, 7, 6);
    g.fillStyle(0x3a3630).fillRect(21, 9, 5, 4);
    g.fillStyle(0x3a3630).fillRect(8, 16, 2, 4).fillRect(16, 16, 2, 4);
    g.generateTexture('decor-sheep', 28, 20);

    g.destroy();
  }

  // ---------- キャラクター ----------

  private createCharacters(): void {
    const make = (key: string, pal: CharPalette) => this.makeCharSheet(key, pal);
    make('player', {
      skin: '#f0c8a0',
      hair: '#4a5a8a',
      top: '#3d7dd8',
      bottom: '#2a4a80',
      accent: '#ffe9a8',
      hairStyle: 'short',
    });
    make('npc-mire', {
      skin: '#f4d0ac',
      hair: '#c25a3e',
      top: '#e8dcc4',
      bottom: '#9a5a4a',
      accent: '#d84a5a',
      hairStyle: 'long',
    });
    make('npc-balga', {
      skin: '#e0b48c',
      hair: '#b8b4ac',
      top: '#6a5a44',
      bottom: '#4a4036',
      hairStyle: 'short',
      beard: '#b8b4ac',
    });
    make('npc-gand', {
      skin: '#e0aa80',
      hair: '#c26a2e',
      top: '#5a5e6a',
      bottom: '#3e424e',
      accent: '#8a5a2e',
      hairStyle: 'bald',
      beard: '#c26a2e',
    });
    make('npc-tomma', {
      skin: '#d8a878',
      hair: '#3e5a3a',
      top: '#4a7a48',
      bottom: '#3a5a3a',
      hairStyle: 'hood',
    });
    make('npc-veil', {
      skin: '#f4d8bc',
      hair: '#e8e8f0',
      top: '#e8e8f0',
      bottom: '#7a90c0',
      accent: '#7a90c0',
      hairStyle: 'hood',
    });
    make('npc-lena', {
      skin: '#e4c0a0',
      hair: '#c8c4bc',
      top: '#8a6a9a',
      bottom: '#5a4a66',
      hairStyle: 'long',
    });
    make('npc-archivist', {
      skin: '#ecc8a4',
      hair: '#5a4a3a',
      top: '#7a6a9a',
      bottom: '#4a4058',
      hairStyle: 'cap',
    });
    make('npc-sera', {
      skin: '#f4d0ac',
      hair: '#d8b060',
      top: '#7ab890',
      bottom: '#4a7a5c',
      hairStyle: 'long',
    });
    make('npc-dolk', {
      skin: '#e0b48c',
      hair: '#6a5a44',
      top: '#8a8e9a',
      bottom: '#5a5e6a',
      accent: '#c23e3e',
      hairStyle: 'cap',
    });
    make('npc-marle', {
      skin: '#f0c8a0',
      hair: '#8a4a2e',
      top: '#d8904a',
      bottom: '#8a5a3a',
      hairStyle: 'long',
    });
    make('npc-merchant', {
      skin: '#e8c098',
      hair: '#3a3630',
      top: '#c2a23e',
      bottom: '#6a5a2e',
      hairStyle: 'short',
    });
  }

  private makeCharSheet(key: string, pal: CharPalette): void {
    const fw = 24;
    const fh = 32;
    const canvas = this.textures.createCanvas(key, fw * 3, fh * 3);
    if (!canvas) return;
    const ctx = canvas.getContext();
    const dirs: ('down' | 'up' | 'side')[] = ['down', 'up', 'side'];
    dirs.forEach((dir, row) => {
      for (let frame = 0; frame < 3; frame++) {
        this.drawChar(ctx, frame * fw, row * fh, dir, frame, pal);
      }
    });
    canvas.refresh();
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        canvas.add(row * 3 + col, 0, col * fw, row * fh, fw, fh);
      }
    }
  }

  private drawChar(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    dir: 'down' | 'up' | 'side',
    frame: number,
    pal: CharPalette,
  ): void {
    const p = (x: number, y: number, w: number, h: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(ox + x, oy + y, w, h);
    };
    // 歩行: frame 0/2 で脚を振る
    const legSwing = frame === 0 ? -2 : frame === 2 ? 2 : 0;
    const bob = frame === 1 ? 0 : 1;

    // 脚
    p(7, 22 + bob, 4, 8 - bob, OUTLINE);
    p(13, 22 + bob, 4, 8 - bob, OUTLINE);
    p(8, 23 + bob + Math.max(0, -legSwing), 2, 6 - bob, pal.bottom);
    p(14, 23 + bob + Math.max(0, legSwing), 2, 6 - bob, pal.bottom);

    // 胴
    p(5, 11 + bob, 14, 12, OUTLINE);
    p(6, 12 + bob, 12, 10, pal.top);
    p(6, 19 + bob, 12, 3, this.shade(pal.top));
    if (pal.accent) p(6, 14 + bob, 12, 2, pal.accent);

    // 腕
    const armSwing = dir === 'side' ? legSwing : 0;
    p(3, 13 + bob + armSwing, 3, 8, OUTLINE);
    p(18, 13 + bob - armSwing, 3, 8, OUTLINE);
    p(4, 14 + bob + armSwing, 1, 6, pal.top);
    p(19, 14 + bob - armSwing, 1, 6, pal.top);

    // 頭
    p(5, 1 + bob, 14, 12, OUTLINE);
    p(6, 2 + bob, 12, 10, pal.skin);

    // 髪
    ctx.fillStyle = pal.hair;
    if (pal.hairStyle === 'hood') {
      p(5, 1 + bob, 14, 5, pal.hair);
      p(5, 5 + bob, 2, 6, pal.hair);
      p(17, 5 + bob, 2, 6, pal.hair);
    } else if (pal.hairStyle === 'long') {
      p(5, 1 + bob, 14, 4, pal.hair);
      p(4, 4 + bob, 3, 12, pal.hair);
      p(17, 4 + bob, 3, 12, pal.hair);
    } else if (pal.hairStyle === 'short') {
      p(5, 1 + bob, 14, 4, pal.hair);
      p(5, 4 + bob, 2, 3, pal.hair);
      p(17, 4 + bob, 2, 3, pal.hair);
    } else if (pal.hairStyle === 'cap') {
      p(5, 1 + bob, 14, 4, pal.hair);
      p(4, 4 + bob, 16, 2, pal.hair);
    }
    if (dir === 'up' && pal.hairStyle !== 'bald') {
      p(6, 2 + bob, 12, 9, pal.hair);
    }
    if (pal.beard && dir !== 'up') {
      p(7, 9 + bob, 10, 4, pal.beard);
    }

    // 顔
    if (dir === 'down') {
      p(8, 6 + bob, 2, 2, '#2a2e3a');
      p(14, 6 + bob, 2, 2, '#2a2e3a');
    } else if (dir === 'side') {
      p(8, 6 + bob, 2, 2, '#2a2e3a');
    }
  }

  private shade(hex: string): string {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n >> 16) - 40);
    const g = Math.max(0, ((n >> 8) & 0xff) - 40);
    const b = Math.max(0, (n & 0xff) - 40);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  // ---------- 敵 ----------

  private createEnemies(): void {
    const g = this.add.graphics();

    // 残響のかけら(2フレームの脈動)
    for (let f = 0; f < 2; f++) {
      g.clear();
      const r = f === 0 ? 8 : 9;
      g.fillStyle(0x6a3aa8, 0.5).fillCircle(12, 12, r + 3);
      g.fillStyle(0x8a4dc8).fillCircle(12, 12, r);
      g.fillStyle(0xb07de8).fillCircle(9, 9, 3);
      g.fillStyle(0xe0c8ff).fillRect(11, 11, 2, 2);
      g.generateTexture(`enemy-shard-${f}`, 24, 24);
    }

    // 影狼
    for (let f = 0; f < 2; f++) {
      g.clear();
      const legOff = f === 0 ? 0 : 2;
      g.fillStyle(0x2a2e3a).fillRect(4 + legOff, 14, 3, 6).fillRect(12, 14, 3, 6);
      g.fillRect(18 - legOff, 14, 3, 6).fillRect(23, 14, 3, 6);
      g.fillStyle(0x3a3e50).fillEllipse(14, 10, 22, 10);
      g.fillStyle(0x4a4e64).fillEllipse(12, 8, 14, 6);
      g.fillStyle(0x3a3e50).fillRect(22, 4, 7, 7);
      g.fillStyle(0x2a2e3a).fillRect(24, 2, 3, 3);
      g.fillStyle(0xd84a5a).fillRect(26, 6, 2, 2);
      g.fillStyle(0x2a2e3a).fillRect(0, 8, 6, 3);
      g.generateTexture(`enemy-wolf-${f}`, 30, 22);
    }

    // 石の哨兵
    for (let f = 0; f < 2; f++) {
      g.clear();
      const off = f === 0 ? 0 : 1;
      g.fillStyle(0x4e5260).fillRect(4, 6 + off, 24, 20);
      g.fillStyle(0x5e6272).fillRect(6, 8 + off, 20, 10);
      g.fillStyle(0x3a3e4a).fillRect(2, 10 + off, 5, 12).fillRect(25, 10 - off, 5, 12);
      g.fillStyle(0x2e323e).fillRect(8, 26, 6, 6).fillRect(18, 26, 6, 6);
      g.fillStyle(0x86e2ff).fillRect(10, 12 + off, 4, 3).fillRect(18, 12 + off, 4, 3);
      g.lineStyle(1, 0x86e2ff, 0.6).strokeRect(12, 18 + off, 8, 5);
      g.generateTexture(`enemy-sentinel-${f}`, 32, 34);
    }

    // 聖堂の怨霊
    for (let f = 0; f < 2; f++) {
      g.clear();
      const sway = f === 0 ? 0 : 2;
      g.fillStyle(0x3a4a58, 0.85).fillEllipse(13 + sway, 10, 18, 16);
      g.fillStyle(0x3a4a58, 0.7);
      g.fillTriangle(5 + sway, 16, 21 + sway, 16, 13 + sway, 30);
      g.fillStyle(0x8ae2c8).fillRect(9 + sway, 8, 3, 4).fillRect(15 + sway, 8, 3, 4);
      g.fillStyle(0x5a8a7a, 0.6).fillCircle(13 + sway, 6, 3);
      g.generateTexture(`enemy-wraith-${f}`, 28, 32);
    }

    // ボス1: 哭きの残響(鐘の亡霊)
    for (let f = 0; f < 2; f++) {
      g.clear();
      const pulse = f === 0 ? 0 : 2;
      g.fillStyle(0x4a3a78, 0.5).fillEllipse(24, 30, 44 + pulse * 2, 40 + pulse);
      g.fillStyle(0x5a4a98, 0.85);
      g.fillTriangle(8, 44, 40, 44, 24, 8);
      g.fillStyle(0x6a5ab8).fillEllipse(24, 18, 22, 18);
      g.fillStyle(0xb8e2ff).fillRect(17, 14, 5, 6).fillRect(27, 14, 5, 6);
      g.fillStyle(0x2e2648).fillEllipse(24, 40, 18, 8);
      g.fillStyle(0xd8c46a).fillRect(21, 34, 6, 8);
      g.lineStyle(2, 0x9ae6ff, 0.7).strokeCircle(24, 26, 16 + pulse);
      g.generateTexture(`enemy-boss1-${f}`, 48, 52);
    }

    // ボス2: 黙の会の執行者
    for (let f = 0; f < 2; f++) {
      g.clear();
      const off = f === 0 ? 0 : 1;
      g.fillStyle(0x1e222c).fillRect(8, 6 + off, 24, 32);
      g.fillStyle(0x2e3240).fillRect(10, 8 + off, 20, 14);
      g.fillStyle(0x14161e).fillRect(12, 2 + off, 16, 10);
      g.fillStyle(0xd84a5a).fillRect(16, 6 + off, 3, 2).fillRect(22, 6 + off, 3, 2);
      g.fillStyle(0x3e4254).fillRect(4, 12 + off, 6, 16).fillRect(30, 12 - off, 6, 16);
      g.fillStyle(0x8a8e9a).fillRect(33, 4 - off, 3, 26);
      g.fillStyle(0xc2b46a).fillRect(14, 24 + off, 12, 3);
      g.generateTexture(`enemy-boss2-${f}`, 40, 44);
    }

    g.destroy();
  }

  // ---------- エフェクト ----------

  private createEffectTextures(): void {
    // 発光(放射グラデーション)
    const glow = this.textures.createCanvas('fx-glow', 64, 64);
    if (glow) {
      const ctx = glow.getContext();
      const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,230,160,0.9)');
      grad.addColorStop(0.4, 'rgba(255,210,120,0.35)');
      grad.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      glow.refresh();
    }

    const g = this.add.graphics();

    // 斬撃(3フレームの弧)
    for (let f = 0; f < 3; f++) {
      g.clear();
      g.lineStyle(4 - f, 0xffffff, 0.9 - f * 0.25);
      g.beginPath();
      g.arc(20, 20, 14 + f * 3, -0.9, 0.9);
      g.strokePath();
      g.lineStyle(2, 0x9ae6ff, 0.5);
      g.beginPath();
      g.arc(20, 20, 10 + f * 3, -0.7, 0.7);
      g.strokePath();
      g.generateTexture(`fx-slash-${f}`, 40, 40);
    }

    // 火花
    g.clear();
    g.fillStyle(0xffe9a8);
    g.fillRect(3, 0, 2, 8).fillRect(0, 3, 8, 2);
    g.generateTexture('fx-spark', 8, 8);

    // 影
    g.clear();
    g.fillStyle(0x000000, 0.3).fillEllipse(12, 5, 22, 9);
    g.generateTexture('fx-shadow', 24, 10);

    // 雨・雪・蛍・葉
    g.clear();
    g.fillStyle(0x9ac8e8, 0.7).fillRect(0, 0, 2, 9);
    g.generateTexture('fx-rain', 2, 9);
    g.clear();
    g.fillStyle(0xcfe8ff, 0.9).fillCircle(2, 2, 2);
    g.generateTexture('fx-snow', 5, 5);
    g.clear();
    g.fillStyle(0xd8ffb0, 1).fillCircle(2, 2, 2);
    g.generateTexture('fx-firefly', 5, 5);
    g.clear();
    g.fillStyle(0x76b264).fillEllipse(3, 2, 6, 3);
    g.generateTexture('fx-leaf', 7, 5);

    // 弾(ボス用)
    g.clear();
    g.fillStyle(0x9ae6ff, 0.4).fillCircle(6, 6, 6);
    g.fillStyle(0xd8f4ff).fillCircle(6, 6, 3);
    g.generateTexture('fx-orb', 12, 12);

    // 属性エフェクト
    g.clear();
    g.fillStyle(0xff9a4a, 0.8).fillCircle(8, 8, 7);
    g.fillStyle(0xffd84a).fillCircle(8, 10, 4);
    g.generateTexture('fx-fire', 16, 16);
    g.clear();
    g.fillStyle(0xa8e2ff, 0.8);
    g.fillTriangle(8, 0, 0, 14, 16, 14);
    g.generateTexture('fx-ice', 16, 16);
    g.clear();
    g.lineStyle(2, 0xc8a0ff, 0.9).strokeCircle(10, 10, 8);
    g.generateTexture('fx-echo-ring', 20, 20);

    g.destroy();
  }

  // ---------- アニメーション ----------

  private createAnimations(): void {
    const chars = [
      'player',
      'npc-mire',
      'npc-balga',
      'npc-gand',
      'npc-tomma',
      'npc-veil',
      'npc-lena',
      'npc-archivist',
      'npc-sera',
      'npc-dolk',
      'npc-marle',
      'npc-merchant',
    ];
    chars.forEach((key) => {
      const rows: Record<string, number> = { down: 0, up: 1, side: 2 };
      Object.entries(rows).forEach(([dir, row]) => {
        this.anims.create({
          key: `${key}-walk-${dir}`,
          frames: [
            { key, frame: row * 3 + 0 },
            { key, frame: row * 3 + 1 },
            { key, frame: row * 3 + 2 },
            { key, frame: row * 3 + 1 },
          ],
          frameRate: 8,
          repeat: -1,
        });
        this.anims.create({
          key: `${key}-idle-${dir}`,
          frames: [{ key, frame: row * 3 + 1 }],
          frameRate: 1,
        });
      });
    });

    const enemyAnim = (base: string, rate = 4) =>
      this.anims.create({
        key: `${base}-anim`,
        frames: [{ key: `${base}-0` }, { key: `${base}-1` }],
        frameRate: rate,
        repeat: -1,
      });
    enemyAnim('enemy-shard', 3);
    enemyAnim('enemy-wolf', 6);
    enemyAnim('enemy-sentinel', 2);
    enemyAnim('enemy-wraith', 3);
    enemyAnim('enemy-boss1', 2);
    enemyAnim('enemy-boss2', 4);

    this.anims.create({
      key: 'water-anim',
      frames: [0, 1, 2, 3].map((f) => ({ key: `tile-water-${f}` })),
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: 'slash-anim',
      frames: [0, 1, 2].map((f) => ({ key: `fx-slash-${f}` })),
      frameRate: 24,
    });
  }
}
