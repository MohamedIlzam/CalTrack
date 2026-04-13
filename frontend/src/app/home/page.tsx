"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppBottomNav } from "@/components/ui/AppBottomNav";
import { CalorieCard } from "@/components/ui/CalorieCard";
import {
  useAppStore,
  selectConsumedKcal,
  selectEntriesByMeal,
  selectKcalByMeal,
  type MealSlot,
} from "@/store/useAppStore";

/* ─── Helpers ─── */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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
};

const MEAL_EMPTY_CTA: Record<MealSlot, { text: string; question: string }> = {
  breakfast: { text: "Log Breakfast", question: "What did you have for breakfast?" },
  lunch: { text: "Log Lunch", question: "What did you have for lunch?" },
  dinner: { text: "Quick Add", question: "Plan your dinner in advance" },
  snacks: { text: "Add Snack", question: "Had a snack today?" },
};

/* ─── Component ─── */

export default function HomePage() {
  const router = useRouter();
  const name = useAppStore((s) => s.name);
  const targetCalories = useAppStore((s) => s.targetCalories) || 1850;
  const targetCarbsG = useAppStore((s) => s.targetCarbsG) || 250;
  const targetProteinG = useAppStore((s) => s.targetProteinG) || 120;
  const targetFatG = useAppStore((s) => s.targetFatG) || 65;
  const consumed = useAppStore(selectConsumedKcal);
  const consumedCarbs = useAppStore((s) => s.entries.reduce((sum, e) => sum + e.carbs, 0));
  const consumedProtein = useAppStore((s) => s.entries.reduce((sum, e) => sum + e.protein, 0));
  const consumedFat = useAppStore((s) => s.entries.reduce((sum, e) => sum + e.fat, 0));

  const breakfastEntries = useAppStore(selectEntriesByMeal("breakfast"));
  const lunchEntries = useAppStore(selectEntriesByMeal("lunch"));
  const dinnerEntries = useAppStore(selectEntriesByMeal("dinner"));
  const snacksEntries = useAppStore(selectEntriesByMeal("snacks"));
  const breakfastKcal = useAppStore(selectKcalByMeal("breakfast"));
  const lunchKcal = useAppStore(selectKcalByMeal("lunch"));
  const dinnerKcal = useAppStore(selectKcalByMeal("dinner"));
  const snacksKcal = useAppStore(selectKcalByMeal("snacks"));
  const removeFoodEntry = useAppStore((s) => s.removeFoodEntry);

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
          <div className="w-8 h-8 rounded-full border border-[#006B5F]/10 overflow-hidden bg-gray-200">
            <div className="w-full h-full bg-[#006B5F]/20 flex items-center justify-center text-[10px] text-[#006B5F] font-bold">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div>
            <h1 className="text-[18px] font-extrabold text-[#006B5F] tracking-tight leading-none mb-[2px]">
              CalTrack
            </h1>
            <p className="text-[10px] font-medium text-[#3C4A46]/70 uppercase tracking-widest leading-none">
              {todayStr}
            </p>
          </div>
        </div>

        <button className="text-gray-500 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
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

        {/* Bento Vitality Metric Card */}
        <div className="relative w-full h-[260px] flex items-stretch">
          {/* Main Teal Card */}
          <div className="relative z-10 w-[56%]">
            <CalorieCard
              remaining={remaining}
              consumed={consumed}
              burned={0}
              progress={progress}
            />
          </div>

          {/* Macro Mini Cards Container */}
          <div className="absolute right-0 top-0 bottom-0 w-[50%] flex flex-col justify-between py-1 z-0 gap-[10px] pl-2">
            {/* Carbs */}
            <div className="bg-white rounded-[20px] p-3 shadow-sm border border-[#BACAC5]/10 flex-1 ml-auto w-full max-w-[145px] pl-[34px] flex flex-col justify-center gap-1.5">
              <p className="text-[10px] font-bold text-[#3C4A46] uppercase tracking-wider">
                Carbs
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-[18px] font-extrabold text-[#1A1C1C] leading-none">
                  {consumedCarbs}
                </span>
                <span className="text-[11px] font-medium text-[#3C4A46] leading-none">
                  / {targetCarbsG}g
                </span>
              </div>
              <div className="w-full h-[6px] bg-[#F3F3F3] rounded-full overflow-hidden">
                <div className="h-full bg-[#FFAD3A] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round((consumedCarbs / targetCarbsG) * 100))}%` }}></div>
              </div>
            </div>

            {/* Protein */}
            <div className="bg-white rounded-[20px] p-3 shadow-sm border border-[#BACAC5]/10 flex-1 ml-auto w-full max-w-[145px] pl-[34px] flex flex-col justify-center gap-1.5">
              <p className="text-[10px] font-bold text-[#3C4A46] uppercase tracking-wider">
                Protein
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-[18px] font-extrabold text-[#1A1C1C] leading-none">
                  {consumedProtein}
                </span>
                <span className="text-[11px] font-medium text-[#3C4A46] leading-none">
                  / {targetProteinG}g
                </span>
              </div>
              <div className="w-full h-[6px] bg-[#F3F3F3] rounded-full overflow-hidden">
                <div className="h-full bg-[#643E00] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round((consumedProtein / targetProteinG) * 100))}%` }}></div>
              </div>
            </div>

            {/* Fat */}
            <div className="bg-white rounded-[20px] p-3 shadow-sm border border-[#BACAC5]/10 flex-1 ml-auto w-full max-w-[145px] pl-[34px] flex flex-col justify-center gap-1.5">
              <p className="text-[10px] font-bold text-[#3C4A46] uppercase tracking-wider">
                Fat
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-[18px] font-extrabold text-[#1A1C1C] leading-none">
                  {consumedFat}
                </span>
                <span className="text-[11px] font-medium text-[#3C4A46] leading-none">
                  / {targetFatG}g
                </span>
              </div>
              <div className="w-full h-[6px] bg-[#F3F3F3] rounded-full overflow-hidden">
                <div className="h-full bg-[#005047] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round((consumedFat / targetFatG) * 100))}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Scroll */}
        <div>
          <h3 className="text-[18px] font-bold text-[#1A1C1C] mb-3">
            Quick Actions
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E8E8E8]/40 rounded-[12px] whitespace-nowrap">
              <svg className="w-[18px] h-[18px] text-[#006B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[14px] font-semibold text-[#1A1C1C]">
                Recent Foods
              </span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E8E8E8]/40 rounded-[12px] whitespace-nowrap">
              <svg className="w-[18px] h-[18px] text-[#006B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-[14px] font-semibold text-[#1A1C1C]">
                Saved Meals
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
                /* Populated state — show logged food rows */
                <div className="bg-white rounded-[16px] shadow-sm p-4 flex flex-col gap-0 border border-[#EEEEEE]/50">
                  {mealEntries.map((entry, i) => (
                    <div key={entry.id}>
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#F3F3F3] rounded-xl overflow-hidden flex items-center justify-center text-xl">
                            {MEAL_ICONS[slot]}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-[#1A1C1C]">{entry.name}</p>
                            <p className="text-[12px] font-medium text-[#3C4A46]">{entry.serving}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-[#3C4A46]">{entry.kcal}</span>
                          <button
                            onClick={() => removeFoodEntry(entry.id)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#3C4A46]/30 hover:text-red-400 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {i < mealEntries.length - 1 && (
                        <div className="border-t border-[#EEEEEE] my-2" />
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => router.push(`/search?meal=${slot}`)}
                    className="w-full py-2.5 bg-[#F3F3F3] text-[#006B5F] rounded-xl flex items-center justify-center gap-2 mt-3 transition-colors hover:bg-gray-200"
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
                    {MEAL_EMPTY_CTA[slot].question}
                  </p>
                  <button
                    onClick={() => router.push(`/search?meal=${slot}`)}
                    className={`px-6 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-[1.2px] mt-1 ${
                      slot === "dinner"
                        ? "border border-[#006B5F]/20 text-[#006B5F]"
                        : "bg-[#006B5F] text-white shadow-[0_10px_15px_-3px_rgba(0,107,95,0.2)]"
                    }`}
                  >
                    {MEAL_EMPTY_CTA[slot].text}
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