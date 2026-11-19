"use client";
import { useState } from "react";

const PALETTE = ["#e3000b", "#0055bf", "#ffd500", "#237841", "#fe8a18", "#e3000b", "#0055bf", "#ffd500"];

export default function Studs() {
  const [on, setOn] = useState(Array(8).fill(false));
  const [rain, setRain] = useState(0);
  const done = on.every(Boolean);

  const tap = (i) => {
    const next = on.map((v, k) => (k === i ? !v : v));
    setOn(next);
    if (next.every(Boolean)) setRain((r) => r + 1);
  };

  return (
    <div className="studs">
      <div className="stud-row" role="group" aria-label="Nyalakan semua stud">
        {PALETTE.map((c, i) => (
          <button key={i} className={"stud" + (on[i] ? " lit" : "")} style={{ "--c": c }} aria-pressed={on[i]} aria-label={"Stud " + (i + 1)} onClick={() => tap(i)} />
        ))}
      </div>
      <p className="stud-hint" aria-live="polite">
        {done ? "Mantap! Semua stud menyala. Sekarang main Lego di bawah." : "Klik semua stud untuk kejutan kecil. " + on.filter(Boolean).length + "/8"}
      </p>
      {rain > 0 && (
        <div className="rain" key={rain} aria-hidden="true">
          {Array.from({ length: 36 }).map((_, i) => (
            <i key={i} style={{ "--x": (i * 29) % 100 + "%", "--d": (i % 7) * 0.18 + "s", "--c": PALETTE[i % 8], "--w": 24 + (i % 4) * 10 + "px" }} />
          ))}
        </div>
      )}
    </div>
  );
}
