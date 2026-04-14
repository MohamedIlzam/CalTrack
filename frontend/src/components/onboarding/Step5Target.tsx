"use client";

import { Button } from "../ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { useOnboardingDraft } from "./OnboardingFlow";

interface Props {
  onNext: () => void;
  onBack?: () => void;
}

const GOAL_LABEL: Record<string, string> = {
  lose: "Optimized for Weight Loss",
  maintain: "Optimized for Maintenance",
  gain: "Optimized for Weight Gain",
};

export function Step5Target({ onNext, onBack }: Props) {
  const { draft } = useOnboardingDraft();
  
  const targetCalories = draft.targetCalories;
  const targetProteinG = draft.targetProteinG;
  const targetCarbsG = draft.targetCarbsG;
  const targetFatG = draft.targetFatG;
  const goal = draft.goal || "lose";

  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const setOnboarding = useAppStore((s) => s.setOnboarding);

  const handleStartTracking = () => {
    setOnboarding(draft);
    completeOnboarding();
    onNext();
  };

  // Fallback to sensible defaults if onboarding was skipped
  const calories = targetCalories || 1850;
  const protein = targetProteinG || 92;
  const carbs = targetCarbsG || 231;
  const fat = targetFatG || 62;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F9FAFB] w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 pb-3 sm:pb-4 flex-shrink-0">
        <button onClick={onBack} className="p-1 -ml-1 text-[#1A1C1C]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[#94A3B8] text-[11px] font-bold tracking-[1.5px] uppercase">
          Step 5 of 5
        </span>
      </div>

      {/* Main scrollable content limits overlapping with floating footer via pb-36 */}
      <div className="px-4 sm:px-5 flex flex-col flex-1 pb-6 overflow-y-auto">
        {/* Main Target Card */}
        <div 
          className="relative overflow-hidden rounded-[32px] p-7 mb-4 shadow-[0_12px_24px_rgba(45,212,191,0.2)]" 
          style={{ background: 'linear-gradient(145deg, #38DBC4 0%, #2BBA9A 100%)' }}
        >
          <div className="flex flex-col gap-1 relative z-10 text-[#004B40]">
            <span className="text-[11px] font-bold tracking-[1px] uppercase opacity-80 mb-1">
              Your Curated Plan
            </span>
            <h2 className="text-[22px] font-bold tracking-tight mb-3">
              DAILY TARGET
            </h2>
            <div className="flex items-baseline gap-2 mb-5 sm:mb-6">
              <span className="text-[2.75rem] sm:text-[3.5rem] font-black tracking-[-2px] leading-none">{calories.toLocaleString()}</span>
              <span className="text-[16px] font-semibold text-[#004B40]/80">kcal / day</span>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-[#004B40]/10 rounded-full px-4 py-2 w-max">
              <div className="w-[18px] h-[18px] bg-[#004B40] text-[#38DBC4] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[13px] font-bold">{GOAL_LABEL[goal]}</span>
            </div>
          </div>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
          {/* Protein */}
          <div className="bg-white rounded-[20px] sm:rounded-[24px] p-3 sm:p-5 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#EBF8F5] flex items-center justify-center mb-2 sm:mb-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2DD4BF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" strokeWidth="2.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 17c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6z" />
              </svg>
            </div>
            <span className="text-[18px] sm:text-[22px] font-black text-gray-900 leading-none mb-1">{protein}g</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 tracking-[1.5px] uppercase">Protein</span>
          </div>

          {/* Carbs */}
          <div className="bg-white rounded-[20px] sm:rounded-[24px] p-3 sm:p-5 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFF5E6] flex items-center justify-center mb-2 sm:mb-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#ED8936]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-3.314 0-6 2.686-6 6h12c0-3.314-2.686-6-6-6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11a5 5 0 0110 0" />
              </svg>
            </div>
            <span className="text-[18px] sm:text-[22px] font-black text-gray-900 leading-none mb-1">{carbs}g</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 tracking-[1.5px] uppercase">Carbs</span>
          </div>

          {/* Fat */}
          <div className="bg-white rounded-[20px] sm:rounded-[24px] p-3 sm:p-5 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-2 sm:mb-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3a9 9 0 00-6 15l6 3 6-3a9 9 0 00-6-15z" />
              </svg>
            </div>
            <span className="text-[18px] sm:text-[22px] font-black text-gray-900 leading-none mb-1">{fat}g</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 tracking-[1.5px] uppercase">Fat</span>
          </div>
        </div>

        {/* Projection Card */}
        <div className="bg-[#F3F4F6] rounded-[24px] p-5 flex gap-4 border border-white">
          <div className="w-10 h-10 bg-[#FFDDB8] text-[#D06F0F] rounded-xl flex items-center justify-center flex-shrink-0">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 17l6-6 4 4 8-8" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 7h7v7" />
             </svg>
          </div>
          <div className="flex flex-col">
             <h3 className="font-bold text-[#1A1C1C] mb-1 leading-snug">Weekly Projection</h3>
             <p className="text-[14px] text-[#64748B] leading-relaxed">
               Based on your profile, this plan helps you lose <span className="text-[#006B5F] font-semibold">0.5 kg per week</span> by maintaining a sustainable caloric deficit.
             </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Sheet */}
      <div className="flex-shrink-0 bg-white rounded-t-[32px] px-4 sm:px-6 py-5 sm:py-6 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Button fullWidth size="large" onClick={handleStartTracking} className="mb-4 !rounded-[24px]"
          rightIcon={<svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7"/></svg>}
        >
          Start Tracking
        </Button>
        <div className="text-center w-full">
          <span className="text-[10px] font-bold text-[#94A3B8] tracking-[1px] uppercase">
            Your Journey Begins Now
          </span>
        </div>
      </div>
    </div>
  );
}
