"use client";

import React from "react";

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack" | "snacks" | "saved_meals";

export interface MealPlateItem {
  id: string;
  name: string;
  qty: number;
  kcalPerServing?: number;
  proteinPerServing?: number;
  carbsPerServing?: number;
  fatPerServing?: number;
  emoji?: string;
  unitName?: string;
  isEstimate?: boolean;
  isVerified?: boolean;
}

export interface MealTotals {
  caloriesKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
}

export const MEAL_SLOT_CONFIG: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: "Breakfast", emoji: "🌅" },
  lunch: { label: "Lunch", emoji: "☀️" },
  dinner: { label: "Dinner", emoji: "🌙" },
  snack: { label: "Snack", emoji: "🍪" },
  snacks: { label: "Snack", emoji: "🍪" },
};

export interface MealPlateCardProps {
  items: MealPlateItem[];
  totals?: MealTotals;
  mode?: "edit" | "preview";
  isFixedBottom?: boolean;
  isScrolled?: boolean;
  selectedMeal?: MealSlot;
  onSelectMeal?: (slot: MealSlot) => void;
  onIncreaseItem?: (itemId: string) => void;
  onDecreaseItem?: (itemId: string) => void;
  onSaveMeal?: () => void | Promise<void>;
  isSaving?: boolean;
  error?: string | null;
  saveButtonText?: string;
  extraAction?: React.ReactNode;
  className?: string;
}

/**
 * Reusable, typed meal plate card that renders the meal basket and nutritional breakdown.
 *
 * Supported features:
 * - Authoritative and computed nutritional totals (Kcal, P, C, F)
 * - Multi-item list with emojis and serving descriptors
 * - Controlled portion adjustments via steppers
 * - Read-only preview mode vs. editable mode
 * - Verified database indicator vs. AI estimate badge
 * - Accessible error and loading states (resolves CAL-001)
 * - Suitable for Search page, Home screen, and AI Coach responses
 */
