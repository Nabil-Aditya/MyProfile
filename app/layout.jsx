import "./globals.css";
import "./lego-fx.css"; // sesuaikan dengan nama file CSS-mu

export const metadata = {
  title: "Muhammad Nabil Aditya Putera",
  icons: {
    icon: "/nabil.png",
    apple: "/nabil.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}