"use client";

import React, { useState } from "react";
import { BottomNavFooter } from "../ui/BottomNavFooter";
import { ProTipCard } from "../ui/ProTipCard";

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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const cardItems = foodItems.filter((f) => f.type === "card");
  const chipItems = foodItems.filter((f) => f.type === "chip");

  return (
    <div className="flex flex-col min-h-[100dvh] bg-surface">
      {/* Top Header */}
      <div className="px-6 pt-6 mb-2">
        <button onClick={onBack} className="text-gray-700 mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-primary">STEP 4 OF 5</span>
          <span className="text-sm font-medium text-gray-400">80% Complete</span>
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-6">
          <div className="bg-primary h-full rounded-full" style={{ width: "80%" }} />
        </div>
      </div>

      <div className="flex-1 px-6 flex flex-col overflow-y-auto pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
          What do you{" "}
          <span className="text-primary">eat most</span>?
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          This helps us personalize your quick-add logs with traditional Sri Lankan favorites.
        </p>

        {/* Large Food Image Cards */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Rice and Curry - Full Width */}
          <button
            onClick={() => toggle("rice-curry")}
            className={`relative w-full h-40 rounded-2xl overflow-hidden border-2 transition-all ${
              selectedIds.has("rice-curry")
                ? "border-primary"
                : "border-transparent"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-amber-800/30" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              {selectedIds.has("rice-curry") && (
                <svg className="w-5 h-5 text-primary bg-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-white font-bold text-lg">Rice and Curry</span>
            </div>
          </button>

          {/* Kottu and Hoppers - Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            {cardItems
              .filter((f) => f.id !== "rice-curry")
              .map((food) => (
                <button
                  key={food.id}
                  onClick={() => toggle(food.id)}
                  className={`relative h-28 rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedIds.has(food.id)
                      ? "border-primary bg-primary-light"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="absolute inset-0 bg-amber-800/15" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    {selectedIds.has(food.id) && (
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={`font-bold text-sm ${selectedIds.has(food.id) ? "text-gray-800" : "text-gray-600"}`}>
                      {food.name}
                    </span>
                  </div>
                  {/* Plus icon if not selected */}
                  {!selectedIds.has(food.id) && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
          </div>
        </div>

        {/* Chip Selection */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          {chipItems.map((food) => {
            const isSelected = selectedIds.has(food.id);
            return (
              <button
                key={food.id}
                onClick={() => toggle(food.id)}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {isSelected && (
                  <span className="mr-1.5">✓</span>
                )}
                {food.name}
              </button>
            );
          })}
        </div>

        {/* Pro Tip */}
        <ProTipCard
          title="PRO TIP"
          content="Sri Lankan meals are nutrient-dense. Selecting these now helps our AI estimate spices and coconut milk content more accurately."
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
          className="mb-4"
        />
      </div>

      <BottomNavFooter onNext={onNext} onBack={onBack} />
    </div>
  );
}
