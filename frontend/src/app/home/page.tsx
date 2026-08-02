"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppBottomNav } from "@/components/ui/AppBottomNav";
import { motion } from "motion/react";
import {
  useAppStore,
  selectConsumedKcal,
  type MealSlot,
  type FoodEntry,
} from "@/store/useAppStore";
import { fetchDailyLog, deleteMealEntry, getAuthToken } from "@/lib/api";

/* ─── Helpers ─── */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Ring constants ───────────────────────────────────────────────────────────
const CR_SIZE = 160;
const CR_STROKE = 13;
const CR_R = CR_SIZE / 2 - CR_STROKE / 2;
const CR_C = 2 * Math.PI * CR_R;

const MR_SIZE = 40;
const MR_STROKE = 4;
const MR_R = MR_SIZE / 2 - MR_STROKE / 2;
const MR_C = 2 * Math.PI * MR_R;

// ─── Types ────────────────────────────────────────────────────────────────────
interface MacroData {
  label: string;
  value: number;
  total: number;
  unit: string;
  color: string;
  glow: string;
}

// ─── CalorieRing ──────────────────────────────────────────────────────────────
function CalorieRing({
  remaining,
  goal,
  consumed,
  burned,
}: {
  remaining: number;
  goal: number;
  consumed: number;
  burned: number;
}) {
  const consumedArc = goal > 0 ? (consumed / goal) * CR_C : 0;
  const burnedArc = goal > 0 ? (burned / goal) * CR_C : 0;

  return (
    <div className="relative flex-shrink-0" style={{ width: CR_SIZE, height: CR_SIZE }}>
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: CR_STROKE + 8,
          background: "radial-gradient(circle, rgba(255,173,58,0.07) 0%, transparent 70%)",
        }}
      />
      <svg
        width={CR_SIZE}
        height={CR_SIZE}
        className="absolute inset-0"
        style={{ transform: "rotate(-90deg)" }}
      >
        <defs>
          <filter id="glow-amber">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-teal">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={CR_SIZE / 2} cy={CR_SIZE / 2} r={CR_R}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={CR_STROKE}
        />

        {/* Burned arc */}
        <motion.circle
          cx={CR_SIZE / 2} cy={CR_SIZE / 2} r={CR_R}
          fill="none"
          stroke="#2dd4bf"
          strokeWidth={CR_STROKE - 4}
          strokeLinecap="round"
          filter="url(#glow-teal)"
          strokeDasharray={`${CR_C} ${CR_C}`}
          initial={{ strokeDashoffset: CR_C }}
          animate={{ strokeDashoffset: CR_C - burnedArc }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.6 }}
        />

        {/* Consumed arc */}
        <motion.circle
          cx={CR_SIZE / 2} cy={CR_SIZE / 2} r={CR_R}
          fill="none"
          stroke="#ffad3a"
          strokeWidth={CR_STROKE}
          strokeLinecap="round"
          filter="url(#glow-amber)"
          strokeDasharray={`${CR_C} ${CR_C}`}
          initial={{ strokeDashoffset: CR_C }}
          animate={{ strokeDashoffset: CR_C - consumedArc }}
          transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ pointerEvents: "none" }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "Inter, sans-serif" }}>
          Remaining
        </span>
        <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05, color: "#ffffff", fontFamily: "var(--font-headline, sans-serif)" }}>
          {remaining.toLocaleString()}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.42)", fontFamily: "Inter, sans-serif", marginTop: 1 }}>
          of {goal.toLocaleString()} kcal
        </span>
      </div>
    </div>
  );
}

