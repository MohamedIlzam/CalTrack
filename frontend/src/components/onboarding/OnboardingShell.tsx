import React from "react";
import { Stepper } from "../ui/Stepper";

interface OnboardingShellProps {
  /** Back button label shown in the header */
  headerTitle: string;
  /** Current step number */
  step: number;
  /** Total number of steps */
  totalSteps?: number;
  /** Whether to show the stepper */
  showStepper?: boolean;
  /** Called when back arrow is tapped */
  onBack?: () => void;
  /** Main scrollable content */
  children: React.ReactNode;
  /** Fixed footer content (Back/Continue buttons) */
  footer?: React.ReactNode;
}

export function OnboardingShell({
  headerTitle,
  step,
  totalSteps = 5,
  showStepper = true,
  onBack,
  children,
  footer,
}: OnboardingShellProps) {
  return (
    <div className="flex flex-col h-[100dvh] bg-surface">
      {/* ── Fixed Top: Header + Stepper ── */}
      <div className="flex-shrink-0">
        {/* Header Bar — always in the same spot */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-2">
          {onBack ? (
            <button
              onClick={onBack}
              className="text-primary flex items-center gap-1.5 font-semibold text-[15px]"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {headerTitle}
            </button>
          ) : (
            <span className="text-primary font-semibold text-[15px]">{headerTitle}</span>
          )}
        </div>

        {/* Stepper */}
        {showStepper && <Stepper currentStep={step} totalSteps={totalSteps} />}
      </div>

      {/* ── Flexible Middle: Content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6">
        {children}
      </div>

      {/* ── Fixed Bottom: Footer ── */}
      {footer && (
        <div className="flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
