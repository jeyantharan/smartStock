import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { CategoryProvider } from "@/context/CategoryContext";
import ToastContainer from "@/components/Toast";

export const metadata: Metadata = {
  title: "Smart Stock | Premium Online Marketplace",
  description: "Experience the next generation of online shopping. Fast, responsive, and beautiful.",
  authors: [{ name: "Smart Stock Team" }],
  icons: {
    icon: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo.jpg" type="image/jpeg" />
      </head>
      <body>
        <AppProvider>
          <CategoryProvider>
            {children}
            <ToastContainer />
          </CategoryProvider>
        </AppProvider>
      </body>
    </html>
  );
}