export function MealPlateCard({
  items,
  totals,
  mode = "edit",
  isFixedBottom = false,
  isScrolled = false,
  selectedMeal = "breakfast",
  onSelectMeal,
  onIncreaseItem,
  onDecreaseItem,
  onSaveMeal,
  isSaving = false,
  error = null,
  saveButtonText,
  extraAction,
  className = "",
}: MealPlateCardProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const isReadOnly = mode === "preview";

  // Compute fallback totals if not provided authoritatively by backend
  const totalKcal =
    totals?.caloriesKcal ??
    Math.round(items.reduce((s, i) => s + (i.kcalPerServing || 0) * i.qty, 0));
  const totalProtein =
    totals?.proteinG ??
    Math.round(items.reduce((s, i) => s + (i.proteinPerServing || 0) * i.qty, 0) * 10) / 10;
  const totalCarbs =
    totals?.carbohydratesG ??
    Math.round(items.reduce((s, i) => s + (i.carbsPerServing || 0) * i.qty, 0) * 10) / 10;
  const totalFat =
    totals?.fatG ??
    Math.round(items.reduce((s, i) => s + (i.fatPerServing || 0) * i.qty, 0) * 10) / 10;

  const defaultSaveLabel = isReadOnly
    ? "Confirm & Log Meal"
    : `Save ${items.length} ${items.length === 1 ? "item" : "items"}`;
  const saveLabel = saveButtonText || defaultSaveLabel;

  const cardContent = (
    <div className={`flex flex-col gap-[14px] ${className}`}>
      {/* ── Total Vitality Card ── */}
      <div
        className="flex-none shadow-[0_10px_40px_rgba(0,107,95,0.2)] transition-opacity duration-300 rounded-[26px] p-4 flex gap-[14px] overflow-hidden relative"
        style={{
          opacity: isScrolled ? 0.85 : 1,
          background:
            "linear-gradient(135deg, rgba(0,68,57,0.95) 0%, rgba(0,121,107,0.95) 50%, rgba(20,184,166,0.92) 100%)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Left Side: Stats */}
        <div className="w-[42%] flex flex-col justify-center border-r border-white/20 pr-3 relative">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 mb-1 leading-none">
              Total
            </p>
            <p className="text-[36px] font-extrabold text-white tracking-[-1px] leading-none flex items-baseline gap-[2px]">
              {totalKcal}
              <span className="text-[15px] font-semibold opacity-75">kcal</span>
            </p>
          </div>
          <div className="flex justify-between mt-4 pr-1">
            {[
              { label: "P", val: totalProtein },
              { label: "C", val: totalCarbs },
              { label: "F", val: totalFat },
            ].map(({ label, val }) => (
              <div key={label} className="flex flex-col items-start gap-[1px]">
                <p className="text-[9px] font-bold text-white/50 leading-none">{label}</p>
                <p className="text-[13px] font-extrabold text-white leading-none">
                  {val}
                  <span className="text-[9px] font-normal opacity-75 ml-[1px]">g</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Plate Items (Scrollable) */}
        <div
          className="w-[58%] flex flex-col gap-[6px] max-h-[125px] overflow-y-auto no-scrollbar pl-1"
          role="list"
          aria-label="Meal items list"
        >
          {items.map((item, idx) => {
            const servingLabel = item.unitName
              ? `${item.qty} ${item.unitName}`
              : `${item.qty} ${item.qty === 1 ? "srv" : "srvs"}`;

            return (
              <div
                key={`${item.id}-${idx}`}
                className="bg-white/14 rounded-[14px] py-2 px-[10px] flex items-center gap-[10px]"
                style={{ background: "rgba(255,255,255,0.12)" }}
                role="listitem"
              >
                <span className="text-[18px] leading-none select-none">
                  {item.emoji || "🍽️"}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[13px] font-bold text-white truncate leading-tight">
                      {item.name}
                    </p>
                    {item.isEstimate && (
                      <span
                        className="text-[8.5px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400/25 text-amber-200 border border-amber-300/30 flex-none leading-none tracking-tight"
                        title="AI Estimated Nutrition"
                      >
                        AI Estimate
                      </span>
                    )}
                    {item.isVerified && (
                      <span
                        className="text-[8.5px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-400/25 text-emerald-200 border border-emerald-300/30 flex-none leading-none tracking-tight"
                        title="In Food Catalog"
                      >
                        In Catalog
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/60 truncate mt-[1px] tracking-wide">
                    {servingLabel}
                  </p>
                </div>

                {/* Stepper Controls (Editable mode only) */}
                {!isReadOnly && onDecreaseItem && onIncreaseItem && (
                  <div className="flex items-center gap-1 bg-black/20 rounded-full px-1 py-1">
                    <button
                      type="button"
                      onClick={() => onDecreaseItem(item.id)}
                      className="px-1.5 active:opacity-50 text-white cursor-pointer"
                      aria-label={`Decrease ${item.name}`}
                      title={`Decrease ${item.name}`}
                    >
                      <svg
                        className="w-[9px] h-[9px] text-white/90"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3.5}
                      >
                        <path strokeLinecap="round" d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="text-[11px] font-bold text-white min-w-[12px] text-center leading-none tabular-nums select-none mb-[1px]">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onIncreaseItem(item.id)}
                      className="px-1.5 active:opacity-50 text-white cursor-pointer"
                      aria-label={`Increase ${item.name}`}
                      title={`Increase ${item.name}`}
                    >
                      <svg
                        className="w-[9px] h-[9px] text-white/90"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3.5}
                      >
                        <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Error Feedback Banner (Resolves CAL-001) ── */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] bg-red-500/10 border border-red-500/30 text-red-700 text-[12.5px] font-medium"
        >
          <svg className="w-4 h-4 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1 leading-snug">{error}</span>
        </div>
      )}

      {/* ── Action & Save Controls ── */}
      {(onSelectMeal || onSaveMeal) && (
        <div className="flex-none pt-1 shrink-0">
          {/* Meal Slot Selector */}
          {onSelectMeal && (
            <div
              className="flex gap-2 mb-[14px] overflow-x-auto no-scrollbar"
              role="radiogroup"
              aria-label="Select meal category"
            >
              {(["breakfast", "lunch", "dinner", "snack"] as MealSlot[]).map((slot) => {
                const config = MEAL_SLOT_CONFIG[slot] || { label: slot, emoji: "🍽️" };
                const isSelected = selectedMeal === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onSelectMeal(slot)}
                    className={`flex-none flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-bold transition-all active:scale-95 shadow-sm border cursor-pointer ${
                      isSelected
                        ? "bg-[#006B5F] text-white border-transparent"
                        : "bg-white text-[#3C4A46] border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-[15px]">{config.emoji}</span>
                    {config.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Confirm & Save Button */}
          {onSaveMeal && (
            <div className="flex gap-2 items-center w-full">
              <button
                type="button"
                id="save-meal-button"
                onClick={onSaveMeal}
                disabled={isSaving}
                className="flex-1 py-[16px] rounded-[22px] text-white text-[15px] font-bold tracking-wide shadow-[0_8px_20px_rgba(0,107,95,0.25)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                style={{ background: "#006B5F" }}
              >
                {isSaving ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                ) : (
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isSaving ? "Saving..." : saveLabel}
              </button>

              {extraAction}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // If fixed bottom layout is requested (as in Search page), wrap in fixed overlay
  if (isFixedBottom) {
    return (
      <div className="fixed bottom-[80px] left-0 right-0 z-20 pointer-events-none pb-4 pt-10 transition-all duration-300">
        <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-[#F9F9F9] via-[#F9F9F9] to-transparent opacity-95" />
        <div className="relative max-w-screen-xl mx-auto px-4 pointer-events-auto">
          {cardContent}
        </div>
      </div>
    );
  }

  // Normal inline flow layout
  return cardContent;
}
