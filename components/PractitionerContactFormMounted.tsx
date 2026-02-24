"use client";

import { useEffect, useState } from "react";
import PractitionerContactForm from "@/components/PractitionerContactForm";

export default function PractitionerContactFormMounted({
  claim
}: {
  claim?: string | null;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <PractitionerContactForm claim={claim} />;
}
