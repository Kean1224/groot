
"use client";
import "../styles/globals.css";
import Layout from "../components/Layout";
import type { Metadata } from "next";
import React, { useEffect } from "react";

export const metadata: Metadata = {
  title: "All4You Auctioneers",
  description: "South Africa's trusted online auction platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Register service worker for PWA
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  }, []);
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
