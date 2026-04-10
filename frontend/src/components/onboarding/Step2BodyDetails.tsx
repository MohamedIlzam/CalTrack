"use client";

import React, { useState, useMemo } from "react";
import { OnboardingShell } from "./OnboardingShell";
import { BottomNavFooter } from "../ui/BottomNavFooter";
import { ProTipCard } from "../ui/ProTipCard";
import { useAppStore } from "@/store/useAppStore";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2BodyDetails({ onNext, onBack }: Props) {
  const setOnboarding = useAppStore((s) => s.setOnboarding);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  
  const [heightCm, setHeightCm] = useState<string>("");
  const [heightFt, setHeightFt] = useState<string>("");
  const [heightIn, setHeightIn] = useState<string>("");
  
  const [weightVal, setWeightVal] = useState<string>("");

  const bmi = useMemo(() => {
    // calculate total kg
    let w = 0;
    if (weightVal) {
      w = weightUnit === 'kg' ? parseFloat(weightVal) : parseFloat(weightVal) * 0.453592;
    }
    
    // calculate total cm
    let h = 0;
    if (heightUnit === 'cm') {
      h = parseFloat(heightCm);
    } else {
      const ft = parseFloat(heightFt || "0");
      const inch = parseFloat(heightIn || "0");
      h = (ft * 12 + inch) * 2.54;
    }

    if (h > 0 && w > 0) {
      return Number((w / Math.pow(h / 100, 2)).toFixed(1));
    }
    return null;
  }, [heightCm, heightFt, heightIn, weightVal, weightUnit, heightUnit]);

  const bmiStatus = useMemo(() => {
    if (!bmi) return { label: "", color: "" };
    if (bmi < 18.5) return { label: "Underweight", color: "text-[#F59E0B]" }; // using amber for sub-optimal
    if (bmi < 25.0) return { label: "Normal", color: "text-[#006B5F]" };
    if (bmi < 30.0) return { label: "Overweight", color: "text-[#D97706]" };
    return { label: "Obese", color: "text-[#E11D48]" };
  }, [bmi]);

  const handleNext = () => {
    // Resolve to kg
    let wKg = 0;
    if (weightVal) {
      wKg = weightUnit === 'kg' ? parseFloat(weightVal) : parseFloat(weightVal) * 0.453592;
    }
    // Resolve to cm
    let hCm = 0;
    if (heightUnit === 'cm') {
      hCm = parseFloat(heightCm) || 0;
    } else {
      const ft = parseFloat(heightFt || "0");
      const inch = parseFloat(heightIn || "0");
      hCm = (ft * 12 + inch) * 2.54;
    }
    if (wKg > 0 && hCm > 0) {
      setOnboarding({ weightKg: wKg, heightCm: hCm });
    }
    onNext();
  };

  const markerPosition = useMemo(() => {
    if (!bmi) return 0;
    if (bmi < 18.5) {
      return Math.max(5, ((bmi - 15) / (18.5 - 15)) * 25);
    } else if (bmi < 25) {
      return 25 + ((bmi - 18.5) / (25 - 18.5)) * 33;
    } else if (bmi < 30) {
      return 58 + ((bmi - 25) / (30 - 25)) * 17;
    } else {
      return 75 + Math.min(20, ((bmi - 30) / (40 - 30)) * 25); // cap at 95%
    }
  }, [bmi]);
  return (
    <OnboardingShell
      headerTitle="Personal"
      step={2}
      onBack={onBack}
      footer={<BottomNavFooter onNext={handleNext} onBack={onBack} />}
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
          <div className="flex flex-col gap-1 col-span-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Height</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center pl-4 pr-1 h-[52px]">
              {heightUnit === 'cm' ? (
                <input 
                  type="number" placeholder="170" 
                  className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300 pr-[50px]" 
                  value={heightCm} onChange={(e) => setHeightCm(e.target.value)}
                />
              ) : (
                <div className="flex items-center w-full pr-[45px]">
                  <input 
                    type="number" placeholder="5" 
                    className="bg-transparent w-1/2 min-w-0 font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300 text-center" 
                    value={heightFt} onChange={(e) => setHeightFt(e.target.value)}
                  />
                  <span className="text-[9px] font-bold text-gray-400 mr-2">FT</span>
                  <input 
                    type="number" placeholder="9" 
                    className="bg-transparent w-1/2 min-w-0 font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300 text-center border-l border-gray-200" 
                    value={heightIn} onChange={(e) => setHeightIn(e.target.value)}
                  />
                  <span className="text-[9px] font-bold text-gray-400 ml-1">IN</span>
                </div>
              )}
              
              <button 
                onClick={() => {
                   if (heightUnit === 'cm') {
                     setHeightUnit('ft');
                     if (heightCm) {
                       const totalInches = parseFloat(heightCm) / 2.54;
                       const ft = Math.floor(totalInches / 12);
                       const inch = Math.round(totalInches % 12);
                       setHeightFt(ft.toString());
                       setHeightIn(inch.toString());
                     }
                   } else {
                     setHeightUnit('cm');
                     const ft = parseFloat(heightFt || "0");
                     const inch = parseFloat(heightIn || "0");
                     if (ft > 0 || inch > 0) {
                       setHeightCm(Math.round((ft * 12 + inch) * 2.54).toString());
                     }
                   }
                }}
                className="absolute right-1 top-1 bottom-1 rounded-[12px] flex items-center justify-center px-2.5 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors z-10"
                title="Tap to change unit"
              >
                <span className="text-[11px] font-bold text-primary">{heightUnit === 'cm' ? 'CM' : 'FT'}</span>
              </button>
            </div>
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1 col-span-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Current Weight</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center pl-4 pr-1 h-[52px]">
              <input 
                type="number" 
                placeholder={weightUnit === 'kg' ? "65.0" : "145.0"} 
                step="0.1" 
                className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300 pr-[50px]" 
                value={weightVal}
                onChange={(e) => setWeightVal(e.target.value)}
              />
              <button 
                onClick={() => {
                   if (weightUnit === 'kg') {
                     setWeightUnit('lbs');
                     if (weightVal) setWeightVal((parseFloat(weightVal) * 2.20462).toFixed(1));
                   } else {
                     setWeightUnit('kg');
                     if (weightVal) setWeightVal((parseFloat(weightVal) / 2.20462).toFixed(1));
                   }
                }}
                className="absolute right-1 top-1 bottom-1 rounded-[12px] flex items-center justify-center px-2 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors z-10"
                title="Tap to change unit"
              >
                <span className="text-[11px] font-bold text-primary">{weightUnit === 'kg' ? 'KG' : 'LBS'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* BMI Indicator */}
        <div className={`flex flex-col mt-4 mb-2 transition-opacity duration-300 ${!bmi ? 'opacity-40' : 'opacity-100'}`}>
          <div className="flex justify-between items-end mb-4 relative z-10">
            <span className="text-sm font-bold text-[#3C4A46]">BMI Indicator</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-extrabold ${bmi ? bmiStatus.color : 'text-gray-300'}`}>
                {bmi ? bmi : '--'}
              </span>
              <span className="text-xs font-semibold text-gray-500">
                {bmi ? bmiStatus.label : 'Pending'}
              </span>
            </div>
          </div>
          
          <div className="relative w-full mt-2">
            {/* Numerical Ticks */}
            <div className="absolute -top-[18px] left-0 w-full">
              <span className="absolute left-[25%] -translate-x-1/2 text-[10px] font-bold text-gray-500">18.5</span>
              <span className="absolute left-[58%] -translate-x-1/2 text-[10px] font-bold text-gray-500">25.0</span>
              <span className="absolute left-[75%] -translate-x-1/2 text-[10px] font-bold text-gray-500">30.0</span>
            </div>

            {/* Segmented Bar */}
            <div className="relative w-full h-3 flex rounded-full overflow-hidden gap-[2px]">
              <div className="bg-[#FCE173] w-[25%] h-full" />
              <div className="bg-[#2DD4BF] w-[33%] h-full" />
              <div className="bg-[#FBBF24] w-[17%] h-full" />
              <div className="bg-[#FB7185] w-[25%] h-full" />
              
              {/* Active Marker Line */}
              {bmi && (
                <div 
                  className="absolute top-0 bottom-0 w-[4px] bg-white border-x border-gray-900/10 shadow-sm transition-all duration-500 ease-out z-10"
                  style={{ left: `calc(${markerPosition}% - 2px)` }}
                />
              )}
            </div>

            {/* Labels */}
            <div className="flex justify-between text-[8px] font-bold text-gray-400 mt-2 uppercase tracking-wide">
              <span className="w-[25%] text-left text-gray-500">Underweight</span>
              <span className="w-[33%] text-center text-gray-500">Healthy</span>
              <span className="w-[17%] text-center text-gray-500 pt-[1px] pr-2">Overweight</span>
              <span className="w-[25%] text-right text-gray-500">Obese</span>
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
