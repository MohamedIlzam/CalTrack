"use client";

import React, { useState } from "react";
import { OnboardingShell } from "./OnboardingShell";
import { BottomNavFooter } from "../ui/BottomNavFooter";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

interface FoodItem {
  id: string;
  name: string;
  type: "card" | "chip";
}

const foodItems: FoodItem[] = [
  { id: "rice-curry", name: "Rice and Curry", type: "card" },
  { id: "kottu", name: "Kottu", type: "card" },
  { id: "hoppers", name: "Hoppers", type: "card" },
  { id: "dhal-curry", name: "Dhal Curry", type: "chip" },
  { id: "coconut-sambol", name: "Coconut Sambol", type: "chip" },
  { id: "string-hoppers", name: "String Hoppers", type: "chip" },
  { id: "milk-tea", name: "Milk Tea", type: "chip" },
  { id: "short-eats", name: "Short Eats", type: "chip" },
  { id: "roti", name: "Roti", type: "chip" },
  { id: "chicken-curry", name: "Chicken Curry", type: "chip" },
];

export function Step4Food({ onNext, onBack }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(["rice-curry", "kottu", "dhal-curry", "coconut-sambol"])
  );

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const chipItems = foodItems.filter((f) => f.type === "chip");

  return (
    <OnboardingShell
      headerTitle="Food Preferences"
      step={4}
      onBack={onBack}
      footer={<BottomNavFooter onNext={onNext} onBack={onBack} />}
    >
      <div className="flex flex-col py-1">

        <h1 className="text-[1.75rem] font-bold text-gray-900 mb-1 tracking-tight">
          What do you <span className="text-primary">eat most</span>?
        </h1>
        <p className="text-gray-500 text-sm mb-4">
          This helps us personalize your quick-add logs with traditional Sri Lankan favorites.
        </p>

        {/* Large Card — Rice and Curry */}
        <button
          onClick={() => toggle("rice-curry")}
          className={`relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden border-2 transition-all mb-2.5 ${
            selectedIds.has("rice-curry") ? "border-primary" : "border-transparent"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
          <div className="absolute inset-0 bg-amber-800/25" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            {selectedIds.has("rice-curry") && (
              <svg className="w-4 h-4 text-primary bg-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-white font-bold text-base">Rice and Curry</span>
          </div>
        </button>

        {/* Side by Side — Kottu + Hoppers */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {["kottu", "hoppers"].map((id) => {
            const food = foodItems.find((f) => f.id === id)!;
            const isSelected = selectedIds.has(id);
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={`relative h-[72px] sm:h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                  isSelected ? "border-primary bg-primary-light" : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="absolute inset-0 bg-amber-800/10" />
                <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={`font-bold text-sm ${isSelected ? "text-gray-800" : "text-gray-500"}`}>
                    {food.name}
                  </span>
                </div>
                {!isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Chip Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {chipItems.map((food) => {
            const isSelected = selectedIds.has(food.id);
            return (
              <button
                key={food.id}
                onClick={() => toggle(food.id)}
                className={`px-3.5 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 border ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-500 border-gray-200"
                }`}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {food.name}
              </button>
            );
          })}
        </div>

        {/* Pro Tip */}
        <div className="bg-warning-bg/60 rounded-2xl p-4">
          <p className="text-warning-text font-bold text-xs mb-1">💡 PRO TIP</p>
          <p className="text-xs text-gray-700 leading-relaxed">
            Sri Lankan meals are nutrient-dense. Selecting these now helps our AI estimate
            spices and coconut milk content more accurately.
          </p>
        </div>
      </div>
    </OnboardingShell>
  );
}
