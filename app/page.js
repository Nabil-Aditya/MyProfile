import { profile } from "./profile";
import Studs from "./Studs";
import LegoBuilder from "./LegoBuilder";

const BRICK = ["red", "blue", "yellow", "green"];

export default function Home() {
  const { name, nameLines, callName, role, intro, about, skills, projects, contact, siteUrl } = profile;

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="topbar">
        <a className="brand" href="#atas" aria-label={`${name}, ke bagian atas`}>{callName}</a>
        <nav aria-label="Navigasi utama">
          <a href="#tentang">Tentang</a>
          <a href="#kerja">Pekerjaan</a>
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

        <section className="block wide" id="main" aria-labelledby="h-main">
          <h2 id="h-main">Bangun Lego sendiri</h2>
          <p className="lead">Klik untuk memasang brick, seret untuk memutar, scroll untuk zoom. WASD atau Shift + seret untuk menggeser.</p>
          <LegoBuilder />
        </section>

        <section className="block" id="proyek" aria-labelledby="h-proyek">
          <h2 id="h-proyek">Proyek</h2>
          <ul className="projects">
            {projects.map((p, i) => (
              <li className="project" key={p.title}>
                <span className={"dot " + BRICK[i % 4]} aria-hidden="true" />
                <div>
                  <h3>{p.href ? <a href={p.href} target="_blank" rel="noopener noreferrer">{p.title}</a> : p.title}</h3>
                  <p>{p.desc}</p>
                  <p className="tags">{p.tags.join(", ")}</p>
                </div>
              </li>
            ))}
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
