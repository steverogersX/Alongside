import type { Metadata } from "next";
import {
  Archivo,
  IBM_Plex_Mono,
  Lora,
  Newsreader,
  Source_Serif_4,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

/**
 * Three roles, held to strictly. Archivo runs the interface — an engineered
 * grotesque that looks drawn rather than defaulted. Source Serif is for
 * reading, and only appears inside documents. Plex Mono is the utility face:
 * every label, count, timestamp and model name, so data never wears the same
 * clothes as prose. The remaining serifs exist for the document font picker.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
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
      className={`${archivo.variable} ${sourceSerif.variable} ${newsreader.variable} ${lora.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
