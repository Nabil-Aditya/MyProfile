"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/* Palet warna brick Lego (nama + RGB mendekati warna aslinya) */
const PALETTE = [
  { name: "Putih", rgb: [244, 244, 244] },
  { name: "Hitam", rgb: [27, 42, 52] },
  { name: "Abu terang", rgb: [160, 165, 169] },
  { name: "Abu gelap", rgb: [99, 95, 98] },
  { name: "Merah", rgb: [196, 40, 27] },
  { name: "Oranye", rgb: [218, 133, 65] },
  { name: "Kuning", rgb: [245, 205, 47] },
  { name: "Hijau", rgb: [40, 127, 70] },
  { name: "Hijau terang", rgb: [164, 189, 71] },
  { name: "Biru", rgb: [13, 105, 171] },
  { name: "Biru muda", rgb: [116, 185, 224] },
  { name: "Cokelat tua", rgb: [105, 64, 39] },
  { name: "Tan", rgb: [215, 197, 153] },
  { name: "Kulit", rgb: [238, 196, 164] },
  { name: "Pink", rgb: [255, 152, 194] },
  { name: "Ungu", rgb: [107, 50, 123] },
];

const SIZES = [
  { label: "Kasar", n: 32 },
  { label: "Sedang", n: 48 },
  { label: "Halus", n: 64 },
];

const CELL = 16; // ukuran satu brick pada hasil akhir (px)

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

function nearest(r, g, b) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < PALETTE.length; i++) {
    const [pr, pg, pb] = PALETTE[i].rgb;
    // jarak warna berbobot (mata lebih sensitif ke hijau)
    const rm = (r + pr) / 2;
    const dr = r - pr, dg = g - pg, db = b - pb;
    const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

function drawBrick(ctx, x, y, s, rgb) {
  ctx.fillStyle = css(rgb);
  ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = css(mix(rgb, [0, 0, 0], 0.28));
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);

  const cx = x + s / 2, cy = y + s / 2, r = s * 0.31;
  // bayangan stud
  ctx.fillStyle = css(mix(rgb, [0, 0, 0], 0.3));
  ctx.beginPath(); ctx.arc(cx + s * 0.04, cy + s * 0.06, r, 0, Math.PI * 2); ctx.fill();
  // badan stud
  ctx.fillStyle = css(mix(rgb, [255, 255, 255], 0.12));
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  // kilau
  ctx.strokeStyle = "rgba(255,255,255,.45)";
  ctx.lineWidth = Math.max(1, s * 0.07);
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.68, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke();
}

