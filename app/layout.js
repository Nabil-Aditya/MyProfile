import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/source-serif-4";
import "./globals.css";
import { profile } from "./profile";

export const metadata = {
  title: profile.name,
  description: profile.intro,
  openGraph: {
    title: profile.name,
    description: profile.intro,
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
