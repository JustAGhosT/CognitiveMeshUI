import type React from "react"
import type { Metadata } from "next"
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
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
