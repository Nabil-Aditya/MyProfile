import { profile } from "./profile";

export default function Home() {
  const {
    name,
    nameLines,
    callName,
    role,
    intro,
    about,
    skills,
    projects,
    contact,
    siteUrl,
  } = profile;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    alternateName: [callName, "Nabil Aditya", "Nabil Aditya Putera"],
    url: siteUrl,
    description: intro,
    jobTitle: ["Software Engineer", "Project Manager"],
    knowsAbout: [
      "Artificial Intelligence",
      "Internet of Things",
      "Cybersecurity",
      "Software Engineering",
      "Project Management",
    ],
    email: contact.email,
    sameAs: contact.links.map((l) => l.href),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="topbar">
        <a className="brand" href="#atas" aria-label={`${name}, ke bagian atas`}>
          {callName}
        </a>
        <nav aria-label="Navigasi utama">
          <a href="#tentang">Tentang</a>
          <a href="#kerja">Pekerjaan</a>
          <a href="#proyek">Proyek</a>
          <a href="#kontak">Kontak</a>
        </nav>
      </header>

      <main id="atas">
        <section className="hero">
          <h1 className="name" aria-label={name}>
            {nameLines.map((line, i) => (
              <span className="name-line" aria-hidden="true" key={line}>
                <span className="name-word" style={{ "--i": i }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p className="role">{role}</p>

          <div className="hero-foot">
            <p className="intro">{intro}</p>
            <div className="actions">
              <a className="btn" href="#kontak">
                Hubungi saya
              </a>
              <a className="textlink" href="#proyek">
                Lihat proyek
              </a>
            </div>
          </div>
        </section>

        <section className="block" id="tentang" aria-labelledby="h-tentang">
          <h2 id="h-tentang">Tentang saya</h2>
          <div className="prose">
            {about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <section className="block" id="kerja" aria-labelledby="h-kerja">
          <h2 id="h-kerja">Yang saya kerjakan</h2>
          <dl className="rows">
            {skills.map((s) => (
              <div className="row" key={s.name}>
                <dt>{s.name}</dt>
                <dd>{s.desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="block" id="proyek" aria-labelledby="h-proyek">
          <h2 id="h-proyek">Proyek</h2>
          <ul className="rows">
            {projects.map((p) => (
              <li className="row project" key={p.title}>
                <div className="project-title">
                  {p.href ? (
                    <a href={p.href} target="_blank" rel="noopener noreferrer">
                      {p.title}
                    </a>
                  ) : (
                    <span>{p.title}</span>
                  )}
                </div>
                <div>
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
          <a className="mail" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          <ul className="social">
            {contact.links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="legal">
            &copy; {new Date().getFullYear()} {name}
          </p>
        </div>
      </footer>
    </>
  );
}