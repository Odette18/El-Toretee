import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ThemeSwitcher } from "@/components/theme-switcher" // ajusta la ruta
import ConveyThisLoader from "./ConveyThisLoader"; // import relativo y simple

void ThemeSwitcher;
void ConveyThisLoader;

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "El Torete Burger",
  description: "La mejor hamburguesa de la ciudad",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          {/* <navbar className="flex items-center justify-end p-4">
            <ThemeSwitcher />
          </navbar> */}
          
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
