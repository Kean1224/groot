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
  return (
    <html lang="en">
      <head />
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
