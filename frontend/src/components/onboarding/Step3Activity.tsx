"use client";

import React, { useState } from "react";
import { BottomNavFooter } from "../ui/BottomNavFooter";
import { Stepper } from "../ui/Stepper";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const activityLevels = [
  {
    id: "sedentary",
    label: "Sedentary",
    description: "Little or no exercise, desk job, most of the day sitting.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "lightly",
    label: "Lightly Active",
    description: "Light exercise or sports 1-3 days per week.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "moderately",
    label: "Moderately Active",
    description: "Moderate exercise or sports 3-5 days per week.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: "very",
    label: "Very Active",
    description: "Hard exercise or physical job 6-7 days per week.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export function Step3Activity({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<string>("lightly");

  const selectedData = activityLevels.find((a) => a.id === selected);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-surface">
      {/* Top Header */}
      <div className="flex items-center gap-1 px-6 pt-6 mb-4">
        <button onClick={onBack} className="text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="text-primary font-semibold text-lg leading-tight">
          Activity<br />Level
        </div>
      </div>

      <Stepper currentStep={3} totalSteps={5} />

      <div className="flex-1 px-6 mt-4 flex flex-col overflow-y-auto pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          How active are you?
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          This helps us calculate your daily energy expenditure more accurately.
        </p>

        {/* Activity Cards */}
        <div className="flex flex-col gap-3">
          {activityLevels.map((level) => {
            const isSelected = selected === level.id;
            return (
              <button
                key={level.id}
                onClick={() => setSelected(level.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? "border-primary bg-primary-light"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{level.label}</span>
                    {isSelected && (
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 leading-snug">{level.description}</p>
                </div>
                <div className={`flex-shrink-0 ${isSelected ? "text-primary" : "text-gray-300"}`}>
                  {level.icon}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mindful Curator Tip */}
        {selectedData && (
          <div className="mt-6 bg-primary-light/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary font-bold text-sm">The Mindful Curator&apos;s Tip</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Being &ldquo;{selectedData.label}&rdquo; burns approximately{" "}
              {selectedData.id === "lightly" ? "20%" : selectedData.id === "moderately" ? "40%" : selectedData.id === "very" ? "60%" : "0%"}{" "}
              more calories than a sedentary baseline. Small movements matter.
            </p>
            {/* Decorative leaf */}
            <div className="flex justify-end mt-2 opacity-20">
              <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <BottomNavFooter onNext={onNext} onBack={onBack} />
    </div>
  );
}
