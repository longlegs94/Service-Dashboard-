// Generates the PWA app icons as real PNGs (no image libraries needed — encodes
// PNG directly via Node's zlib). Run with: node scripts/generate-icons.mjs
//
// Design: a slate "clipboard / job list" mark on a brand background. Replace
// these with your own artwork any time — keep the same filenames.
import { deflateSync, crc32 } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(here, "..", "public", "icons");
mkdirSync(iconsDir, { recursive: true });

const BG = [15, 23, 42]; // slate-900 (theme color)
const FG = [255, 255, 255]; // clipboard body
const LINE = [148, 163, 184]; // slate-400 list lines

function encodePng(size, draw) {
  const ch = 4;
  const stride = size * ch + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y);
      const o = y * stride + 1 + x * ch;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0, 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// rounded-rect hit test
function inRoundRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

/** content scale: 1 = fill (regular), ~0.8 = padded safe area (maskable). */
function makeDraw(size, contentScale) {
  const pad = (size * (1 - contentScale)) / 2;
  const inner = size - pad * 2;
  // clipboard body
  const bx0 = pad + inner * 0.26;
  const bx1 = pad + inner * 0.74;
  const by0 = pad + inner * 0.2;
  const by1 = pad + inner * 0.84;
  const radius = inner * 0.06;
  // top clip tab
  const tx0 = pad + inner * 0.4;
  const tx1 = pad + inner * 0.6;
  const ty0 = pad + inner * 0.14;
  const ty1 = pad + inner * 0.24;
  // list lines
  const lines = [0.4, 0.54, 0.68].map((f) => pad + inner * f);
  const lx0 = pad + inner * 0.36;
  const lx1 = pad + inner * 0.64;
  const lh = inner * 0.035;

  return (x, y) => {
    // list lines
    for (const ly of lines) {
      if (x >= lx0 && x <= lx1 && y >= ly && y <= ly + lh) return [...LINE, 255];
    }
    // clip tab
    if (inRoundRect(x, y, tx0, ty0, tx1, ty1, radius * 0.5)) return [...FG, 255];
    // clipboard body
    if (inRoundRect(x, y, bx0, by0, bx1, by1, radius)) return [...FG, 255];
    // background
    return [...BG, 255];
  };
}

const targets = [
  { file: "icon-192.png", size: 192, scale: 1 },
  { file: "icon-512.png", size: 512, scale: 1 },
  { file: "maskable-512.png", size: 512, scale: 0.8 },
  { file: "apple-touch-icon.png", size: 180, scale: 1 },
];

for (const t of targets) {
  const png = encodePng(t.size, makeDraw(t.size, t.scale));
  writeFileSync(join(iconsDir, t.file), png);
  console.log(`wrote public/icons/${t.file} (${png.length} bytes)`);
}
