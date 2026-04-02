"use client";

import React, { useState } from "react";
import { OnboardingShell } from "./OnboardingShell";
import { BottomNavFooter } from "../ui/BottomNavFooter";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const goals = [
  {
    id: "lose",
    label: "Lose Weight",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
  },
  {
    id: "maintain",
    label: "Maintain",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6h18M5 6v12a2 2 0 002 2h10a2 2 0 002-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      </svg>
    ),
  },
  {
    id: "gain",
    label: "Gain Weight",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
  },
];

export function Step1Goal({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState("lose");

  return (
    <OnboardingShell
      headerTitle="Goal"
      step={1}
      onBack={onBack}
      footer={<BottomNavFooter onNext={onNext} onBack={onBack} />}
    >
      <div className="flex flex-col py-2">
        <h1 className="text-[2rem] font-bold text-gray-900 mb-8 tracking-tight">
          What&apos;s your main goal?
        </h1>

        <div className="flex flex-col gap-4">
          {goals.map((goal) => {
            const isSelected = selected === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => setSelected(goal.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 ${
                  isSelected
                    ? "bg-white border-[2.5px] border-[#006B5F] shadow-sm"
                    : "bg-gray-50 border-[2.5px] border-transparent hover:bg-gray-100"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? "bg-[#2DD4BF] text-[#006B5F]" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {goal.icon}
                </div>
                <span className={`font-bold text-lg ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                  {goal.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </OnboardingShell>
  );
}
