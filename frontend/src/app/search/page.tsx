"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppBottomNav } from "@/components/ui/AppBottomNav";
import { useAppStore, type MealSlot } from "@/store/useAppStore";

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
  category: string;
}

interface PlateItem extends Food {
  qty: number;
}

type AiRole = "user" | "ai";
interface AiMessage {
  id: string;
  role: AiRole;
  text: string;
  suggestedFood?: Food;
}

// ─── Food Database ────────────────────────────────────────────────────────────
const FOOD_DB: Food[] = [
  { id: "red-rice",      name: "Red Rice",          kcalPerServing: 120, proteinPerServing: 2.7, carbsPerServing: 26.7, fatPerServing: 0,   emoji: "🍚", chipColor: "#C45C1A",  category: "Rice & Bread" },
  { id: "white-rice",    name: "White Rice",        kcalPerServing: 130, proteinPerServing: 2.4, carbsPerServing: 28.2, fatPerServing: 0.3, emoji: "🍚", chipColor: "#D4A574",  category: "Rice & Bread" },
  { id: "kiribath",      name: "Kiribath",          kcalPerServing: 185, proteinPerServing: 3,   carbsPerServing: 38,   fatPerServing: 3,   emoji: "🍘", chipColor: "#F0E0B0",  category: "Rice & Bread" },
  { id: "hopper",        name: "Hopper (Appam)",    kcalPerServing: 120, proteinPerServing: 2.8, carbsPerServing: 22,   fatPerServing: 2.5, emoji: "🥞", chipColor: "#E8C86A",  category: "Rice & Bread" },
  { id: "string-hopper", name: "String Hoppers",    kcalPerServing: 100, proteinPerServing: 2.2, carbsPerServing: 21,   fatPerServing: 0.8, emoji: "🍝", chipColor: "#F5D49A",  category: "Rice & Bread" },
  { id: "pol-roti",      name: "Pol Roti",          kcalPerServing: 180, proteinPerServing: 3.5, carbsPerServing: 24,   fatPerServing: 7.5, emoji: "🫓", chipColor: "#C8A05A",  category: "Rice & Bread" },
  { id: "bread",         name: "Bread (slice)",     kcalPerServing: 80,  proteinPerServing: 3,   carbsPerServing: 15,   fatPerServing: 1,   emoji: "🍞", chipColor: "#D4A070",  category: "Rice & Bread" },
  { id: "kottu",         name: "Kottu Roti",        kcalPerServing: 320, proteinPerServing: 14,  carbsPerServing: 42,   fatPerServing: 11,  emoji: "🫕", chipColor: "#8B6914",  category: "Rice & Bread" },
  { id: "dhal-curry",    name: "Dhal Curry",        kcalPerServing: 140, proteinPerServing: 8,   carbsPerServing: 18,   fatPerServing: 4,   emoji: "🍛", chipColor: "#E8A020",  category: "Curries" },
  { id: "fish-curry",    name: "Fish Curry",        kcalPerServing: 165, proteinPerServing: 18,  carbsPerServing: 5,    fatPerServing: 8,   emoji: "🐟", chipColor: "#E07040",  category: "Curries" },
  { id: "chicken-curry", name: "Chicken Curry",     kcalPerServing: 195, proteinPerServing: 22,  carbsPerServing: 4,    fatPerServing: 9,   emoji: "🍗", chipColor: "#D4763A",  category: "Curries" },
  { id: "jackfruit",     name: "Jackfruit Curry",   kcalPerServing: 145, proteinPerServing: 2,   carbsPerServing: 30,   fatPerServing: 2,   emoji: "🍈", chipColor: "#7DC940",  category: "Curries" },
  { id: "pol-sambol",    name: "Pol Sambol",        kcalPerServing: 260, proteinPerServing: 6,   carbsPerServing: 14,   fatPerServing: 16,  emoji: "🥥", chipColor: "#2C7A45",  category: "Sides" },
  { id: "lunu-miris",    name: "Lunu Miris",        kcalPerServing: 45,  proteinPerServing: 1,   carbsPerServing: 7,    fatPerServing: 1.5, emoji: "🌶️", chipColor: "#C0392B",  category: "Sides" },
  { id: "papadam",       name: "Papadam",           kcalPerServing: 50,  proteinPerServing: 2,   carbsPerServing: 8,    fatPerServing: 1,   emoji: "🫓", chipColor: "#D4A030",  category: "Sides" },
  { id: "potato",        name: "Tempered Potato",   kcalPerServing: 155, proteinPerServing: 2.5, carbsPerServing: 28,   fatPerServing: 4,   emoji: "🥔", chipColor: "#D4A830",  category: "Sides" },
  { id: "gotu-kola",     name: "Gotu Kola Sambol",  kcalPerServing: 55,  proteinPerServing: 1.5, carbsPerServing: 6,    fatPerServing: 2.5, emoji: "🥬", chipColor: "#27AE60",  category: "Sides" },
  { id: "egg",           name: "Boiled Egg",        kcalPerServing: 78,  proteinPerServing: 6,   carbsPerServing: 0.6,  fatPerServing: 5,   emoji: "🥚", chipColor: "#F4D03F",  category: "Extras" },
  { id: "banana",        name: "Banana",            kcalPerServing: 90,  proteinPerServing: 1,   carbsPerServing: 23,   fatPerServing: 0.3, emoji: "🍌", chipColor: "#F4D03F",  category: "Extras" },
  { id: "mango",         name: "Mango",             kcalPerServing: 70,  proteinPerServing: 0.5, carbsPerServing: 17,   fatPerServing: 0.3, emoji: "🥭", chipColor: "#FF8C00",  category: "Extras" },
  { id: "coconut-milk",  name: "Coconut Milk",      kcalPerServing: 110, proteinPerServing: 1,   carbsPerServing: 3,    fatPerServing: 11,  emoji: "🥛", chipColor: "#E0F0E8",  category: "Extras" },
  { id: "watalappam",    name: "Watalappam",        kcalPerServing: 210, proteinPerServing: 4,   carbsPerServing: 28,   fatPerServing: 9,   emoji: "🍮", chipColor: "#8B4513",  category: "Extras" },
];

