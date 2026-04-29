"use client";

import { AppBottomNav } from "@/components/ui/AppBottomNav";
import { useAppStore, selectConsumedKcal } from "@/store/useAppStore";

export default function ProgressPage() {
  const weightKg = useAppStore(s => s.weightKg) || 68.3;
  const targetWeightKg = useAppStore(s => s.targetWeightKg) || 66.0;
  const heightCm = useAppStore(s => s.heightCm) || 168;
  const targetCalories = useAppStore(s => s.targetCalories) || 1850;
  
  const consumed = useAppStore(selectConsumedKcal);
  const consumedCarbs = useAppStore((s) => s.entries.filter(e => e.meal !== "saved_meals").reduce((sum, e) => sum + e.carbs, 0));
  const consumedProtein = useAppStore((s) => s.entries.filter(e => e.meal !== "saved_meals").reduce((sum, e) => sum + e.protein, 0));
  const consumedFat = useAppStore((s) => s.entries.filter(e => e.meal !== "saved_meals").reduce((sum, e) => sum + e.fat, 0));

  const diff = Math.abs(weightKg - targetWeightKg).toFixed(1);
  const diffText = weightKg > targetWeightKg ? "kg to lose" : "kg to gain";
  
  const bmi = (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1);
  const bmiValue = parseFloat(bmi);
  const bmiPos = Math.min(95, Math.max(5, ((bmiValue - 15) / 15) * 100));

  return (
    <div className="min-h-screen font-body antialiased bg-background text-on-surface pb-[100px]">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <button className="hover:bg-zinc-100 transition-colors p-2 rounded-full scale-95 active:scale-90 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">menu</span>
          </button>
          <h1 className="font-headline font-bold text-lg tracking-tight text-on-surface">
            My Progress
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container scale-95 active:scale-90 transition-transform cursor-pointer">
          <img
            alt="Profile"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAujlvrvnLYDmjfK8wThE9IUvMJyD8lUYYY4XzMUzklL80Ipd5DIJptPFWcNt3t4YX8hyJO4SBQqSRsxWehrvALDdHARXL8Lxopfwn4ksE5yaD-tKcn4bsggsbg3aPG9_8PxQ6yTTMo1Ponv1EQnza6SCyBPYdXs8SuLZFGTQfLakQtph2CGLJOeaTtSkux9MA_bZlpNHjP7Z6kNNwRdt_Zg_BzKqTKxJ73oGfE66CedBugY5vHp31GdcCaYWNNYSNaku2TZMp9YjE"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-8">
        {/* Weight Progress Hero (New Graph UI) */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#4CE4C8] to-[#40DFCD] rounded-[32px] p-6 text-[#085C50] shadow-sm mb-2">
          {/* Top Decorative Glow */}
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-white rounded-full blur-3xl opacity-20"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3 mt-1">
              <div>
                <p className="font-headline font-bold text-[10px] tracking-[0.15em] uppercase opacity-80 mb-2">
                  Total Progress
                </p>
                <div className="flex items-baseline gap-1.5">
                  <h2 className="font-headline font-extrabold text-[46px] tracking-tighter leading-none">
                    {diff}
                  </h2>
                  <span className="font-headline font-bold text-[13px] tracking-wide uppercase opacity-90">
                    {diffText}
                  </span>
                </div>
              </div>
              <div className="text-right pt-7">
                <span className="font-headline font-bold text-[11px] opacity-80 uppercase tracking-widest">
                  Target: {targetWeightKg} kg
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3.5 bg-[#A1ECD9]/60 rounded-full mb-10 overflow-hidden drop-shadow-sm shadow-inner relative">
              <div className="absolute left-0 top-0 h-full bg-[#085C50] w-[65%] rounded-full shadow-lg"></div>
            </div>

            {/* Graph Section */}
            <div className="relative h-[160px] w-full mb-10">
              {/* Y-axis grid and labels */}
              <div className="absolute inset-0 flex flex-col justify-between pb-8">
                <div className="relative w-full border-t border-[#A1ECD9]/40">
                  <span className="absolute -top-[16px] left-0 text-[10px] font-bold opacity-60">75KG</span>
                </div>
                <div className="relative w-full border-t border-[#A1ECD9]/40">
                  <span className="absolute -top-[16px] left-0 text-[10px] font-bold opacity-60">70KG</span>
                </div>
                <div className="relative w-full border-t border-[#A1ECD9]/40">
                  <span className="absolute -top-[16px] left-0 text-[10px] font-bold opacity-60">65KG</span>
                </div>
              </div>

              {/* Chart SVG */}
              <div className="absolute inset-0 pb-8 pl-[12%]">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                  {/* Target Path (dashed white) */}
                  <line x1="0" y1="15" x2="300" y2="85" stroke="white" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.9" />
                  
                  {/* Actual Path (solid curve) */}
                  <path d="M 0 15 C 60 45, 100 35, 150 85 C 195 125, 235 110, 275 65" fill="none" stroke="#085C50" strokeWidth="4.5" strokeLinecap="round" />
                  
                  {/* Glowing end dot */}
                  <circle cx="275" cy="65" r="4.5" fill="#085C50" />
                  <circle cx="275" cy="65" r="9" fill="#085C50" opacity="0.3" />
                </svg>
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 w-full pl-[12%] flex justify-between text-[9px] font-bold opacity-60 uppercase tracking-widest px-2">
                <span className="-translate-x-1/2">Week 1</span>
                <span className="-translate-x-1/2">Week 2</span>
                <span className="-translate-x-1/2">Week 3</span>
                <span className="-translate-x-1/2 -mr-3">Now</span>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#85EADA]/40 rounded-[20px] p-5 backdrop-blur-md relative overflow-hidden flex flex-col items-start">
                <div className="absolute inset-0 bg-white opacity-20"></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1.5">Current</p>
                  <div className="flex items-baseline gap-1">
                    <p className="font-headline font-extrabold text-[28px] leading-none">{weightKg.toFixed(1)}</p>
                    <span className="text-xs font-bold opacity-90">kg</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#85EADA]/40 rounded-[20px] p-5 backdrop-blur-md relative overflow-hidden flex flex-col items-end text-right">
                <div className="absolute inset-0 bg-white opacity-20"></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1.5">Goal</p>
                  <div className="flex items-baseline gap-1">
                    <p className="font-headline font-extrabold text-[28px] leading-none">{targetWeightKg.toFixed(1)}</p>
                    <span className="text-xs font-bold opacity-90">kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend Component */}
            <div className="flex justify-center items-center gap-6 mb-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-[3px] bg-[#085C50] rounded-full"></div>
                <span className="text-[11px] font-bold opacity-80 title-case font-body">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-[3px] bg-white opacity-90 rounded-full border border-dashed border-white"></div>
                <span className="text-[11px] font-bold opacity-80 title-case font-body">Target Path</span>
              </div>
            </div>

            {/* Footer Text */}
            <p className="text-center text-[12px] font-bold opacity-80 italic font-body">
              Just 2.3 kg away from your Sri Lankan health target
            </p>
          </div>
        </section>

        {/* Calorie Adherence Section */}
        <section className="bg-surface-container-lowest p-6 rounded-xl space-y-6 flex flex-col pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Calorie Adherence
              </h3>
              <span className="material-symbols-outlined text-primary">
                analytics
              </span>
            </div>
            {/* Time Period Tabs */}
            <div className="flex bg-surface-container-low p-1 rounded-lg">
              <button className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider text-outline">
                Today
              </button>
              <button className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider text-outline">
                Yesterday
              </button>
              <button className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-surface-container-lowest text-primary shadow-sm rounded-md">
                7 Days
              </button>
              <button className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider text-outline">
                Month
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-outline font-medium">Consumed Today</p>
              <div className="flex items-baseline gap-1">
                <h4 className="font-headline font-extrabold text-4xl text-on-surface">
                  {consumed.toLocaleString()}
                </h4>
                <span className="text-sm font-bold text-outline">kcal</span>
              </div>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-full flex flex-col justify-center align-center h-auto items-center">
              <p className="text-[10px] font-bold text-primary uppercase tracking-tighter w-full block m-0 h-auto">
                Target: {targetCalories}
              </p>
            </div>
          </div>
          {/* 7-Day Calorie Bar Chart */}
          <div className="space-y-4">
            <div className="flex items-end justify-between h-24 gap-2 px-1">
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary/30 rounded-t-sm h-[85%]" title="1,920 kcal"></div>
                <span className="text-[9px] font-bold text-outline">M</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary/30 rounded-t-sm h-[90%]" title="2,100 kcal"></div>
                <span className="text-[9px] font-bold text-outline">T</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary rounded-t-sm h-[75%]" title="1,650 kcal"></div>
                <span className="text-[9px] font-bold text-outline">W</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary/30 rounded-t-sm h-[80%]" title="1,780 kcal"></div>
                <span className="text-[9px] font-bold text-outline">T</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary/30 rounded-t-sm h-[95%]" title="2,150 kcal"></div>
                <span className="text-[9px] font-bold text-outline">F</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-error/40 rounded-t-sm h-[100%]" title="2,400 kcal"></div>
                <span className="text-[9px] font-bold text-outline">S</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary/30 rounded-t-sm h-[60%]" title="1,400 kcal"></div>
                <span className="text-[9px] font-bold text-outline">S</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-outline">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Under Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-error/40"></div>
                <span>Over Target</span>
              </div>
            </div>
          </div>
        </section>

        {/* Macro Filters & Trends Section */}
        <section className="bg-surface-container-lowest p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Macro Trends
            </h3>
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
              Last 7 Days
            </span>
          </div>
          {/* Macro Tabs/Filters */}
          <div className="grid grid-cols-3 gap-2">
            <button className="bg-primary/10 border border-primary/20 p-3 rounded-xl text-center">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                Carbs
              </p>
              <p className="font-headline font-bold text-sm">{consumedCarbs}g</p>
            </button>
            <button className="bg-surface-container-low p-3 rounded-xl text-center border border-transparent">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">
                Protein
              </p>
              <p className="font-headline font-bold text-sm">{consumedProtein}g</p>
            </button>
            <button className="bg-surface-container-low p-3 rounded-xl text-center border border-transparent">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">
                Fat
              </p>
              <p className="font-headline font-bold text-sm">{consumedFat}g</p>
            </button>
          </div>
          {/* Trend Visualization for selected Macro */}
          <div className="bg-surface-container-low/50 p-4 rounded-xl">
            <div className="flex justify-between items-end h-16 gap-1 mb-2">
              <div className="w-full bg-primary/20 rounded-t-sm h-[60%]"></div>
              <div className="w-full bg-primary/20 rounded-t-sm h-[70%]"></div>
              <div className="w-full bg-primary/20 rounded-t-sm h-[55%]"></div>
              <div className="w-full bg-primary/60 rounded-t-sm h-[80%]"></div>
              <div className="w-full bg-primary/20 rounded-t-sm h-[65%]"></div>
              <div className="w-full bg-primary rounded-t-sm h-[90%]"></div>
              <div className="w-full bg-primary/20 rounded-t-sm h-[75%]"></div>
            </div>
            <div className="flex justify-between text-[8px] font-bold text-outline uppercase px-1">
              <span>Mon</span>
              <span>Sun</span>
            </div>
            <p className="mt-4 text-[11px] text-center text-on-surface-variant font-medium">
              Carbohydrate intake peaked on <span className="font-bold">Saturday</span> due to larger portions of rice.
            </p>
          </div>
        </section>

        {/* South Asian BMI Tracker */}
        <section className="bg-surface-container-lowest p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                South Asian BMI Tracker
              </h3>
              <p className="text-xs text-outline font-medium">
                Based on local health standards
              </p>
            </div>
            <div className="flex flex-col items-end">
              <p className="font-headline font-black text-3xl text-on-surface">
                {bmi}
              </p>
              <div className="flex items-center gap-1 bg-tertiary-container/20 px-2 py-0.5 rounded text-[10px] font-bold text-tertiary uppercase tracking-tighter">
                <span className="material-symbols-outlined text-[12px]">
                  monitor_weight
                </span>
                Current BMI
              </div>
            </div>
          </div>
          <div className="relative">
            {/* Labels */}
            <div className="flex justify-between text-[10px] text-outline font-bold uppercase tracking-tighter mb-2 px-1">
              <span>Under</span>
              <span className="text-primary">Normal</span>
              <span className="text-tertiary">Over</span>
              <span className="text-error">Obese</span>
            </div>
            {/* Gauge Bar */}
            <div className="h-5 w-full rounded-full flex overflow-hidden shadow-inner">
              <div className="h-full bg-secondary-container w-[35%]" title="Underweight < 18.5"></div>
              <div className="h-full bg-primary-container w-[25%] border-x-2 border-surface-container-lowest" title="Normal 18.5 - 23.0"></div>
              <div className="h-full bg-tertiary-container w-[20%]" title="Overweight 23.0 - 27.5"></div>
              <div className="h-full bg-error-container w-[20%]" title="Obese > 27.5"></div>
            </div>
            {/* Marker */}
            <div 
              className="absolute top-7 transform -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out"
              style={{ left: `${bmiPos}%` }}
            >
              <div className="w-1.5 h-4 bg-on-surface rounded-full shadow-sm"></div>
            </div>
            {/* Range markers */}
            <div className="flex justify-between text-[9px] text-outline mt-1 px-1 font-mono">
              <span>18.5</span>
              <span className="text-primary font-bold">23.0</span>
              <span>27.5</span>
            </div>
          </div>
          {/* BMI Historical Sparkline */}
          <div className="pt-4 border-t border-outline-variant/20">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">
              6-Month Trend
            </p>
            <div className="flex items-end justify-between h-12 gap-1.5 px-1">
              <div className="w-full bg-outline-variant/20 rounded-t-sm h-[95%]"></div>
              <div className="w-full bg-outline-variant/20 rounded-t-sm h-[90%]"></div>
              <div className="w-full bg-outline-variant/20 rounded-t-sm h-[85%]"></div>
              <div className="w-full bg-outline-variant/20 rounded-t-sm h-[80%]"></div>
              <div className="w-full bg-primary/60 rounded-t-sm h-[70%]"></div>
              <div className="w-full bg-primary rounded-t-sm h-[65%]"></div>
            </div>
          </div>
          <div className="bg-tertiary-container/10 p-4 rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-tertiary mt-0.5">
              info
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Your current BMI is <span className="font-bold">{bmi}</span>. For South
              Asians, health risks increase above{" "}
              <span className="font-bold text-tertiary">23.0</span>. Aiming for{" "}
              <span className="text-primary font-bold">22.5</span> is
              recommended.
            </p>
          </div>
        </section>

        {/* Essential Micronutrients */}
        <section className="bg-surface-container-lowest p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Essential Micronutrients
              </h3>
              <p className="text-xs text-outline font-medium">
                Daily Target Adherence
              </p>
            </div>
            <span className="material-symbols-outlined text-primary">
              nutrition
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Fiber */}
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center text-center space-y-3 border border-outline-variant/10">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                Fiber
              </span>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-variant/30" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth={4}></circle>
                  <circle className="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="44" strokeLinecap="round" strokeWidth={4}></circle>
                </svg>
                <span className="absolute font-headline font-bold text-sm">75%</span>
              </div>
              <p className="text-[10px] text-primary font-bold">Near Goal</p>
            </div>
            {/* Sodium */}
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center text-center space-y-3 border border-outline-variant/10">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                Sodium
              </span>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-variant/30" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth={4}></circle>
                  <circle className="text-error" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="130" strokeLinecap="round" strokeWidth={4}></circle>
                </svg>
                <span className="absolute font-headline font-bold text-sm text-error">High</span>
              </div>
              <p className="text-[10px] text-error font-bold uppercase">Critical</p>
            </div>
            {/* Potassium */}
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center text-center space-y-3 border border-outline-variant/10">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                Potassium
              </span>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-variant/30" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth={4}></circle>
                  <circle className="text-tertiary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="88" strokeLinecap="round" strokeWidth={4}></circle>
                </svg>
                <span className="absolute font-headline font-bold text-sm">50%</span>
              </div>
              <p className="text-[10px] text-tertiary font-bold">Low</p>
            </div>
            {/* Vitamin C */}
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center text-center space-y-3 border border-outline-variant/10">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                Vitamin C
              </span>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-variant/30" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth={4}></circle>
                  <circle className="text-primary-container" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="18" strokeLinecap="round" strokeWidth={4}></circle>
                </svg>
                <span className="absolute font-headline font-bold text-sm">90%</span>
              </div>
              <p className="text-[10px] text-primary-container font-bold">Optimal</p>
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant text-center px-4">
            Pro tip: Sodium intake is common in pickles and dried fish. Increase
            Fiber via whole grains like red rice.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hydration Tracker */}
          <section className="bg-surface-container-lowest p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-lg">Hydration</h3>
              <div className="flex items-center gap-1 text-primary">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  water_drop
                </span>
                <span className="font-bold text-xs uppercase tracking-widest">
                  Liters
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between h-24 gap-2">
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary/20 rounded-t-md h-[80%]"></div>
                <span className="text-[9px] font-bold text-outline">M</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary/20 rounded-t-md h-[60%]"></div>
                <span className="text-[9px] font-bold text-outline">T</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary rounded-t-md h-[95%]"></div>
                <span className="text-[9px] font-bold text-outline">W</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary/20 rounded-t-md h-[40%]"></div>
                <span className="text-[9px] font-bold text-outline">T</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary/20 rounded-t-md h-[70%]"></div>
                <span className="text-[9px] font-bold text-outline">F</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary/20 rounded-t-md h-[30%]"></div>
                <span className="text-[9px] font-bold text-outline">S</span>
              </div>
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-primary/10 rounded-t-md h-[10%]"></div>
                <span className="text-[9px] font-bold text-outline">S</span>
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-on-surface-variant text-center">
              Avg. 2.4L per day
            </p>
          </section>

          {/* Adherence & Streaks */}
          <section className="bg-surface-container-lowest p-6 rounded-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline font-bold text-lg">Goal Adherence</h3>
                <p className="text-xs text-outline font-medium">Last 7 Days</p>
              </div>
              <div className="bg-tertiary-container px-3 py-1.5 rounded-full flex items-center gap-2 scale-95 active:scale-90 transition-transform cursor-pointer">
                <span
                  className="material-symbols-outlined text-on-tertiary-container text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_fire_department
                </span>
                <span className="text-[10px] font-bold text-on-tertiary-container uppercase tracking-widest">
                  14 Day Streak
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-8">
              <span className="font-headline font-extrabold text-4xl text-primary">
                5
              </span>
              <span className="font-headline font-bold text-lg text-outline">
                / 7 Days Under Target
              </span>
            </div>
            <div className="flex justify-between gap-1">
              <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
              <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
              <div className="h-1.5 flex-1 bg-outline-variant/30 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
              <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
              <div className="h-1.5 flex-1 bg-outline-variant/30 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
            </div>
          </section>
        </div>

        {/* Local Food Habits */}
        <section className="bg-surface-container-low p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline font-bold text-lg">Staple Frequency</h3>
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary-container/20 px-2 py-1 rounded">
              This Month
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-lg group hover:bg-primary-container transition-colors">
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary">
                  eco
                </span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Red Rice</p>
                <p className="text-[10px] text-outline group-hover:text-on-primary-container">
                  Sri Lankan Medium Grain
                </p>
              </div>
              <div className="text-right">
                <p className="font-headline font-bold text-lg">24</p>
                <p className="text-[10px] uppercase font-bold tracking-tighter opacity-60">
                  Logs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-lg group hover:bg-primary-container transition-colors">
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">
                  potted_plant
                </span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Dhal Curry</p>
                <p className="text-[10px] text-outline group-hover:text-on-primary-container">
                  Protein Rich Pulses
                </p>
              </div>
              <div className="text-right">
                <p className="font-headline font-bold text-lg">18</p>
                <p className="text-[10px] uppercase font-bold tracking-tighter opacity-60">
                  Logs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-lg group hover:bg-primary-container transition-colors">
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary-container">
                  nutrition
                </span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Pol Sambol</p>
                <p className="text-[10px] text-outline group-hover:text-on-primary-container">
                  Fresh Coconut Relish
                </p>
              </div>
              <div className="text-right">
                <p className="font-headline font-bold text-lg">12</p>
                <p className="text-[10px] uppercase font-bold tracking-tighter opacity-60">
                  Logs
                </p>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 py-3 text-xs font-bold text-primary uppercase tracking-widest border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
            View Full Breakdown
          </button>
        </section>
      </main>

      <AppBottomNav activeTab="progress" />
    </div>
  );
}