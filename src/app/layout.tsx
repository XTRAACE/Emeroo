import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "EMERO — Intelligent Emergency Response",
  description:
    "EMERO is an intelligent emergency-response platform connecting people, emergency vehicles, hospitals and responders through real-time coordination.",
  keywords: ["emergency", "response", "EMERO", "ambulance", "hospital", "safety"],
  openGraph: {
    title: "EMERO — Intelligent Emergency Response",
    description: "Connecting people, emergency vehicles, hospitals and responders through real-time coordination.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
