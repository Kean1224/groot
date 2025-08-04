
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
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http: https:; font-src 'self' data:; connect-src 'self' http://localhost:5000 https://api.all4youauctions.co.za ws://localhost:5050 ws://localhost:5051 wss://api.all4youauctions.co.za; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';" 
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#facc15" />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
