import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import {  Poppins } from "next/font/google";

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Vithsutra-app",
  description: "Created with v0",
  generator: "v0.app",
}


const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'], 
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <script src="https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if (typeof window !== 'undefined') {
              require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });
            }
          `,
          }}
        />
      </head>
      <body
        className={`${poppins.className} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
