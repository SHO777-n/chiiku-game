# CHANGELOG

形式: 日付 / 種別(feat, fix, docs, refactor, test, chore)/ 内容

---

## 2026-07-11(Phase 1 完了)

- feat: Phase 1 最小プレイアブル版を実装
  - タイトル画面(はじめから / つづきから)
  - フィールド「ハルベナ村はずれ」(25×19タイル、データ駆動)
  - プレイヤー移動(WASD/矢印、斜め正規化)・カメラ追従・壁/水との衝突
  - NPCミレとの会話システム(ページ送り、会話中は移動不可)
  - 敵「残響のかけら」×3(巡回→索敵→追跡→帰還のAI状態機械)
  - 通常攻撃(向き依存の判定+クールダウン)・HP・無敵時間・ゲームオーバー
  - セーブ/ロード(Kキー、localStorage、バージョン付きJSON+検証)
  - React製HUD(HPバー、EventBus経由)
- test: core層28件の単体テスト(movement / combat / enemyAi / save)
- fix: セーブキーをS→Kへ変更(WASD移動と競合するため)
- 動作確認: Playwright(headless Chromium)で
  起動→開始→会話→移動→被弾→ゲームオーバー→つづきから復元 の一巡を確認済み
- 既知の問題: TASKS.md「Phase 1 の既知の問題」を参照

## 2026-07-11

- docs: Phase 0 完了。企画・設計ドキュメント初稿を作成
  (GDD / TDD / WORLD / STORY / SYSTEMS / ROADMAP / DECISIONS / TASKS / README)
- コンセプト決定: 『残響のオルセディア』— 土地に残る記憶の残響を聴く聴律師のアクションRPG
