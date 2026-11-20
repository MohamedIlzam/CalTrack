"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppBottomNav } from "@/components/ui/AppBottomNav";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAppStore } from "@/store/useAppStore";
import {
  fetchWeightHistory,
  postWeightLog,
  fetchAdherence,
  fetchUserProfile,
  type WeightEntry,
  type AdherenceDay,
  type UserProfile,
} from "@/lib/api";
import { calculateBmi } from "@/lib/nutrition";
import { getLocalDateString } from "@/lib/date";

function ProgressContent() {
  const queryClient = useQueryClient();

  // Zustand Store Fallbacks
  const storeWeightKg = useAppStore((s) => s.weightKg);
  const storeTargetWeightKg = useAppStore((s) => s.targetWeightKg);
  const storeHeightCm = useAppStore((s) => s.heightCm);
  const storeTargetCalories = useAppStore((s) => s.targetCalories);
  const storeTargetProteinG = useAppStore((s) => s.targetProteinG);
  const storeTargetCarbsG = useAppStore((s) => s.targetCarbsG);
  const storeTargetFatG = useAppStore((s) => s.targetFatG);
  const setOnboarding = useAppStore((s) => s.setOnboarding);

  // Time range selection: 7 days or 30 days
  const [range, setRange] = useState<7 | 30>(7);
  // Active macro tab for detailed macro breakdown
  const [activeMacro, setActiveMacro] = useState<"protein" | "carbs" | "fat">("protein");
  // Interactive day selection in charts
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Log weight modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [submittingWeight, setSubmittingWeight] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);

  // 1. Fetch User Profile
  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  // Effective user metrics
  const weightKg = profile?.weightKg ?? (storeWeightKg > 0 ? storeWeightKg : 68.5);
  const targetWeightKg = profile?.targetWeightKg ?? (storeTargetWeightKg > 0 ? storeTargetWeightKg : 65.0);
  const heightCm = profile?.heightCm ?? (storeHeightCm > 0 ? storeHeightCm : 168);
  const targetCalories = profile?.targetCalories ?? (storeTargetCalories > 0 ? storeTargetCalories : 1850);
  const targetProteinG = profile?.targetProteinG ?? (storeTargetProteinG > 0 ? storeTargetProteinG : 115);
  const targetCarbsG = profile?.targetCarbsG ?? (storeTargetCarbsG > 0 ? storeTargetCarbsG : 208);
  const targetFatG = profile?.targetFatG ?? (storeTargetFatG > 0 ? storeTargetFatG : 62);

  // 2. Fetch Adherence Data for Selected Range
  const {
    data: adherenceDays = [],
    isLoading: isAdherenceLoading,
    isError: isAdherenceError,
    refetch: refetchAdherence,
  } = useQuery<AdherenceDay[]>({
    queryKey: ["adherence", range],
    queryFn: () => fetchAdherence(range),
  });

  // 3. Fetch Real Weight History
  const {
    data: weightHistory = [],
    isLoading: isWeightLoading,
    refetch: refetchWeight,
  } = useQuery<WeightEntry[]>({
    queryKey: ["weightHistory"],
    queryFn: fetchWeightHistory,
  });

  // BMI calculation
  const bmiInfo = useMemo(() => calculateBmi(weightKg, heightCm), [weightKg, heightCm]);
  const bmiPos = useMemo(() => {
    if (!bmiInfo.numericBmi) return 50;
    // Map BMI range [15, 35] to [0%, 100%]
    return Math.min(96, Math.max(4, ((bmiInfo.numericBmi - 15) / 20) * 100));
  }, [bmiInfo]);

  // Derived Analytics from Adherence Days
  const analytics = useMemo(() => {
    const totalDays = adherenceDays.length || range;
    const loggedDays = adherenceDays.filter((d) => d.logged);
    const loggedCount = loggedDays.length;
    const unloggedCount = Math.max(0, totalDays - loggedCount);

    const consistencyPct = totalDays > 0 ? Math.round((loggedCount / totalDays) * 100) : 0;

    let avgCalories: number | null = null;
    let avgProtein: number | null = null;
    let avgCarbs: number | null = null;
    let avgFat: number | null = null;
    let caloriesDelta: number | null = null;

    if (loggedCount > 0) {
      const sumKcal = loggedDays.reduce((acc, d) => acc + d.calories, 0);
      const sumP = loggedDays.reduce((acc, d) => acc + d.protein, 0);
      const sumC = loggedDays.reduce((acc, d) => acc + d.carbs, 0);
      const sumF = loggedDays.reduce((acc, d) => acc + d.fat, 0);

      avgCalories = Math.round(sumKcal / loggedCount);
      avgProtein = Math.round((sumP / loggedCount) * 10) / 10;
      avgCarbs = Math.round((sumC / loggedCount) * 10) / 10;
      avgFat = Math.round((sumF / loggedCount) * 10) / 10;
      caloriesDelta = avgCalories - targetCalories;
    }

    // Days logged within/under target
    const withinTargetCount = loggedDays.filter((d) => d.calories <= targetCalories).length;
    const targetAdherencePct = loggedCount > 0 ? Math.round((withinTargetCount / loggedCount) * 100) : 0;

    // Macro Ratio Percentages
    let proteinRatio = 25;
    let carbsRatio = 45;
    let fatRatio = 30;

    if (avgProtein !== null && avgCarbs !== null && avgFat !== null) {
      const pKcal = avgProtein * 4;
      const cKcal = avgCarbs * 4;
      const fKcal = avgFat * 9;
      const totalKcal = pKcal + cKcal + fKcal;
      if (totalKcal > 0) {
        proteinRatio = Math.round((pKcal / totalKcal) * 100);
        carbsRatio = Math.round((cKcal / totalKcal) * 100);
        fatRatio = Math.max(0, 100 - proteinRatio - carbsRatio);
      }
    }

    return {
      totalDays,
      loggedCount,
      unloggedCount,
      consistencyPct,
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFat,
      caloriesDelta,
      withinTargetCount,
      targetAdherencePct,
      proteinRatio,
      carbsRatio,
      fatRatio,
    };
  }, [adherenceDays, range, targetCalories]);

  // Selected Day Details for Interactive Chart
  const selectedDayInfo = useMemo(() => {
    if (adherenceDays.length === 0) return null;
    if (selectedDate) {
      const found = adherenceDays.find((d) => d.date === selectedDate);
      if (found) return found;
    }
    // Default to the latest day in the list
    return adherenceDays[adherenceDays.length - 1];
  }, [adherenceDays, selectedDate]);

  // Handle Weight Log Submission
  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (isNaN(val) || val < 10 || val > 300) {
      setWeightError("Please enter a valid weight between 10 kg and 300 kg");
      return;
    }

    setSubmittingWeight(true);
    setWeightError(null);
    try {
      await postWeightLog(val);
      setOnboarding({ weightKg: val });
      queryClient.invalidateQueries({ queryKey: ["weightHistory"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setIsModalOpen(false);
      setWeightInput("");
    } catch (err: any) {
      setWeightError(err.message || "Failed to save weight entry.");
    } finally {
      setSubmittingWeight(false);
    }
  };

  // Helper: Format Date for Chart Labels
  const formatDayLabel = (dateStr: string, isShort: boolean = false) => {
    const parts = dateStr.split("-");
    if (parts.length < 3) return dateStr;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    if (isShort) {
      return d.toLocaleDateString("en-US", { weekday: "narrow" });
    }
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  // Calculate Weight Difference
  const weightDiff = Math.abs(weightKg - targetWeightKg).toFixed(1);
  const weightDiffAction = weightKg > targetWeightKg ? "to lose" : "to gain";

  // SVG Chart Geometry for Weight History (only when >= 2 entries)
  const weightSvg = useMemo(() => {
    if (weightHistory.length < 2) return null;

    const weights = weightHistory.map((w) => w.weightKg);
    const minW = Math.max(0, Math.min(...weights, targetWeightKg) - 2);
    const maxW = Math.max(...weights, targetWeightKg) + 2;
    const rangeW = maxW - minW || 1;

    const width = 320;
    const height = 120;
    const padding = 16;

    const getX = (idx: number) => padding + (idx / (weights.length - 1)) * (width - 2 * padding);
    const getY = (w: number) => height - padding - ((w - minW) / rangeW) * (height - 2 * padding);

    const points = weights.map((w, i) => ({
      x: getX(i),
      y: getY(w),
      weight: w,
      date: weightHistory[i].recordedAt,
    }));

    const pathData = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");

    const targetY = getY(targetWeightKg);

    const netChange = (weights[weights.length - 1] - weights[0]).toFixed(1);

    return {
      points,
      pathData,
      targetY,
      minW: minW.toFixed(0),
      maxW: maxW.toFixed(0),
      netChange,
      firstDate: new Date(weightHistory[0].recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      lastDate: new Date(weightHistory[weightHistory.length - 1].recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  }, [weightHistory, targetWeightKg]);

  return (
    <div className="min-h-screen font-sans bg-[#F9FAFB] text-[#1A1C1C] pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-xl tracking-tight text-[#1A1C1C]">
            Progress & Analytics
          </h1>
          <p className="text-xs font-semibold text-[#006B5F] mt-0.5">
            CalTrack Nutrition Intelligence
          </p>
        </div>

        {/* Date Range Selector Pill */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setRange(7);
              setSelectedDate(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              range === 7
                ? "bg-[#006B5F] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => {
              setRange(30);
              setSelectedDate(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              range === 30
                ? "bg-[#006B5F] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            30 Days
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-6 space-y-6">
        {/* Loading Skeleton */}
        {isAdherenceLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 bg-gray-200 rounded-3xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-gray-200 rounded-2xl" />
              <div className="h-24 bg-gray-200 rounded-2xl" />
            </div>
            <div className="h-64 bg-gray-200 rounded-3xl" />
          </div>
        )}

        {/* Error Retry State */}
        {isAdherenceError && !isAdherenceLoading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-3">
            <p className="text-sm font-bold text-red-600">
              Unable to load progress analytics
            </p>
            <button
              onClick={() => {
                refetchAdherence();
                refetchWeight();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isAdherenceLoading && !isAdherenceError && (
          <>
            {/* Overview KPI Cards (2x2 Grid) */}
            <section className="grid grid-cols-2 gap-3">
              {/* 1. Avg Calories */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Avg Daily Calories
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#006B5F]" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-headline font-black text-2xl text-[#1A1C1C]">
                      {analytics.avgCalories !== null
                        ? analytics.avgCalories.toLocaleString()
                        : "—"}
                    </span>
                    {analytics.avgCalories !== null && (
                      <span className="text-xs font-bold text-gray-400">kcal</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-50">
                  {analytics.avgCalories !== null && analytics.caloriesDelta !== null ? (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-bold ${
                          analytics.caloriesDelta <= 0
                            ? "text-[#006B5F]"
                            : "text-amber-600"
                        }`}
                      >
                        {analytics.caloriesDelta <= 0
                          ? `${Math.abs(analytics.caloriesDelta)} kcal under target`
                          : `${analytics.caloriesDelta} kcal over target`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-gray-400">
                      No days logged in range
                    </span>
                  )}
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Target: {targetCalories.toLocaleString()} kcal
                  </p>
                </div>
              </div>

              {/* 2. Logging Consistency */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Logging Consistency
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-headline font-black text-2xl text-[#1A1C1C]">
                      {analytics.loggedCount}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      / {analytics.totalDays} days
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-50 space-y-1.5">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#006B5F] rounded-full transition-all duration-500"
                      style={{ width: `${analytics.consistencyPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>{analytics.consistencyPct}% tracked</span>
                    <span>
                      {analytics.unloggedCount > 0
                        ? `${analytics.unloggedCount} unlogged`
                        : "All logged"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Avg Protein */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Avg Daily Protein
                    </span>
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-headline font-black text-2xl text-[#1A1C1C]">
                      {analytics.avgProtein !== null ? `${analytics.avgProtein}g` : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-50">
                  <p className="text-[11px] font-bold text-gray-600">
                    Goal: {targetProteinG}g / day
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {analytics.avgProtein !== null
                      ? `${Math.round((analytics.avgProtein / targetProteinG) * 100)}% of protein target`
                      : "No meal entries recorded"}
                  </p>
                </div>
              </div>

              {/* 4. Target Adherence */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Target Adherence
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-headline font-black text-2xl text-[#1A1C1C]">
                      {analytics.loggedCount > 0
                        ? `${analytics.withinTargetCount} / ${analytics.loggedCount}`
                        : "—"}
                    </span>
                    <span className="text-xs font-bold text-gray-400">days</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-50">
                  <p className="text-[11px] font-bold text-[#006B5F]">
                    {analytics.loggedCount > 0
                      ? `${analytics.targetAdherencePct}% within budget`
                      : "Awaiting logs"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {analytics.loggedCount > 0
                      ? "Of tracked calendar days"
                      : "Unlogged days excluded"}
                  </p>
                </div>
              </div>
            </section>

            {/* Calorie Intake vs Target Interactive Chart */}
            <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-base text-[#1A1C1C]">
                    Calorie Intake vs Target
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Daily totals with clear unlogged day distinction
                  </p>
                </div>
                <div className="bg-[#006B5F]/10 text-[#006B5F] px-3 py-1 rounded-full text-xs font-bold">
                  Target: {targetCalories.toLocaleString()} kcal
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="relative pt-6 pb-2">
                {/* Horizontal Dashed Reference Line for Target Calories */}
                <div
                  className="absolute inset-x-0 border-t-2 border-dashed border-[#006B5F]/30 pointer-events-none z-10 flex justify-end pr-1"
                  style={{ top: "35%" }}
                >
                  <span className="text-[9px] font-extrabold text-[#006B5F] bg-white/90 px-1 -translate-y-2.5 rounded">
                    Goal: {targetCalories}
                  </span>
                </div>

                {/* Bars Grid */}
                <div
                  className={`flex items-end justify-between gap-1.5 h-44 px-1 ${
                    range === 30 ? "gap-0.5" : "gap-2"
                  }`}
                >
                  {adherenceDays.map((day) => {
                    const isSelected = selectedDayInfo?.date === day.date;
                    const isOver = day.logged && day.calories > targetCalories;
                    // Max height scaling based on 1.3x target
                    const maxScale = Math.max(targetCalories * 1.3, 2400);
                    const heightPercent = day.logged
                      ? Math.min(100, Math.max(14, Math.round((day.calories / maxScale) * 100)))
                      : 12;

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setSelectedDate(day.date)}
                        className="group flex-1 flex flex-col items-center h-full justify-end cursor-pointer outline-none focus:outline-none"
                      >
                        {/* The Bar */}
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 relative flex items-start justify-center ${
                            !day.logged
                              ? "bg-gray-100 border-2 border-dashed border-gray-300 opacity-60 group-hover:opacity-100"
                              : isOver
                              ? "bg-gradient-to-t from-amber-500 to-rose-500 shadow-sm"
                              : "bg-gradient-to-t from-[#006B5F] to-[#2DD4BF] shadow-sm"
                          } ${isSelected ? "ring-2 ring-offset-2 ring-[#006B5F]" : ""}`}
                          style={{ height: `${heightPercent}%` }}
                        >
                          {!day.logged && range === 7 && (
                            <span className="text-[8px] font-extrabold text-gray-400 mt-1">
                              —
                            </span>
                          )}
                        </div>

                        {/* Label below bar */}
                        <span
                          className={`text-[9px] font-bold mt-2 truncate ${
                            isSelected ? "text-[#006B5F]" : "text-gray-400"
                          }`}
                        >
                          {range === 7
                            ? formatDayLabel(day.date, true)
                            : parseInt(day.date.split("-")[2], 10) % 5 === 0 || day.date === getLocalDateString()
                            ? day.date.split("-")[2]
                            : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-gray-100 text-[11px] font-bold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#006B5F]" />
                    <span>Under Target</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                    <span>Over Target</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-gray-100 border border-dashed border-gray-400" />
                    <span>Unlogged Day</span>
                  </div>
                </div>
              </div>

              {/* Selected Day Detail Inspection Box */}
              {selectedDayInfo && (
                <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl p-4 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0F766E]">
                        {formatDayLabel(selectedDayInfo.date)}
                      </span>
                      <h4 className="font-headline font-black text-lg text-[#1A1C1C] mt-0.5">
                        {selectedDayInfo.logged
                          ? `${selectedDayInfo.calories.toLocaleString()} kcal`
                          : "Unlogged Day"}
                      </h4>
                    </div>

                    {selectedDayInfo.logged ? (
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          selectedDayInfo.calories <= targetCalories
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {selectedDayInfo.calories <= targetCalories
                          ? `${targetCalories - selectedDayInfo.calories} kcal under goal`
                          : `${selectedDayInfo.calories - targetCalories} kcal over goal`}
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        No Meals Recorded
                      </span>
                    )}
                  </div>

                  {selectedDayInfo.logged ? (
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#CCFBF1]/60 text-center">
                      <div className="bg-white/70 rounded-xl py-1.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Protein</span>
                        <p className="font-black text-sm text-[#006B5F]">{selectedDayInfo.protein}g</p>
                      </div>
                      <div className="bg-white/70 rounded-xl py-1.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Carbs</span>
                        <p className="font-black text-sm text-amber-600">{selectedDayInfo.carbs}g</p>
                      </div>
                      <div className="bg-white/70 rounded-xl py-1.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Fat</span>
                        <p className="font-black text-sm text-rose-500">{selectedDayInfo.fat}g</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">
                      Unlogged days are excluded from your averages to keep your daily nutritional statistics honest.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Macronutrient Intake Trends & Ratio */}
            <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-base text-[#1A1C1C]">
                    Macronutrient Intake Trends
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Real consumption across logged Sri Lankan meals
                  </p>
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Logged Averages
                </span>
              </div>

              {/* Macro Switcher Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    key: "protein",
                    label: "Protein",
                    val: analytics.avgProtein,
                    target: targetProteinG,
                    color: "text-[#006B5F]",
                    border: "border-[#006B5F]",
                    bg: "bg-[#006B5F]/10",
                  },
                  {
                    key: "carbs",
                    label: "Carbohydrates",
                    val: analytics.avgCarbs,
                    target: targetCarbsG,
                    color: "text-amber-600",
                    border: "border-amber-500",
                    bg: "bg-amber-50",
                  },
                  {
                    key: "fat",
                    label: "Healthy Fats",
                    val: analytics.avgFat,
                    target: targetFatG,
                    color: "text-rose-500",
                    border: "border-rose-400",
                    bg: "bg-rose-50",
                  },
                ].map((item) => {
                  const isActive = activeMacro === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveMacro(item.key as any)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isActive
                          ? `${item.border} ${item.bg} shadow-sm`
                          : "border-gray-100 bg-gray-50/50 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {item.label}
                      </span>
                      <p className={`font-headline font-black text-lg ${item.color} mt-0.5`}>
                        {item.val !== null ? `${item.val}g` : "—"}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        Target: {item.target}g
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Macro Calorie Energy Distribution Bar */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                  <span>Actual Calorie Ratio</span>
                  <span>
                    {analytics.proteinRatio}% P • {analytics.carbsRatio}% C • {analytics.fatRatio}% F
                  </span>
                </div>
                <div className="h-3 w-full bg-gray-200 rounded-full flex overflow-hidden">
                  <div
                    className="bg-[#006B5F] h-full transition-all duration-500"
                    style={{ width: `${analytics.proteinRatio}%` }}
                    title={`Protein: ${analytics.proteinRatio}%`}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all duration-500"
                    style={{ width: `${analytics.carbsRatio}%` }}
                    title={`Carbs: ${analytics.carbsRatio}%`}
                  />
                  <div
                    className="bg-rose-400 h-full transition-all duration-500"
                    style={{ width: `${analytics.fatRatio}%` }}
                    title={`Fat: ${analytics.fatRatio}%`}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                  <span>Recommended Profile Target: 25% P • 45% C • 30% F</span>
                </div>
              </div>

              {/* Active Macro Timeline Chart */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span className="capitalize">{activeMacro} Daily Intake (g)</span>
                  <span>
                    Goal:{" "}
                    {activeMacro === "protein"
                      ? targetProteinG
                      : activeMacro === "carbs"
                      ? targetCarbsG
                      : targetFatG}
                    g
                  </span>
                </div>

                <div
                  className={`flex items-end justify-between h-28 px-1 pt-2 ${
                    range === 30 ? "gap-0.5" : "gap-2"
                  }`}
                >
                  {adherenceDays.map((day) => {
                    const val = day.logged ? day[activeMacro] : 0;
                    const maxVal = Math.max(
                      activeMacro === "protein"
                        ? targetProteinG * 1.3
                        : activeMacro === "carbs"
                        ? targetCarbsG * 1.3
                        : targetFatG * 1.3,
                      50
                    );
                    const hPct = day.logged
                      ? Math.min(100, Math.max(12, Math.round((val / maxVal) * 100)))
                      : 8;

                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center h-full justify-end"
                        title={`${day.date}: ${val}g`}
                      >
                        <div
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            !day.logged
                              ? "bg-gray-200 border border-dashed border-gray-300 opacity-50"
                              : activeMacro === "protein"
                              ? "bg-[#006B5F]"
                              : activeMacro === "carbs"
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                          style={{ height: `${hPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Weight Tracking & Goal Journey */}
            <section className="bg-gradient-to-br from-[#004B40] via-[#006B5F] to-[#0D9488] rounded-3xl p-6 text-white shadow-lg space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2DD4BF]">
                    Weight Journey
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="font-headline font-black text-3xl">
                      {weightDiff}
                    </h3>
                    <span className="text-sm font-bold text-white/80 uppercase">
                      kg {weightDiffAction}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 mt-1">
                    Current: {weightKg.toFixed(1)} kg • Goal: {targetWeightKg.toFixed(1)} kg
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setWeightInput(weightKg.toString());
                    setIsModalOpen(true);
                  }}
                  className="bg-white hover:bg-gray-100 text-[#006B5F] px-4 py-2 rounded-xl text-xs font-black shadow transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Log Weight</span>
                </button>
              </div>

              {/* Weight Chart or Honest Empty State */}
              <div className="bg-black/15 rounded-2xl p-4 backdrop-blur-sm">
                {isWeightLoading ? (
                  <div className="h-32 flex items-center justify-center text-xs text-white/60">
                    Loading weight history...
                  </div>
                ) : weightSvg ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-white/80">
                      <span>Historical Weight Trend</span>
                      <span className="text-[#2DD4BF]">
                        {parseFloat(weightSvg.netChange) <= 0
                          ? `${weightSvg.netChange} kg since ${weightSvg.firstDate}`
                          : `+${weightSvg.netChange} kg since ${weightSvg.firstDate}`}
                      </span>
                    </div>

                    <div className="relative h-28 w-full">
                      <svg
                        className="w-full h-full overflow-visible"
                        viewBox="0 0 320 120"
                        preserveAspectRatio="none"
                      >
                        {/* Target Line (Dashed White) */}
                        <line
                          x1="0"
                          y1={weightSvg.targetY}
                          x2="320"
                          y2={weightSvg.targetY}
                          stroke="white"
                          strokeWidth="1.5"
                          strokeDasharray="4,4"
                          opacity="0.6"
                        />

                        {/* Actual Weight Curve */}
                        <path
                          d={weightSvg.pathData}
                          fill="none"
                          stroke="#2DD4BF"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Weight Points */}
                        {weightSvg.points.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r={idx === weightSvg.points.length - 1 ? 4.5 : 3}
                            fill="#FFFFFF"
                            stroke="#006B5F"
                            strokeWidth="2"
                          />
                        ))}
                      </svg>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-white/60 pt-1">
                      <span>{weightSvg.firstDate}</span>
                      <span className="text-white/40">Target: {targetWeightKg} kg</span>
                      <span>{weightSvg.lastDate}</span>
                    </div>
                  </div>
                ) : weightHistory.length === 1 ? (
                  <div className="py-4 text-center space-y-2">
                    <p className="text-sm font-bold text-white">
                      1 weight entry recorded ({weightHistory[0].weightKg} kg)
                    </p>
                    <p className="text-xs text-white/70 max-w-sm mx-auto">
                      Log your weight on multiple days to view your progress trend line.
                    </p>
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-2">
                    <p className="text-sm font-bold text-white">
                      No weight entries logged yet
                    </p>
                    <p className="text-xs text-white/70 max-w-sm mx-auto">
                      Regular weigh-ins help you monitor your journey toward your South Asian health goal.
                    </p>
                  </div>
                )}
              </div>

              {/* South Asian BMI Status Indicator */}
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                      South Asian BMI Standard
                    </span>
                    <h4 className="font-headline font-black text-lg text-white">
                      BMI {bmiInfo.bmi} • {bmiInfo.label}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#2DD4BF] bg-white/10 px-2.5 py-1 rounded-full uppercase">
                      Height: {heightCm} cm
                    </span>
                  </div>
                </div>

                {/* BMI Gauge Bar */}
                <div className="relative pt-1 pb-3">
                  <div className="h-3 w-full rounded-full flex overflow-hidden shadow-inner">
                    <div className="h-full bg-blue-400 w-[25%]" title="Underweight < 18.5" />
                    <div className="h-full bg-emerald-400 w-[30%]" title="Normal 18.5 - 23.0" />
                    <div className="h-full bg-amber-400 w-[25%]" title="Overweight 23.0 - 27.5" />
                    <div className="h-full bg-rose-400 w-[20%]" title="Obese > 27.5" />
                  </div>

                  {/* Marker Pin */}
                  <div
                    className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                    style={{ left: `${bmiPos}%` }}
                  >
                    <div className="w-2.5 h-4 bg-white rounded-full shadow-md" />
                  </div>

                  <div className="flex justify-between text-[9px] font-bold text-white/60 mt-1 px-1">
                    <span>18.5</span>
                    <span className="text-[#2DD4BF]">23.0 (SA Limit)</span>
                    <span>27.5</span>
                  </div>
                </div>

                <p className="text-[11px] text-white/80 leading-relaxed">
                  South Asian health guidelines recommend maintaining BMI below{" "}
                  <span className="font-bold text-white">23.0</span> to minimize metabolic and cardiovascular risk.
                </p>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Log Weight Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-[430px] bg-white rounded-t-[32px] p-6 shadow-2xl z-10 border-t border-gray-100 pb-10 flex flex-col gap-4">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto" />

            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-[#1A1C1C]">Log Weight</h3>
                <p className="text-xs text-gray-500">Record today's body weight</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {weightError && (
              <div className="bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-xl p-3">
                {weightError}
              </div>
            )}

            <form onSubmit={handleLogWeight} className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 pl-1">
                  Weight (kg)
                </label>
                <div className="relative flex items-center mt-1">
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="300"
                    required
                    autoFocus
                    placeholder="e.g. 68.5"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#006B5F] focus:bg-white focus:outline-none text-base font-extrabold text-[#1A1C1C]"
                  />
                  <span className="absolute right-4 font-bold text-xs text-gray-400">kg</span>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWeight}
                  className="flex-1 py-3 bg-[#006B5F] hover:bg-[#00574D] disabled:bg-gray-300 rounded-xl text-xs font-bold text-white transition-colors shadow-md shadow-[#006B5F]/20"
                >
                  {submittingWeight ? "Saving..." : "Save Weight"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Persistent Bottom Nav */}
      <AppBottomNav activeTab="progress" />
    </div>
  );
}

export default function ProgressPage() {
  return (
    <AuthGuard>
      <ProgressContent />
    </AuthGuard>
  );
}