const CATEGORIES = ["All", "Rice & Bread", "Curries", "Sides", "Extras"];

const MEAL_LABELS: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: "Breakfast", emoji: "🌅" },
  lunch:    { label: "Lunch",     emoji: "☀️" },
  dinner:   { label: "Dinner",    emoji: "🌙" },
  snack:    { label: "Snack",     emoji: "🍪" },
  saved_meals: { label: "Save as Meal", emoji: "❤️" },
};

// ─── Mock AI ingredient generator ─────────────────────────────────────────────
function generateFoodFromDescription(desc: string): Food {
  const lower = desc.toLowerCase();
  let base = { kcal: 150, p: 8, c: 15, f: 6 };
  if (/rice|bath|kiri/.test(lower))             base = { kcal: 150, p: 3,  c: 32, f: 1  };
  else if (/curry|kulambu|gravy/.test(lower))   base = { kcal: 165, p: 11, c: 12, f: 8  };
  else if (/sambol|mallung|salad/.test(lower))  base = { kcal: 60,  p: 2,  c: 8,  f: 3  };
  else if (/roti|bread|hopper/.test(lower))     base = { kcal: 140, p: 4,  c: 25, f: 4  };
  else if (/chicken|beef|pork|lamb/.test(lower)) base = { kcal: 210, p: 24, c: 2,  f: 11 };
  else if (/fish|prawn|crab/.test(lower))       base = { kcal: 160, p: 20, c: 3,  f: 7  };
  else if (/egg/.test(lower))                   base = { kcal: 80,  p: 6,  c: 1,  f: 5  };
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
    category: "Custom",
  };
}

// ─── Stepper Component ────────────────────────────────────────────────────────
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

