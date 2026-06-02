import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true
  },
  alternates: {
    canonical: "/praticiens"
  }
};

export default function InscriptionPage() {
  permanentRedirect("/praticiens");
}