// ─── MacroRing ────────────────────────────────────────────────────────────────
function MacroRing({ label, value, total, unit, color, glow, index }: MacroData & { index: number }) {
  const arc = total > 0 ? (value / total) * MR_C : 0;

  return (
    <motion.div
      className="flex items-center gap-2 px-0.5"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.35 + index * 0.1 }}
    >
      <div className="relative flex-shrink-0" style={{ width: MR_SIZE, height: MR_SIZE }}>
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${glow} 20%, transparent 70%)` }}
        />
        <svg width={MR_SIZE} height={MR_SIZE} className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={MR_SIZE / 2} cy={MR_SIZE / 2} r={MR_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={MR_STROKE} />
          <motion.circle
            cx={MR_SIZE / 2} cy={MR_SIZE / 2} r={MR_R}
            fill="none"
            stroke={color}
            strokeWidth={MR_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${MR_C} ${MR_C}`}
            initial={{ strokeDashoffset: MR_C }}
            animate={{ strokeDashoffset: MR_C - arc }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.5 + index * 0.1 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-headline, sans-serif)", lineHeight: 1 }}>
            {value}
          </span>
          <span style={{ fontSize: 8, fontWeight: 500, color: "rgba(255,255,255,0.32)", fontFamily: "Inter, sans-serif", marginTop: 1 }}>
            {unit}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", color, fontFamily: "Inter, sans-serif", lineHeight: 1 }}>
          {label}
        </p>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#ffffff", fontFamily: "var(--font-headline, sans-serif)", lineHeight: 1, marginTop: 2 }}>
          {value}
          <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.32)", marginLeft: 2 }}>
            / {total}{unit}
          </span>
        </p>
        <div style={{ height: 3, width: "100%", maxWidth: 60, background: "rgba(255,255,255,0.12)", borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
          <motion.div
            style={{ height: "100%", background: color, borderRadius: 99 }}
            initial={{ width: 0 }}
            animate={{ width: `${total > 0 ? Math.min(100, Math.max(0, Math.round((value / total) * 100))) : 0}%` }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.6 + index * 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

const MEAL_ICONS: Record<MealSlot, string> = {
  breakfast: "🍳",
  lunch: "🍛",
  dinner: "🌙",
  snacks: "🍪",
  snack: "🍪",
};

const MEAL_EMPTY_CTA: Record<MealSlot, { text: string; question: string }> = {
  breakfast: { text: "Log Breakfast", question: "What did you have for breakfast?" },
  lunch: { text: "Log Lunch", question: "What did you have for lunch?" },
  dinner: { text: "Quick Add", question: "Plan your dinner in advance" },
  snacks: { text: "Add Snack", question: "Had a snack today?" },
  snack: { text: "Add Snack", question: "Had a snack today?" },
};

function getFoodEmoji(name: string, fallback: string = "🍽️"): string {
  const lower = name.toLowerCase();
  if (/rice|bath|kiribath/.test(lower)) return "🍚";
  if (/curry|parippu|dhal|kulambu/.test(lower)) return "🍛";
  if (/roti|bread|paratha/.test(lower)) return "🫓";
  if (/hopper|appa/.test(lower)) return "🥞";
  if (/string hopper|indi appam/.test(lower)) return "🍝";
  if (/fish|ambul thiyal/.test(lower)) return "🐟";
  if (/chicken/.test(lower)) return "🍗";
  if (/egg|biththara/.test(lower)) return "🥚";
  if (/sambol|mallung/.test(lower)) return "🥗";
  if (/banana|fruit|mango/.test(lower)) return "🍌";
  if (/watalappam|pudding|sweet/.test(lower)) return "🍮";
  if (/tea|coffee|milk/.test(lower)) return "☕";
  return fallback;
}

function CollectiveMealCard({
  slotKey,
  slotLabel,
  entries,
  mealIcon,
  onDeleteEntry,
  onEditMeal,
}: {
  slotKey: string;
  slotLabel: string;
  entries: FoodEntry[];
  mealIcon: string;
  onDeleteEntry: (id: string) => void;
  onEditMeal: (slot: string) => void;
}) {
  const allItems = useMemo(() => {
    const list: Array<{ id: string; entryId: string; name: string; qty: number; emoji: string }> = [];
    entries.forEach((e) => {
      if (e.ingredients && e.ingredients.length > 0) {
        e.ingredients.forEach((ing, ingIdx) => {
          list.push({
            id: ing.id ? ing.id : `${e.id}::ing::${ingIdx}`,
            entryId: e.id,
            name: ing.name,
            qty: ing.qty || 1,
            emoji: getFoodEmoji(ing.name, mealIcon),
          });
        });
      } else if (e.name && e.name.includes(",")) {
        const parts = e.name.split(",").map((p) => p.trim()).filter(Boolean);
        parts.forEach((itemName, idx) => {
          list.push({
            id: `${e.id}::part::${idx}`,
            entryId: e.id,
            name: itemName,
            qty: 1,
            emoji: getFoodEmoji(itemName, mealIcon),
          });
        });
      } else {
        list.push({
          id: e.id,
          entryId: e.id,
          name: e.name,
          qty: 1,
          emoji: getFoodEmoji(e.name, mealIcon),
        });
      }
    });
    return list;
  }, [entries, mealIcon]);

  const totalKcal = entries.reduce((s, e) => s + e.kcal, 0);
  const totalProtein = entries.reduce((s, e) => s + e.protein, 0);
  const totalCarbs = entries.reduce((s, e) => s + e.carbs, 0);
  const totalFat = entries.reduce((s, e) => s + e.fat, 0);

  return (
    <div className="relative mb-3 group cursor-pointer" onClick={() => onEditMeal(slotKey)}>
      {/* Top-Right Edit Meal Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onEditMeal(slotKey); }}
        title={`Edit ${slotLabel}`}
        className="absolute top-2.5 right-9 z-20 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Edit
      </button>

      {/* Top-Right Card Delete Button (deletes all entries in this meal slot) */}
      <button
        onClick={(e) => { e.stopPropagation(); entries.forEach(el => onDeleteEntry(el.id)); }}
        title={`Delete all ${slotLabel} items`}
        className="absolute -top-2 -right-2 z-20 w-7 h-7 rounded-full bg-red-500 text-white shadow-md flex items-center justify-center opacity-90 hover:opacity-100 hover:scale-110 active:scale-95 transition-all cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Exact Greenish Plate Card matching Search Page */}
      <div 
        className="flex-none shadow-[0_10px_40px_rgba(0,107,95,0.2)] rounded-[26px] p-4 flex gap-[14px] overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, rgba(0,68,57,0.95) 0%, rgba(0,121,107,0.95) 50%, rgba(20,184,166,0.92) 100%)",
          backdropFilter: "blur(12px)"
        }}
      >
        {/* Left Side: Total Stats */}
        <div className="w-[42%] flex flex-col justify-center border-r border-white/20 pr-3 relative">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 mb-1 leading-none">Total</p>
            <p className="text-[36px] font-extrabold text-white tracking-[-1px] leading-none flex items-baseline gap-[2px]">
              {totalKcal}<span className="text-[15px] font-semibold opacity-75">kcal</span>
            </p>
          </div>
          <div className="flex justify-between mt-4 pr-1">
            {[
              { label: "P", val: totalProtein },
              { label: "C", val: totalCarbs },
              { label: "F", val: totalFat }
            ].map(({ label, val }) => (
              <div key={label} className="flex flex-col items-start gap-[1px]">
                <p className="text-[9px] font-bold text-white/50 leading-none">{label}</p>
                <p className="text-[13px] font-extrabold text-white leading-none">
                  {val}<span className="text-[9px] font-normal opacity-75 ml-[1px]">g</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Scrollable List of ALL Foods in this Meal Slot */}
        <div className="w-[58%] flex flex-col gap-[6px] max-h-[125px] overflow-y-auto no-scrollbar pl-1">
          {allItems.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="bg-white/14 rounded-[14px] py-2 px-[10px] flex items-center gap-[10px] relative group/item" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span className="text-[18px] leading-none">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate leading-tight">{item.name}</p>
                <p className="text-[10px] text-white/60 truncate mt-[1px] tracking-wide">{item.qty} {item.qty === 1 ? 'srv' : 'srvs'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="bg-black/20 rounded-full px-2 py-0.5 select-none">
                  <span className="text-[11px] font-bold text-white/90 tabular-nums">x{item.qty}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteEntry(item.entryId); }}
                  title={`Remove ${item.name}`}
                  className="w-5 h-5 rounded-full bg-black/30 hover:bg-red-500 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Component ─── */

export default function HomePage() {
  const router = useRouter();
  const logout = useAppStore((s) => s.logout);
  const name = useAppStore((s) => s.name);
  const targetCalories = useAppStore((s) => s.targetCalories) || 1850;
  const targetCarbsG = useAppStore((s) => s.targetCarbsG) || 250;
  const targetProteinG = useAppStore((s) => s.targetProteinG) || 120;
  const targetFatG = useAppStore((s) => s.targetFatG) || 65;
  const consumed = useAppStore(selectConsumedKcal);
  const consumedCarbs = useAppStore((s) => s.entries.reduce((sum, e) => sum + e.carbs, 0));
  const consumedProtein = useAppStore((s) => s.entries.reduce((sum, e) => sum + e.protein, 0));
  const consumedFat = useAppStore((s) => s.entries.reduce((sum, e) => sum + e.fat, 0));

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/");
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    logout();
    router.replace("/");
  };

  /* useShallow prevents infinite loops — .filter() returns new array refs each call */
  const breakfastEntries = useAppStore(useShallow((s) => s.entries.filter((e: FoodEntry) => e.meal === "breakfast")));
  const lunchEntries = useAppStore(useShallow((s) => s.entries.filter((e: FoodEntry) => e.meal === "lunch")));
  const dinnerEntries = useAppStore(useShallow((s) => s.entries.filter((e: FoodEntry) => e.meal === "dinner")));
  const snacksEntries = useAppStore(useShallow((s) => s.entries.filter((e: FoodEntry) => e.meal === "snacks" || e.meal === "snack")));
  const breakfastKcal = useAppStore((s) => s.entries.filter((e) => e.meal === "breakfast").reduce((sum, e) => sum + e.kcal, 0));
  const lunchKcal = useAppStore((s) => s.entries.filter((e) => e.meal === "lunch").reduce((sum, e) => sum + e.kcal, 0));
  const dinnerKcal = useAppStore((s) => s.entries.filter((e) => e.meal === "dinner").reduce((sum, e) => sum + e.kcal, 0));
  const snacksKcal = useAppStore((s) => s.entries.filter((e) => e.meal === "snacks" || e.meal === "snack").reduce((sum, e) => sum + e.kcal, 0));
  const removeFoodEntry = useAppStore((s) => s.removeFoodEntry);

  const queryClient = useQueryClient();
  const dateIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { data: dailyLog } = useQuery({
    queryKey: ['dailyLog', dateIso],
    queryFn: () => fetchDailyLog(dateIso),
  });

  useEffect(() => {
    if (dailyLog && dailyLog.entries) {
      const storeEntries = useAppStore.getState().entries;
      const apiEntries: FoodEntry[] = dailyLog.entries.map((e) => {
        let mealSlot: MealSlot = 'breakfast';
        const m = e.meal.toLowerCase();
        if (m === 'lunch') mealSlot = 'lunch';
        else if (m === 'dinner') mealSlot = 'dinner';
        else if (m === 'snacks' || m === 'snack') mealSlot = 'snacks';

        const existingLocal = storeEntries.find(st => st.id === e.id);
        let foodName = e.unitName || e.food?.name || "";
        if (!foodName || foodName.endsWith("items") || foodName.endsWith("servings") || foodName.includes("Item")) {
          if (existingLocal && existingLocal.name) {
            foodName = existingLocal.name;
          } else {
            foodName = e.food?.name || `${mealSlot.charAt(0).toUpperCase() + mealSlot.slice(1)} Entry`;
          }
        }

        return {
          id: e.id,
          name: foodName,
          kcal: Math.round(e.loggedCaloriesKcal),
          carbs: Math.round(e.loggedCarbohydratesG),
          protein: Math.round(e.loggedProteinG),
          fat: Math.round(e.loggedFatG),
          serving: e.unitName,
          meal: mealSlot,
          ingredients: existingLocal?.ingredients,
        };
      });

      useAppStore.setState({ entries: apiEntries });
    }
  }, [dailyLog]);

  const handleDeleteEntry = async (id: string) => {
    removeFoodEntry(id);
    try {
      await deleteMealEntry(id);
    } catch (err) {
      console.error('Failed to delete meal entry from backend:', err);
    }
    queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
  };

  const remaining = Math.max(0, targetCalories - consumed);
  const progress = targetCalories > 0 ? consumed / targetCalories : 0;
  const greeting = useMemo(() => getGreeting(), []);
  const todayStr = useMemo(() => formatDate(new Date()), []);
  const displayName = name || "there";

  const meals: { slot: MealSlot; entries: typeof breakfastEntries; kcal: number }[] = [
    { slot: "breakfast", entries: breakfastEntries, kcal: breakfastKcal },
    { slot: "lunch", entries: lunchEntries, kcal: lunchKcal },
    { slot: "dinner", entries: dinnerEntries, kcal: dinnerKcal },
    { slot: "snacks", entries: snacksEntries, kcal: snacksKcal },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-[100px] font-sans pt-[72px]">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 bg-white/80 backdrop-blur-xl flex justify-between items-center border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <Link href="/profile" title="View Profile & Settings" className="w-8 h-8 rounded-full border border-[#006B5F]/20 overflow-hidden bg-[#006B5F]/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-[10px] text-[#006B5F] font-black">
            {displayName.slice(0, 2).toUpperCase()}
          </Link>

          <div>
            <h1 className="text-[18px] font-extrabold text-[#006B5F] tracking-tight leading-none mb-[2px]">
              CalTrack
            </h1>
            <p className="text-[10px] font-medium text-[#3C4A46]/70 uppercase tracking-widest leading-none">
              {todayStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </header>

      <main className="px-6 pt-5 flex flex-col gap-6">
        {/* Greeting Section */}
        <div>
          <h2 className="text-2xl font-extrabold text-[#1A1C1C] tracking-[-0.6px]">
            {greeting}, {displayName}
          </h2>
          <p className="text-[16px] font-medium text-[#3C4A46] opacity-80 mt-1">
            Ready for a mindful day of wellness?
          </p>
        </div>

        {/* Nutrition Card */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          style={{ fontFamily: "var(--font-headline, sans-serif)" }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: 32,
              background: "linear-gradient(150deg, #082e2a 0%, #0a4038 35%, #005c4e 70%, #00695c 100%)",
              boxShadow: "0 40px 80px rgba(0,60,50,0.35), 0 12px 28px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
              padding: "20px 16px 22px",
            }}
          >
            {/* Ambient blobs */}
            <div className="absolute pointer-events-none" style={{ width: 240, height: 240, top: -100, right: -70, background: "radial-gradient(circle, rgba(255,173,58,0.16) 0%, transparent 65%)" }} />
            <div className="absolute pointer-events-none" style={{ width: 180, height: 180, bottom: -80, left: -50, background: "radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 65%)" }} />
            <div className="absolute pointer-events-none" style={{ top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />

            {/* Header */}
            <div className="flex items-start justify-between mb-5 relative">
              <div>
                <p style={{ fontSize: 17, fontWeight: 800, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.3px" }}>
                  Health Card
                </p>
                <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.38)", fontFamily: "Inter, sans-serif", marginTop: 4 }}>
                  {todayStr}
                </p>
              </div>
              <div
                className="flex items-center gap-1.5 mt-0.5"
                style={{ background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: 999, padding: "5px 11px" }}
              >
                <div className="rounded-full" style={{ width: 6, height: 6, background: "#2dd4bf", boxShadow: "0 0 6px rgba(45,212,191,0.7)" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#2dd4bf", fontFamily: "Inter, sans-serif", letterSpacing: "0.2px" }}>
                  On track
                </span>
              </div>
            </div>

            {/* Ring + Macros */}
            <div className="flex items-center justify-between gap-2.5 relative">
              <CalorieRing
                remaining={remaining}
                goal={targetCalories}
                consumed={consumed}
                burned={0}
              />
              <div 
                className="flex flex-col justify-between flex-1 min-w-0 rounded-2xl p-2.5 px-3.5 border border-white/[0.08] shadow-inner"
                style={{ height: CR_SIZE, background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}
              >
                {[
                  { label: "Carbs",   value: consumedCarbs, total: targetCarbsG, unit: "g", color: "#ffad3a", glow: "rgba(255,173,58,0.25)" },
                  { label: "Protein", value: consumedProtein,  total: targetProteinG, unit: "g", color: "#2dd4bf", glow: "rgba(45,212,191,0.2)" },
                  { label: "Fat",     value: consumedFat,  total: targetFatG,  unit: "g", color: "#94a3b8", glow: "rgba(148,163,184,0.2)" },
                ].map((m, i) => (
                  <MacroRing key={m.label} {...m} index={i} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Scroll */}
        <div>
          <h3 className="text-[18px] font-bold text-[#1A1C1C] mb-3">
            Quick Actions
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar mb-6">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E8E8E8]/40 rounded-[12px] whitespace-nowrap">
              <svg className="w-[18px] h-[18px] text-[#006B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[14px] font-semibold text-[#1A1C1C]">
                Recent Foods
              </span>
            </button>
          </div>
        </div>

        {/* ─── Meal Sections (data-driven) ─── */}
        {meals.map(({ slot, entries: mealEntries, kcal }) => {
          const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
          const hasEntries = mealEntries.length > 0;

          if (slot === "snacks" && !hasEntries) {
            /* Special snacks empty state — warm amber card */
            return (
              <div key={slot}>
                <div className="flex justify-between items-end mb-3">
                  <h3 className="text-[20px] font-extrabold text-[#1A1C1C] tracking-[-0.5px]">
                    {capitalize(slot)}
                  </h3>
                  <span className="text-[12px] font-bold text-[#3C4A46]/40 uppercase tracking-[1.2px] mb-0.5">
                    EMPTY
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/search?meal=${slot}`)}
                  className="w-full bg-[#FFFBF4] border border-[#855300]/10 rounded-[16px] px-5 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform hover:bg-[#FFF8EE]"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#FFAD3A]/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#855300]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c.83 0 1.5-.67 1.5-1.5S12.83 5 12 5s-1.5.67-1.5 1.5S11.17 8 12 8zm-2 4c.83 0 1.5-.67 1.5-1.5S10.83 9 10 9s-1.5.67-1.5 1.5S9.17 12 10 12zm5 2c.83 0 1.5-.67 1.5-1.5S15.83 11 15 11s-1.5.67-1.5 1.5S14.17 14 15 14z" />
                      <circle cx="12" cy="12" r="9" strokeWidth={2} />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-bold text-[#1A1C1C]">Had a snack today?</p>
                    <p className="text-[12px] font-medium text-[#855300]/70 mt-0.5">Track bites between meals</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#FFAD3A]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#855300]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>
              </div>
            );
          }

          return (
            <div key={slot}>
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-[20px] font-extrabold text-[#1A1C1C] tracking-[-0.5px]">
                  {capitalize(slot)}
                </h3>
                <span className={`text-[12px] font-bold uppercase tracking-[1.2px] mb-0.5 ${hasEntries ? "text-[#006B5F]" : "text-[#3C4A46]/40"}`}>
                  {hasEntries ? `${kcal} KCAL` : "EMPTY"}
                </span>
              </div>

              {hasEntries ? (
                /* Populated state — show single collective greenish card per meal slot with scrollable foods list */
                <div className="flex flex-col gap-2">
                  <CollectiveMealCard
                    slotKey={slot}
                    slotLabel={capitalize(slot)}
                    entries={mealEntries}
                    mealIcon={MEAL_ICONS[slot]}
                    onDeleteEntry={handleDeleteEntry}
                    onEditMeal={(s) => router.push(`/search?meal=${s}`)}
                  />

                  <button
                    onClick={() => router.push(`/search?meal=${slot}`)}
                    className="w-full py-2.5 bg-[#F3F3F3] text-[#006B5F] rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-gray-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-[12px] font-bold tracking-[1.2px] uppercase">Add Food</span>
                  </button>
                </div>
              ) : (
                /* Empty state */
                <div className="bg-[#F3F3F3] border-2 border-dashed border-[#BACAC5]/30 rounded-[16px] p-6 flex flex-col items-center justify-center gap-3">
                  <svg className="w-8 h-8 text-[#3C4A46]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {slot === "dinner" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <p className="text-[14px] font-medium text-[#3C4A46] text-center">
                    {MEAL_EMPTY_CTA[slot]?.question || "Track your meal for today"}
                  </p>
                  <button
                    onClick={() => router.push(`/search?meal=${slot}`)}
                    className={`px-6 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-[1.2px] mt-1 ${
                      slot === "dinner"
                        ? "border border-[#006B5F]/20 text-[#006B5F]"
                        : "bg-[#006B5F] text-white shadow-[0_10px_15px_-3px_rgba(0,107,95,0.2)]"
                    }`}
                  >
                    {MEAL_EMPTY_CTA[slot]?.text || "Add Food"}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Mindful Tip */}
        <div className="bg-[#F3F3F3] rounded-[24px] p-6 mt-4 relative overflow-hidden">
          <h4 className="text-[20px] font-extrabold text-[#1A1C1C] mb-2">
            Mindful Tip
          </h4>
          <p className="text-[14px] tracking-tight text-[#3C4A46] mb-8 leading-relaxed max-w-[85%]">
            Adding Gotu Kola sambol to your lunch provides essential micronutrients for brain health.
          </p>

          <div className="mt-auto">
            <div className="w-8 h-8 flex items-center justify-center bg-white/50 rounded-full">
              <svg className="w-5 h-5 text-[#006B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Weekly Streak */}
        <div className="relative bg-[#FFFBF4] border border-[#855300]/10 rounded-[24px] p-6 overflow-hidden mt-1">
          <div className="flex justify-between items-start mb-2 relative z-10 w-full">
            <div>
              <p className="text-[10px] font-bold text-[#855300] uppercase tracking-widest mb-1">
                Weekly Streak
              </p>
              <p className="text-[30px] font-extrabold text-[#855300] leading-none mb-4">
                14 Days
              </p>
            </div>

            <svg className="w-5 h-5 text-[#855300] opacity-80 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>

          <p className="text-[12px] font-medium text-[#855300]/80 pr-4 relative z-10">
            You&apos;re in the top 5% of mindful trackers in Sri Lanka this month!
          </p>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}