export default function LegoCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const outRef = useRef(null);
  const fileRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | starting | live | result
  const [error, setError] = useState("");
  const [facing, setFacing] = useState("user");
  const [size, setSize] = useState(48);
  const [counts, setCounts] = useState([]);
  const [count, setCount] = useState(0);
  const lastSource = useRef(null); // simpan sumber agar bisa diganti ukuran tanpa foto ulang

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopStream, [stopStream]);

  const startCamera = useCallback(async (mode = facing) => {
    setError("");
    setStatus("starting");
    stopStream();
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Browser ini tidak mendukung kamera. Coba unggah foto saja.");
      setStatus("idle");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      v.srcObject = stream;
      await v.play();
      setStatus("live");
    } catch (e) {
      setError(
        e && e.name === "NotAllowedError"
          ? "Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser, lalu coba lagi."
          : "Kamera tidak bisa dibuka. Pastikan tidak sedang dipakai aplikasi lain, atau unggah foto saja."
      );
      setStatus("idle");
    }
  }, [facing, stopStream]);

  /* Ubah sumber gambar (video / img) menjadi mosaik Lego */
  const render = useCallback((source, n, mirror) => {
    const sw = source.videoWidth || source.naturalWidth || source.width;
    const sh = source.videoHeight || source.naturalHeight || source.height;
    const side = Math.min(sw, sh);
    const sx = (sw - side) / 2, sy = (sh - side) / 2;

    const tiny = document.createElement("canvas");
    tiny.width = tiny.height = n;
    const tctx = tiny.getContext("2d", { willReadFrequently: true });
    tctx.imageSmoothingQuality = "high";
    if (mirror) { tctx.translate(n, 0); tctx.scale(-1, 1); }
    tctx.drawImage(source, sx, sy, side, side, 0, 0, n, n);

    const { data } = tctx.getImageData(0, 0, n, n);
    const out = outRef.current;
    out.width = out.height = n * CELL;
    const ctx = out.getContext("2d");
    const tally = new Array(PALETTE.length).fill(0);

    for (let i = 0; i < n * n; i++) {
      let r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
      // sedikit naikkan kontras dan saturasi supaya wajah lebih jelas
      const avg = (r + g + b) / 3;
      r = (r - avg) * 1.25 + avg; g = (g - avg) * 1.25 + avg; b = (b - avg) * 1.25 + avg;
      r = (r - 128) * 1.15 + 128; g = (g - 128) * 1.15 + 128; b = (b - 128) * 1.15 + 128;
      const k = nearest(Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b)));
      tally[k]++;
      drawBrick(ctx, (i % n) * CELL, Math.floor(i / n) * CELL, CELL, PALETTE[k].rgb);
    }

    setCount(n * n);
    setCounts(
      tally.map((c, i) => ({ ...PALETTE[i], c })).filter((p) => p.c > 0).sort((a, b) => b.c - a.c)
    );
  }, []);

  const snap = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    // bekukan frame terakhir supaya bisa dirender ulang saat ukuran diganti
    const frame = document.createElement("canvas");
    frame.width = v.videoWidth; frame.height = v.videoHeight;
    frame.getContext("2d").drawImage(v, 0, 0);
    lastSource.current = { el: frame, mirror: facing === "user" };
    render(frame, size, facing === "user");
    stopStream();
    setStatus("result");
  }, [facing, render, size, stopStream]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      stopStream();
      lastSource.current = { el: img, mirror: false };
      setStatus("result");
      // tunggu canvas muncul di DOM
      requestAnimationFrame(() => render(img, size, false));
    };
    img.onerror = () => setError("File gambar tidak bisa dibaca.");
    img.src = URL.createObjectURL(f);
    e.target.value = "";
  };

  const changeSize = (n) => {
    setSize(n);
    if (status === "result" && lastSource.current) {
      render(lastSource.current.el, n, lastSource.current.mirror);
    }
  };

  const flip = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    startCamera(next);
  };

  const download = () => {
    outRef.current.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "wajah-lego.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png");
  };

  const showVideo = status === "live" || status === "starting";

  return (
    <div className="lc">
      <style>{STYLE}</style>

      <div className="lc-stage">
        <video
          ref={videoRef}
          className={"lc-video" + (facing === "user" ? " mirror" : "")}
          style={{ display: showVideo ? "block" : "none" }}
          playsInline
          muted
        />
        <canvas
          ref={outRef}
          className="lc-out"
          style={{ display: status === "result" ? "block" : "none" }}
          aria-label="Hasil foto versi Lego"
        />
        {(status === "idle" || status === "starting") && (
          <div className="lc-empty">
            <div className="lc-studs" aria-hidden="true">
              {Array.from({ length: 16 }, (_, i) => <i key={i} className={"s" + (i % 4)} />)}
            </div>
            <p>{status === "starting" ? "Membuka kamera…" : "Nyalakan kamera, lalu potret wajahmu. Hasilnya disusun dari brick Lego."}</p>
          </div>
        )}
      </div>

      <div className="lc-sizes" role="group" aria-label="Kehalusan mosaik">
        {SIZES.map((s) => (
          <button key={s.n} type="button" className={size === s.n ? "on" : ""} onClick={() => changeSize(s.n)} aria-pressed={size === s.n}>
            {s.label} <small>{s.n}×{s.n}</small>
          </button>
        ))}
      </div>

      <div className="lc-actions">
        {status === "idle" && (
          <>
            <button type="button" className="primary" onClick={() => startCamera()}>Nyalakan kamera</button>
            <button type="button" onClick={() => fileRef.current?.click()}>Unggah foto</button>
          </>
        )}
        {status === "live" && (
          <>
            <button type="button" className="primary" onClick={snap}>Potret</button>
            <button type="button" onClick={flip}>Balik kamera</button>
            <button type="button" onClick={() => { stopStream(); setStatus("idle"); }}>Matikan</button>
          </>
        )}
        {status === "result" && (
          <>
            <button type="button" className="primary" onClick={download}>Simpan PNG</button>
            <button type="button" onClick={() => startCamera()}>Potret ulang</button>
            <button type="button" onClick={() => fileRef.current?.click()}>Unggah foto</button>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>

      {error && <p className="lc-error" role="alert">{error}</p>}

      {status === "result" && (
        <div className="lc-parts">
          <p><b>{count.toLocaleString("id-ID")}</b> brick dipakai, {counts.length} warna</p>
          <ul>
            {counts.map((p) => (
              <li key={p.name}>
                <span className="sw" style={{ background: css(p.rgb) }} />
                {p.name} <b>{p.c}</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const STYLE = `
.lc{--r:#c4281b;--b:#0d69ab;--y:#f5cd2f;--g:#287f46;max-width:560px;margin:0 auto;display:grid;gap:14px}
.lc-stage{position:relative;aspect-ratio:1;width:100%;background:#1b2a34;border:4px solid #1b2a34;border-radius:10px;overflow:hidden;box-shadow:0 6px 0 #0d69ab}
.lc-video,.lc-out{width:100%;height:100%;object-fit:cover;display:block}
.lc-video.mirror{transform:scaleX(-1)}
.lc-empty{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:16px;padding:24px;text-align:center;color:#f4f4f4}
.lc-empty p{margin:0;max-width:30ch;line-height:1.5}
.lc-studs{display:grid;grid-template-columns:repeat(4,28px);gap:8px}
.lc-studs i{width:28px;height:28px;border-radius:50%;box-shadow:inset 0 -3px 0 rgba(0,0,0,.3)}
.lc-studs .s0{background:var(--r)}.lc-studs .s1{background:var(--b)}.lc-studs .s2{background:var(--y)}.lc-studs .s3{background:var(--g)}
.lc-sizes{display:flex;gap:8px;flex-wrap:wrap}
.lc-sizes button{flex:1;min-width:96px}
.lc-sizes small{opacity:.65;margin-left:4px}
.lc-actions{display:flex;gap:8px;flex-wrap:wrap}
.lc button{font:inherit;font-weight:600;padding:10px 16px;border:3px solid #1b2a34;border-radius:8px;background:#fff;color:#1b2a34;cursor:pointer;box-shadow:0 3px 0 #1b2a34;transition:transform .08s,box-shadow .08s}
.lc button:active{transform:translateY(3px);box-shadow:0 0 0 #1b2a34}
.lc button:focus-visible{outline:3px solid var(--b);outline-offset:2px}
.lc button.primary{background:var(--r);color:#fff}
.lc-sizes button.on{background:var(--y)}
.lc-error{margin:0;padding:10px 12px;border-left:5px solid var(--r);background:rgba(196,40,27,.1)}
.lc-parts p{margin:0 0 8px}
.lc-parts ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.9rem}
.lc-parts li{display:flex;align-items:center;gap:6px}
.lc-parts .sw{width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,.35)}
@media (prefers-reduced-motion:reduce){.lc button{transition:none}}
`;