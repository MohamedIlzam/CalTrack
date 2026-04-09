import React from "react";
import { Button } from "./Button";

interface BottomNavFooterProps {
  onBack?: () => void;
  onNext?: () => void;
  continueLabel?: string;
  showBack?: boolean;
}

export function BottomNavFooter({
  onBack,
  onNext,
  continueLabel = "CONTINUE",
  showBack = true,
}: BottomNavFooterProps) {
  return (
    <div className="w-full px-6 py-4 pb-6 bg-surface flex items-center justify-between">
      {showBack ? (
        <button
          onClick={onBack}
          className="flex flex-col items-center justify-center text-muted hover:text-foreground transition-colors outline-none"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[11px] font-semibold tracking-wide">BACK</span>
        </button>
      ) : (
        <div className="w-12" />
      )}

      <Button
        variant="secondary"
        onClick={onNext}
        rightIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        }
        className="uppercase tracking-wide text-sm px-7 py-2.5"
      >
        {continueLabel}
      </Button>
    </div>
  );
}
