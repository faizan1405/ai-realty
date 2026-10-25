import * as THREE from "three";

const cache = new Map<string, THREE.CanvasTexture>();

function make(key: string, size: number, draw: (c: CanvasRenderingContext2D, s: number) => void) {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

// seeded random so textures are stable
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function noise(c: CanvasRenderingContext2D, s: number, amt: number, r: () => number) {
  const img = c.getImageData(0, 0, s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * amt;
    const d = img.data; d[i] = d[i]! + n; d[i + 1] = d[i + 1]! + n; d[i + 2] = d[i + 2]! + n;
  }
  c.putImageData(img, 0, 0);
}

/** Split-face natural stone, random coursed ashlar. 1 tile ≈ 2m. */
export const stoneTexture = () =>
  make("stone", 512, (c, s) => {
    const r = rng(7);
    c.fillStyle = "#5b564e"; c.fillRect(0, 0, s, s);
    let y = 0;
    while (y < s) {
      const h = 18 + r() * 26;
      let x = -r() * 60;
      while (x < s) {
        const w = 40 + r() * 90;
        const t = 120 + r() * 50;
        c.fillStyle = `rgb(${t + 8},${t + 2},${t - 10})`;
        c.fillRect(x + 2, y + 2, w - 3, h - 3);
        x += w;
      }
      y += h;
    }
    noise(c, s, 26, r);
  });

/** Board-formed concrete with tie holes. 1 tile ≈ 2.4m. */
export const concreteTexture = () =>
  make("concrete", 512, (c, s) => {
    const r = rng(11);
    c.fillStyle = "#cfc8bb"; c.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 16) {
      c.fillStyle = `rgba(90,80,70,${0.03 + r() * 0.05})`;
      c.fillRect(0, y, s, 16);
      c.fillStyle = "rgba(80,72,64,0.12)";
      c.fillRect(0, y, s, 1);
    }
    c.fillStyle = "rgba(60,55,50,0.45)";
    for (let x = 64; x < s; x += 128) for (let y = 64; y < s; y += 128) { c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); }
    noise(c, s, 18, r);
  });

/** Warm teak with vertical grain. */
export const woodTexture = () =>
  make("wood", 256, (c, s) => {
    const r = rng(3);
    c.fillStyle = "#7d4f2c"; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 160; i++) {
      c.strokeStyle = `rgba(${40 + r() * 40},${20 + r() * 20},10,${0.15 + r() * 0.25})`;
      c.lineWidth = 0.5 + r() * 2;
      const x = r() * s;
      c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + r() * 6, s / 3, x - r() * 6, (2 * s) / 3, x + r() * 4, s); c.stroke();
    }
    noise(c, s, 14, r);
  });

/** Large-format limestone paving. */
export const pavingTexture = () =>
  make("paving", 512, (c, s) => {
    const r = rng(5);
    c.fillStyle = "#6f6a61"; c.fillRect(0, 0, s, s);
    const n = 4;
    const t = s / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = 150 + r() * 22;
      c.fillStyle = `rgb(${v},${v - 6},${v - 16})`;
      c.fillRect(i * t + 1.5, j * t + 1.5, t - 3, t - 3);
    }
    noise(c, s, 16, r);
  });

/** Lawn. */
export const grassTexture = () =>
  make("grass", 256, (c, s) => {
    const r = rng(9);
    c.fillStyle = "#3f5a36"; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 4000; i++) {
      c.fillStyle = `rgba(${50 + r() * 40},${80 + r() * 50},${40 + r() * 20},0.6)`;
      c.fillRect(r() * s, r() * s, 1, 2 + r() * 3);
    }
  });
