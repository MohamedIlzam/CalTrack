"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppBottomNav } from "@/components/ui/AppBottomNav";
import { useAppStore } from "@/store/useAppStore";
import { fetchUserProfile, updateUserProfile, type UserProfile } from "@/lib/api";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const logout = useAppStore((s) => s.logout);
  const storeName = useAppStore((s) => s.name);
  const storeEmail = useAppStore((s) => s.email);
  const setOnboarding = useAppStore((s) => s.setOnboarding);

  // Fetch profile from live NestJS backend
  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  // Local Form State
  const [name, setName] = useState(storeName || "CalTrack User");
  const [weightKg, setWeightKg] = useState<string>("68.5");
  const [targetWeightKg, setTargetWeightKg] = useState<string>("65.0");
  const [heightCm, setHeightCm] = useState<string>("168");
  const [goal, setGoal] = useState<"LOSE" | "MAINTAIN" | "GAIN">("LOSE");
  const [activityLevel, setActivityLevel] = useState<"SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE">("MODERATE");
  const [targetCalories, setTargetCalories] = useState<string>("1850");
  const [targetProteinG, setTargetProteinG] = useState<string>("130");
  const [targetCarbsG, setTargetCarbsG] = useState<string>("210");
  const [targetFatG, setTargetFatG] = useState<string>("55");
  const [timezone, setTimezone] = useState<string>("Asia/Colombo");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync profile data from backend
  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.weightKg) setWeightKg(profile.weightKg.toString());
      if (profile.targetWeightKg) setTargetWeightKg(profile.targetWeightKg.toString());
      if (profile.heightCm) setHeightCm(profile.heightCm.toString());
      if (profile.goal) setGoal(profile.goal);
      if (profile.activityLevel) setActivityLevel(profile.activityLevel);
      if (profile.targetCalories) setTargetCalories(profile.targetCalories.toString());
      if (profile.targetProteinG) setTargetProteinG(profile.targetProteinG.toString());
      if (profile.targetCarbsG) setTargetCarbsG(profile.targetCarbsG.toString());
      if (profile.targetFatG) setTargetFatG(profile.targetFatG.toString());
      if (profile.timezone) setTimezone(profile.timezone);
    }
  }, [profile]);

  // Calculated South Asian BMI
  const bmiInfo = useMemo(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm) / 100;
    if (isNaN(w) || isNaN(h) || h <= 0) return { bmi: "--", label: "Unknown", color: "text-gray-400" };
    const bmiVal = (w / (h * h)).toFixed(1);
    const numericBmi = parseFloat(bmiVal);

    if (numericBmi < 18.5) return { bmi: bmiVal, label: "Underweight", color: "text-blue-500" };
    if (numericBmi < 23.0) return { bmi: bmiVal, label: "Normal (South Asian)", color: "text-emerald-500" };
    if (numericBmi < 27.5) return { bmi: bmiVal, label: "Overweight (South Asian)", color: "text-amber-500" };
    return { bmi: bmiVal, label: "Obese (South Asian)", color: "text-rose-500" };
  }, [weightKg, heightCm]);

  // Calculated Macro percentages
  const macroBreakdown = useMemo(() => {
    const p = (parseFloat(targetProteinG) || 0) * 4;
    const c = (parseFloat(targetCarbsG) || 0) * 4;
    const f = (parseFloat(targetFatG) || 0) * 9;
    const total = p + c + f || 1;

    return {
      proteinPct: Math.round((p / total) * 100),
      carbsPct: Math.round((c / total) * 100),
      fatPct: Math.round((f / total) * 100),
      computedCalories: Math.round(total),
    };
  }, [targetProteinG, targetCarbsG, targetFatG]);

  // Mutation to save profile updates
  const updateMutation = useMutation({
    mutationFn: (payload: Partial<UserProfile>) => updateUserProfile(payload),
    onSuccess: (updated) => {
      // Sync local Zustand state
      setOnboarding({
        name: updated.name || undefined,
        weightKg: updated.weightKg || undefined,
        targetWeightKg: updated.targetWeightKg || undefined,
        heightCm: updated.heightCm || undefined,
        targetCalories: updated.targetCalories || undefined,
        targetProteinG: updated.targetProteinG || undefined,
        targetCarbsG: updated.targetCarbsG || undefined,
        targetFatG: updated.targetFatG || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setToastMessage("Profile settings updated successfully!");
      setTimeout(() => setToastMessage(null), 3000);
    },
    onError: (err: any) => {
      setToastMessage(err.message || "Failed to update profile.");
      setTimeout(() => setToastMessage(null), 3000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name,
      weightKg: parseFloat(weightKg) || undefined,
      targetWeightKg: parseFloat(targetWeightKg) || undefined,
      heightCm: parseFloat(heightCm) || undefined,
      goal,
      activityLevel,
      targetCalories: parseInt(targetCalories, 10) || undefined,
      targetProteinG: parseInt(targetProteinG, 10) || undefined,
      targetCarbsG: parseInt(targetCarbsG, 10) || undefined,
      targetFatG: parseInt(targetFatG, 10) || undefined,
      timezone,
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-[#1A1C1C] pb-28">
      {/* Top Header Card */}
      <header className="relative bg-gradient-to-br from-[#004B40] via-[#006B5F] to-[#0D9488] text-white pt-8 pb-10 px-5 rounded-b-[32px] shadow-xl overflow-hidden">
        {/* Glow backdrop */}
        <div 
          className="absolute -right-10 -top-10 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black shadow-inner">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">{name}</h1>
              <p className="text-xs text-white/70 font-medium">{profile?.email || storeEmail || "user@caltrack.app"}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-red-500/80 active:scale-95 transition-all text-xs font-bold text-white flex items-center gap-1.5 backdrop-blur-sm border border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Goal Badge Header */}
        <div className="mt-6 flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/10 w-fit">
          {(["LOSE", "MAINTAIN", "GAIN"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGoal(g)}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                goal === g
                  ? "bg-white text-[#006B5F] shadow-sm scale-105"
                  : "text-white/75 hover:text-white"
              }`}
            >
              {g === "LOSE" ? "Weight Loss" : g === "MAINTAIN" ? "Maintain Weight" : "Muscle Gain"}
            </button>
          ))}
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-[430px] mx-auto px-4 -mt-4 space-y-4 relative z-20">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-[#006B5F] text-white p-3.5 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 animate-fade-in border border-white/20">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Section 1: Physical Metrics & BMI */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1A1C1C] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#006B5F]" />
                Body & Physical Metrics
              </h2>
              <span className={`text-xs font-extrabold ${bmiInfo.color}`}>
                BMI {bmiInfo.bmi} • {bmiInfo.label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Weight</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:border-[#006B5F] focus:bg-white focus:outline-none text-xs font-extrabold text-[#1A1C1C]"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] font-bold text-gray-400">kg</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Target Weight</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:border-[#006B5F] focus:bg-white focus:outline-none text-xs font-extrabold text-[#1A1C1C]"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] font-bold text-gray-400">kg</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Height</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl focus:border-[#006B5F] focus:bg-white focus:outline-none text-xs font-extrabold text-[#1A1C1C]"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] font-bold text-gray-400">cm</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Calorie & Macro Target Builder */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1A1C1C] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
                Daily Calorie & Macro Targets
              </h2>
              <span className="text-xs font-extrabold text-[#006B5F]">
                {targetCalories} kcal / day
              </span>
            </div>

            {/* Target Calories Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Target Daily Calories</label>
              <div className="relative">
                <input
                  type="number"
                  step="50"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-2xl focus:border-[#006B5F] focus:bg-white focus:outline-none text-sm font-black text-[#1A1C1C]"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-gray-400">kcal</span>
              </div>
            </div>

            {/* Macro Split Bar Visualizer */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                <span>Macro Split</span>
                <span>Calculated: {macroBreakdown.computedCalories} kcal</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${macroBreakdown.proteinPct}%` }} 
                  className="bg-[#FFAD3A] transition-all duration-300" 
                  title={`Protein: ${macroBreakdown.proteinPct}%`} 
                />
                <div 
                  style={{ width: `${macroBreakdown.carbsPct}%` }} 
                  className="bg-[#2DD4BF] transition-all duration-300" 
                  title={`Carbs: ${macroBreakdown.carbsPct}%`} 
                />
                <div 
                  style={{ width: `${macroBreakdown.fatPct}%` }} 
                  className="bg-gray-400 transition-all duration-300" 
                  title={`Fat: ${macroBreakdown.fatPct}%`} 
                />
              </div>
            </div>

            {/* Macro Inputs */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="flex flex-col gap-1 bg-[#FFFBEB] p-2.5 rounded-2xl border border-[#FDE68A]">
                <span className="text-[10px] font-extrabold text-[#D97706] uppercase">Protein ({macroBreakdown.proteinPct}%)</span>
                <div className="relative">
                  <input
                    type="number"
                    value={targetProteinG}
                    onChange={(e) => setTargetProteinG(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-xl focus:border-[#D97706] focus:outline-none text-xs font-black text-[#1A1C1C]"
                  />
                  <span className="absolute right-2 top-2 text-[10px] font-bold text-gray-400">g</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 bg-[#CCFBF1] p-2.5 rounded-2xl border border-[#99F6E4]">
                <span className="text-[10px] font-extrabold text-[#0D9488] uppercase">Carbs ({macroBreakdown.carbsPct}%)</span>
                <div className="relative">
                  <input
                    type="number"
                    value={targetCarbsG}
                    onChange={(e) => setTargetCarbsG(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-teal-200 rounded-xl focus:border-[#0D9488] focus:outline-none text-xs font-black text-[#1A1C1C]"
                  />
                  <span className="absolute right-2 top-2 text-[10px] font-bold text-gray-400">g</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                <span className="text-[10px] font-extrabold text-gray-600 uppercase">Fat ({macroBreakdown.fatPct}%)</span>
                <div className="relative">
                  <input
                    type="number"
                    value={targetFatG}
                    onChange={(e) => setTargetFatG(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl focus:border-gray-500 focus:outline-none text-xs font-black text-[#1A1C1C]"
                  />
                  <span className="absolute right-2 top-2 text-[10px] font-bold text-gray-400">g</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Lifestyle & Activity Level */}
          <section className="bg-[#FFFFFF] rounded-3xl p-5 shadow-sm border border-gray-100/80 space-y-3">
            <h2 className="text-sm font-extrabold text-[#1A1C1C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFAD3A]" />
              Activity & Lifestyle Level
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "SEDENTARY", label: "Sedentary", desc: "Desk job, little movement" },
                { key: "LIGHT", label: "Light Activity", desc: "1-3 days exercise / week" },
                { key: "MODERATE", label: "Moderate", desc: "3-5 days active exercise" },
                { key: "ACTIVE", label: "Highly Active", desc: "Heavy physical work / sports" },
              ].map((act) => (
                <button
                  key={act.key}
                  type="button"
                  onClick={() => setActivityLevel(act.key as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    activityLevel === act.key
                      ? "bg-[#006B5F]/10 border-[#006B5F] text-[#006B5F] shadow-sm"
                      : "bg-[#F9FAFB] border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <p className="text-xs font-extrabold">{act.label}</p>
                  <p className="text-[10px] opacity-75 mt-0.5 leading-tight">{act.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Save Button */}
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full py-4 bg-[#006B5F] hover:bg-[#00574D] disabled:bg-gray-300 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-[#006B5F]/25 active:scale-98 flex items-center justify-center gap-2"
          >
            {updateMutation.isPending ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Profile Settings</span>
              </>
            )}
          </button>
        </form>
      </main>

      <AppBottomNav activeTab="profile" />
    </div>
  );
}
