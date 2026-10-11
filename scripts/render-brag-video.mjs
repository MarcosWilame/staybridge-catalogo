import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const projectRoot = resolve(process.cwd());
const outputRoot = join(projectRoot, 'brag-output');
const workRoot = join(outputRoot, 'work');
const screenshot = 'C:/Users/Wilam/AppData/Local/Temp/codex-clipboard-0d104104-8a8b-47cb-817e-19ddd455fdde.png';
const font = 'C\\:/Windows/Fonts/segoeuib.ttf';

mkdirSync(workRoot, { recursive: true });

const assets = {
  single: join(workRoot, 'site-images/single-streatham-130.jpg'),
  ensuite: join(workRoot, 'site-images/ensuite-finchley-220.jpg'),
  studio: join(workRoot, 'site-images/studio-streatham-280.jpg'),
  flat: join(workRoot, 'site-images/flat-willesden-490.jpg'),
};

function run(args) {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
}

function renderScene(name, input, copy, extraFilter = '') {
  const output = join(workRoot, `${name}.mp4`);
  const base = extraFilter || 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=brightness=-0.10:saturation=1.08';
  const filter = `${base},drawbox=x=0:y=0:w=1080:h=1920:color=black@0.16:t=fill,drawbox=x=40:y=1500:w=1000:h=300:color=#102c20@0.90:t=fill,drawtext=fontfile='${font}':text='${copy}':fontcolor=white:fontsize=48:line_spacing=12:x=72:y=1600:shadowcolor=black@0.65:shadowx=0:shadowy=5,fade=t=in:st=0:d=0.35,fade=t=out:st=3.65:d=0.35`;

  run([
    '-loop', '1', '-i', input,
    '-t', '4', '-vf', filter,
    '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-an', output,
  ]);
  return output;
}

const scenes = [
  renderScene('01-single', assets.single, 'Single Room  •  Streatham  •  £130/sem.'),
  renderScene('02-ensuite', assets.ensuite, 'Ensuite  •  Finchley  •  £220/sem.'),
  renderScene('03-studio', assets.studio, 'Studio  •  Streatham  •  £280/sem.'),
  renderScene('04-flat', assets.flat, 'Flat  •  Willesden Green  •  £490/sem.'),
  renderScene(
    '05-chatbot',
    screenshot,
    'Pergunte. Compare. Encontre.',
    'scale=820:-1:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:180:color=#102c20'
  ),
];

const concatFile = join(workRoot, 'concat.txt');
writeFileSync(concatFile, scenes.map((scene) => `file '${scene.replaceAll('\\', '/')}'`).join('\n'));
const silentVideo = join(workRoot, 'silent.mp4');
run(['-f', 'concat', '-safe', '0', '-i', concatFile, '-c', 'copy', silentVideo]);

const audio = join(workRoot, 'music.m4a');
run([
  '-f', 'lavfi', '-i', 'sine=frequency=220:duration=20',
  '-f', 'lavfi', '-i', 'sine=frequency=330:duration=20',
  '-f', 'lavfi', '-i', 'sine=frequency=440:duration=20',
  '-filter_complex', '[0:a]volume=0.05[a0];[1:a]volume=0.035[a1];[2:a]volume=0.025[a2];[a0][a1][a2]amix=inputs=3:duration=longest,afade=t=in:st=0:d=1,afade=t=out:st=18:d=2',
  '-c:a', 'aac', '-b:a', '128k', audio,
]);

const finalVideo = join(outputRoot, 'brag.mp4');
run(['-i', silentVideo, '-i', audio, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-shortest', finalVideo]);
run(['-ss', '0.5', '-i', finalVideo, '-frames:v', '1', '-q:v', '2', join(outputRoot, 'brag.jpg')]);

console.log(`Rendered ${finalVideo}`);
