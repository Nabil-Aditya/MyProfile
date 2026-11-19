import { profile } from "./profile";
import Studs from "./Studs";
import LegoBuilder from "./LegoBuilder";
import LegoFX from "./LegoFX";

const BRICK = ["red", "blue", "yellow", "green"];

// logo ada di folder public/logos/. Dicocokkan otomatis lewat nama proyek.
const LOGOS = [
  { re: /pawku/i, src: "/logos/pawku.png", alt: "Logo PawKu", w: 400, h: 385 },
  { re: /voltawaste/i, src: "/logos/voltawaste.png", alt: "Logo Voltawaste", w: 400, h: 118 },
  { re: /ecozyne/i, src: "/logos/ecozyne.png", alt: "Logo Ecozyne", w: 315, h: 400 },
  { re: /sipelita/i, src: "/logos/sipelita.jpg", alt: "Logo SIPELITA", w: 400, h: 400 },
];
const logoOf = (...parts) => {
  const s = parts.join(" ");
  return LOGOS.find((l) => l.re.test(s));
};

export default function Home() {
  const { name, nameLines, callName, role, intro, about, skills, projects, contact, siteUrl, stats, experience } = profile;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    alternateName: [callName, "Nabil Aditya", "Nabil Aditya Putera"],
    url: siteUrl,
    description: intro,
    jobTitle: ["Software Engineer", "Project Manager"],
    knowsAbout: ["Artificial Intelligence", "Internet of Things", "Cybersecurity", "Software Engineering", "Project Management"],
    email: contact.email,
    sameAs: contact.links.map((l) => l.href),
  };

  return (
    <>
      <LegoFX />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="topbar">
        <a className="brand" href="#atas" aria-label={`${name}, ke bagian atas`}>{callName}</a>
        <nav aria-label="Navigasi utama">
          <a href="#tentang">Tentang</a>
          <a href="#kerja">Pekerjaan</a>
          <a href="#pengalaman">Pengalaman</a>
          <a href="#main">Main Lego</a>
          <a href="#proyek">Proyek</a>
          <a href="#kontak">Kontak</a>
        </nav>
      </header>

      <main id="atas">
        <section className="hero">
          <div className="hero-text">
            <h1 className="name" aria-label={name}>
              {nameLines.map((line, i) => (
                <span className={"chip " + BRICK[i % 4]} aria-hidden="true" key={line} style={{ "--i": i }}>{line}</span>
              ))}
            </h1>
            <p className="role">{role}</p>
            <p className="intro">{intro}</p>
            <div className="actions">
              <a className="btn" href="#main">Main Lego 3D</a>
              <a className="textlink" href="#kontak">Hubungi saya</a>
            </div>
            <ul className="stats">
              {stats.map((s, i) => (
                <li className={BRICK[i % 4]} key={s.label}>
                  <b>{s.n}</b>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hero-photo">
            <div className="plate">
              <img src="/nabil.png" alt={`Foto ${name}`} width="608" height="800" />
            </div>
            <Studs />
          </div>
        </section>

        <section className="block" id="tentang" aria-labelledby="h-tentang">
          <h2 id="h-tentang">Tentang saya</h2>
          <div className="prose">{about.map((p) => <p key={p}>{p}</p>)}</div>
        </section>

        <section className="block" id="kerja" aria-labelledby="h-kerja">
          <h2 id="h-kerja">Yang saya kerjakan</h2>
          <ul className="skills">
            {skills.map((s, i) => (
              <li className={"brick " + BRICK[i % 4]} key={s.name}>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="block wide" id="pengalaman" aria-labelledby="h-pengalaman">
          <h2 id="h-pengalaman">Perjalanan saya</h2>
          <ol className="timeline">
            {experience.map((e, i) => {
              const logo = logoOf(e.title, e.desc);
              return (
                <li className={"tl-item " + BRICK[i % 4]} key={e.title + e.period}>
                  <span className="tl-stud" aria-hidden="true" />
                  <div className="tl-card">
                    {logo && <img className="tl-logo" src={logo.src} alt={logo.alt} width={logo.w} height={logo.h} loading="lazy" />}
                    <div className="tl-head">
                      <span className="tl-period">{e.period}</span>
                      {e.now && <span className="tl-badge now">Saat ini</span>}
                      {e.award && <span className="tl-badge award">{e.award}</span>}
                    </div>
                    <h3>{e.title}</h3>
                    <p className="tl-org">{e.org} · {e.type}</p>
                    <p>{e.desc}</p>
                    <p className="tags">{e.tags.join(", ")}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="block wide" id="main" aria-labelledby="h-main">
          <h2 id="h-main">Bangun Lego sendiri</h2>
          <p className="lead">Ketuk atau klik untuk memasang brick, seret untuk memutar, cubit dua jari atau scroll untuk zoom. Di komputer, WASD atau Shift + seret untuk menggeser. Di HP, geser dari area di luar kotak game kalau mau scroll halaman.</p>
          <LegoBuilder />
        </section>

        <section className="block" id="proyek" aria-labelledby="h-proyek">
          <h2 id="h-proyek">Proyek</h2>
          <ul className="projects">
            {projects.map((p, i) => {
              const logo = logoOf(p.title);
              return (
                <li className={"project" + (logo ? " has-logo" : "")} key={p.title}>
                  {logo ? (
                    <span className="logo-plate">
                      <img src={logo.src} alt={logo.alt} width={logo.w} height={logo.h} loading="lazy" />
                    </span>
                  ) : (
                    <span className={"dot " + BRICK[i % 4]} aria-hidden="true" />
                  )}
                  <div>
                    <h3>{p.href ? <a href={p.href} target="_blank" rel="noopener noreferrer">{p.title}</a> : p.title}</h3>
                    <p>{p.desc}</p>
                    <p className="tags">{p.tags.join(", ")}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className="contact" id="kontak">
        <div className="contact-inner">
          <h2>Ada yang ingin dibicarakan?</h2>
          <a className="mail" href={`mailto:${contact.email}`}>{contact.email}</a>
          <ul className="social">
            {contact.links.map((l) => (
              <li key={l.label}><a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a></li>
            ))}
          </ul>
          <p className="legal">&copy; {new Date().getFullYear()} {name}. Situs penggemar bertema brick, tidak berafiliasi dengan LEGO Group.</p>
        </div>
      </footer>
    </>
  );
}