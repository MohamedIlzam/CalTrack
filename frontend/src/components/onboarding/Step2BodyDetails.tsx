"use client";

import React, { useState, useMemo } from "react";
import { OnboardingShell } from "./OnboardingShell";
import { BottomNavFooter } from "../ui/BottomNavFooter";
import { ProTipCard } from "../ui/ProTipCard";
import { useAppStore } from "@/store/useAppStore";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2BodyDetails({ onNext, onBack }: Props) {
  const setOnboarding = useAppStore((s) => s.setOnboarding);

  const [name, setName] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");

  const [heightCm, setHeightCm] = useState<string>("");
  const [heightFt, setHeightFt] = useState<string>("");
  const [heightIn, setHeightIn] = useState<string>("");

  const [weightVal, setWeightVal] = useState<string>("");

  // Target weight — tracks manual edits separately so auto-fill can override when height changes
  const [targetWeightVal, setTargetWeightVal] = useState<string>("");
  const [targetWeightEdited, setTargetWeightEdited] = useState(false);

  /* ── derived height in cm (shared) ── */
  const resolvedHeightCm = useMemo(() => {
    if (heightUnit === "cm") return parseFloat(heightCm) || 0;
    const ft = parseFloat(heightFt || "0");
    const inch = parseFloat(heightIn || "0");
    return (ft * 12 + inch) * 2.54;
  }, [heightCm, heightFt, heightIn, heightUnit]);

  /* ── auto healthy weight: BMI midpoint 21.75 × h² ── */
  const autoHealthyWeightKg = useMemo(() => {
    if (resolvedHeightCm <= 0) return 0;
    return 21.75 * Math.pow(resolvedHeightCm / 100, 2);
  }, [resolvedHeightCm]);

  const autoHealthyWeightDisplay = useMemo(() => {
    if (autoHealthyWeightKg <= 0) return "";
    const val = weightUnit === "kg" ? autoHealthyWeightKg : autoHealthyWeightKg * 2.20462;
    return val.toFixed(1);
  }, [autoHealthyWeightKg, weightUnit]);

  // The displayed value in the target weight input
  const targetWeightDisplayVal = targetWeightEdited ? targetWeightVal : autoHealthyWeightDisplay;

  /* ── toggle weight unit — converts both fields ── */
  const toggleWeightUnit = () => {
    if (weightUnit === "kg") {
      setWeightUnit("lbs");
      if (weightVal) setWeightVal((parseFloat(weightVal) * 2.20462).toFixed(1));
      if (targetWeightEdited && targetWeightVal)
        setTargetWeightVal((parseFloat(targetWeightVal) * 2.20462).toFixed(1));
    } else {
      setWeightUnit("kg");
      if (weightVal) setWeightVal((parseFloat(weightVal) / 2.20462).toFixed(1));
      if (targetWeightEdited && targetWeightVal)
        setTargetWeightVal((parseFloat(targetWeightVal) / 2.20462).toFixed(1));
    }
  };

  /* ── current BMI ── */
  const bmi = useMemo(() => {
    const w = weightVal
      ? weightUnit === "kg" ? parseFloat(weightVal) : parseFloat(weightVal) * 0.453592
      : 0;
    if (resolvedHeightCm > 0 && w > 0)
      return Number((w / Math.pow(resolvedHeightCm / 100, 2)).toFixed(1));
    return null;
  }, [weightVal, weightUnit, resolvedHeightCm]);

  const bmiStatus = useMemo(() => {
    if (!bmi) return { label: "", color: "" };
    if (bmi < 18.5) return { label: "Underweight", color: "text-[#F59E0B]" };
    if (bmi < 25.0) return { label: "Normal", color: "text-[#006B5F]" };
    if (bmi < 30.0) return { label: "Overweight", color: "text-[#D97706]" };
    return { label: "Obese", color: "text-[#E11D48]" };
  }, [bmi]);

  /* ── target BMI (for second marker) ── */
  const targetBmi = useMemo(() => {
    const tKg = targetWeightEdited && targetWeightVal
      ? (weightUnit === "kg" ? parseFloat(targetWeightVal) : parseFloat(targetWeightVal) * 0.453592)
      : autoHealthyWeightKg;
    if (resolvedHeightCm > 0 && tKg > 0)
      return Number((tKg / Math.pow(resolvedHeightCm / 100, 2)).toFixed(1));
    return null;
  }, [targetWeightEdited, targetWeightVal, weightUnit, autoHealthyWeightKg, resolvedHeightCm]);

  /* ── marker position helper ── */
  const bmiToPosition = (b: number) => {
    if (b < 18.5) return Math.max(5, ((b - 15) / (18.5 - 15)) * 25);
    if (b < 25) return 25 + ((b - 18.5) / (25 - 18.5)) * 33;
    if (b < 30) return 58 + ((b - 25) / (30 - 25)) * 17;
    return 75 + Math.min(20, ((b - 30) / (40 - 30)) * 25);
  };

  const markerPosition = useMemo(() => (bmi ? bmiToPosition(bmi) : 0), [bmi]);
  const targetMarkerPosition = useMemo(() => (targetBmi ? bmiToPosition(targetBmi) : 0), [targetBmi]);

  /* ── save & advance ── */
  const handleNext = () => {
    const wKg = weightVal
      ? weightUnit === "kg" ? parseFloat(weightVal) : parseFloat(weightVal) * 0.453592
      : 0;
    const tKg = targetWeightEdited && targetWeightVal
      ? (weightUnit === "kg" ? parseFloat(targetWeightVal) : parseFloat(targetWeightVal) * 0.453592)
      : autoHealthyWeightKg;
    if (wKg > 0 && resolvedHeightCm > 0) {
      setOnboarding({ name, weightKg: wKg, targetWeightKg: tKg, heightCm: resolvedHeightCm });
    }
    onNext();
  };

  return (
    <OnboardingShell
      headerTitle="Personal"
      step={2}
      onBack={onBack}
      footer={<BottomNavFooter onNext={handleNext} onBack={onBack} />}
    >
      <div className="flex flex-col gap-3 py-1">
        <div>
          <h1 className="text-[1.75rem] font-bold text-gray-900 mb-1 tracking-tight">
            Tell us about yourself
          </h1>
          <p className="text-gray-500 text-sm">
            Your biology is the foundation of your curated wellness plan.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-2">

          {/* Name — full width */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Name</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center px-4 h-[46px]">
              <input
                type="text"
                placeholder="e.g. Alex Fernando"
                className="bg-transparent w-full font-bold text-base text-gray-900 outline-none placeholder:text-gray-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Age */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Age</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center px-4 h-[46px]">
              <input type="number" placeholder="25" className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300" />
              <span className="text-xs font-bold text-gray-400 absolute right-4">YRS</span>
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Gender</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center px-4 h-[46px]">
              <select defaultValue="" className="bg-transparent w-full font-bold text-base text-gray-900 outline-none appearance-none cursor-pointer">
                <option value="" disabled hidden>Select</option>
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
              <svg className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Height */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Height</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center pl-4 pr-1 h-[46px]">
              {heightUnit === "cm" ? (
                <input
                  type="number" placeholder="170"
                  className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300 pr-[50px]"
                  value={heightCm} onChange={(e) => setHeightCm(e.target.value)}
                />
              ) : (
                <div className="flex items-center w-full pr-[45px]">
                  <input
                    type="number" placeholder="5"
                    className="bg-transparent w-1/2 min-w-0 font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300 text-center"
                    value={heightFt} onChange={(e) => setHeightFt(e.target.value)}
                  />
                  <span className="text-[9px] font-bold text-gray-400 mr-2">FT</span>
                  <input
                    type="number" placeholder="9"
                    className="bg-transparent w-1/2 min-w-0 font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300 text-center border-l border-gray-200"
                    value={heightIn} onChange={(e) => setHeightIn(e.target.value)}
                  />
                  <span className="text-[9px] font-bold text-gray-400 ml-1">IN</span>
                </div>
              )}
              <button
                onClick={() => {
                  if (heightUnit === "cm") {
                    setHeightUnit("ft");
                    if (heightCm) {
                      const totalInches = parseFloat(heightCm) / 2.54;
                      const ft = Math.floor(totalInches / 12);
                      const inch = Math.round(totalInches % 12);
                      setHeightFt(ft.toString());
                      setHeightIn(inch.toString());
                    }
                  } else {
                    setHeightUnit("cm");
                    const ft = parseFloat(heightFt || "0");
                    const inch = parseFloat(heightIn || "0");
                    if (ft > 0 || inch > 0) {
                      setHeightCm(Math.round((ft * 12 + inch) * 2.54).toString());
                    }
                  }
                }}
                className="absolute right-1 top-1 bottom-1 rounded-[12px] flex items-center justify-center px-2.5 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors z-10"
              >
                <span className="text-[11px] font-bold text-primary">{heightUnit === "cm" ? "CM" : "FT"}</span>
              </button>
            </div>
          </div>

          {/* Current Weight */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Current Weight</label>
            <div className="relative bg-gray-50 rounded-2xl flex items-center pl-4 pr-1 h-[46px]">
              <input
                type="number"
                placeholder={weightUnit === "kg" ? "65.0" : "145.0"}
                step="0.1"
                className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300 pr-[50px]"
                value={weightVal}
                onChange={(e) => setWeightVal(e.target.value)}
              />
              <button
                onClick={toggleWeightUnit}
                className="absolute right-1 top-1 bottom-1 rounded-[12px] flex items-center justify-center px-2 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors z-10"
              >
                <span className="text-[11px] font-bold text-primary">{weightUnit === "kg" ? "KG" : "LBS"}</span>
              </button>
            </div>
          </div>

        </div>

        {/* BMI Indicator */}
        <div className={`flex flex-col mt-1 transition-opacity duration-300 ${!bmi && !targetBmi ? "opacity-40" : "opacity-100"}`}>
          <div className="flex justify-between items-end mb-3 relative z-10">
            <span className="text-sm font-bold text-[#3C4A46]">BMI Indicator</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-extrabold ${bmi ? bmiStatus.color : "text-gray-300"}`}>
                {bmi ?? "--"}
              </span>
              <span className="text-xs font-semibold text-gray-500">
                {bmi ? bmiStatus.label : "Pending"}
              </span>
            </div>
          </div>

          <div className="relative w-full mt-1">
            {/* Tick labels */}
            <div className="absolute -top-[18px] left-0 w-full">
              <span className="absolute left-[25%] -translate-x-1/2 text-[10px] font-bold text-gray-500">18.5</span>
              <span className="absolute left-[58%] -translate-x-1/2 text-[10px] font-bold text-gray-500">25.0</span>
              <span className="absolute left-[75%] -translate-x-1/2 text-[10px] font-bold text-gray-500">30.0</span>
            </div>

            {/* Segmented bar */}
            <div className="relative w-full h-3 flex rounded-full overflow-hidden gap-[2px]">
              <div className="bg-[#FCE173] w-[25%] h-full" />
              <div className="bg-[#2DD4BF] w-[33%] h-full" />
              <div className="bg-[#FBBF24] w-[17%] h-full" />
              <div className="bg-[#FB7185] w-[25%] h-full" />

              {/* Current weight marker — white */}
              {bmi && (
                <div
                  className="absolute top-0 bottom-0 w-[4px] bg-white border-x border-gray-900/10 shadow-sm transition-all duration-500 ease-out z-20"
                  style={{ left: `calc(${markerPosition}% - 2px)` }}
                />
              )}

              {/* Target weight marker — black */}
              {targetBmi && (
                <div
                  className="absolute top-0 bottom-0 w-[4px] bg-gray-900 shadow-sm transition-all duration-500 ease-out z-10"
                  style={{ left: `calc(${targetMarkerPosition}% - 2px)` }}
                />
              )}
            </div>

            {/* Segment labels */}
            <div className="flex justify-between text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
              <span className="w-[25%] text-left text-gray-500">Underweight</span>
              <span className="w-[33%] text-center text-gray-500">Healthy</span>
              <span className="w-[17%] text-center text-gray-500 pt-[1px] pr-2">Overweight</span>
              <span className="w-[25%] text-right text-gray-500">Obese</span>
            </div>
          </div>
        </div>

        {/* Target Weight — below BMI, auto-filled from healthy BMI midpoint */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Target Weight</label>
            {!targetWeightEdited && autoHealthyWeightKg > 0 && (
              <span className="text-[10px] font-semibold text-[#006B5F] bg-[#006B5F]/10 px-2 py-0.5 rounded-full">
                Auto — healthy midpoint
              </span>
            )}
          </div>
          <div className="relative bg-gray-50 rounded-2xl flex items-center pl-4 pr-1 h-[46px]">
            <input
              type="number"
              placeholder={weightUnit === "kg" ? "60.0" : "132.0"}
              step="0.1"
              className="bg-transparent w-full font-bold text-lg text-gray-900 outline-none placeholder:text-gray-300 pr-[50px]"
              value={targetWeightDisplayVal}
              onChange={(e) => {
                setTargetWeightEdited(true);
                setTargetWeightVal(e.target.value);
              }}
            />
            <button
              onClick={toggleWeightUnit}
              className="absolute right-1 top-1 bottom-1 rounded-[12px] flex items-center justify-center px-2 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors z-10"
            >
              <span className="text-[11px] font-bold text-primary">{weightUnit === "kg" ? "KG" : "LBS"}</span>
            </button>
          </div>
        </div>

        <ProTipCard
          title="Why this matters?"
          content="These metrics allow us to calculate your Basal Metabolic Rate (BMR) with clinical precision for your personal wellness plan."
        />

      </div>
    </OnboardingShell>
  );
}
