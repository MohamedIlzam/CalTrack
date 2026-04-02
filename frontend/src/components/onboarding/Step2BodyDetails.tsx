import React from "react";
import { BottomNavFooter } from "../ui/BottomNavFooter";
import { Stepper } from "../ui/Stepper";
import { ProTipCard } from "../ui/ProTipCard";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2BodyDetails({ onNext, onBack }: Props) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-surface">
      {/* Top Header */}
      <div className="flex items-center text-primary font-semibold text-lg px-6 pt-6 mb-4">
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Personal
      </div>

      <Stepper currentStep={2} totalSteps={5} />

      <div className="flex-1 px-6 mt-6 flex flex-col gap-6 overflow-y-auto pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Tell us about yourself</h1>
          <p className="text-gray-500 font-medium">Your biology is the foundation of your curated wellness plan.</p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Age */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Age</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center px-4 h-[60px]">
              <input type="number" placeholder="25" className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300" />
              <span className="text-sm font-bold text-gray-400 absolute right-4">YRS</span>
            </div>
          </div>
          
          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Gender</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center px-4 h-[60px]">
              <select className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none appearance-none cursor-pointer">
                <option value="" disabled selected hidden>Select</option>
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
              <svg className="w-5 h-5 text-gray-400 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Height */}
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-sm font-bold text-gray-700">Height</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center px-4 h-[60px]">
              <input type="number" placeholder="170" className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300" />
              <div className="absolute right-4 border-l border-gray-200 pl-4">
                <span className="text-sm font-bold text-primary">CM</span>
              </div>
            </div>
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-sm font-bold text-gray-700">Current Weight</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center px-4 h-[60px]">
              <input type="number" placeholder="65.0" className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300" step="0.1" />
              <div className="absolute right-4 border-l border-gray-200 pl-4">
                <span className="text-sm font-bold text-primary">KG</span>
              </div>
            </div>
          </div>
        </div>

        <ProTipCard 
          title="Why this matters?"
          content="These metrics allow us to calculate your Basal Metabolic Rate (BMR) with clinical precision for the Sri Lankan climate."
          className="mt-2"
        />
      </div>

      <BottomNavFooter onNext={onNext} onBack={onBack} />
    </div>
  );
}
