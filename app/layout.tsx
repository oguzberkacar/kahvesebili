import type { Metadata } from "next";
import "./globals.css";

import { MasterProvider } from "./context/MasterContext";

export const metadata: Metadata = {
  title: "Kahve Makinesi",
  description: "Kahve makinesi arayüzü",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kardora",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-quaternary">
        <MasterProvider>{children}</MasterProvider>
      </body>
    </html>
  );
}
