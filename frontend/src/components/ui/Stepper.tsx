import React from "react";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export function Stepper({ currentStep, totalSteps }: StepperProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="flex flex-col w-full px-6 py-4">
      <div className="flex justify-between items-end mb-2">
        <span className="text-4xl font-light text-gray-200 leading-none">
          {currentStep.toString().padStart(2, "0")}
        </span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
