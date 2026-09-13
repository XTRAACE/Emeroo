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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#dc2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Remove browser extension injected attributes before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              function clean(){
                var els=document.querySelectorAll('[bis_skin_checked]');
                for(var i=0;i<els.length;i++) els[i].removeAttribute('bis_skin_checked');
              }
              if(document.readyState==='loading'){
                document.addEventListener('DOMContentLoaded',clean);
              }else{clean();}
              new MutationObserver(clean).observe(document.body||document.documentElement,{attributes:true,attributeFilter:['bis_skin_checked'],subtree:true});
            })();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <div suppressHydrationWarning>
          <ThemeProvider>{children}</ThemeProvider>
        </div>
      </body>
    </html>
  );
}
