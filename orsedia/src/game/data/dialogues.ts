/**
 * 会話データ(宣言的データ)。
 * action は ScriptRunner が解釈するコマンド列(';' 区切り)。
 * 例: 'startQuest:sq1;giveItem:potion:2;setFlag:x:true'
 */

export interface DialogueChoice {
  label: string;
  action?: string;
}

export interface DialogueNode {
  speaker: string;
  pages: string[];
  /** 最終ページの後に表示する選択肢 */
  choices?: DialogueChoice[];
  /** 会話終了時に実行(choices がある場合は無視) */
  action?: string;
}

export const dialogues: Record<string, DialogueNode> = {
  // ---------- 導入 ----------
  intro: {
    speaker: 'グレン師匠',
    pages: [
      'リオ。ハルベナ村の依頼、おまえに任せる。\n「聞こえぬはずの鐘が、夜ごと聴こえる」……妙な話だ。',
      '聴律師の仕事は、暴くことでも封じることでもない。\nまず、聴くことだ。行ってこい。',
      '移動: WASD/矢印  攻撃: SPACE/J  スキル: 1〜4\n会話・調べる: E  メニュー: M  セーブ: K',
    ],
    action: 'startQuest:mq1',
  },

  // ---------- ミレ ----------
  mireIntro: {
    speaker: 'ミレ',
    pages: [
      'あなたが王都の聴律師さま? ずいぶん若いのね。\nわたしはミレ。宿屋の娘よ。',
      '村長は今よそ者にピリピリしてるから、気をつけて。\n……ねえ、あの鐘の音、あなたにも聴こえる?',
      '夜になると、森の奥から。わたしにだけ……。\n森の北東に、空気が震える場所があるの。調べてみて。',
    ],
    action: 'progress:mq1:talkMire',
  },
  mireChat: {
    speaker: 'ミレ',
    pages: ['危なくなったら無理しないでね。\nKキーで記録をつけておけば、続きから再開できるから。'],
  },
  mireGrateful: {
    speaker: 'ミレ',
    pages: [
      '……鐘の音、やんだわ。ううん、違う。\n最後にひとつだけ、とても優しい音がした。',
      'あなたが聴き遂げてくれたのね。ありがとう。\nあの人、千年ずっと、村を守ってたんだ……。',
    ],
  },
  mireSad: {
    speaker: 'ミレ',
    pages: [
      '鐘の音、聴こえなくなった。これでいいのよね。\n村は安全になったんだから。……そうよね。',
       'でも、あの音の主の名前を、誰も知らないままなんて。\n……ごめんなさい、なんでもない。',
    ],
  },
  mireSq3Start: {
    speaker: 'ミレ',
    pages: [
      'ねえ、リオ。わたし、どうして鐘が聴こえたんだろう。\n聴律師でもないのに。……怖いの。',
      'ヴェイル様なら何か知ってるかも。\n聞いてみてくれない?',
    ],
    choices: [
      { label: '調べてみる(サブクエスト受注)', action: 'startQuest:sq3' },
      { label: 'また今度' },
    ],
  },
  mireSq3End: {
    speaker: 'ミレ',
    pages: [
      '……律血の民。古代文明の、末裔。わたしが?',
      'そっか。だからずっと、風の音が歌に聴こえたんだ。\n……ありがとう。怖くなくなった。',
      'これ、お守り。わたしが縫ったの。\nあなたが遠くへ行っても、音が届きますように。',
    ],
    action: 'setFlag:sq3ToldMire:true;progress:sq3:tellMire;reward:sq3',
  },

  // ---------- バルガ村長 ----------
  balgaCold: {
    speaker: '村長バルガ',
    pages: [
      'よそ者の聴律師か。王都は腰が重いくせに\n寄越すのは子供ときた。',
      '悪いが期待はせん。森には近づくなよ。\n最近は魔物が湧く。',
    ],
  },
  balgaWorried: {
    speaker: '村長バルガ',
    pages: [
      '鐘楼の封を開けただと? ……ガンドの奴め。',
      '……いや。ワシが子供の頃から、あの鐘は鳴っていた。\n誰も信じてくれんかったがな。頼む、村を守ってくれ。',
    ],
  },
  balgaAfter: {
    speaker: '村長バルガ',
    pages: [
      'あんたを見くびっていた。すまなかった。\n村を代表して礼を言う。',
      'あんたはもう、よそ者ではない。\nいつでも帰ってこい、リオ。',
    ],
  },

  // ---------- ガンド ----------
  gandShop: {
    speaker: 'ガンド',
    pages: ['おう、聴律師の。石はいいぞ。石は嘘をつかん。\n何か見ていくか?'],
    choices: [{ label: '買い物をする', action: 'openShop:gand' }, { label: 'やめる' }],
  },
  gandSq2Offer: {
    speaker: 'ガンド',
    pages: [
      'ワシはな、石に残った残響を聴く研究をしとる。\nドワーフの技と、あんたらの理屈の間の技だ。',
      '律鉄鉱が3つ要る。森に露頭があるはずだ。\n頼まれてくれんか?',
    ],
    choices: [
      { label: '引き受ける(サブクエスト受注)', action: 'startQuest:sq2' },
      { label: 'また今度' },
    ],
  },
  gandSq2Done: {
    speaker: 'ガンド',
    pages: [
      'おお、上物だ! 助かる。\n……聴こえるか? 石の中で、千年前の川が流れとる。',
      'これは礼だ。それとな、腕を見込んで言っとくが、\nメニューの調合で武具も打てるようにしといたぞ。',
    ],
    action: 'takeItem:ore:3;progress:sq2:ore:3;reward:sq2',
  },
  gandNeedOre: {
    speaker: 'ガンド',
    pages: [
      'その欠片……鐘楼の封と同じ律動だな。\n開けられるぞ、ワシなら。',
      'だが封を揺らすには律鉄鉱が3つ要る。\n森の露頭から採ってこい。話はそれからだ。',
    ],
  },
  gandOpen: {
    speaker: 'ガンド',
    pages: ['鉱石は揃ったな。欠片を貸せ。\n……ようし。封の律動に、重ねる……!'],
    choices: [
      {
        label: '律鉄鉱3つを渡す',
        action:
          'takeItem:ore:3;setFlag:towerOpen:true;setFlag:towerBossGate:true;progress:mq2:showShard;reward:mq2;startQuest:mq3;notify:鐘楼の封が開いた!',
      },
      { label: 'まだ準備がある' },
    ],
  },

  // ---------- トマ ----------
  tommaShop: {
    speaker: '行商人トマ',
    pages: ['やあ、旅の人! 薬と道具ならお任せを。\n獣人の行商網に外れなし、だよ。'],
    choices: [{ label: '買い物をする', action: 'openShop:tomma' }, { label: 'やめる' }],
  },

  // ---------- ヴェイル ----------
  veilTalk: {
    speaker: 'シスター・ヴェイル',
    pages: [
      '死者の声を掘り返すことが善だとは、わたくしは思いません。\n残響は、眠らせてこそ安らぐのです。',
      'あなたの師がどう教えたかは知りませんが……\nどうか、聴きすぎませんように。',
    ],
  },
  veilSq3: {
    speaker: 'シスター・ヴェイル',
    pages: [
      'ミレのこと、ですか。……薄々は。',
      '律血の民──古代文明の末裔は、残響と共鳴する血を持つ。\n教団は長く、彼らを「監視」してきました。',
      'わたくしがここにいる理由も、それです。\n……彼女に伝えるかどうかは、あなたが決めなさい。',
    ],
    action: 'setFlag:sq3AskedVeil:true;progress:sq3:askVeil',
  },
  veilInvite: {
    speaker: 'シスター・ヴェイル',
    pages: [
      '鐘楼の一件、聞きました。あなたの判断がどうであれ、\nひとつ確かなことがある。',
      'あの残響は「管理記録」に存在しなかった。\n何者かが、意図的に記録を消している。',
      'ヴェルディンの聖堂書庫へ来なさい。\n見せたいものがあります。……街道の封鎖は解かせました。',
    ],
    action: 'setFlag:veilMoved:true;startQuest:mq4;notify:王国街道が通れるようになった',
  },
  veilTownMq4: {
    speaker: 'シスター・ヴェイル',
    pages: [
      'よく来ましたね。ここヴェルディンは静寂教団の街。\n……ですが、その静寂は少し、深すぎる。',
      '書庫の記録が改竄されています。1200年前の、\n大共鳴災厄の前後だけが、綺麗に。',
      '書記官のオルムが詳しい。話を聞きなさい。',
    ],
    action: 'setFlag:mq4TalkedVeil:true;progress:mq4:talkVeil',
  },
  veilTownMq5: {
    speaker: 'シスター・ヴェイル',
    pages: [
      '「黙の会」……教団の中の、教団。\n災厄の真実を、千年黙らせてきた者たち。',
      '地下聖堂に執行者が入った。記録の「最後の原本」を\n消すつもりです。……行きなさい、聴律師。',
      'わたくしは祈ります。あなたが正しく聴けますように。',
    ],
  },
  veilTownChat: {
    speaker: 'シスター・ヴェイル',
    pages: ['聖堂は誰にでも開かれています。\n……静かに、なさいませね。'],
  },

  // ---------- レナ婆さん ----------
  lenaOffer: {
    speaker: 'レナ婆さん',
    pages: [
      'ああ、旅の人や。うちの羊たちが森へ逃げちまってねえ。\n3匹、白いのが。年寄りにはもう追えんのよ。',
    ],
    choices: [
      { label: '探してくる(サブクエスト受注)', action: 'startQuest:sq1' },
      { label: '急いでいるので' },
    ],
  },
  lenaWait: {
    speaker: 'レナ婆さん',
    pages: ['羊たち、見つかったかい? 森で白いのを見たら\n近づいて撫でてやっとくれ。帰り道を思い出すからね。'],
  },
  lenaReward: {
    speaker: 'レナ婆さん',
    pages: ['まあまあ、3匹とも帰ってきたよ!\nありがとうねえ。これはお礼だよ。'],
    action: 'reward:sq1',
  },
  lenaThanks: {
    speaker: 'レナ婆さん',
    pages: ['羊たちも、あんたのことを覚えてるようだよ。\nまた顔をお見せねえ。'],
  },

  // ---------- 街の人々 ----------
  archivistChat: {
    speaker: '書記官オルム',
    pages: ['書庫の本は持ち出し禁止です。\n閲覧はご自由に。……静かにね。'],
  },
  archivistMq4: {
    speaker: '書記官オルム',
    pages: [
      'ヴェイル様のご紹介ですね。……ええ、お見せします。\nこの台帳、綴じ直された跡がある。',
      '災厄前後の頁だけ、紙が新しい。何者かが差し替えた。\nそして原本は──地下聖堂の奉納庫にあるはずです。',
      '地下への扉、開けておきます。\nどうかお気をつけて。最近、下から物音がするのです。',
    ],
    action:
      'progress:mq4:archive;reward:mq4;setFlag:cryptOpen:true;setFlag:cryptBossGate:true;startQuest:mq5;setFlag:companion:true;notify:地下聖堂への扉が開いた。ミレが村から駆けつけ、同行する!',
  },
  seraChat: {
    speaker: '癒し手セラ',
    pages: ['お怪我はない? 無理は禁物よ。\n宿で休めば、朝にはすっかり良くなるわ。'],
  },
  seraOffer: {
    speaker: '癒し手セラ',
    pages: [
      '困ったわ、薬草を切らしてしまって。\n患者さんが待っているのに。',
      '野に生えている薬草を5つ、分けてもらえないかしら?',
    ],
    choices: [
      { label: '薬草を集めてくる(サブクエスト受注)', action: 'startQuest:sq4' },
      { label: '今は難しい' },
    ],
  },
  seraWait: {
    speaker: '癒し手セラ',
    pages: ['薬草、集まったら声をかけてね。5つよ。'],
  },
  seraDone: {
    speaker: '癒し手セラ',
    pages: ['まあ、助かったわ! これで薬が作れる。\nお礼に、とっておきの薬をどうぞ。'],
    action: 'takeItem:herb:5;progress:sq4:herb:5;reward:sq4',
  },
  dolkChat: {
    speaker: '衛兵ドルク',
    pages: ['街道の魔物には気をつけろよ。\n影狼は火に弱い。覚えておけ。'],
  },
  dolkOffer: {
    speaker: '衛兵ドルク',
    pages: [
      '地下聖堂に入るのか? なら頼みがある。\n下に湧いた怨霊ども、3体ばかり間引いてくれ。',
      '本当は俺の仕事なんだがな。……上が動かんのだ。',
    ],
    choices: [
      { label: '引き受ける(サブクエスト受注)', action: 'startQuest:sq5' },
      { label: '考えておく' },
    ],
  },
  dolkWait: {
    speaker: '衛兵ドルク',
    pages: ['怨霊は3体だ。数はこっちで数えておく。\n無理はするな。'],
  },
  dolkReward: {
    speaker: '衛兵ドルク',
    pages: ['3体、確認した。腕が立つな、あんた。\n約束の報酬だ。受け取ってくれ。'],
    action: 'reward:sq5',
  },
  marleInn: {
    speaker: '宿屋のマール',
    pages: ['いらっしゃい! 一晩10リンだよ。\nゆっくり休めば、朝には元気いっぱいさ。'],
    choices: [{ label: '泊まる(10リン)', action: 'rest:10' }, { label: 'やめる' }],
  },
  merchantShop: {
    speaker: '商人ベルタ',
    pages: ['金天秤組合公認の店だよ。品は確かさ。'],
    choices: [{ label: '買い物をする', action: 'openShop:veldrin' }, { label: 'やめる' }],
  },

  // ---------- フィールドイベント ----------
  echoVision: {
    speaker: '残響',
    pages: [
      '……空気が、震えている。目を閉じ、耳を澄ます──',
      '『──鐘を! 鐘を鳴らせ! 森が呑まれる前に!』\n『駄目だ、共鳴が強すぎる! 塔ごと──』',
      '若い聴律師が、鐘楼へ駆けてゆく。\n1200年前の、村の名も残らぬ夜の記憶。',
      '足元に、小さな欠片が落ちている。\n【共鳴の欠片】を手に入れた。',
    ],
    action:
      'progress:mq1:investigate;reward:mq1;giveItem:resonantShard:1;startQuest:mq2;notify:欠片をガンドに見せよう',
  },
  echoIdle: {
    speaker: '',
    pages: ['空気がかすかに震えている。\n今は、これ以上聴き取れない。'],
  },
  sheepFound: {
    speaker: '',
    pages: ['白い羊だ。そっと撫でると、\n思い出したように村の方へ駆けていった。'],
  },
  oreMined: {
    speaker: '',
    pages: ['岩肌から【律鉄鉱】を採取した。'],
  },
  herbPicked: {
    speaker: '',
    pages: ['【薬草】を摘み取った。'],
  },

  // ---------- ボス戦後の選択 ----------
  towerChoice: {
    speaker: '哭きの残響',
    pages: [
      '……音が、ほどけていく。巨大な影の奥に、\n若い聴律師の姿が見える。1200年前の、あの人だ。',
      '『……まだ、鳴らさなきゃ……みんなが、のまれる……』\n彼はまだ、あの夜の中にいる。',
      'どうする?',
    ],
    choices: [
      {
        label: '教団の作法で封じる(彼は静かに眠る)',
        action:
          'setFlag:towerChoice:seal;progress:mq3:choice;reward:mq3;setFlag:roadOpen:true;notify:残響は封じられた……',
      },
      {
        label: '最後まで聴き遂げる(彼の物語を村に伝える)',
        action:
          'setFlag:towerChoice:release;progress:mq3:choice;reward:mq3;setFlag:roadOpen:true;notify:残響は光となって解けた',
      },
    ],
  },
  finalChoice: {
    speaker: '???',
    pages: [
      '執行者が崩れ落ちる。祭壇の奥に、古い写本──\n大共鳴災厄の「原本」がある。',
      'そこに記されていたのは:災厄は事故ではない。\n『深淵の共鳴』を封じるため、古代文明が自ら選んだ犠牲。',
      'そして封は今も、少しずつ、ほどけ続けている。\n──この真実を、どうする?',
    ],
    choices: [
      {
        label: '世界に公表する(恐怖と、備えのはじまり)',
        action: 'setFlag:finalChoice:reveal;progress:mq5:choice;reward:mq5;ending',
      },
      {
        label: '沈黙を守る(平穏と、先送りの千年)',
        action: 'setFlag:finalChoice:silence;progress:mq5:choice;reward:mq5;ending',
      },
    ],
  },
  companionJoin: {
    speaker: 'ミレ',
    pages: [
      'リオ! ……はあ、はあ。村から走ってきたの。\n嫌な音がする。あなたひとりで行かせられない。',
      'わたし、聴こえるんだから。役に立つわ。\n……一緒に行く。いいわね?',
    ],
  },
};

export type DialogueId = keyof typeof dialogues;
