import React from "react";
import { Button } from "../ui/Button";
import { Stepper } from "../ui/Stepper";

interface Props {
  onNext: () => void;
}

export function Step1Welcome({ onNext }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-surface px-6 pt-6 pb-8">
      {/* Top Header */}
      <div className="flex items-center text-primary font-bold text-lg mb-4">
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        CalTrack
      </div>

      <Stepper currentStep={1} totalSteps={5} />

      {/* Main Content scrollable area if needed */}
      <div className="flex-1 mt-6 flex flex-col">
        {/* Placeholder for the Curry Image */}
        <div className="w-full aspect-[4/3] bg-[#C18845]/20 rounded-[2rem] mb-8 overflow-hidden relative">
           <div className="absolute inset-0 flex items-center justify-center text-orange-800/40 font-medium">
             [Curry Image Placeholder]
           </div>
        </div>

        <h1 className="text-[2.5rem] font-bold leading-[1.1] mb-4 text-gray-900 tracking-tight">
          The easiest calorie tracker for <span className="text-primary">Sri Lankan</span> food.
        </h1>

        <p className="text-gray-600 text-[1.05rem] leading-relaxed mb-10 pr-4">
          Personalized insights for Kottu, Hoppers, and your daily Rice & Curry.
        </p>

        {/* Action Area */}
        <div className="mt-auto flex flex-col items-center gap-4 w-full">
          <Button fullWidth onClick={onNext} className="py-[18px]">
            Get Started
          </Button>
          <div className="text-sm font-medium text-gray-400 mt-2 tracking-wide uppercase">
            ALREADY A MEMBER? <button className="text-primary hover:underline ml-1 font-bold">SIGN IN</button>
          </div>
        </div>
      </div>
    </div>
  );
}
