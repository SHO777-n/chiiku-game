# 残響のオルセディア(Echoes of Orsedia)

土地に残された「記憶の残響」を聴く見習い聴律師リオの、2Dトップダウン・アクションRPG。
**Phase 2〜5 の骨格実装まで完了** — 村・森・鐘楼・街道・街・地下聖堂の6マップ、
クエスト10本、ボス2体、選択によって変わる3種のエンディングまで通してプレイできます。

- 企画書: [docs/GDD.md](docs/GDD.md) / 技術設計: [docs/TDD.md](docs/TDD.md)
- 世界観: [docs/WORLD.md](docs/WORLD.md) / ストーリー: [docs/STORY.md](docs/STORY.md)
- システム: [docs/SYSTEMS.md](docs/SYSTEMS.md) / ロードマップ: [docs/ROADMAP.md](docs/ROADMAP.md)
- 技術判断の記録: [docs/DECISIONS.md](docs/DECISIONS.md) / 変更履歴: [docs/CHANGELOG.md](docs/CHANGELOG.md)
- タスク: [TASKS.md](TASKS.md)

## 主な特徴

- HD-2D風のビジュアル(全キャラ歩行アニメ、水面アニメ、昼夜サイクル、雨、街灯・蛍の発光)
  — すべて実行時に動的生成(画像アセット不要)
- リアルタイム戦闘: 通常攻撃+スキル4種(属性: 物理/火/氷/残響)、弱点・耐性、
  状態異常(毒/しびれ)、ダメージ数字、弾幕を撃つボス2体
- 成長: レベル1〜10、スキルツリー、装備(武器/防具/装身具)、調合・鍛冶
- 世界: マップ6面、NPC13人(昼夜で行動変化)、ショップ3店、宿屋、仲間(ミレ)
- 物語: メインクエスト5章+サブクエスト5本。2つの大きな選択で3種のエンディングに分岐
- BGM7曲+効果音9種(Web Audio手続き生成)
- セーブ/ロード(バージョン付き・検証付き。旧版セーブは自動マイグレーション)

## 必要環境

- Node.js 20 以上 / npm

## 遊び方(いちばん簡単)

**`play.html` をブラウザで開くだけ**(ダブルクリックでOK。インストール・通信不要)。
ゲームの更新後は `npm run build:single` で `play.html` を再生成する。

## 開発時の起動方法

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
| 攻撃 | SPACE / J |
| スキル | 1〜4(習得順に割り当て) |
| 会話・調べる・決定 | E / ENTER |
| メニュー(アイテム/装備/スキル/クエスト/調合) | M(閉じる: Esc) |
| セーブ | K |

## 攻略の流れ(ネタバレなし)

村で話を聞く → 森の「震える場所」を調べる → 鍛冶屋ガンドに協力してもらう →
鐘楼へ。その先は、あなたの選択次第。

## テスト・品質チェック

```bash
npm run test    # Vitest 単体テスト(コアロジック+マップ整合性検証)
npm run lint    # ESLint
npm run build   # 型チェック + 本番ビルド
```

マップを変更する場合は `tools/genmaps.mjs` を編集し、
`node tools/genmaps.mjs` で `src/game/data/maps.ts` を再生成する(直接編集しない)。

## プロジェクト構成

- `src/core/` — Phaser非依存の純粋ロジック(戦闘計算/AI/セーブ/クエスト/時間 等。テスト対象)
- `src/game/data/` — マップ・敵・会話・アイテム・クエストなどのゲームデータ
- `src/game/` — Phaser本体(scenes / entities / systems)
- `src/ui/` — React製UI(HUD/メニュー/ショップ)。状態は `systems/GameState` ストアを共有
- `tools/` — マップジェネレータ

## 既知の問題

[TASKS.md「既知の問題(Phase 5 継続項目)」](TASKS.md)を参照
(バランス初期値、手続き生成BGM、バンドルサイズ等)
