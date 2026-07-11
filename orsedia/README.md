# 残響のオルセディア(Echoes of Orsedia)

土地に残された「記憶の残響」を聴く見習い聴律師リオの、2Dトップダウン・アクションRPG。
現在は **Phase 1(最小プレイアブル版)** を開発中です。

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
| セーブ | S(フィールド上) |

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

- Phase 1 実装中(docs/CHANGELOG.md を参照)
