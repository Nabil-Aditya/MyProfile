
import Script from "next/script";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/source-serif-4";
import "./globals.css";
import "./lego-fx.css";
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
      <head>
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),
                    dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-5J9MJLC6');
            `,
          }}
        />
      </head>

      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5J9MJLC6"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}
