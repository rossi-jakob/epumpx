import type { Metadata } from "next";
import { Outfit, Exo_2 } from "next/font/google";

import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";

import "@rainbow-me/rainbowkit/styles.css";
import WalletProvider from "./providers";
const Exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://epumpx.vercel.app'),
  title: 'EPumpX',
  description: 'EPumpX is Pumpfun on EPIX chain.',
  openGraph: {
    title: 'EPumpX',
    description: 'EPumpX is Pumpfun on EPIX chain.',
    images: [{
      url: 'public/thumbnail.webp',
      width: 1280,
      height: 720,
      alt: 'EPumpX Logo',
    }],
    url: 'https://epumpx.vercel.app',
    siteName: 'EPumpX',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EPumpXFun',
    description: 'EPumpX is Pumpfun on EPIX chain.',
    images: ['public/thumbnail.webp'],
  },
  // Add these explicit tags to override any potential cached values
  other: {
    'og:description': 'EPumpX is Pumpfun on EPIX chain.',
    'twitter:description': 'EPumpX is Pumpfun on EPIX chain.',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body className={` ${Exo2.className} ${Exo2.variable} antialiased`}>
        <div className="flex flex-col min-h-screen h ">
          <WalletProvider>
            <Navbar />
            {children}
            <Footer />
            {/* <Script
              src="/charting_library/charting_library.js"  // Ensure this is the correct path
              strategy="beforeInteractive"  // Load before interactive
            /> */}
          </WalletProvider>
        </div>
      </body>
    </html>
  );
}
