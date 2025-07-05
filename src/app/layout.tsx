import type { Metadata } from "next"
import type React from "react"
import { ThemeProvider } from "../../components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cognitive Mesh - Enterprise AI Transformation Framework",
  description:
    "A revolutionary spaceship-grade AI dashboard for enterprise AI transformation featuring draggable modules, neural processing, and quantum analysis capabilities.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased dark">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
