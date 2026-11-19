"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const COLORS = ["#e3000b", "#0055bf", "#f2cd37", "#237841", "#ffffff", "#1b2a34", "#fe8a18", "#a0a5a9"];
const SIZES = [[1, 1], [1, 2], [2, 2], [2, 4], [1, 4]];
const H = 1.2;

export default function LegoBuilder() {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const cur = useRef({ c: 0, s: 2, rot: false, del: false, pan: false });
  const api = useRef({});
  const [ui, setUi] = useState({ c: 0, s: 2, rot: false, del: false, pan: false });
  const [count, setCount] = useState(0);

  const set = (patch) => {
    Object.assign(cur.current, patch);
    api.current.resetGhost && api.current.resetGhost();
    setUi({ ...cur.current });
  };

  useEffect(() => {
    const cv = canvas.current;
    const el = wrap.current;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    R.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
    R.setClearColor(0xbfe3ff);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xbfe3ff, 120, 320);
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 600);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x778899, 1.6));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(10, 25, 8);
    scene.add(dl);

    const stG = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14);
    const tc = document.createElement("canvas");
    tc.width = tc.height = 128;
    const x = tc.getContext("2d");
    x.fillStyle = "#2f9e5b"; x.fillRect(0, 0, 128, 128);
    x.strokeStyle = "#278a4e"; x.lineWidth = 3; x.strokeRect(0, 0, 128, 128);
    x.fillStyle = "#3cb870"; x.beginPath(); x.arc(64, 64, 38, 0, 7); x.fill(); x.stroke();
    const tx = new THREE.CanvasTexture(tc);
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(800, 800);
    tx.anisotropy = 8;
    tx.colorSpace = THREE.SRGBColorSpace;
    const base = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ map: tx }));
    base.rotation.x = -Math.PI / 2;
    scene.add(base);

    const bricks = [], occ = {}, hist = [];
    const key = (a, b, c) => a + "," + b + "," + c;
    const dims = () => (cur.current.rot ? [SIZES[cur.current.s][1], SIZES[cur.current.s][0]] : SIZES[cur.current.s]);

    function makeBrick(w, d, col, ghost) {
      const g = new THREE.Group();
      const m = new THREE.MeshLambertMaterial({ color: col, transparent: !!ghost, opacity: ghost ? 0.55 : 1 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, H, d - 0.04), m);
      b.position.set(w / 2, H / 2, d / 2);
      g.add(b);
      for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) {
        const s = new THREE.Mesh(stG, m);
        s.position.set(i + 0.5, H + 0.1, j + 0.5);
        g.add(s);
      }
      return g;
    }
    const fits = (px, py, pz, w, d) => {
      if (py < 0 || py > 60) return false;
      for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) if (occ[key(px + i, py, pz + j)]) return false;
      return true;
    };
    function place(px, py, pz, w, d, col) {
      const g = makeBrick(w, d, col);
      g.position.set(px, py * H, pz);
      scene.add(g);
      const o = { g, x: px, y: py, z: pz, w, d };
      g.userData.o = o;
      bricks.push(o);
      for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) occ[key(px + i, py, pz + j)] = o;
      hist.push(o);
      setCount(bricks.length);
    }
    function remove(o) {
      scene.remove(o.g);
      bricks.splice(bricks.indexOf(o), 1);
      for (let i = 0; i < o.w; i++) for (let j = 0; j < o.d; j++) delete occ[key(o.x + i, o.y, o.z + j)];
      const k = hist.indexOf(o);
      if (k > -1) hist.splice(k, 1);
      setCount(bricks.length);
    }

    let ghost = null, ghostKey = "";
    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
    function target(ev) {
      const r = cv.getBoundingClientRect();
      mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mouse, cam);
      const hit = ray.intersectObjects([base].concat(bricks.map((b) => b.g)), true)[0];
      if (!hit) return null;
      let o = hit.object, br = null;
      while (o) { if (o.userData && o.userData.o) { br = o.userData.o; break; } o = o.parent; }
      if (cur.current.del) return { brick: br };
      const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      const q = hit.point.clone().addScaledVector(n, 0.05);
      const dm = dims();
      return {
        x: Math.floor(q.x) - Math.floor(dm[0] / 2),
        z: Math.floor(q.z) - Math.floor(dm[1] / 2),
        y: Math.max(0, Math.floor(q.y / H)),
        w: dm[0], d: dm[1],
      };
    }
    function updGhost(ev) {
      // layar sentuh tidak punya "hover", jadi bayangan brick tidak ditampilkan
      if (ev.pointerType === "touch") { if (ghost) ghost.visible = false; return; }
      const t = target(ev);
      if (!t || cur.current.del || cur.current.pan) { if (ghost) ghost.visible = false; return; }
      const k = [t.x, t.y, t.z, t.w, t.d, cur.current.c].join();
      if (k !== ghostKey) {
        if (ghost) scene.remove(ghost);
        const ok = fits(t.x, t.y, t.z, t.w, t.d);
        ghost = makeBrick(t.w, t.d, ok ? COLORS[cur.current.c] : "#ff2222", true);
        ghost.position.set(t.x, t.y * H, t.z);
        scene.add(ghost);
        ghostKey = k;
      }
      ghost.visible = true;
    }

    let yaw = 0.8, pitch = 0.7, dist = 26;
    const tgt = new THREE.Vector3(8, 1, 8);
    const camUpd = () => {
      cam.position.set(tgt.x + dist * Math.cos(pitch) * Math.sin(yaw), tgt.y + dist * Math.sin(pitch), tgt.z + dist * Math.cos(pitch) * Math.cos(yaw));
      cam.lookAt(tgt);
    };

    // pointer: 1 jari = putar / pasang brick, 2 jari = cubit untuk zoom
    let down = null, moved = 0, last = null, pinch = 0;
    const pts = new Map();
    const two = () => {
      const [a, b] = [...pts.values()];
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    };
    const onDown = (e) => {
      pts.set(e.pointerId, e);
      if (pts.size === 2) { pinch = two(); moved = 99; if (ghost) ghost.visible = false; return; }
      down = e; last = e; moved = 0;
      cv.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (pts.has(e.pointerId)) pts.set(e.pointerId, e);
      if (pts.size === 2) {
        const d = two();
        if (pinch) dist = Math.max(8, Math.min(90, dist * (pinch / d)));
        pinch = d;
        return;
      }
      if (down) {
        const dx = e.clientX - last.clientX, dy = e.clientY - last.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        if (cur.current.pan || down.shiftKey || down.button === 2) {
          const k = dist * 0.0016;
          tgt.x += (-Math.cos(yaw) * dx - Math.sin(yaw) * dy) * k;
          tgt.z += (Math.sin(yaw) * dx - Math.cos(yaw) * dy) * k;
        } else {
          yaw -= dx * 0.007;
          pitch = Math.max(0.1, Math.min(1.5, pitch + dy * 0.007));
        }
        last = e;
        if (ghost) ghost.visible = false;
      } else updGhost(e);
    };
    const onUp = (e) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = 0;
      const tap = down && down.pointerType === "touch" ? 14 : 6; // jari lebih goyang dari mouse
      if (down && down.pointerId === e.pointerId && moved < tap && down.button === 0 && !cur.current.pan && !down.shiftKey) {
        const t = target(e);
        if (t) {
          if (cur.current.del) { if (t.brick) remove(t.brick); }
          else if (fits(t.x, t.y, t.z, t.w, t.d)) place(t.x, t.y, t.z, t.w, t.d, COLORS[cur.current.c]);
          ghostKey = "";
          updGhost(e);
        }
      }
      if (down && down.pointerId === e.pointerId) down = null;
    };
    const onCancel = (e) => {
      pts.delete(e.pointerId);
      pinch = 0;
      if (down && down.pointerId === e.pointerId) down = null;
    };
    const onWheel = (e) => { e.preventDefault(); dist = Math.max(8, Math.min(90, dist * (1 + e.deltaY * 0.001))); };
    const noMenu = (e) => e.preventDefault();
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onCancel);
    cv.addEventListener("wheel", onWheel, { passive: false });
    cv.addEventListener("contextmenu", noMenu);

    const keys = {};
    const kd = (e) => { if (el.contains(document.activeElement) || document.activeElement === document.body) keys[e.key.toLowerCase()] = 1; };
    const ku = (e) => { keys[e.key.toLowerCase()] = 0; };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    api.current.resetGhost = () => { ghostKey = ""; };
    api.current.undo = () => { const o = hist[hist.length - 1]; if (o) remove(o); };
    api.current.clear = () => bricks.slice().forEach(remove);
    api.current.demo = () => {
      api.current.clear();
      const rows = ["1111111", "1001001", "1011101", "1111111"];
      rows.forEach((r, i) => [...r].forEach((c, j) => { if (c === "1") place(5 + j, 0, 5 + i * 1, 1, 1, COLORS[(i + j) % 4]); }));
      for (let j = 0; j < 7; j++) place(5 + j, 1, 5, 1, 1, COLORS[2]);
    };

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      R.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    // hemat baterai: berhenti menggambar kalau area bermain tidak terlihat
    let vis = true;
    const vio = new IntersectionObserver(([en]) => { vis = en.isIntersecting; });
    vio.observe(el);

    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!vis) return;
      const sp = dist * 0.012;
      const fx = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0);
      const rx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
      tgt.x += (-Math.sin(yaw) * fx + Math.cos(yaw) * rx) * sp;
      tgt.z += (-Math.cos(yaw) * fx - Math.sin(yaw) * rx) * sp;
      base.position.set(Math.round(tgt.x), 0, Math.round(tgt.z));
      camUpd();
      R.render(scene, cam);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      vio.disconnect();
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onCancel);
      cv.removeEventListener("wheel", onWheel);
      cv.removeEventListener("contextmenu", noMenu);
      R.dispose();
    };
  }, []);

  return (
    <div className="builder" ref={wrap}>
      <canvas ref={canvas} style={{ touchAction: "none" }} aria-label="Area bermain Lego 3D" />
      <div className="b-top">Brick: {count}</div>
      <div className="b-bar">
        {COLORS.map((c, i) => (
          <button key={c} className={"sw" + (i === ui.c && !ui.del ? " on" : "")} style={{ background: c }} aria-label={"Warna " + c} onClick={() => set({ c: i, del: false })} />
        ))}
        <span className="sep" />
        {SIZES.map((s, i) => (
          <button key={i} className={i === ui.s ? "on" : ""} onClick={() => set({ s: i, del: false })}>{s[0]}×{s[1]}</button>
        ))}
        <span className="sep" />
        <button className={ui.rot ? "on" : ""} onClick={() => set({ rot: !ui.rot })}>↻ Putar</button>
        <button className={ui.pan ? "on" : ""} onClick={() => set({ pan: !ui.pan, del: false })}>✥ Geser</button>
        <button className={ui.del ? "on" : ""} onClick={() => set({ del: !ui.del })}>🗑 Hapus</button>
        <button onClick={() => api.current.undo()}>↶ Undo</button>
        <button onClick={() => api.current.demo()}>✨ Contoh</button>
        <button onClick={() => api.current.clear()}>Reset</button>
      </div>
    </div>
  );
}