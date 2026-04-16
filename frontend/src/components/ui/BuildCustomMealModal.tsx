"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Food {
  id: string;
  name: string;
  kcalPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  emoji: string;
  chipColor: string;
}
interface PlateItem extends Food { qty: number; }

type AiRole = "user" | "ai";
interface AiMessage {
  id: string;
  role: AiRole;
  text: string;
  suggestedFood?: Food;   // AI-generated ingredient card
}

interface BuildCustomMealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Food database ─────────────────────────────────────────────────────────────
// Swap the .filter() for a real Supabase query when DB is wired up.
const FOOD_DB: Food[] = [
  { id: "red-rice",      name: "Red Rice",          kcalPerServing: 120, proteinPerServing: 2.7, carbsPerServing: 26.7, fatPerServing: 0,   emoji: "🍚", chipColor: "#C45C1A" },
  { id: "white-rice",    name: "White Rice",         kcalPerServing: 130, proteinPerServing: 2.4, carbsPerServing: 28.2, fatPerServing: 0.3, emoji: "🍚", chipColor: "#D4A574" },
  { id: "kiribath",      name: "Kiribath",           kcalPerServing: 185, proteinPerServing: 3,   carbsPerServing: 38,   fatPerServing: 3,   emoji: "🍘", chipColor: "#F0E0B0" },
  { id: "hopper",        name: "Hopper (Appam)",     kcalPerServing: 120, proteinPerServing: 2.8, carbsPerServing: 22,   fatPerServing: 2.5, emoji: "🥞", chipColor: "#E8C86A" },
  { id: "string-hopper", name: "String Hoppers",     kcalPerServing: 100, proteinPerServing: 2.2, carbsPerServing: 21,   fatPerServing: 0.8, emoji: "🍝", chipColor: "#F5D49A" },
  { id: "pol-roti",      name: "Pol Roti",           kcalPerServing: 180, proteinPerServing: 3.5, carbsPerServing: 24,   fatPerServing: 7.5, emoji: "🫓", chipColor: "#C8A05A" },
  { id: "bread",         name: "Bread (slice)",      kcalPerServing: 80,  proteinPerServing: 3,   carbsPerServing: 15,   fatPerServing: 1,   emoji: "🍞", chipColor: "#D4A070" },
  { id: "dhal-curry",    name: "Dhal Curry",         kcalPerServing: 140, proteinPerServing: 8,   carbsPerServing: 18,   fatPerServing: 4,   emoji: "🍛", chipColor: "#E8A020" },
  { id: "fish-curry",    name: "Fish Curry",         kcalPerServing: 165, proteinPerServing: 18,  carbsPerServing: 5,    fatPerServing: 8,   emoji: "🐟", chipColor: "#E07040" },
  { id: "chicken-curry", name: "Chicken Curry",      kcalPerServing: 195, proteinPerServing: 22,  carbsPerServing: 4,    fatPerServing: 9,   emoji: "🍗", chipColor: "#D4763A" },
  { id: "pol-sambol",    name: "Pol Sambol",         kcalPerServing: 260, proteinPerServing: 6,   carbsPerServing: 14,   fatPerServing: 16,  emoji: "🥥", chipColor: "#2C7A45" },
  { id: "lunu-miris",    name: "Lunu Miris",         kcalPerServing: 45,  proteinPerServing: 1,   carbsPerServing: 7,    fatPerServing: 1.5, emoji: "🌶️", chipColor: "#C0392B" },
  { id: "kottu",         name: "Kottu Roti",         kcalPerServing: 320, proteinPerServing: 14,  carbsPerServing: 42,   fatPerServing: 11,  emoji: "🫕", chipColor: "#8B6914" },
  { id: "egg",           name: "Boiled Egg",         kcalPerServing: 78,  proteinPerServing: 6,   carbsPerServing: 0.6,  fatPerServing: 5,   emoji: "🥚", chipColor: "#F4D03F" },
  { id: "papadam",       name: "Papadam",            kcalPerServing: 50,  proteinPerServing: 2,   carbsPerServing: 8,    fatPerServing: 1,   emoji: "🫓", chipColor: "#D4A030" },
  { id: "potato",        name: "Tempered Potato",    kcalPerServing: 155, proteinPerServing: 2.5, carbsPerServing: 28,   fatPerServing: 4,   emoji: "🥔", chipColor: "#D4A830" },
  { id: "gotu-kola",     name: "Gotu Kola Sambol",   kcalPerServing: 55,  proteinPerServing: 1.5, carbsPerServing: 6,    fatPerServing: 2.5, emoji: "🥬", chipColor: "#27AE60" },
  { id: "jackfruit",     name: "Jackfruit Curry",    kcalPerServing: 145, proteinPerServing: 2,   carbsPerServing: 30,   fatPerServing: 2,   emoji: "🍈", chipColor: "#7DC940" },
  { id: "banana",        name: "Banana",             kcalPerServing: 90,  proteinPerServing: 1,   carbsPerServing: 23,   fatPerServing: 0.3, emoji: "🍌", chipColor: "#F4D03F" },
  { id: "mango",         name: "Mango",              kcalPerServing: 70,  proteinPerServing: 0.5, carbsPerServing: 17,   fatPerServing: 0.3, emoji: "🥭", chipColor: "#FF8C00" },
  { id: "coconut-milk",  name: "Coconut Milk",       kcalPerServing: 110, proteinPerServing: 1,   carbsPerServing: 3,    fatPerServing: 11,  emoji: "🥛", chipColor: "#E0F0E8" },
  { id: "watalappam",    name: "Watalappam",         kcalPerServing: 210, proteinPerServing: 4,   carbsPerServing: 28,   fatPerServing: 9,   emoji: "🍮", chipColor: "#8B4513" },
];

