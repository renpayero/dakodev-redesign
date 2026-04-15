import sharp from "sharp";
import pngToIco from "png-to-ico";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const svgPath = resolve("public/favicon.svg");
const svg = await readFile(svgPath);

const pngTargets = [
  { out: "public/favicon-48.png", size: 48 },
  { out: "public/apple-touch-icon.png", size: 180 },
  { out: "public/icon-192.png", size: 192 },
  { out: "public/icon-512.png", size: 512 },
];

for (const { out, size } of pngTargets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(resolve(out));
  console.log(`\u2713 ${out} (${size}\u00d7${size})`);
}

// favicon.ico: multi-size (16/32/48) — sharp no exporta .ico, usamos png-to-ico
const icoBuffers = await Promise.all(
  [16, 32, 48].map((size) =>
    sharp(svg, { density: 384 }).resize(size, size).png().toBuffer()
  )
);
const ico = await pngToIco(icoBuffers);
await writeFile(resolve("public/favicon.ico"), ico);
console.log("\u2713 public/favicon.ico (16/32/48)");
