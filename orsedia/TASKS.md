# TASKS — 開発タスク一覧

- 現在フェーズ: **Phase 1 完了 → Phase 2(Vertical Slice)準備**
- 状態: 未着手 / 作業中 / 完了

---

## Phase 1 タスク

### Task-001: プロジェクト基盤構築

目的: Vite + TypeScript + React + Phaser 3 + Vitest + ESLint + Prettier の開発環境を作り、空のゲーム画面が起動する状態にする。
対象ファイル: package.json, vite.config.ts, tsconfig.json, eslint.config.js, .prettierrc, .gitignore, index.html, src/main.tsx, src/App.tsx, src/game/config.ts, src/game/scenes/BootScene.ts
完了条件:
- `npm run dev` で黒いゲームキャンバスが表示される
- `npm run lint` / `npm run test` / `npm run build` が成功する
状態: 完了

### Task-002: シーン管理の骨格

目的: Boot → Title → Game → GameOver のシーン遷移骨格を作る。
対象ファイル: src/game/scenes/*.ts, src/game/config.ts
完了条件: シーンがキー操作で一巡できる(仮テキスト表示で可)
状態: 完了

### Task-003: タイトル画面

目的: タイトル表示と「はじめる」を実装する(「つづきから」はTask-014で有効化)。
対象ファイル: src/game/scenes/TitleScene.ts
完了条件: Enter/クリックでゲーム開始できる
状態: 完了

### Task-004: フィールド表示

目的: データ定義された小マップ(タイル配列)を描画する。
対象ファイル: src/game/data/maps.ts, src/game/scenes/GameScene.ts, src/game/scenes/BootScene.ts
完了条件: 床・壁が描画される。マップデータとロジックが分離されている
状態: 完了

### Task-005: プレイヤー移動

目的: WASD/矢印キーで移動できるようにする。
対象ファイル: src/core/movement.ts(+テスト), src/game/entities/Player.ts, src/game/scenes/GameScene.ts
完了条件:
- 8方向移動できる/斜め移動時に速度が上がらない(正規化テストあり)
- マップ外へ出ない
状態: 完了

### Task-006: カメラ追従

目的: カメラがプレイヤーを追い、マップ境界で止まる。
対象ファイル: src/game/scenes/GameScene.ts
完了条件: 追従・境界クランプを目視確認
状態: 完了

### Task-007: 障害物との当たり判定

目的: 壁タイルを通過できないようにする。
対象ファイル: src/game/scenes/GameScene.ts, src/game/data/maps.ts
完了条件: すべての壁で停止する。すり抜けがない
状態: 完了

### Task-008: 会話システムとNPC

目的: NPC(ミレ)1人を配置し、近接+Eキーで会話ウィンドウを表示する。
対象ファイル: src/game/entities/Npc.ts, src/game/systems/DialogueBox.ts, src/game/data/dialogues.ts
完了条件: 会話開始/ページ送り/終了ができる。会話中は移動できない。会話文はデータファイルにある
状態: 完了

### Task-009: 敵の配置と巡回AI

目的: 敵「残響のかけら」を配置し、巡回点を往復させる。
対象ファイル: src/core/enemyAi.ts(+テスト), src/game/entities/Enemy.ts, src/game/data/enemies.ts
完了条件: 巡回動作を目視確認。AI状態遷移の単体テストが通る
状態: 完了

### Task-010: 索敵・追跡・帰還AI

目的: プレイヤー発見で追跡、見失うと初期位置へ帰還する。
対象ファイル: src/core/enemyAi.ts(+テスト), src/game/entities/Enemy.ts
完了条件: patrol→chase→return→patrol の遷移テストが通り、目視確認済み
状態: 完了

### Task-011: 通常攻撃

目的: Space/Jで向いている方向に攻撃判定を出し、敵にダメージを与える。
対象ファイル: src/core/combat.ts(+テスト), src/game/entities/Player.ts, src/game/scenes/GameScene.ts
完了条件: クールダウンがある/敵HPが減り0で消滅する/ダメージ計算のテストが通る
状態: 完了

### Task-012: プレイヤーHPと被ダメージ

目的: 敵接触でダメージ+無敵時間。HPをHUD(React)に表示する。
対象ファイル: src/core/combat.ts, src/game/EventBus.ts, src/ui/Hud.tsx, src/game/entities/Player.ts
完了条件: 被弾で点滅・HP減少がHUDに反映される。HP計算のテストが通る
状態: 完了

### Task-013: ゲームオーバー

目的: HP0でゲームオーバー画面を出し、タイトルへ戻れる。
対象ファイル: src/game/scenes/GameOverScene.ts, src/game/scenes/GameScene.ts
完了条件: HP0→ゲームオーバー→タイトル→再開の一巡ができる
状態: 完了

### Task-014: セーブ・ロード

目的: Kキーで保存、タイトル「つづきから」で位置・HP・撃破敵を復元する。
対象ファイル: src/core/save.ts(+テスト), src/game/systems/SaveManager.ts, src/game/scenes/TitleScene.ts, src/game/scenes/GameScene.ts
完了条件: 保存→リロード→復元が動く。壊れたデータで新規開始になる(検証テストあり)
状態: 完了

### Task-015: 導入テキストと仕上げ

目的: ゲーム開始時の導入数行と操作説明を表示し、Phase 1として整える。
対象ファイル: src/game/data/dialogues.ts, src/game/scenes/GameScene.ts ほか微調整
完了条件: 初見の人が操作を理解できる
状態: 完了

### Task-016: Phase 1 完了確認

目的: 仕様書§16の完了条件を検証し、既知の問題を文書化して次フェーズのタスクを整理する。
対象ファイル: docs/CHANGELOG.md, docs/ROADMAP.md, TASKS.md, README.md
完了条件: lint / test / build 成功、起動手順どおりに一巡プレイできる、既知の問題が記録済み
状態: 完了

---

## リファクタリング点検

- Phase 1 完了時点で点検済み。重複・巨大ファイル・循環依存なし。
  GameScene が最大(約270行)。Phase 2 で入力処理・戦闘処理の分離を検討

## Phase 1 の既知の問題

- Phaser同梱によりバンドルが約1.6MB(gzip 393KB)。Phase 5 でコード分割を検討
- 攻撃は向いている方向の矩形判定のみで、密着時に当てにくいことがある(Phase 2 で調整)
- 倒した敵は再出現しない(リポップは Phase 2 のバランス調整で導入判断)
- BGM・SEは未実装(Phase 2 予定どおり)

---

## Phase 2 タスク(次フェーズ・粗分解)

着手時に §6 の形式へ詳細化する。

- Task-101: マップ遷移の仕組み(村⇔フィールド⇔ダンジョン)
- Task-102: ハルベナ村マップとNPC5人
- Task-103: 会話の選択肢とフラグ
- Task-104: クエスト管理(メイン1本+サブ3本)
- Task-105: 敵2種追加+ボス「哭きの残響」
- Task-106: レベル・経験値
- Task-107: アイテム・インベントリ
- Task-108: 装備(武器・防具各1枠)
- Task-109: ショップ
- Task-110: スキル1〜2個
- Task-111: 残響再生(情景残響)演出
- Task-112: BGM/SEの仕組み
- Task-113: エンディング2種と選択
- Task-114: セーブ拡張(進行フラグ)
- Task-115: 面白さ検証プレイレビュー
