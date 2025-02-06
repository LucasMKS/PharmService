import { Inter, Roboto, Alkatra, Raleway, Ubuntu } from "next/font/google";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react"; // Adicionado
import "./globals.css";
import Footer from "@components/Footer";
import ThemeSwitcher from "@components/theme/ThemeSwitcher";

// Fontes (mantidas iguais)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "700"],
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "700"],
});

const alkatra = Alkatra({
  subsets: ["latin"],
  variable: "--font-alkatra",
  weight: "500",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: "500",
});

const ubuntu = Ubuntu({
  subsets: ["latin"],
  variable: "--font-ubuntu",
  weight: "500",
});

export const metadata = {
  title: "PharmStock",
  description: "Gerenciamento de estoque farmacêutico",
};

// Componente de Loader Global
function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${roboto.variable} ${alkatra.variable} ${raleway.variable} ${ubuntu.variable}`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextTopLoader />
          <ThemeSwitcher />

          <Suspense fallback={<GlobalLoader />}>
            <main>{children}</main>
          </Suspense>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
