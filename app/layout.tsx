import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { MasterProvider } from "./context/MasterContext";

const mont = localFont({
  src: [
    { path: "../public/font/Mont-Hairline.otf", weight: "100", style: "normal" },
    {
      path: "../public/font/Mont-HairlineItalic.otf",
      weight: "100",
      style: "italic",
    },
    { path: "../public/font/Mont-Thin.otf", weight: "200", style: "normal" },
    {
      path: "../public/font/Mont-ThinItalic.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../public/font/Mont-ExtraLight.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/font/Mont-ExtraLightItalic.otf",
      weight: "300",
      style: "italic",
    },
    { path: "../public/font/Mont-Book.otf", weight: "400", style: "normal" },
    {
      path: "../public/font/Mont-BookItalic.otf",
      weight: "400",
      style: "italic",
    },
    { path: "../public/font/Mont-Regular.otf", weight: "500", style: "normal" },
    {
      path: "../public/font/Mont-RegularItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/font/Mont-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/font/Mont-SemiBoldItalic.otf",
      weight: "600",
      style: "italic",
    },
    { path: "../public/font/Mont-Bold.otf", weight: "700", style: "normal" },
    {
      path: "../public/font/Mont-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    { path: "../public/font/Mont-Heavy.otf", weight: "800", style: "normal" },
    {
      path: "../public/font/Mont-HeavyItalic.otf",
      weight: "800",
      style: "italic",
    },
    { path: "../public/font/Mont-Black.otf", weight: "900", style: "normal" },
    {
      path: "../public/font/Mont-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-mont",
  display: "swap",
});

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
    <html lang="en" className={mont.variable}>
      <body className={`${mont.className} bg-quaternary`}>
        <MasterProvider>{children}</MasterProvider>
      </body>
    </html>
  );
}
