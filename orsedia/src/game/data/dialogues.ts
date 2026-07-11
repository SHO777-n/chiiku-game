/**
 * 会話データ(ロジック禁止。データのみ)。
 */

export interface Dialogue {
  speaker: string;
  pages: string[];
}

export const dialogues = {
  intro: {
    speaker: '???',
    pages: [
      'ここは、オルセディア大陸の辺境 ——\nハルベナ村はずれの野原。',
      '見習い聴律師リオは、師グレンの命で\nこの村へやって来た。',
      '「聞こえないはずの鐘の音が、夜ごと聴こえる」\n…… そんな訴えが、王都まで届いたのだという。',
      '移動: WASD / 矢印キー   攻撃: SPACE / J\n会話: E / ENTER   セーブ: K',
    ],
  },
  mire: {
    speaker: 'ミレ',
    pages: [
      'あなたが王都から来た聴律師さま?\nずいぶん…… 若いのね。あ、ごめんなさい!',
      'わたしはミレ。村の宿屋の娘よ。\n村長は今、よそ者にピリピリしてるから気をつけて。',
      '最近、野原に「残響のかけら」って魔物が\n湧くようになったの。紫色のふるえてる子たち。',
      '夜になると、森の奥から鐘の音が聴こえる……\nわたしにだけ。ねえ、あなたなら分かるんでしょう?',
      '危なくなったら無理しないで。\nKキーで記録をつけておけば、続きから再開できるから。',
    ],
  },
  gameOverHint: {
    speaker: '',
    pages: ['力尽きた……'],
  },
} as const satisfies Record<string, Dialogue>;

export type DialogueId = keyof typeof dialogues;
