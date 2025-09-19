import type { Metadata } from "next";
import "./globals.css";
import { Web3Providers } from "@/lib/wallet";

export const metadata: Metadata = { title: "Launchpad" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}
