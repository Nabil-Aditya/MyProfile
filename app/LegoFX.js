"use client";
import { useEffect, useRef, useState } from "react";

const COL = ["#e3000b", "#0055bf", "#f2cd37", "#237841", "#fe8a18"];
const N = 14; // tinggi menara brick di pojok kanan bawah
const SEL = ".block > h2, .block .lead, .prose p, .skills .brick, .stats li, .tl-card, .project, .contact-inner > h2, .contact-inner .mail";

// brick latar yang melayang mengikuti scroll (parallax)
const FB = Array.from({ length: 12 }, (_, i) => {
  const w = 44 + (i % 4) * 22;
  return { l: (i * 37 + 6) % 92, t: (i * 53 + 4) % 90, w, h: 26 + (i % 3) * 8, n: Math.round(w / 20), c: COL[i % 5], k: 0.12 + (i % 5) * 0.09, r: ((i * 29) % 40) - 20 };
});

// bentuk brick yang "hujan" saat scroll
const PIECES = [
  { w: 36, h: 22, n: 2 },
  { w: 72, h: 22, n: 4 },
  { w: 54, h: 22, n: 3 },
  { w: 36, h: 36, n: 2 },
  { w: 18, h: 22, n: 1 },
];

let soundOn = true; // suara default NYALA
let ctx = null;
function beep(f) {
  if (!soundOn) return;
  try {
    const A = ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());
    if (A.state === "suspended") A.resume();
    const o = A.createOscillator(), g = A.createGain();
    o.type = "square";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.05, A.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, A.currentTime + 0.08);
    o.connect(g);
    g.connect(A.destination);
    o.start();
    o.stop(A.currentTime + 0.09);
  } catch {}
}

