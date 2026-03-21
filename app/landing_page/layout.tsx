import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visual Crafters | Landing Page",
  description:
    "Professional branding, design templates, and marketing visuals for modern businesses.",
};

export default function LandingPageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
