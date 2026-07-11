import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { AudioSystem } from '../systems/AudioSystem';
import { gameState } from '../systems/GameState';
import { eventBus } from '../EventBus';

interface EndingContent {
  title: string;
  lines: string[];
}

/** 鐘楼の選択 × 最後の選択 でエンディングを決める。 */
function resolveEnding(towerChoice: unknown, finalChoice: unknown): EndingContent {
  if (towerChoice === 'release' && finalChoice === 'reveal') {
    return {
      title: 'エンディング:響き合う世界',
      lines: [
        '真実は、恐れと共に世界へ放たれた。',
        '諸国は争いを止め、封を継ぐ「聴律の同盟」を結ぶ。',
        '',
        'ハルベナ村には慰霊の鐘が建ち、',
        '千年守り続けた聴律師の名が、初めて刻まれた。',
        '',
        'ミレは村で最初の「律血の語り部」となり、',
        'リオは今日も、どこかの土地の声を聴いている。',
        '',
        '── 音は、消えない。受け継がれる。',
      ],
    };
  }
  if (towerChoice === 'seal' && finalChoice === 'silence') {
    return {
      title: 'エンディング:静寂の平和',
      lines: [
        '真実は地下聖堂の闇に還り、世界は静かなままだった。',
        '鐘の音を覚えている者も、やがていなくなるだろう。',
        '',
        '村は平和だ。街も平和だ。',
        'ただ、封がほどけ続けていることを知る者は、',
        'もう、あなたしかいない。',
        '',
        '── 静寂は、優しくて、重い。',
      ],
    };
  }
  return {
    title: 'エンディング:ほろ苦い夜明け',
    lines: [
      '選ばれた道は、まっすぐではなかった。',
      '救われた声もあれば、眠ったままの声もある。',
      '',
      'それでも夜は明ける。',
      '旅の途中で拾った音たちが、胸の奥で鳴っている。',
      '',
      'リオの旅は、まだ終わらない。',
      '',
      '── 世界は、まだ聴くべき声で満ちている。',
    ],
  };
}

export class EndingScene extends Phaser.Scene {
  constructor() {
    super('ending');
  }

  create(): void {
    eventBus.emit('scene-changed', { scene: 'ending' });
    AudioSystem.playBgm('ending');
    gameState.setFlag('gameCleared', true);

    const cx = GAME_WIDTH / 2;
    const ending = resolveEnding(gameState.s.flags.towerChoice, gameState.s.flags.finalChoice);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0d16, 0x0a0d16, 0x2a3452, 0x1a2438);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.particles(0, 0, 'fx-firefly', {
      x: { min: 0, max: GAME_WIDTH },
      y: GAME_HEIGHT + 5,
      lifespan: 6000,
      speedY: { min: -30, max: -12 },
      alpha: { start: 0.9, end: 0 },
      quantity: 1,
      frequency: 200,
      blendMode: Phaser.BlendModes.ADD,
    });

    this.add
      .text(cx, 70, ending.title, {
        fontSize: '26px',
        color: '#ffe9a8',
        fontStyle: 'bold',
        stroke: '#0a0d16',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const body = this.add
      .text(cx, GAME_HEIGHT / 2 + 10, ending.lines.join('\n'), {
        fontSize: '15px',
        color: '#eef2f6',
        align: 'center',
        lineSpacing: 10,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({ targets: this.children.list[2], alpha: 1, duration: 1500 });
    this.tweens.add({ targets: body, alpha: 1, duration: 1800, delay: 800 });

    const hint = this.add
      .text(cx, GAME_HEIGHT - 40, '[ENTER] タイトルへ', { fontSize: '14px', color: '#8fb3d9' })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: hint, alpha: 1, duration: 800, delay: 2600 });

    this.time.delayedCall(2600, () => {
      this.input.keyboard?.once('keydown-ENTER', () => {
        AudioSystem.stopBgm();
        this.scene.start('title');
      });
    });
  }
}