export default function LegoFX() {
  const fbs = useRef([]);
  const [cnt, setCnt] = useState(0);
  const [snd, setSnd] = useState(true);
  const [motion, setMotion] = useState(null); // null = belum dicek, true = animasi nyala
  const [osReduce, setOsReduce] = useState(false); // perangkat meminta "kurangi gerakan"
  const prev = useRef(0);

  // cek pengaturan perangkat + pilihan yang pernah disimpan pengunjung
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let saved = null;
    try { saved = localStorage.getItem("motion"); } catch {}
    setOsReduce(reduce);
    setMotion(saved ? saved === "on" : !reduce);

    let savedSnd = null;
    try { savedSnd = localStorage.getItem("sound"); } catch {}
    soundOn = savedSnd !== "off";
    setSnd(soundOn);
  }, []);

  // CSS memakai atribut ini untuk menentukan animasi boleh jalan atau tidak
  useEffect(() => {
    if (motion !== null) document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);

  // browser memblokir suara sebelum ada sentuhan pertama: buka kuncinya di sentuhan pertama
  useEffect(() => {
    const evs = ["pointerdown", "touchend", "keydown", "click"];
    const unlock = () => {
      try {
        const A = ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());
        if (A.state === "suspended") {
          A.resume().then(() => {
            if (A.state === "running") evs.forEach((t) => removeEventListener(t, unlock));
          });
        } else {
          evs.forEach((t) => removeEventListener(t, unlock));
        }
      } catch {}
    };
    evs.forEach((t) => addEventListener(t, unlock, { passive: true }));
    return () => evs.forEach((t) => removeEventListener(t, unlock));
  }, []);

  useEffect(() => {
    if (cnt !== prev.current) beep(280 + cnt * 35);
    prev.current = cnt;
  }, [cnt]);

  useEffect(() => {
    if (motion === null) return;
    const rm = !motion;
    const root = document.documentElement;
    const coarse = matchMedia("(pointer: coarse)").matches; // HP / tablet
    const STEP = coarse ? 150 : 110; // tiap sekian px scroll muncul 1 brick
    const CAP = coarse ? 16 : 36; // batas brick yang tampil bersamaan

    // lapisan brick yang jatuh / naik saat scroll
    const shower = document.createElement("div");
    shower.className = "shower";
    document.body.appendChild(shower);

    const spawn = (dir) => {
      if (shower.childElementCount >= CAP) return;
      const p = PIECES[(Math.random() * PIECES.length) | 0];
      const s = 0.9 + Math.random() * 0.8;
      const el = document.createElement("b");
      el.className = "sb " + (dir > 0 ? "dn" : "up");
      el.style.cssText =
        `left:${(4 + Math.random() * 90).toFixed(1)}%;--w:${(p.w * s).toFixed(0)}px;--h:${(p.h * s).toFixed(0)}px;--n:${p.n};` +
        `--c:${COL[(Math.random() * 5) | 0]};--t:${(1.5 + Math.random() * 1.4).toFixed(2)}s;` +
        `--rot:${((Math.random() - 0.5) * 540) | 0}deg;--sx:${((Math.random() - 0.5) * 140) | 0}px`;
      shower.appendChild(el);
      el.addEventListener("animationend", () => el.remove(), { once: true });
    };

    let last = scrollY, prevY = scrollY, acc = 0, ticking = false;

    const upd = () => {
      ticking = false;
      const sy = scrollY;
      const max = Math.max(1, root.scrollHeight - innerHeight);
      const p = Math.min(1, Math.max(0, sy / max));
      if (Math.abs(sy - last) > 2) { root.style.setProperty("--dir", sy > last ? -1 : 1); last = sy; }
      root.style.setProperty("--p", (p * 100).toFixed(1) + "%");
      setCnt(Math.round(p * N));

      if (!rm) {
        // hujan brick: turun saat scroll ke bawah, naik saat scroll ke atas
        const d = sy - prevY;
        prevY = sy;
        acc += Math.abs(d);
        let n = 0;
        while (acc > STEP && n < 3) { spawn(d > 0 ? 1 : -1); acc -= STEP; n++; }
        if (acc > STEP * 4) acc = 0;

        const span = innerHeight + 160;
        fbs.current.forEach((el, i) => {
          if (!el) return;
          const f = FB[i];
          const y = ((((f.t / 100) * innerHeight - sy * f.k) % span) + span) % span - 80;
          el.style.transform = `translate3d(0,${y}px,0) rotate(${f.r + sy * f.k * 0.08}deg)`;
        });
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    upd();

    // elemen "jatuh" dari atas saat scroll turun, "muncul" dari bawah saat scroll naik
    let io;
    const els = rm ? [] : [...document.querySelectorAll(SEL)];
    if (els.length) {
      els.forEach((el) => {
        el.classList.add("rv");
        el.style.setProperty("--r", (Math.random() * 10 - 5).toFixed(1) + "deg");
      });
      io = new IntersectionObserver(
        (es) => es.forEach((e) => {
          const el = e.target;
          if (e.isIntersecting) {
            const idx = Array.prototype.indexOf.call(el.parentNode.children, el);
            el.style.transitionDelay = ((idx % 4) * 0.08).toFixed(2) + "s";
            el.classList.add("in");
            setTimeout(() => { el.style.transitionDelay = ""; }, 900);
          } else el.classList.remove("in");
        }),
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      els.forEach((el) => io.observe(el));
    }

    // ketuk / klik: brick kecil meledak (tidak muncul saat sedang scroll)
    const fx = document.createElement("div");
    fx.className = "fx";
    document.body.appendChild(fx);
    const burst = (x, y) => {
      for (let i = 0; i < 7; i++) {
        const b = document.createElement("i");
        b.style.cssText = `left:${x}px;top:${y}px;--c:${COL[i % 5]};--dx:${((Math.random() - 0.5) * 260).toFixed(0)}px;--dy:${(60 + Math.random() * 120).toFixed(0)}px;--r:${((Math.random() - 0.5) * 720).toFixed(0)}deg`;
        fx.appendChild(b);
        setTimeout(() => b.remove(), 1000);
      }
      beep(660);
    };
    let dn = null;
    const onDown = (e) => { dn = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; };
    const onUp = (e) => {
      if (!dn || dn.id !== e.pointerId) return;
      const ok = Math.hypot(e.clientX - dn.x, e.clientY - dn.y) < 10 && performance.now() - dn.t < 500;
      dn = null;
      if (!ok || rm) return;
      if (e.target.closest && e.target.closest("a,button,canvas,input,textarea")) return;
      burst(e.clientX, e.clientY);
    };
    const onCancel = () => { dn = null; };
    addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onCancel);

    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onCancel);
      io && io.disconnect();
      els.forEach((el) => el.classList.remove("rv", "in"));
      fx.remove();
      shower.remove();
    };
  }, [motion]);

  const toggleSound = () => {
    soundOn = !soundOn;
    setSnd(soundOn);
    try { localStorage.setItem("sound", soundOn ? "on" : "off"); } catch {}
    beep(520);
  };
  const toggleMotion = () => {
    const n = !motion;
    setMotion(n);
    try { localStorage.setItem("motion", n ? "on" : "off"); } catch {}
  };

  return (
    <>
      <div className="pbar" aria-hidden="true" />
      <div className="fb-layer" aria-hidden="true">
        {FB.map((f, i) => (
          <div key={i} ref={(el) => (fbs.current[i] = el)} className="fb" style={{ left: f.l + "%", "--w": f.w + "px", "--h": f.h + "px", "--n": f.n, "--c": f.c }} />
        ))}
      </div>
      <button className="tower" onClick={() => scrollTo({ top: 0, behavior: "smooth" })} aria-label="Menara brick progres scroll, ketuk untuk kembali ke atas" title="Kembali ke atas">
        <em>{cnt === N ? "🏆 Selesai!" : Math.round((cnt / N) * 100) + "%"}</em>
        {Array.from({ length: N }).map((_, i) => (
          <span key={i} className={"tw-b" + (i < cnt ? " on" : "")} style={{ "--c": COL[i % 5] }} />
        ))}
      </button>
      {osReduce && (
        <button className="mot" onClick={toggleMotion} aria-pressed={!!motion}>
          ✨ Animasi: {motion ? "ON" : "OFF"}
        </button>
      )}
      <button className="snd" onClick={toggleSound} aria-pressed={snd}>
        {snd ? "🔊" : "🔇"}<span className="snd-t"> Suara brick</span>
      </button>
    </>
  );
}