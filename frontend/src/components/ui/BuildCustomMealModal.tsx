"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FoodItem {
  id: string;
  name: string;
  qty: number;           // current quantity (servings)
  kcalPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  emoji: string;
  chipColor: string;     // background tint for image chip
}

interface BuildCustomMealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Seed data (matches the screenshot exactly) ───────────────────────────────
// Per-serving values calculated so totals @ default qty match screenshot:
//   Red Rice ×1.5 → 180 kcal, P 4g, C 40g, F 0g
//   Dhal Curry ×1 → 140 kcal, P 8g,  C 18g, F 4g
//   Pol Sambol ×0.5 → 130 kcal, P 3g,  C 7g,  F 8g
//   Total → 450 kcal, P 15g, C 65g, F 12g  ✓
const SEED_ITEMS: FoodItem[] = [
  {
    id: "red-rice",
    name: "Red Rice",
    qty: 1.5,
    kcalPerServing: 120,
    proteinPerServing: 2.67,
    carbsPerServing: 26.67,
    fatPerServing: 0,
    emoji: "🍚",
    chipColor: "#C45C1A",
  },
  {
    id: "dhal-curry",
    name: "Dhal Curry",
    qty: 1,
    kcalPerServing: 140,
    proteinPerServing: 8,
    carbsPerServing: 18,
    fatPerServing: 4,
    emoji: "🍛",
    chipColor: "#E8A020",
  },
  {
    id: "pol-sambol",
    name: "Pol Sambol",
    qty: 0.5,
    kcalPerServing: 260,
    proteinPerServing: 6,
    carbsPerServing: 14,
    fatPerServing: 16,
    emoji: "🥥",
    chipColor: "#2C7A45",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function BuildCustomMealModal({ isOpen, onClose }: BuildCustomMealModalProps) {
  const [mealName, setMealName] = useState("");
  const [items, setItems] = useState<FoodItem[]>(SEED_ITEMS);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Derived totals ──────────────────────────────────────────────────────────
  const totalKcal    = Math.round(items.reduce((s, i) => s + i.kcalPerServing    * i.qty, 0));
  const totalProtein = Math.round(items.reduce((s, i) => s + i.proteinPerServing * i.qty, 0));
  const totalCarbs   = Math.round(items.reduce((s, i) => s + i.carbsPerServing   * i.qty, 0));
  const totalFat     = Math.round(items.reduce((s, i) => s + i.fatPerServing     * i.qty, 0));

  function changeQty(id: string, delta: number) {
    setItems(prev =>
      prev.map(item =>
        item.id !== id
          ? item
          : { ...item, qty: Math.max(0.5, Math.round((item.qty + delta) * 2) / 2) }
      )
    );
  }

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="fixed inset-0 z-[70] transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.35)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* ── Bottom sheet ───────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Build Custom Meal"
        className="fixed inset-x-0 bottom-0 z-[71] flex flex-col bg-[#F5F7F6] rounded-t-[28px]"
        style={{
          height: "calc(100dvh - 36px)",
          transform: isOpen ? "translateY(0)" : "translateY(105%)",
          transition: "transform 400ms cubic-bezier(0.32,0.72,0,1)",
          willChange: "transform",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-9 h-[4px] rounded-full bg-[#BACAC5]/50" />
        </div>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0">
          <button
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-black/6 transition-colors"
          >
            <svg className="w-5 h-5 text-[#1A1C1C]" fill="none" stroke="currentColor"
              viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          <h1 className="text-[17px] font-extrabold text-[#1A1C1C] tracking-tight">
            Build Custom Meal
          </h1>

          <button
            aria-label="More options"
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-black/6 transition-colors"
          >
            <svg className="w-[18px] h-[18px] text-[#3C4A46]" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5"  r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 space-y-4 pb-2">

          {/* Meal Identity */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3C4A46] mb-2">
              Meal Identity
            </p>
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="e.g., Amma's Sunday Lunch"
              className="w-full bg-white border border-[#BACAC5]/25 rounded-2xl
                px-4 py-[13px] text-[14px] text-[#1A1C1C]
                placeholder:text-[#BACAC5] shadow-sm outline-none
                focus:border-[#006B5F]/40 transition-colors"
            />
          </section>

          {/* Total Vitality card */}
          <div
            className="rounded-[22px] p-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #005548 0%, #00897B 50%, #2DD4BF 100%)",
            }}
          >
            {/* Fork & knife icon */}
            <div className="absolute top-4 right-4 w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
              </svg>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 mb-1">
              Total Vitality
            </p>
            <p className="text-[38px] font-extrabold text-white tracking-[-1px] leading-none">
              {totalKcal}
              <span className="text-[18px] font-semibold opacity-75 ml-1">kcal</span>
            </p>

            {/* Macro row */}
            <div className="flex gap-5 mt-3 pt-3 border-t border-white/20">
              {[
                { label: "Protein", val: totalProtein },
                { label: "Carbs",   val: totalCarbs   },
                { label: "Fats",    val: totalFat     },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/55">{label}</p>
                  <p className="text-[15px] font-extrabold text-white leading-tight">
                    {val}<span className="text-[11px] font-semibold opacity-75">g</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* The Plate */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-extrabold text-[#1A1C1C]">The Plate</h2>
              <span className="text-[11px] font-bold text-[#006B5F] bg-[#E6F7F5] rounded-full px-3 py-[3px]">
                {items.length} Items
              </span>
            </div>

            <div className="space-y-[10px]">
              {items.map((item) => {
                const kcal    = Math.round(item.kcalPerServing    * item.qty);
                const protein = Math.round(item.proteinPerServing * item.qty);
                const carbs   = Math.round(item.carbsPerServing   * item.qty);
                const label   = item.qty === 1 ? "1 serving" : `${item.qty} servings`;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[18px] p-3 flex items-center gap-3
                      shadow-sm border border-[#BACAC5]/15"
                  >
                    {/* Image chip */}
                    <div
                      className="w-[50px] h-[50px] rounded-[13px] flex-shrink-0
                        flex items-center justify-center text-[24px] select-none"
                      style={{ background: item.chipColor + "22" }}
                    >
                      {item.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#1A1C1C] leading-tight truncate">
                        {item.name}
                      </p>
                      <p className="text-[12px] text-[#3C4A46] mt-[1px]">
                        {label} &bull; {kcal} kcal
                      </p>
                      <p className="text-[10px] text-gray-400 mt-[2px]">
                        P&nbsp;<span className="font-semibold text-[#3C4A46]">{protein}g</span>
                        &nbsp;&nbsp;C&nbsp;<span className="font-semibold text-[#3C4A46]">{carbs}g</span>
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-[9px] flex-shrink-0">
                      <button
                        aria-label={`Decrease ${item.name}`}
                        className="w-[28px] h-[28px] rounded-full bg-[#F3F3F3]
                          flex items-center justify-center active:bg-gray-200 transition-colors"
                        onClick={() => changeQty(item.id, -0.5)}
                      >
                        <svg className="w-[13px] h-[13px] text-[#3C4A46]" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                          <path d="M5 12h14" />
                        </svg>
                      </button>

                      <span className="text-[13px] font-bold text-[#1A1C1C] w-7 text-center tabular-nums">
                        {item.qty}
                      </span>

                      <button
                        aria-label={`Increase ${item.name}`}
                        className="w-[28px] h-[28px] rounded-full bg-[#006B5F]
                          flex items-center justify-center active:bg-[#00574D] transition-colors"
                        onClick={() => changeQty(item.id, 0.5)}
                      >
                        <svg className="w-[13px] h-[13px] text-white" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Ingredient */}
            <button
              className="w-full mt-3 py-[15px] rounded-[18px]
                border-2 border-dashed border-[#BACAC5]/40
                flex items-center justify-center gap-2
                text-[#006B5F] active:bg-[#F0FDFA] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[14px] font-semibold">Add Ingredient</span>
            </button>
          </section>

          {/* Bottom padding so last item clears the Save button */}
          <div className="h-4" />
        </div>

        {/* ── Save button (fixed to sheet bottom) ──────────────────────────── */}
        <div
          className="flex-shrink-0 px-4 pt-3 pb-8"
          style={{
            background:
              "linear-gradient(to top, #F5F7F6 70%, transparent)",
          }}
        >
          <button
            className="w-full py-[15px] rounded-[20px] bg-[#006B5F] text-white
              text-[16px] font-bold tracking-wide shadow-lg
              active:bg-[#00574D] transition-colors"
          >
            Save Meal
          </button>
        </div>
      </div>
    </>
  );
}
