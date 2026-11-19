"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Ukuran dunia game (piksel logis). Canvas di-scale lewat CSS.
const W = 380;
const HT = 560;
const BH = 28; // tinggi satu brick
const GROUND = HT - 48;
const START_W = 170;
const PERFECT = 5; // toleransi "pas" (px)
const BEST_KEY = "lego-stack-best";

const COLORS = ["#e3000b", "#0055bf", "#f2cd37", "#237841"]; // merah, biru, kuning, hijau
const colorOf = (i) => COLORS[i % COLORS.length];

function makeGame() {
  return {
    state: "idle", // idle | play | over
    blocks: [{ x: (W - START_W) / 2, w: START_W }],
    cur: { x: 0, w: START_W, dir: 1 },
    debris: [],
    flashes: [],
    cam: 0,
    camT: 0,
    combo: 0,
    overAt: 0,
  };
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function drawBrick(ctx, x, topY, w, color) {
  // badan
  ctx.fillStyle = color;
  rrect(ctx, x, topY, w, BH, 3);
  ctx.fill();
  // bayangan bawah & kilau atas
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(x, topY + BH - 6, w, 6);
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillRect(x + 2, topY + 1, w - 4, 3);
  // stud
  const n = Math.max(1, Math.round(w / 28));
  const gap = w / n;
  for (let k = 0; k < n; k++) {
    const cx = x + gap * (k + 0.5);
    ctx.fillStyle = color;
    rrect(ctx, cx - 9, topY - 6, 18, 7, 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(cx - 7, topY - 5, 14, 2);
  }
}

export default function LegoStack() {
  const canvasRef = useRef(null);
  const gRef = useRef(makeGame());
  const visibleRef = useRef(true);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const v = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
      if (v > 0) setBest(v);
    } catch {}
  }, []);

  const reset = useCallback(() => {
    gRef.current = makeGame();
    setScore(0);
    setStatus("");
  }, []);

  const drop = useCallback(() => {
    const g = gRef.current;

    if (g.state === "idle") {
      g.state = "play";
      return;
    }
    if (g.state === "over") {
      if (performance.now() - g.overAt < 500) return; // cegah restart tak sengaja
      reset();
      gRef.current.state = "play";
      return;
    }

    const { blocks, cur } = g;
    const top = blocks[blocks.length - 1];
    const n = blocks.length;
    const rowTop = (n + 1) * BH;

    const left = Math.max(cur.x, top.x);
    const right = Math.min(cur.x + cur.w, top.x + top.w);
    const overlap = right - left;

    if (overlap <= 0) {
      // meleset total
      g.debris.push({ x: cur.x, w: cur.w, y: rowTop, vy: 0, vx: cur.dir * 30, color: colorOf(n) });
      g.state = "over";
      g.overAt = performance.now();
      const finalScore = n - 1;
      setStatus(`Menara roboh. Skor ${finalScore}.`);
      setBest((b) => {
        if (finalScore > b) {
          try {
            localStorage.setItem(BEST_KEY, String(finalScore));
          } catch {}
          return finalScore;
        }
        return b;
      });
      return;
    }

    let placed;
    if (Math.abs(cur.x - top.x) <= PERFECT) {
      placed = { x: top.x, w: top.w };
      g.combo += 1;
      g.flashes.push({ t: 0, text: g.combo >= 3 ? `Pas x${g.combo}!` : "Pas!" });
      if (g.combo >= 3 && placed.w < START_W) {
        const nw = Math.min(START_W, placed.w + 8);
        placed = { x: Math.max(0, Math.min(W - nw, placed.x - 4)), w: nw };
      }
    } else {
      g.combo = 0;
      placed = { x: left, w: overlap };
      const cutX = cur.x < top.x ? cur.x : top.x + top.w;
      const cutW = cur.x < top.x ? top.x - cur.x : cur.x + cur.w - (top.x + top.w);
      g.debris.push({ x: cutX, w: cutW, y: rowTop, vy: 0, vx: (cur.x < top.x ? -1 : 1) * 40, color: colorOf(n) });
    }

    blocks.push(placed);
    const nn = blocks.length;
    g.cur = nn % 2 === 0
      ? { x: W - placed.w, w: placed.w, dir: -1 }
      : { x: 0, w: placed.w, dir: 1 };
    g.camT = Math.max(0, (nn - 7) * BH);
    setScore(nn - 1);
  }, [reset]);

  // loop render + update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = HT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let io;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(([e]) => (visibleRef.current = e.isIntersecting), { threshold: 0.05 });
      io.observe(canvas);
    }

    let raf;
    let last = performance.now();

    const update = (dt) => {
      const g = gRef.current;
      const n = g.blocks.length;

      if (g.state !== "over") {
        const speed = Math.min(150 + (n - 1) * 9, 430);
        const c = g.cur;
        c.x += c.dir * speed * dt;
        if (c.x < 0) { c.x = 0; c.dir = 1; }
        if (c.x + c.w > W) { c.x = W - c.w; c.dir = -1; }
      }

      for (const d of g.debris) {
        d.vy += 1500 * dt;
        d.y -= d.vy * dt;
        d.x += d.vx * dt;
      }
      g.debris = g.debris.filter((d) => d.y > -200);

      for (const f of g.flashes) f.t += dt;
      g.flashes = g.flashes.filter((f) => f.t < 0.9);

      g.cam = reduce ? g.camT : g.cam + (g.camT - g.cam) * Math.min(1, dt * 8);
    };

    const draw = () => {
      const g = gRef.current;
      const { cam } = g;

      // langit
      ctx.fillStyle = "#cfe9f7";
      ctx.fillRect(0, 0, W, HT);

      // baseplate
      const gy = GROUND + cam;
      if (gy < HT) {
        ctx.fillStyle = "#2f9e57";
        ctx.fillRect(0, gy, W, HT - gy);
        ctx.fillStyle = "#237841";
        ctx.fillRect(0, gy, W, 4);
        ctx.fillStyle = "#38b567";
        for (let sx = 13; sx < W; sx += 26) {
          rrect(ctx, sx - 9, gy + 14, 18, 7, 2);
          ctx.fill();
        }
      }

      // brick yang sudah tersusun
      g.blocks.forEach((b, i) => {
        const topY = GROUND - (i + 1) * BH + cam;
        if (topY > HT || topY < -BH - 10) return;
        drawBrick(ctx, b.x, topY, b.w, colorOf(i));
      });

      // brick yang bergerak
      if (g.state !== "over") {
        const n = g.blocks.length;
        const topY = GROUND - (n + 1) * BH + cam;
        drawBrick(ctx, g.cur.x, topY, g.cur.w, colorOf(n));
      }

      // potongan yang jatuh
      for (const d of g.debris) {
        drawBrick(ctx, d.x, GROUND - d.y + cam, d.w, d.color);
      }

      // teks "Pas!"
      for (const f of g.flashes) {
        ctx.globalAlpha = 1 - f.t / 0.9;
        ctx.fillStyle = "#14213d";
        ctx.font = "800 22px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(f.text, W / 2, 120 - f.t * 30);
        ctx.globalAlpha = 1;
      }

      // skor besar
      if (g.state === "play") {
        ctx.fillStyle = "rgba(20,33,61,0.85)";
        ctx.font = "800 44px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(g.blocks.length - 1), W / 2, 64);
      }

      // overlay awal / akhir
      if (g.state !== "play") {
        ctx.fillStyle = "rgba(20,33,61,0.72)";
        rrect(ctx, 40, 190, W - 80, 150, 10);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        if (g.state === "idle") {
          ctx.font = "800 24px system-ui, sans-serif";
          ctx.fillText("Susun menara Lego", W / 2, 240);
          ctx.font = "500 16px system-ui, sans-serif";
          ctx.fillText("Ketuk atau tekan Spasi", W / 2, 275);
          ctx.fillText("untuk menjatuhkan brick", W / 2, 298);
        } else {
          ctx.font = "800 24px system-ui, sans-serif";
          ctx.fillText("Menara roboh", W / 2, 240);
          ctx.font = "700 20px system-ui, sans-serif";
          ctx.fillText(`Skor ${g.blocks.length - 1}`, W / 2, 275);
          ctx.font = "500 16px system-ui, sans-serif";
          ctx.fillText("Ketuk untuk main lagi", W / 2, 308);
        }
      }
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visibleRef.current) return;
      update(dt);
      draw();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      if (io) io.disconnect();
    };
  }, []);

  const onKeyDown = (e) => {
    if (e.code === "Space" || e.key === "Enter") {
      e.preventDefault();
      drop();
    }
  };

  return (
    <div style={{ maxWidth: W, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        <span>Skor: {score}</span>
        <span>Terbaik: {best}</span>
      </div>
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="application"
        aria-label="Game Lego Stack. Tekan Spasi atau Enter untuk menjatuhkan brick."
        onPointerDown={drop}
        onKeyDown={onKeyDown}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          aspectRatio: `${W} / ${HT}`,
          borderRadius: 12,
          border: "3px solid #14213d",
          touchAction: "manipulation",
          cursor: "pointer",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      />
      <p aria-live="polite" style={{ position: "absolute", left: -9999 }}>
        {status}
      </p>
    </div>
  );
}