import React from "react";
import { OnboardingShell } from "./OnboardingShell";
import { BottomNavFooter } from "../ui/BottomNavFooter";
import { ProTipCard } from "../ui/ProTipCard";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2BodyDetails({ onNext, onBack }: Props) {
  return (
    <OnboardingShell
      headerTitle="Personal"
      step={2}
      onBack={onBack}
      footer={<BottomNavFooter onNext={onNext} onBack={onBack} />}
    >
      <div className="flex flex-col gap-5 py-2">
        <div>
          <h1 className="text-[1.75rem] font-bold text-gray-900 mb-1 tracking-tight">
            Tell us about yourself
          </h1>
          <p className="text-gray-500 text-sm">
            Your biology is the foundation of your curated wellness plan.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Age */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Age</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center px-4 h-[52px]">
              <input type="number" placeholder="25" className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300" />
              <span className="text-xs font-bold text-gray-400 absolute right-4">YRS</span>
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Gender</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center px-4 h-[52px]">
              <select defaultValue="" className="bg-transparent w-full font-bold text-base text-gray-900 outline-none appearance-none cursor-pointer">
                <option value="" disabled hidden>Select</option>
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
              <svg className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Height */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Height</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center px-4 h-[52px]">
              <input type="number" placeholder="170" className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300" />
              <div className="absolute right-4 border-l border-gray-200 pl-3">
                <span className="text-xs font-bold text-primary">CM</span>
              </div>
            </div>
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Current Weight</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center px-4 h-[52px]">
              <input type="number" placeholder="65.0" step="0.1" className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300" />
              <div className="absolute right-4 border-l border-gray-200 pl-3">
                <span className="text-xs font-bold text-primary">KG</span>
              </div>
            </div>
          </div>
        </div>

        <ProTipCard
          title="Why this matters?"
          content="These metrics allow us to calculate your Basal Metabolic Rate (BMR) with clinical precision for the Sri Lankan climate."
        />
      </div>
    </OnboardingShell>
  );
}