// ─── Mock AI ingredient generator ─────────────────────────────────────────────
// TODO: Replace with a real Claude / Supabase Edge Function call.
function generateFoodFromDescription(desc: string): Food {
  const lower = desc.toLowerCase();
  let base = { kcal: 150, p: 8, c: 15, f: 6 };
  if (/rice|bath|kiri/.test(lower))            base = { kcal: 150, p: 3,  c: 32, f: 1  };
  else if (/curry|kulambu|gravy/.test(lower))  base = { kcal: 165, p: 11, c: 12, f: 8  };
  else if (/sambol|mallung|salad/.test(lower)) base = { kcal: 60,  p: 2,  c: 8,  f: 3  };
  else if (/roti|bread|hopper/.test(lower))    base = { kcal: 140, p: 4,  c: 25, f: 4  };
  else if (/chicken|beef|pork|lamb/.test(lower)) base = { kcal: 210, p: 24, c: 2,  f: 11 };
  else if (/fish|prawn|crab/.test(lower))      base = { kcal: 160, p: 20, c: 3,  f: 7  };
  else if (/egg/.test(lower))                  base = { kcal: 80,  p: 6,  c: 1,  f: 5  };
  else if (/fruit|mango|banana|papaya/.test(lower)) base = { kcal: 75, p: 1, c: 18, f: 0.3 };

  const jitter = (n: number, range: number) =>
    Math.max(0, Math.round(n + (Math.random() - 0.5) * range));

  const name = desc.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  const palettes: Array<[string, string]> = [
    ["🥘", "#006B5F"], ["🍲", "#E8A020"], ["🫕", "#C45C1A"],
    ["🍽️", "#2C7A45"], ["🥗", "#D4763A"],
  ];
  const [emoji, chipColor] = palettes[Math.floor(Math.random() * palettes.length)];

  return {
    id: `ai-${Date.now()}`,
    name,
    kcalPerServing:    jitter(base.kcal, 20),
    proteinPerServing: jitter(base.p, 4),
    carbsPerServing:   jitter(base.c, 6),
    fatPerServing:     jitter(base.f, 3),
    emoji,
    chipColor,
  };
}

