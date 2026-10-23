import { readdir, mkdir, stat, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root = path.resolve('public/images');
const output = path.join(root, 'responsive');
await mkdir(output, { recursive: true });
const metadata = {};
for (const name of (await readdir(root)).sort()) {
 if (!/\.(webp|png|jpe?g)$/i.test(name)) continue;
 const input = path.join(root, name);
 const info = await sharp(input).metadata();
 if (!info.width || !info.height) continue;
 const variants = [];
 if (info.width > 480) {
  for (const width of [480, 960]) {
   if (width >= info.width) continue;
   const filename = `${path.parse(name).name}-${width}.webp`;
   const target = path.join(output, filename);
   const targetStat = await stat(target).catch(() => null);
   if (!targetStat || targetStat.mtimeMs < (await stat(input)).mtimeMs) {
    await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(target);
   }
   variants.push(`/images/responsive/${filename} ${width}w`);
  }
 }
 variants.push(`/images/${name} ${info.width}w`);
 metadata[`/images/${name}`] = { width: info.width, height: info.height, srcset: variants.join(', ') };
}
const target = path.resolve('src/data/image-metadata.json');
const content = JSON.stringify(metadata, null, 2) + '\n';
if (await readFile(target, 'utf8').catch(() => '') !== content) await writeFile(target, content);
console.log(`Prepared intrinsic dimensions and responsive sources for ${Object.keys(metadata).length} images.`);