// ─── Main Search + Build Content ──────────────────────────────────────────────
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramMeal = (searchParams.get("meal") ?? "breakfast") as MealSlot;
  const addFoodEntry = useAppStore((s) => s.addFoodEntry);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isScrolled, setIsScrolled] = useState(false);

  // ── Plate state ──────────────────────────────────────────────────────────────
  const [plateItems, setPlateItems] = useState<PlateItem[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<MealSlot>(paramMeal);

  // ── AI state ─────────────────────────────────────────────────────────────────
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const searchRef = useRef<HTMLInputElement>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = aiOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [aiOpen]);

  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }
  }, [aiMessages, aiThinking]);

  // ── Search / filter ──────────────────────────────────────────────────────────
  const isDefaultEmpty = !searchQuery.trim() && activeCategory === "All";
  const displayedFoods = isDefaultEmpty
    ? []
    : searchQuery.trim()
      ? FOOD_DB.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : FOOD_DB.filter((f) => f.category === activeCategory);

  // ── Plate helpers ────────────────────────────────────────────────────────────
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

  // ── Totals ───────────────────────────────────────────────────────────────────
  const totalKcal    = Math.round(plateItems.reduce((s, i) => s + i.kcalPerServing * i.qty, 0));
  const totalProtein = Math.round(plateItems.reduce((s, i) => s + i.proteinPerServing * i.qty, 0));
  const totalCarbs   = Math.round(plateItems.reduce((s, i) => s + i.carbsPerServing * i.qty, 0));
  const totalFat     = Math.round(plateItems.reduce((s, i) => s + i.fatPerServing * i.qty, 0));

  // ── Save meal ────────────────────────────────────────────────────────────────
  function handleSaveMeal() {
    plateItems.forEach((item) => {
      addFoodEntry({
        id: `${Date.now()}-${Math.random()}-${item.id}`,
        meal: selectedMeal,
        name: item.name,
        kcal: Math.round(item.kcalPerServing * item.qty),
        carbs: Math.round(item.carbsPerServing * item.qty),
        protein: Math.round(item.proteinPerServing * item.qty),
        fat: Math.round(item.fatPerServing * item.qty),
        serving: item.qty === 1 ? "1 serving" : `${item.qty} servings`,
      });
    });
    router.push("/home");
  }

  // ── AI actions ───────────────────────────────────────────────────────────────
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
          text: `Here's my best estimate for **${food.name}**. Tap "Add to Plate" to include it.`,
          suggestedFood: food,
        },
      ]);
      setAiThinking(false);
    }, 1600);
  }

  function addAiFoodToPlate(food: Food) {
    handleIncrease(food);
    setAiOpen(false);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-[#F9F9F9] font-sans antialiased ${plateItems.length > 0 ? "pb-[380px]" : "pb-[100px]"}`}>

      {/* ── Top Bar ────────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-6 py-4 bg-white/80 backdrop-blur-xl flex justify-between items-center border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-[#006B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h1 className="text-[18px] font-extrabold text-[#006B5F] tracking-tight leading-none mb-[2px]">
            Search Food
          </h1>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#006B5F]/20">
          <img
            alt="User Profile"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUh-XIBE2J31PmpJvSQACtd3ynGwpljpkllwIpUwg8uNtWhuilvURliuBnwz46eEu4ZQJRvMRL9c5zl7IzfMQIuXLBocp05a8VItkdLwX_3n0M-DqhTt6SBK1ON6hl8rLqF3iGAO2HNUxtnDVOFB1vtZZEhU50dww2sT4Xjg9Br8QERzU7mh8nZlhuP5v4D9DBWQBxpQClG5JUr8sluhT1mpSSCWmYIk-ydCNhSiJX4wwB-P3t8BT0fhRr-2vZAGxpAOx_A1S_ZC0"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <main className="pt-[88px] px-6 max-w-screen-xl mx-auto flex flex-col gap-6">

        {/* ── Search Input ──────────────────────────────────────────────────────── */}
        <div className="h-[56px] w-full">
          <section
            className={`transition-all duration-300 z-50 ${
              isScrolled
                ? "fixed top-[75px] left-0 right-0 px-10 mx-auto max-w-screen-xl opacity-90"
                : "relative w-full"
            }`}
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                <svg className={`w-5 h-5 transition-colors ${isScrolled ? "text-[#006B5F]/70" : "text-gray-400"}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setActiveCategory("All"); }}
                className={`w-full h-14 pl-[48px] pr-12 shadow-sm focus:ring-2 focus:ring-[#006B5F]/20 outline-none text-[#1A1C1C] font-medium transition-all duration-300 truncate ${
                  isScrolled
                    ? "bg-white/60 backdrop-blur-xl rounded-full border border-white/60 text-[15px] placeholder-transparent"
                    : "bg-white rounded-full border border-[#BACAC5]/15 text-[16px] placeholder-gray-400"
                }`}
                placeholder={isScrolled ? "" : "Search Kottu, Dhal, Rice..."}
                type="text"
              />
              {searchQuery.length > 0 ? (
                <div className="absolute inset-y-0 right-4 flex items-center z-10">
                  <button onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                    className="w-[22px] h-[22px] rounded-full bg-[#E8EDED] flex items-center justify-center">
                    <svg className="w-[11px] h-[11px] text-[#3C4A46]" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="absolute inset-y-0 right-4 flex items-center z-10">
                  <svg className="w-5 h-5 text-gray-400 cursor-pointer hover:text-[#006B5F] transition-colors"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Category Chips ────────────────────────────────────────────────────── */}
        <section className="-mx-6">
          <div className="flex gap-3 overflow-x-auto px-6 no-scrollbar pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
                className={`flex-none px-5 py-2.5 rounded-full font-bold text-[13px] transition-all active:scale-95 ${
                  activeCategory === cat
                    ? "bg-[#006B5F]/10 text-[#006B5F]"
                    : "bg-white text-[#3C4A46] shadow-sm border border-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── Food List ─────────────────────────────────────────────────────────── */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[18px] font-extrabold text-[#1A1C1C] tracking-tight">
              {searchQuery.trim()
                ? `Results for "${searchQuery}"`
                : activeCategory === "All"
                  ? "All Foods"
                  : activeCategory}
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-[#3C4A46]/70 font-bold uppercase tracking-wider">
              <svg className="w-3.5 h-3.5 text-[#006B5F]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {displayedFoods.length} items
            </div>
          </div>

          {displayedFoods.length > 0 ? (
            <div className="flex flex-col gap-3">
              {displayedFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-3 bg-white rounded-[20px] shadow-sm border border-[#BACAC5]/15 group active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-[48px] h-[48px] rounded-[14px] flex-shrink-0 flex items-center justify-center text-[22px] select-none"
                      style={{ background: food.chipColor + "1E" }}
                    >
                      {food.emoji}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[14px] text-[#1A1C1C] leading-tight">{food.name}</h3>
                      <p className="text-[12px] text-[#3C4A46] mt-[2px]">
                        {food.kcalPerServing}&nbsp;<span className="text-[#BACAC5]">kcal / serving</span>
                      </p>
                    </div>
                  </div>
                  <Stepper
                    qty={getPlateQty(food.id)}
                    onIncrease={() => handleIncrease(food)}
                    onDecrease={() => handleDecrease(food)}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* ── Empty State + AI CTA ─────────────────────────────────────────── */
            isDefaultEmpty ? (
              <div className="flex flex-col items-center py-10 gap-4 mt-8">
                <div className="w-16 h-16 rounded-full bg-[#006B5F]/10 flex items-center justify-center">
                  <span className="text-[32px]">🥗</span>
                </div>
                <div className="text-center">
                  <p className="text-[16px] font-extrabold text-[#1A1C1C]">
                    What are you having?
                  </p>
                  <p className="text-[13px] text-[#3C4A46]/70 mt-1 max-w-[260px]">
                    Search for a food, pick a category, or create a custom entry with AI!
                  </p>
                </div>
                <button
                  onClick={openAiPanel}
                  className="mt-2 flex items-center gap-2 px-6 py-3 rounded-full text-white text-[14px] font-bold shadow-lg active:scale-95 transition-all"
                  style={{ background: "linear-gradient(135deg, #001E1B 0%, #006B5F 100%)" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.6 4.8L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.2z" />
                    <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z" />
                  </svg>
                  Create with AI
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 gap-4 mt-4">
                <div className="w-16 h-16 rounded-full bg-[#006B5F]/10 flex items-center justify-center">
                  <span className="text-[32px]">🍽️</span>
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-bold text-[#1A1C1C]">
                    No foods found for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-[13px] text-[#3C4A46]/70 mt-1">
                    Can&apos;t find it? Create your own with AI!
                  </p>
                </div>
                <button
                  onClick={openAiPanel}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-[14px] font-bold shadow-lg active:scale-95 transition-all"
                  style={{ background: "linear-gradient(135deg, #001E1B 0%, #006B5F 100%)" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.6 4.8L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.2z" />
                    <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z" />
                  </svg>
                  Create with AI
                </button>
              </div>
            )
          )}
        </section>

        {/* ── Plate Section ─────────────────────────────────────────────────────── */}
        <div className="h-4" />
      </main>

      {/* ── Floating AI Button (Only shown when no items logic) ───────────────── */}
      {plateItems.length === 0 && (
        <button
          id="ai-ingredient-button"
          aria-label="AI Ingredient Assistant"
          onClick={openAiPanel}
          className="fixed z-30 w-[48px] h-[48px] rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90"
          style={{
            bottom: 100,
            right: 24,
            background: "linear-gradient(135deg, #001E1B 0%, #006B5F 100%)",
            boxShadow: "0 4px 20px rgba(0,107,95,0.40), 0 0 0 3px rgba(255,255,255,0.9)",
          }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
            viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.6 4.8L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.2z" />
            <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z" />
            <path d="M19 15l.4 1.2 1.2.4-1.2.4-.4 1.2-.4-1.2-1.2-.4 1.2-.4z" />
          </svg>
        </button>
      )}

      {/* ── Condensed Vitality & Save Panel ─────────────────────────────────────── */}
      {plateItems.length > 0 && (
        <div className="fixed bottom-[80px] left-0 right-0 z-20 pointer-events-none pb-4 pt-10 transition-all duration-300">
          <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-[#F9F9F9] via-[#F9F9F9] to-transparent opacity-95" />
          <div className="relative max-w-screen-xl mx-auto px-4 flex flex-col gap-[14px] pointer-events-auto">
            
            {/* Total Vitality Card (Transparent when app is scrolled to see map/content) */}
            <div 
              className="flex-none shadow-[0_10px_40px_rgba(0,107,95,0.2)] transition-opacity duration-300 rounded-[26px] p-4 flex gap-[14px] overflow-hidden relative"
              style={{ opacity: isScrolled ? 0.85 : 1, background: "linear-gradient(135deg, rgba(0,68,57,0.95) 0%, rgba(0,121,107,0.95) 50%, rgba(20,184,166,0.92) 100%)", backdropFilter: "blur(12px)" }}
            >
              {/* Left Side: Stats */}
              <div className="w-[42%] flex flex-col justify-center border-r border-white/20 pr-3 relative">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 mb-1 leading-none">Total</p>
                  <p className="text-[36px] font-extrabold text-white tracking-[-1px] leading-none flex items-baseline gap-[2px]">
                    {totalKcal}<span className="text-[15px] font-semibold opacity-75">kcal</span>
                  </p>
                </div>
                <div className="flex justify-between mt-4 pr-1">
                  {[{ label: "P", val: totalProtein }, { label: "C", val: totalCarbs }, { label: "F", val: totalFat }].map(({ label, val }) => (
                    <div key={label} className="flex flex-col items-start gap-[1px]">
                      <p className="text-[9px] font-bold text-white/50 leading-none">{label}</p>
                      <p className="text-[13px] font-extrabold text-white leading-none">
                        {val}<span className="text-[9px] font-normal opacity-75 ml-[1px]">g</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Plate Items (Scrollable) */}
              <div className="w-[58%] flex flex-col gap-[6px] max-h-[125px] overflow-y-auto no-scrollbar pl-1">
                {plateItems.map((item) => (
                  <div key={item.id} className="bg-white/14 rounded-[14px] py-2 px-[10px] flex items-center gap-[10px]" style={{ background: "rgba(255,255,255,0.12)" }}>
                    <span className="text-[18px] leading-none">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white truncate leading-tight">{item.name}</p>
                      <p className="text-[10px] text-white/60 truncate mt-[1px] tracking-wide">{item.qty} {item.qty === 1 ? 'srv' : 'srvs'}</p>
                    </div>
                    {/* Tiny Stepper */}
                    <div className="flex items-center gap-1 bg-black/20 rounded-full px-1 py-1">
                      <button onClick={() => handleDecrease(item)} className="px-1.5 active:opacity-50">
                        <svg className="w-[9px] h-[9px] text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" d="M5 12h14" /></svg>
                      </button>
                      <span className="text-[11px] font-bold text-white min-w-[12px] text-center leading-none tabular-nums select-none mb-[1px]">{item.qty}</span>
                      <button onClick={() => handleIncrease(item)} className="px-1.5 active:opacity-50">
                        <svg className="w-[9px] h-[9px] text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Bar Options */}
            <div className="flex-none pt-1 shrink-0">
              <div className="flex gap-2 mb-[14px] overflow-x-auto no-scrollbar">
                {(["breakfast", "lunch", "dinner", "snack", "saved_meals"] as MealSlot[]).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedMeal(slot)}
                    className={`flex-none flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-bold transition-all active:scale-95 shadow-sm border ${
                      selectedMeal === slot
                        ? "bg-[#006B5F] text-white border-transparent"
                        : "bg-white text-[#3C4A46] border-gray-200"
                    }`}
                  >
                    <span className="text-[15px]">{MEAL_LABELS[slot].emoji}</span>
                    {MEAL_LABELS[slot].label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 items-center w-full">
                <button
                  id="save-meal-button"
                  onClick={handleSaveMeal}
                  className="flex-1 py-[16px] rounded-[22px] text-white text-[15px] font-bold tracking-wide shadow-[0_8px_20px_rgba(0,107,95,0.25)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ background: "#006B5F" }}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Save {plateItems.length} {plateItems.length === 1 ? "item" : "items"}
                </button>
                <button
                  id="ai-ingredient-button-inline"
                  aria-label="AI Ingredient Assistant"
                  onClick={openAiPanel}
                  className="w-[56px] h-[56px] flex-none rounded-[22px] flex items-center justify-center shadow-[0_8px_20px_rgba(0,107,95,0.25)] transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg, #001E1B 0%, #006B5F 100%)" }}
                >
                  <svg className="w-[24px] h-[24px] text-white" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.6 4.8L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.2z" />
                    <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z" />
                    <path d="M19 15l.4 1.2 1.2.4-1.2.4-.4 1.2-.4-1.2-1.2-.4 1.2-.4z" />
                  </svg>
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* ── AI Backdrop ─────────────────────────────────────────────────────────── */}
      {aiOpen && (
        <div
          className="fixed inset-0 z-[59] transition-opacity duration-300"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setAiOpen(false)}
        />
      )}

      {/* ── AI Slide-Up Panel ───────────────────────────────────────────────────── */}
      <div
        aria-label="AI Ingredient Assistant"
        className="fixed inset-x-0 bottom-0 z-[60] flex flex-col rounded-t-[24px] max-w-md mx-auto overflow-hidden"
        style={{
          height: "75vh",
          background: "#FAFCFB",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.14)",
          transform: aiOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 380ms cubic-bezier(0.32,0.72,0,1)",
          pointerEvents: aiOpen ? "auto" : "none",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-8 h-[4px] rounded-full bg-[#BACAC5]/50" />
        </div>

        {/* AI header */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-[#BACAC5]/15">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #001E1B, #006B5F)" }}
          >
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
          <button
            onClick={() => setAiOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-black/6 transition-colors"
          >
            <svg className="w-[14px] h-[14px] text-[#3C4A46]" fill="none" stroke="currentColor"
              viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={aiScrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
          {aiMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
              {msg.role === "ai" && (
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: "linear-gradient(135deg, #001E1B, #006B5F)" }}
                >
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
                    color: msg.role === "user" ? "#ffffff" : "#1A1C1C",
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
                      <div
                        className="w-[44px] h-[44px] rounded-[12px] flex-shrink-0 flex items-center justify-center text-[22px]"
                        style={{ background: msg.suggestedFood.chipColor + "22" }}
                      >
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
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #001E1B, #006B5F)" }}
              >
                <svg className="w-[12px] h-[12px] text-white" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round">
                  <path d="M12 3l1.6 4.8L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.2z" />
                </svg>
              </div>
              <div className="bg-[#EEF3F2] px-4 py-3 rounded-[16px] rounded-bl-[4px] flex gap-[5px] items-center">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-[6px] h-[6px] rounded-full bg-[#006B5F]"
                    style={{ animation: `searchBounce 1s ease-in-out ${i * 0.15}s infinite` }} />
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
              <svg
                className="w-[15px] h-[15px]"
                style={{ color: aiInput.trim() && !aiThinking ? "#fff" : "#BACAC5" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* ── End AI Panel ──────────────────────────────────────────────────────── */}

      {/* Bounce keyframes for thinking dots */}
      <style>{`
        @keyframes searchBounce {
          0%, 100% { transform: translateY(0);    opacity: 0.4; }
          50%       { transform: translateY(-4px); opacity: 1;   }
        }
      `}</style>

      <AppBottomNav activeTab="search" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9F9F9]" />}>
      <SearchContent />
    </Suspense>
  );
}