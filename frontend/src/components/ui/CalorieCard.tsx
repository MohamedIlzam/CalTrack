import React from "react";

type CalorieCardProps = {
  remaining: number;
  consumed: number;
  burned: number;
  progress?: number;
};

export function CalorieCard({
  remaining,
  consumed,
  burned,
  progress = 0.68,
}: CalorieCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#35D6C1] px-4 pt-4 pb-5 shadow-sm min-h-[190px]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#FFAD3A]/20 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-[#006B5F]/10 blur-2xl" />

      <p className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-[#006B5F]">
        Remaining
      </p>

      <div className="relative mt-2 h-[120px] w-full">
        {/* SVG Arc - Centered & Refined */}
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <svg
            viewBox="0 0 150 90"
            className="w-[200px] drop-shadow-sm overflow-visible"
            fill="none"
          >
            {/* Background track - Lighter & Thinner */}
            <path
              d="M 15,80 A 60,60 0 0 1 135,80"
              stroke="rgba(0,107,95,0.08)"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength="100"
            />
            {/* Progress track - Thinner */}
            <path
              d="M 15,80 A 60,60 0 0 1 135,80"
              stroke="#005E53"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 - progress * 100}
            />
          </svg>
        </div>

        {/* Calorie Text Stack - Positioned inside the arc */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-8">
          <div className="font-extrabold leading-none tracking-[-2px] text-[42px] text-[#004E45]">
            {remaining.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[2px] text-[#006B5F]/60">
            kcal left
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#006B5F]/10 pt-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#006B5F]/70">
            Consumed
          </p>
          <p className="mt-1 text-[20px] font-extrabold leading-none text-[#00574D]">
            {consumed}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#006B5F]/70">
            Burned
          </p>
          <p className="mt-1 text-[20px] font-extrabold leading-none text-[#00574D]">
            {burned}
          </p>
        </div>
      </div>
    </div>
  );
}
