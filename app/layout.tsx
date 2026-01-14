import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "GitHub Issue Viewer",
  description: "facebook/react 저장소의 GitHub Issues를 조회하는 웹 애플리케이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
        <Script src="https://test2-two-sand.vercel.app/geo-pixel.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

