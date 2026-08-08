import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alongside — workspaces for people and agents",
  description:
    "Multiplayer workspaces where humans and AI agents work in the same room: shared docs, live presence, and attribution on every edit.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${newsreader.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
