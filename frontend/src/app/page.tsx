"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useAppStore } from "@/store/useAppStore";

import { getAuthToken } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const token = useAppStore((s) => s.token);
  const [hydrated, setHydrated] = useState(false);

  /* Wait for Zustand to rehydrate from localStorage before routing */
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const validToken = getAuthToken();
    if (hydrated && hasOnboarded && validToken) {
      router.replace("/home");
    }
  }, [hydrated, hasOnboarded, token, router]);

  /* Still hydrating → show nothing (avoids onboarding flash) */
  if (!hydrated) return null;

  /* Already onboarded with valid token → redirect is in-flight */
  if (hasOnboarded && getAuthToken()) return null;

  return <OnboardingFlow />;
}
