"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useAppStore } from "@/store/useAppStore";

export default function Home() {
  const router = useRouter();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const [hydrated, setHydrated] = useState(false);

  /* Wait for Zustand to rehydrate from localStorage before routing */
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && hasOnboarded) {
      router.replace("/home");
    }
  }, [hydrated, hasOnboarded, router]);

  /* Still hydrating → show nothing (avoids onboarding flash) */
  if (!hydrated) return null;

  /* Already onboarded → redirect is in-flight */
  if (hasOnboarded) return null;

  return <OnboardingFlow />;
}
