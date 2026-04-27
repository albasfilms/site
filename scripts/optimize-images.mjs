import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/**
 * `rel`: ficheiro WebP atual no repo (voltar a correr o script recomprime in-place).
 * maxWidth: limite do maior lado (px)
 * quality: qualidade WebP 1–100
 */
const jobs = [
  { rel: 'images/casamento.webp', maxWidth: 1400, quality: 82 },
  { rel: 'images/portfolio-corporativo.webp', maxWidth: 1400, quality: 82 },
  { rel: 'images/portfolio-eventos.webp', maxWidth: 1400, quality: 82 },
  { rel: 'images/edicao-design-phone.webp', maxWidth: 960, quality: 82 },
  { rel: 'images/logo-2.webp', maxWidth: 800, quality: 85 },
  { rel: 'imagessite/Captação aerea-mobile.webp', maxWidth: 960, quality: 82 },
  { rel: 'imagessite/Ensaios fotográficos.webp', maxWidth: 960, quality: 82 },
  { rel: 'imagessite/Social Midia .webp', maxWidth: 960, quality: 82 },
  { rel: 'imagessite/id visual.webp', maxWidth: 960, quality: 82 },
  { rel: 'imagessite/sites.webp', maxWidth: 960, quality: 82 },
  { rel: 'imagessite/Eventos.webp', maxWidth: 1400, quality: 82 },
  { rel: 'imagessite/Corporativo.webp', maxWidth: 1400, quality: 82 },
  { rel: 'imagessite/Edição .webp', maxWidth: 960, quality: 82 },
  { rel: 'imagessite/Casamento .webp', maxWidth: 1400, quality: 82 },
  { rel: 'imagessite/Logo com nome.webp', maxWidth: 800, quality: 88 },
  { rel: 'portfolio/assets/covers/captacao-print-2.webp', maxWidth: 1600, quality: 82 },
  { rel: 'portfolio/assets/covers/edicao-print-3.webp', maxWidth: 1600, quality: 82 },
  { rel: 'portfolio/assets/covers/ensaios-rosangela.webp', maxWidth: 1400, quality: 82 },
  { rel: 'portfolio/assets/covers/eventos-sala.webp', maxWidth: 1400, quality: 85 },
  { rel: 'portfolio/assets/covers/corporativo-perfil.webp', maxWidth: 1400, quality: 85 },
  { rel: 'portfolio/ensaios/Ensaio Grávida Bruna/Imagem/Logo.webp', maxWidth: 1200, quality: 80 },
];

function formatKb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

async function run() {
  for (const job of jobs) {
    const inputPath = path.join(root, job.rel);
    if (!fs.existsSync(inputPath)) {
      console.warn('Skip (missing):', job.rel);
      continue;
    }
    const statIn = fs.statSync(inputPath);
    const outputPath = inputPath;

    const meta = await sharp(inputPath).metadata();
    const w = meta.width || job.maxWidth;
    const h = meta.height || job.maxWidth;
    const long = Math.max(w, h);
    let pipeline = sharp(inputPath).rotate();
    if (long > job.maxWidth) {
      pipeline = pipeline.resize({
        width: w >= h ? job.maxWidth : undefined,
        height: h > w ? job.maxWidth : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const buf = await pipeline.webp({ quality: job.quality, effort: 6 }).toBuffer();
    fs.writeFileSync(outputPath, buf);

    const statOut = fs.statSync(outputPath);
    console.log(
      `${job.rel}  (${formatKb(statIn.size)} → ${formatKb(statOut.size)})`,
    );
  }
  console.log('Done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
