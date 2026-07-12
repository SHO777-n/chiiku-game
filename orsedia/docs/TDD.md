# TDD — 『残響のオルセディア』 Technical Design Document

- 版数: 0.1(Phase 0 初稿)
- 最終更新: 2026-07-11

---

## 1. 技術スタック

| 層 | 技術 | 備考 |
|---|---|---|
| 言語 | TypeScript(strict) | `any` の安易な使用禁止 |
| UIシェル | React 18 | アプリ枠・HUD・メニュー系UI |
| ゲームエンジン | Phaser 3 | シーン・物理・描画・入力 |
| ビルド | Vite | dev server / build |
| テスト | Vitest | 純粋ロジックを中心に単体テスト |
| Lint / Format | ESLint(flat config)+ Prettier | CI相当をnpm scriptsで |
| セーブ | localStorage(Phase 1〜2) | 将来: Node.js + SQLite → PostgreSQL |
| バックエンド | **Phase 2まで導入しない**(ADR-002) | 必要になった時点で Node.js を追加 |

### 技術選定に関する提案(元指示との差分)

- 指示では Backend: Node.js / DB: SQLite だが、Phase 1〜2 のセーブは
  ローカル完結で十分なため **バックエンドは導入を遅らせる**。
  理由: 面白さの検証に不要、構成が半分になり反復が速い、静的ホスティングで配布できる。
  セーブデータはバージョン付きJSONとして設計し、将来サーバー保存へ移行可能にする。
  (詳細は DECISIONS.md ADR-002)

## 2. アーキテクチャ方針

```
React (App shell / HUD / メニュー)
   ↑↓ EventBus(型付きイベント)
Phaser 3 (シーン / エンティティ / 入力 / 物理)
   ↑↓
純粋ロジック層 src/core (戦闘計算・AI状態遷移・セーブ整形 … Phaserに依存しない)
   ↑
データ層 src/game/data (マップ・敵・会話などの設定データ。ロジックを含まない)
```

原則:

1. **ゲームデータと処理ロジックを分離する** — 数値・会話・配置は `src/game/data/` の
   TypeScript設定ファイルに置き、コードに直書きしない
2. **Phaser非依存の純粋ロジックは `src/core/` に置く** — Vitestで直接テスト可能にする
3. **ReactとPhaserは EventBus 経由でのみ通信する** — 相互のオブジェクトを直接参照しない
4. 循環依存禁止(data → core → game/scenes → ui の一方向)

## 3. ディレクトリ構成(Phase 1)

```
orsedia/
├── docs/               設計ドキュメント
├── index.html          エントリHTML
├── src/
│   ├── main.tsx        Reactマウント
│   ├── App.tsx         アプリシェル(Phaserコンテナ + HUD)
│   ├── ui/             React UI(HUDなど)
│   ├── core/           Phaser非依存の純粋ロジック(要テスト)
│   │   ├── movement.ts   移動ベクトル正規化など
│   │   ├── combat.ts     ダメージ・HP計算
│   │   ├── enemyAi.ts    敵AI状態遷移(純関数)
│   │   └── save.ts       セーブデータの整形・検証
│   ├── game/
│   │   ├── EventBus.ts   React⇔Phaser の型付きイベントバス
│   │   ├── config.ts     Phaser設定・定数
│   │   ├── data/         マップ / NPC / 敵 / 会話 データ
│   │   ├── entities/     Player / Enemy / Npc(Phaser Sprite派生)
│   │   ├── systems/      DialogueBox / SaveManager など
│   │   └── scenes/       Boot / Title / Game / GameOver
│   └── styles.css
├── tests は各モジュール隣接の *.test.ts
├── package.json / vite.config.ts / tsconfig.json
└── eslint.config.js / .prettierrc
```

## 4. 主要設計

### 4.1 シーン構成(Phase 1)

- `BootScene` — テクスチャの動的生成(Phase 1は画像アセットを使わず図形で生成)
- `TitleScene` — はじめる / つづきから(セーブが存在する場合のみ)
- `GameScene` — フィールド・プレイヤー・NPC・敵・会話・HUD連携
- `GameOverScene` — ゲームオーバー表示 → タイトルへ

### 4.2 マップ

- Phase 1はTiledを使わず、`src/game/data/maps.ts` の2次元配列(0=床, 1=壁 等)で定義
- タイル32px。壁タイルは静的物理ボディとして衝突判定
- Phase 2でマップが複雑化した時点で Tiled(JSON)導入を検討(ROADMAP将来候補)

### 4.3 セーブデータ

```ts
interface SaveDataV1 {
  version: 1;
  player: { x: number; y: number; hp: number; maxHp: number };
  defeatedEnemyIds: string[];
  savedAt: string; // ISO 8601
}
```

- `localStorage` キー: `orsedia.save`
- `core/save.ts` が検証(バージョン・型・範囲)を行い、壊れたデータは無視して新規開始
- バージョン番号によるマイグレーションを最初から前提にする

### 4.4 敵AI(Phase 1)

純関数の状態機械。状態: `patrol → (プレイヤー発見) → chase → (射程内) → attack`、
見失う/離れすぎ → `return`(初期位置へ) → `patrol`。
判定入力(距離・視界)を与えると次状態を返す純関数を `core/enemyAi.ts` に置き、テストする。

### 4.5 入力

- 移動: WASD / 矢印キー(斜めは正規化して速度一定)
- 攻撃: Space / J
- 会話・決定: E / Enter
- 将来のパッド対応を見据え、シーン内で入力→意図(Intent)へ変換してから使用する

## 5. テスト方針

- `src/core/` は必ず単体テストを付ける(Vitest, node環境)
- Phaserシーンは自動テスト対象外(手動確認手順をタスクに明記)
- npm scripts: `dev` / `build` / `test` / `lint` / `format`
- タスク完了条件: `lint` `test` `build` がすべて成功していること

## 6. パフォーマンス指針(Phase 1)

- 60fps目標。敵・NPCが少数のため問題は出にくいが、
  毎フレームの `new` 乱発を避ける、テクスチャは Boot で一度だけ生成する

## 7. 技術リスク

| リスク | 対策 |
|---|---|
| React⇔Phaserの状態同期が複雑化 | EventBus一本化。双方向バインディングを作らない |
| セーブ形式の破壊的変更 | version必須+検証+マイグレーション関数 |
| Phaserの物理(Arcade)の限界 | Phase 1〜3はArcadeで十分。当たり判定の要求が上がったら再評価 |
| アセット制作コスト | 動的生成テクスチャ→フリー素材→専用素材の3段階 |
