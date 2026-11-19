import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/source-serif-4";
import "./globals.css";
import { profile } from "./profile";

const siteUrl = "https://www.nabiladitya.my.id";
const title = "Muhammad Nabil Aditya Putera (Nabil Aditya)";
const role = "Software Engineer | Project Manager | AI, IoT & Cybersecurity Enthusiast";
const description =
  "Muhammad Nabil Aditya Putera, biasa dipanggil Nabil Aditya. Software Engineer, Project Manager, dan penggiat AI, IoT, dan Cybersecurity dari Indonesia. Portofolio bertema Lego dengan game bangun Lego 3D.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${title} | Software Engineer & Project Manager`, template: "%s | Muhammad Nabil Aditya Putera" },
  description,
  alternates: { canonical: "/" },
  keywords: ["Muhammad Nabil Aditya Putera", "Nabil Aditya", "Nabil Aditya Putera", "Nabil", "Software Engineer Indonesia", "Project Manager", "AI", "IoT", "Cybersecurity", "portofolio"],
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: { title, description: role, url: siteUrl, siteName: "Muhammad Nabil Aditya Putera", type: "website", locale: "id_ID" },
  twitter: { card: "summary_large_image", title, description: role },
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0055bf" };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
