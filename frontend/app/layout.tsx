
import "../styles/globals.css";
import Layout from "../components/Layout";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "All4You Auctioneers",
  description: "South Africa's trusted online auction platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Service worker registration removed from layout (server component). If needed, move to a client component.
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#facc15" />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
