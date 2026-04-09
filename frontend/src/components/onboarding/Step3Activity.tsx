"use client";

import React, { useState } from "react";
import { OnboardingShell } from "./OnboardingShell";
import { BottomNavFooter } from "../ui/BottomNavFooter";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const activityLevels = [
  {
    id: "sedentary",
    label: "Sedentary",
    description: "Little or no exercise, desk job.",
    icon: "🖥️",
    tip: "0%",
  },
  {
    id: "lightly",
    label: "Lightly Active",
    description: "Light exercise or sports 1-3 days/week.",
    icon: "🚶",
    tip: "20%",
  },
  {
    id: "moderately",
    label: "Moderately Active",
    description: "Moderate exercise or sports 3-5 days/week.",
    icon: "🏃",
    tip: "40%",
  },
  {
    id: "very",
    label: "Very Active",
    description: "Hard exercise or physical job 6-7 days/week.",
    icon: "⚡",
    tip: "60%",
  },
];

export function Step3Activity({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState("lightly");
  const selectedData = activityLevels.find((a) => a.id === selected);

  return (
    <OnboardingShell
      headerTitle="Activity Level"
      step={3}
      onBack={onBack}
      footer={<BottomNavFooter onNext={onNext} onBack={onBack} />}
    >
      <div className="flex flex-col py-2">
        <h1 className="text-[1.75rem] font-bold text-gray-900 mb-1 tracking-tight">
          How active are you?
        </h1>
        <p className="text-gray-500 text-sm mb-4">
          This helps us calculate your daily energy expenditure more accurately.
        </p>

        {/* Activity Cards */}
        <div className="flex flex-col gap-2.5 mb-4">
          {activityLevels.map((level) => {
            const isSelected = selected === level.id;
            return (
              <button
                key={level.id}
                onClick={() => setSelected(level.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? "border-primary bg-primary-light"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[15px] text-gray-900">{level.label}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{level.description}</p>
                </div>
                <span className="text-xl flex-shrink-0">{level.icon}</span>
              </button>
            );
          })}
        </div>

        {/* Mindful Curator Tip */}
        {selectedData && (
          <div className="bg-primary-light/60 rounded-2xl p-4">
            <p className="text-primary font-bold text-xs mb-1">The Mindful Curator&apos;s Tip</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Being &ldquo;{selectedData.label}&rdquo; burns approximately{" "}
              {selectedData.tip} more calories than a sedentary baseline. Small movements matter.
            </p>
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}
