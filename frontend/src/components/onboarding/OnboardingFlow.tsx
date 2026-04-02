"use client";

import React, { useState } from "react";
import { Step1Welcome } from "./Step1Welcome";
import { Step2BodyDetails } from "./Step2BodyDetails";
import { Step3Activity } from "./Step3Activity";
import { Step4Food } from "./Step4Food";

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Welcome onNext={handleNext} />;
      case 2:
        return <Step2BodyDetails onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3Activity onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <Step4Food onNext={handleNext} onBack={handleBack} />;
      default:
        // Step 5 deferred to later (Target Setup)
        return (
          <div className="flex flex-col items-center justify-center p-12 h-screen text-center">
            <h2 className="text-2xl font-bold mb-4">Step 5 (Target)</h2>
            <p className="text-gray-500 mb-8">This step is deferred per Sprint 1 instructions.</p>
            <button onClick={handleBack} className="text-primary font-bold">Go Back</button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface w-full">
      {renderStep()}
    </div>
  );
}
