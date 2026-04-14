"use client";

import React, { useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingState } from "@/store/useAppStore";
import { Step0Welcome } from "./Step0Welcome";
import { Step1Goal } from "./Step1Goal";
import { Step2BodyDetails } from "./Step2BodyDetails";
import { Step3Activity } from "./Step3Activity";
import { Step4Food } from "./Step4Food";
import { Step5Target } from "./Step5Target";

export const OnboardingContext = createContext<{
  draft: Partial<OnboardingState>;
  updateDraft: (data: Partial<OnboardingState>) => void;
} | null>(null);

export const useOnboardingDraft = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("Missing OnboardingContext");
  return ctx;
};

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const totalSteps = 5;

  const [draft, setDraft] = useState<Partial<OnboardingState>>({
    goal: "lose",
    activityLevel: "sedentary",
  });

  const updateDraft = (data: Partial<OnboardingState>) => {
    setDraft((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Step0Welcome onNext={handleNext} />;
      case 1:
        return <Step1Goal onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <Step2BodyDetails onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3Activity onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <Step4Food onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <Step5Target onNext={() => router.push('/home')} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <OnboardingContext.Provider value={{ draft, updateDraft }}>
      <div className="min-h-screen bg-surface md:bg-gray-100 md:flex md:justify-center">
        <div className="w-full md:max-w-[430px] md:min-h-screen bg-surface md:shadow-2xl">
          {renderStep()}
        </div>
      </div>
    </OnboardingContext.Provider>
  );
}
