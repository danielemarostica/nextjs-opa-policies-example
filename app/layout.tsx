import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js × OPA Authorization Playground",
  description: "Demo of OPA-backed middleware authorization in Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
