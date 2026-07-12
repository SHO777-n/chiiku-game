/**
 * 単体HTML生成スクリプト。
 * 実行: npm run build:single  → orsedia/play.html を生成する。
 * dist/ のJS/CSSを1ファイルに埋め込み、ダブルクリックだけで遊べる形にする。
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = join(root, 'dist', 'assets');
const files = readdirSync(assetsDir);
const jsFile = files.find((f) => f.endsWith('.js'));
const cssFile = files.find((f) => f.endsWith('.css'));
if (!jsFile || !cssFile) {
  throw new Error('dist/assets にビルド成果物がない。先に npm run build を実行すること');
}

let js = readFileSync(join(assetsDir, jsFile), 'utf-8');
// インラインscript内で </script> がタグ終端と誤認されないようにする
js = js.replaceAll('</script', '<\\/script');
const css = readFileSync(join(assetsDir, cssFile), 'utf-8');

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔔</text></svg>" />
<title>残響のオルセディア</title>
<style>
${css}
.play-note {
  position: fixed; bottom: 8px; left: 0; right: 0;
  text-align: center; font-size: 11px; color: #5a6a7a;
  font-family: 'Segoe UI', 'Hiragino Sans', sans-serif; pointer-events: none;
}
</style>
</head>
<body>
<div id="root"></div>
<div class="play-note">移動: WASD/矢印 / 攻撃: SPACE / 会話: E / メニュー: M / セーブ: K</div>
<script type="module">
${js}
</script>
</body>
</html>
`;

writeFileSync(join(root, 'play.html'), html);
console.log(`generated play.html (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
