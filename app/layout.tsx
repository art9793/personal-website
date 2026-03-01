import "./globals.css";
import { Providers } from "./providers";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-ui",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-ui",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`bg-gray-100 font-sans ${inter.variable} ${jetbrainsMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
