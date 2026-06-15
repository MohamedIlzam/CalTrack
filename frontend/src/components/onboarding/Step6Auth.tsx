"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { useOnboardingDraft } from "./OnboardingFlow";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";

interface Props {
  onBack: () => void;
  initialMode?: "register" | "login";
}

export function Step6Auth({ onBack, initialMode = "register" }: Props) {
  const router = useRouter();
  const { draft } = useOnboardingDraft();
  const setAuth = useAppStore((s) => s.setAuth);

  const [mode, setMode] = useState<"register" | "login">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === "register" ? "register" : "login";
      const body = mode === "register" 
        ? {
            email,
            password,
            name,
            ...draft,
          }
        : {
            email,
            password,
          };

      const response = await fetch(`http://localhost:3001/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${mode}`);
      }

      // Save credentials & onboarding data in Zustand, redirect home
      setAuth(data.accessToken, data.user);
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F9FAFB] w-full relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 pb-3 sm:pb-4 flex-shrink-0">
        <button onClick={onBack} className="p-1 -ml-1 text-[#1A1C1C]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[#94A3B8] text-[11px] font-bold tracking-[1.5px] uppercase">
          Step 6 of 6
        </span>
      </div>

      {/* Main Content */}
      <div className="px-5 flex flex-col flex-1 pb-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-[#1A1C1C] tracking-tight mb-2">
            {mode === "register" ? "Save Your Calorie Plan" : "Log In to Your Plan"}
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            {mode === "register"
              ? "Create an account to save your customized daily target and start tracking your meals."
              : "Log in with your credentials to sync and track your progress."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-xl p-3 mb-4 leading-normal flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 pl-1">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#2DD4BF] focus:outline-none text-sm transition-colors shadow-sm"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 pl-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#2DD4BF] focus:outline-none text-sm transition-colors shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 pl-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#2DD4BF] focus:outline-none text-sm transition-colors shadow-sm"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            size="large"
            disabled={loading}
            className="mt-6 !rounded-[24px]"
          >
            {loading ? "Please wait..." : mode === "register" ? "Create Account & Start" : "Log In"}
          </Button>
        </form>

        {/* Toggler */}
        <div className="mt-8 text-center flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "register" ? "login" : "register");
              setError(null);
            }}
            className="text-xs font-semibold text-[#006B5F] hover:underline"
          >
            {mode === "register"
              ? "Already have an account? Log In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
