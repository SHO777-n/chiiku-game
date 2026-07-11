# 残響のオルセディア(Echoes of Orsedia)

土地に残された「記憶の残響」を聴く見習い聴律師リオの、2Dトップダウン・アクションRPG。
**Phase 1(最小プレイアブル版)完了** — タイトル・移動・会話・戦闘・ゲームオーバー・
セーブ/ロードまで一巡プレイできます。次は Phase 2(30分の Vertical Slice)。

- 企画書: [docs/GDD.md](docs/GDD.md)
- 技術設計: [docs/TDD.md](docs/TDD.md)
- 世界観: [docs/WORLD.md](docs/WORLD.md) / ストーリー: [docs/STORY.md](docs/STORY.md)
- システム: [docs/SYSTEMS.md](docs/SYSTEMS.md) / ロードマップ: [docs/ROADMAP.md](docs/ROADMAP.md)
- タスク: [TASKS.md](TASKS.md)

## 必要環境

- Node.js 20 以上 / npm

## 起動方法

```bash
cd orsedia
npm install
npm run dev
```

表示されたURL(通常 http://localhost:5173)をブラウザで開く。

## 操作方法

| 操作 | キー |
|---|---|
| 移動 | WASD / 矢印キー |
| 攻撃 | Space / J |
| 会話・決定 | E / Enter |
| セーブ | K(フィールド上) |

## テスト・品質チェック

```bash
npm run test    # Vitest 単体テスト
npm run lint    # ESLint
npm run build   # 型チェック + 本番ビルド
```

## プロジェクト構成

- `src/core/` — Phaser非依存の純粋ロジック(テスト対象)
- `src/game/` — Phaser本体(scenes / entities / systems / data)
- `src/game/data/` — マップ・敵・会話などのゲームデータ(ロジック禁止)
- `src/ui/` — React製HUD等(PhaserとはEventBusでのみ通信)

## 既知の問題

- [TASKS.md「Phase 1 の既知の問題」](TASKS.md)を参照
  (バンドルサイズ約1.6MB、攻撃判定の当てにくさ、敵リポップなし、BGM/SE未実装)