// ─── Shared Stepper ───────────────────────────────────────────────────────────
function Stepper({ qty, onIncrease, onDecrease }: {
  qty: number; onIncrease: () => void; onDecrease: () => void;
}) {
  return (
    <div className="flex items-center gap-[8px] flex-shrink-0">
      <button
        aria-label="Decrease" onClick={onDecrease} disabled={qty === 0}
        className="w-[28px] h-[28px] rounded-full bg-[#F3F3F3]
          flex items-center justify-center transition-opacity"
        style={{ opacity: qty === 0 ? 0.35 : 1 }}
      >
        <svg className="w-[13px] h-[13px] text-[#3C4A46]" fill="none" stroke="currentColor"
          viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12h14" /></svg>
      </button>
      <span className="text-[13px] font-bold text-[#1A1C1C] w-6 text-center tabular-nums select-none">
        {qty > 0 ? qty : "0"}
      </span>
      <button
        aria-label="Increase" onClick={onIncrease}
        className="w-[28px] h-[28px] rounded-full bg-[#006B5F]
          flex items-center justify-center active:bg-[#00574D] transition-colors"
      >
        <svg className="w-[13px] h-[13px] text-white" fill="none" stroke="currentColor"
          viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BuildCustomMealModal({ isOpen, onClose }: BuildCustomMealModalProps) {
  // Only render to the portal once the modal has been opened at least once,
  // and keep it alive for 450 ms after closing so the slide-out animation
  // can finish before the element is removed from the DOM.
  const [mounted,   setMounted]   = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (isOpen) { setIsVisible(true); return; }
    const t = setTimeout(() => setIsVisible(false), 450);
    return () => clearTimeout(t);
  }, [isOpen]);

  const [mealName,    setMealName]    = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [plateItems,  setPlateItems]  = useState<PlateItem[]>([]);

  // ── AI panel state ──────────────────────────────────────────────────────────
  const [aiOpen,     setAiOpen]     = useState(false);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput,    setAiInput]    = useState("");
  const [aiThinking, setAiThinking] = useState(false);

  const searchRef   = useRef<HTMLInputElement>(null);
  const aiInputRef  = useRef<HTMLInputElement>(null);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMealName(""); setSearchQuery(""); setPlateItems([]);
      setAiOpen(false); setAiMessages([]); setAiInput("");
    }
  }, [isOpen]);

  // Scroll AI thread to bottom on new message
  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }
  }, [aiMessages, aiThinking]);

  // ── Search ───────────────────────────────────────────────────────────────────
  const searchResults = searchQuery.trim()
    ? FOOD_DB.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : [];

  // ── Plate helpers ─────────────────────────────────────────────────────────────
  const getPlateQty = (id: string) => plateItems.find((i) => i.id === id)?.qty ?? 0;

  function handleIncrease(food: Food) {
    setPlateItems((prev) => {
      const ex = prev.find((i) => i.id === food.id);
      if (ex) return prev.map((i) => i.id === food.id ? { ...i, qty: Math.round((i.qty + 0.5) * 2) / 2 } : i);
      return [...prev, { ...food, qty: 0.5 }];
    });
  }
  function handleDecrease(food: Food) {
    setPlateItems((prev) => {
      const ex = prev.find((i) => i.id === food.id);
      if (!ex || ex.qty === 0) return prev;
      if (ex.qty <= 0.5) return prev.filter((i) => i.id !== food.id);
      return prev.map((i) => i.id === food.id ? { ...i, qty: Math.round((i.qty - 0.5) * 2) / 2 } : i);
    });
  }

  // ── Totals ────────────────────────────────────────────────────────────────────
  const totalKcal    = Math.round(plateItems.reduce((s, i) => s + i.kcalPerServing    * i.qty, 0));
  const totalProtein = Math.round(plateItems.reduce((s, i) => s + i.proteinPerServing * i.qty, 0));
  const totalCarbs   = Math.round(plateItems.reduce((s, i) => s + i.carbsPerServing   * i.qty, 0));
  const totalFat     = Math.round(plateItems.reduce((s, i) => s + i.fatPerServing     * i.qty, 0));

  // ── AI actions ────────────────────────────────────────────────────────────────
  function openAiPanel() {
    if (aiMessages.length === 0) {
      setAiMessages([{
        id: "welcome",
        role: "ai",
        text: "Hi! Describe any ingredient — even niche or homemade dishes — and I'll estimate its nutrition for you. 🍽️",
      }]);
    }
    setAiOpen(true);
    setTimeout(() => aiInputRef.current?.focus(), 350);
  }

  function sendAiMessage() {
    const text = aiInput.trim();
    if (!text || aiThinking) return;

    const userMsg: AiMessage = { id: `u-${Date.now()}`, role: "user", text };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setAiThinking(true);

    // TODO: replace with real API call (Claude / Supabase Edge Function)
    setTimeout(() => {
      const food = generateFoodFromDescription(text);
      setAiMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "ai",
          text: `Here's my best estimate for **${food.name}**. Tap "Add to Plate" to include it — it'll also be saved to your personal food library.`,
          suggestedFood: food,
        },
      ]);
      setAiThinking(false);
    }, 1600);
  }

  function addAiFoodToPlate(food: Food) {
    handleIncrease(food);
    // TODO: save to Supabase food library here
    setAiOpen(false);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Nothing in the DOM until opened; unmounts after close animation finishes
  if (!mounted || !isVisible) return null;

  return createPortal(
    <>
      {/* Backdrop */}
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

      {/* Sheet — relative + overflow-hidden so the AI panel is clipped inside */}
      <div
        role="dialog" aria-modal="true" aria-label="Build Custom Meal"
        className="fixed inset-x-0 bottom-0 z-[71] flex flex-col bg-[#F5F7F6] rounded-t-[28px] relative overflow-hidden"
        style={{
          height: "calc(100dvh - 36px)",
          transform: isOpen ? "translateY(0)" : "translateY(105%)",
          transition: "transform 400ms cubic-bezier(0.32,0.72,0,1)",
          willChange: "transform",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-9 h-[4px] rounded-full bg-[#BACAC5]/50" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0">
          <button aria-label="Close" onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-black/6 transition-colors">
            <svg className="w-5 h-5 text-[#1A1C1C]" fill="none" stroke="currentColor"
              viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <input
            type="text" value={mealName} onChange={(e) => setMealName(e.target.value)}
            placeholder="Custom meal name"
            className="flex-1 text-center text-[17px] font-extrabold text-[#1A1C1C]
              tracking-tight bg-transparent outline-none placeholder:text-[#BACAC5] placeholder:font-extrabold"
          />
          <button aria-label="More options"
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-black/6 transition-colors">
            <svg className="w-[18px] h-[18px] text-[#3C4A46]" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-2 space-y-4">

          {/* Ingredient search */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3C4A46] mb-[7px]">
              Add Ingredients
            </p>
            <div
              className="flex items-center gap-2 bg-white rounded-2xl px-3.5 border border-[#BACAC5]/25"
              style={{
                boxShadow: searchQuery
                  ? "0 0 0 2px rgba(0,107,95,0.18), 0 2px 8px rgba(0,0,0,0.06)"
                  : "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <svg className="w-[17px] h-[17px] flex-shrink-0 text-[#BACAC5]" fill="none"
                stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input ref={searchRef} type="text" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a food…"
                className="flex-1 py-[13px] text-[14px] text-[#1A1C1C] placeholder:text-[#BACAC5] bg-transparent outline-none"
              />
              {searchQuery.length > 0 && (
                <button onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                  className="w-[22px] h-[22px] rounded-full bg-[#E8EDED] flex items-center justify-center flex-shrink-0">
                  <svg className="w-[11px] h-[11px] text-[#3C4A46]" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {searchQuery.trim().length > 0 && (
              <div className="mt-3 space-y-[8px]">
                {searchResults.length > 0 ? searchResults.map((food) => (
                  <div key={food.id}
                    className="bg-white rounded-[18px] px-3 py-[10px] flex items-center gap-3 shadow-sm border border-[#BACAC5]/15">
                    <div className="w-[44px] h-[44px] rounded-[12px] flex-shrink-0 flex items-center justify-center text-[22px] select-none"
                      style={{ background: food.chipColor + "1E" }}>{food.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#1A1C1C] truncate leading-tight">{food.name}</p>
                      <p className="text-[12px] text-[#3C4A46] mt-[2px]">
                        {food.kcalPerServing}&nbsp;<span className="text-[#BACAC5]">kcal / serving</span>
                      </p>
                    </div>
                    <Stepper qty={getPlateQty(food.id)} onIncrease={() => handleIncrease(food)} onDecrease={() => handleDecrease(food)} />
                  </div>
                )) : (
                  <div className="flex flex-col items-center py-6 gap-2">
                    <span className="text-[28px]">🍽️</span>
                    <p className="text-[13px] font-semibold text-[#3C4A46]">No foods found</p>
                    <p className="text-[12px] text-[#BACAC5]">Try the AI button below to describe it</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Total Vitality */}
          {plateItems.length > 0 && (
            <div className="rounded-[22px] p-4 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #005548 0%, #00897B 50%, #2DD4BF 100%)" }}>
              <div className="absolute top-4 right-4 w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                </svg>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 mb-1">Total Vitality</p>
              <p className="text-[38px] font-extrabold text-white tracking-[-1px] leading-none">
                {totalKcal}<span className="text-[18px] font-semibold opacity-75 ml-1">kcal</span>
              </p>
              <div className="flex gap-5 mt-3 pt-3 border-t border-white/20">
                {[{ label: "Protein", val: totalProtein }, { label: "Carbs", val: totalCarbs }, { label: "Fats", val: totalFat }].map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/55">{label}</p>
                    <p className="text-[15px] font-extrabold text-white leading-tight">
                      {val}<span className="text-[11px] font-semibold opacity-75">g</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* The Plate */}
          {plateItems.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[16px] font-extrabold text-[#1A1C1C]">The Plate</h2>
                <span className="text-[11px] font-bold text-[#006B5F] bg-[#E6F7F5] rounded-full px-3 py-[3px]">
                  {plateItems.length} {plateItems.length === 1 ? "Item" : "Items"}
                </span>
              </div>
              <div className="space-y-[10px]">
                {plateItems.map((item) => {
                  const kcal  = Math.round(item.kcalPerServing * item.qty);
                  const label = item.qty === 1 ? "1 serving" : `${item.qty} servings`;
                  return (
                    <div key={item.id}
                      className="bg-white rounded-[18px] p-3 flex items-center gap-3 shadow-sm border border-[#BACAC5]/15">
                      <div className="w-[50px] h-[50px] rounded-[13px] flex-shrink-0 flex items-center justify-center text-[24px] select-none"
                        style={{ background: item.chipColor + "22" }}>{item.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-[#1A1C1C] leading-tight truncate">{item.name}</p>
                        <p className="text-[12px] text-[#3C4A46] mt-[1px]">{label} &bull; {kcal} kcal</p>
                        <p className="text-[10px] text-gray-400 mt-[2px]">
                          P&nbsp;<span className="font-semibold text-[#3C4A46]">{Math.round(item.proteinPerServing * item.qty)}g</span>
                          &nbsp;&nbsp;C&nbsp;<span className="font-semibold text-[#3C4A46]">{Math.round(item.carbsPerServing * item.qty)}g</span>
                        </p>
                      </div>
                      <Stepper qty={item.qty} onIncrease={() => handleIncrease(item)} onDecrease={() => handleDecrease(item)} />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty plate hint */}
          {plateItems.length === 0 && !searchQuery && (
            <div className="flex flex-col items-center py-8 gap-2">
              <span className="text-[36px]">🥗</span>
              <p className="text-[13px] font-semibold text-[#3C4A46]">Your plate is empty</p>
              <p className="text-[12px] text-[#BACAC5] text-center px-4">
                Search above or tap the AI button to add ingredients
              </p>
            </div>
          )}

          <div className="h-4" />
        </div>

        {/* Save area + floating AI button */}
        <div className="flex-shrink-0 px-4 pt-3 pb-8 relative"
          style={{ background: "linear-gradient(to top, #F5F7F6 75%, transparent)" }}>

          {/* ── Floating AI button ───────────────────────────────────────────── */}
          <button
            aria-label="AI Ingredient Assistant"
            onClick={openAiPanel}
            className="absolute right-4 -top-[58px] w-[48px] h-[48px] rounded-full
              flex items-center justify-center shadow-xl transition-transform active:scale-90"
            style={{
              background: "linear-gradient(135deg, #001E1B 0%, #006B5F 100%)",
              boxShadow: "0 4px 20px rgba(0,107,95,0.40), 0 0 0 3px rgba(255,255,255,0.9)",
            }}
          >
            {/* Sparkle icon */}
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
              viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.6 4.8L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.2z" />
              <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z" />
              <path d="M19 15l.4 1.2 1.2.4-1.2.4-.4 1.2-.4-1.2-1.2-.4 1.2-.4z" />
            </svg>
          </button>

          <button
            disabled={plateItems.length === 0}
            className="w-full py-[15px] rounded-[20px] text-white text-[16px] font-bold tracking-wide shadow-lg transition-all duration-200"
            style={{ background: plateItems.length === 0 ? "#BACAC5" : "#006B5F" }}
          >
            {plateItems.length === 0 ? "Add ingredients to save" : "Save Meal"}
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* ── AI Ingredient Assistant Panel ─────────────────────────────────── */}
        {/* Slides up inside the sheet via absolute positioning                 */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <div
          aria-label="AI Ingredient Assistant"
          className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-[24px] z-10"
          style={{
            height: "78%",
            background: "#FAFCFB",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.14)",
            transform: aiOpen ? "translateY(0)" : "translateY(100%)",
            transition: "transform 380ms cubic-bezier(0.32,0.72,0,1)",
          }}
        >
          {/* AI Panel handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-8 h-[4px] rounded-full bg-[#BACAC5]/50" />
          </div>

          {/* AI Panel header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-[#BACAC5]/15">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #001E1B, #006B5F)" }}>
              <svg className="w-[15px] h-[15px] text-white" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.6 4.8L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.2z" />
                <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-extrabold text-[#1A1C1C] leading-tight">AI Ingredient Creator</p>
              <p className="text-[11px] text-[#BACAC5]">Describe any food to get its nutrition</p>
            </div>
            <button onClick={() => setAiOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full active:bg-black/6 transition-colors">
              <svg className="w-[14px] h-[14px] text-[#3C4A46]" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages thread */}
          <div ref={aiScrollRef}
            className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
            {aiMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.role === "ai" && (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: "linear-gradient(135deg, #001E1B, #006B5F)" }}>
                    <svg className="w-[12px] h-[12px] text-white" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round">
                      <path d="M12 3l1.6 4.8L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.2z" />
                    </svg>
                  </div>
                )}
                <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className="px-3 py-[9px] rounded-[16px] text-[13px] leading-snug"
                    style={{
                      background: msg.role === "user" ? "#006B5F" : "#EEF3F2",
                      color:      msg.role === "user" ? "#ffffff"  : "#1A1C1C",
                      borderRadius: msg.role === "user"
                        ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    }}
                  >
                    {msg.text}
                  </div>

                  {/* AI-generated ingredient card */}
                  {msg.suggestedFood && (
                    <div className="w-full bg-white rounded-[18px] p-3 border border-[#BACAC5]/20 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-[44px] h-[44px] rounded-[12px] flex-shrink-0 flex items-center justify-center text-[22px]"
                          style={{ background: msg.suggestedFood.chipColor + "22" }}>
                          {msg.suggestedFood.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-[#1A1C1C] truncate">{msg.suggestedFood.name}</p>
                          <p className="text-[12px] text-[#3C4A46]">{msg.suggestedFood.kcalPerServing} kcal / serving</p>
                        </div>
                      </div>
                      {/* Macro chips */}
                      <div className="flex gap-2 mb-3">
                        {[
                          { label: "Protein", val: msg.suggestedFood.proteinPerServing, color: "#E6F7F5", text: "#006B5F" },
                          { label: "Carbs",   val: msg.suggestedFood.carbsPerServing,   color: "#FFF8EE", text: "#855300" },
                          { label: "Fats",    val: msg.suggestedFood.fatPerServing,      color: "#FEF2F2", text: "#C0392B" },
                        ].map(({ label, val, color, text }) => (
                          <div key={label} className="flex-1 rounded-xl py-1.5 text-center"
                            style={{ background: color }}>
                            <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: text }}>{label}</p>
                            <p className="text-[13px] font-extrabold" style={{ color: text }}>{val}g</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addAiFoodToPlate(msg.suggestedFood!)}
                        className="w-full py-[10px] rounded-[13px] bg-[#006B5F] text-white
                          text-[13px] font-bold active:bg-[#00574D] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          strokeWidth={2.5} strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add to Plate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking dots */}
            {aiThinking && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #001E1B, #006B5F)" }}>
                  <svg className="w-[12px] h-[12px] text-white" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round">
                    <path d="M12 3l1.6 4.8L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.2z" />
                  </svg>
                </div>
                <div className="bg-[#EEF3F2] px-4 py-3 rounded-[16px] rounded-bl-[4px] flex gap-[5px] items-center">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-[6px] h-[6px] rounded-full bg-[#006B5F]"
                      style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI input composer */}
          <div className="flex-shrink-0 px-4 pb-8 pt-2 border-t border-[#BACAC5]/15">
            <div className="flex items-center gap-2 bg-white rounded-2xl px-3.5 border border-[#BACAC5]/25 shadow-sm">
              <input
                ref={aiInputRef}
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
                placeholder="e.g., Pol Kiri Curry with coconut milk…"
                className="flex-1 py-[13px] text-[14px] text-[#1A1C1C] placeholder:text-[#BACAC5] bg-transparent outline-none"
              />
              <button
                onClick={sendAiMessage}
                disabled={!aiInput.trim() || aiThinking}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: aiInput.trim() && !aiThinking ? "#006B5F" : "#E8EDED",
                }}
              >
                <svg className="w-[15px] h-[15px]"
                  style={{ color: aiInput.trim() && !aiThinking ? "#fff" : "#BACAC5" }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* ── End AI Panel ──────────────────────────────────────────────────── */}

      </div>

      {/* Bounce keyframes for thinking dots */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0);    opacity: 0.4; }
          50%       { transform: translateY(-4px); opacity: 1;   }
        }
      `}</style>
    </>,
    document.body
  );
}
