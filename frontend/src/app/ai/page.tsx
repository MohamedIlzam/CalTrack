"use client";

import React, { useState, useRef, useEffect } from "react";
import { AppBottomNav } from "@/components/ui/AppBottomNav";
import { sendCoachChat } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export type Message = {
  id: string;
  role: "user" | "coach" | "error";
  content: string;
  timestamp: string;
  card?: "daily-summary" | null;
  errorDetails?: {
    errorMessage: string;
    lastPrompt: string;
  };
};

const SUGGESTION_CHIPS = [
  "Dinner ideas under 500 kcal",
  "High-protein Sri Lankan foods",
  "How are my macros today?",
  "Healthy evening snacks",
  "Post-workout meal advice",
];

/* ─────────────── React-Safe Formatted Message Bubble ─────────────── */
/**
 * Safely parses inline markdown (bold **text**) into React elements.
 * Treats all content as React text nodes, completely eliminating XSS / dangerouslySetInnerHTML risks.
 */
export function renderSafeInline(str: string): React.ReactNode[] {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={i} className="font-bold text-[#006B5F]">
          {boldText}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-[14.5px] leading-relaxed text-[#1A1C1C]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Bullet point
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          const bulletContent = trimmed.replace(/^(\*|-|•)\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006B5F] mt-2 flex-shrink-0" />
              <span className="flex-1">{renderSafeInline(bulletContent)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const listContent = numMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-5 h-5 rounded-full bg-[#2DD4BF]/20 text-[#006B5F] text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {num}
              </span>
              <span className="flex-1">{renderSafeInline(listContent)}</span>
            </div>
          );
        }

        return (
          <p key={idx}>
            {renderSafeInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/* ─────────────── Live Daily Snapshot Card ─────────────── */
function DailySnapshotCard() {
  const targetKcal = useAppStore((s) => s.targetCalories) || 2000;
  const targetProtein = useAppStore((s) => s.targetProteinG) || 120;
  const targetCarbs = useAppStore((s) => s.targetCarbsG) || 220;
  const targetFat = useAppStore((s) => s.targetFatG) || 60;
  const entries = useAppStore((s) => s.entries);

  const consumedKcal = entries.reduce((sum, e) => sum + e.kcal, 0);
  const consumedProtein = entries.reduce((sum, e) => sum + e.protein, 0);
  const consumedCarbs = entries.reduce((sum, e) => sum + e.carbs, 0);
  const consumedFat = entries.reduce((sum, e) => sum + e.fat, 0);
  const remainingKcal = Math.max(0, targetKcal - consumedKcal);

  return (
    <div className="w-full bg-gradient-to-br from-[#006B5F] to-[#004E45] text-white rounded-[22px] p-5 shadow-lg relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#2DD4BF]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-center border-b border-white/15 pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-white/70">
              Live Macro Snapshot
            </p>
            <p className="text-[18px] font-extrabold tracking-tight mt-0.5">
              {remainingKcal} <span className="text-[12px] font-normal text-white/80">kcal remaining</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[12px] font-semibold bg-white/15 px-2.5 py-1 rounded-full text-white/90">
              {consumedKcal} / {targetKcal} kcal
            </span>
          </div>
        </div>

        {/* Macro Bars */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Protein", val: consumedProtein, target: targetProtein, color: "#2DD4BF", bg: "bg-[#2DD4BF]" },
            { label: "Carbs", val: consumedCarbs, target: targetCarbs, color: "#FFAD3A", bg: "bg-[#FFAD3A]" },
            { label: "Fat", val: consumedFat, target: targetFat, color: "#94A3B8", bg: "bg-[#94A3B8]" },
          ].map(({ label, val, target, bg }) => {
            const pct = Math.min(100, Math.round((val / (target || 1)) * 100));
            return (
              <div key={label} className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-white/80">{label}</span>
                  <span>{val}g</span>
                </div>
                <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <div className={`h-full ${bg} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Main Chat Page ─────────────── */
export default function AIChatPage() {
  const userName = useAppStore((s) => s.name);
  const targetKcal = useAppStore((s) => s.targetCalories) || 2000;
  const entries = useAppStore((s) => s.entries);
  const consumedKcal = entries.reduce((sum, e) => sum + e.kcal, 0);

  const initialWelcome = React.useMemo<Message>(() => ({
    id: "welcome",
    role: "coach",
    content: `Hello ${userName ? userName : "there"}! 👋 I'm your CalTrack AI Nutrition Coach.\n\nToday you've logged **${consumedKcal} / ${targetKcal} kcal**. Ask me anything about your meals, recipe ideas, macros, or energy balance!`,
    timestamp: "Live",
    card: "daily-summary",
  }), [userName, consumedKcal, targetKcal]);

  const [messages, setMessages] = useState<Message[]>([initialWelcome]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isThinking) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const res = await sendCoachChat(text);
      const coachMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "coach",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      console.error("Coach chat error:", err);
      const errMsg = err?.message || "Unable to reach CalTrack AI. Please check your connection or try again.";
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "error",
        content: errMsg,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        errorDetails: {
          errorMessage: errMsg,
          lastPrompt: text,
        },
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    setMessages([initialWelcome]);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F9F9F9] relative">
      {/* ── Fixed Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-gray-100/60 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="hover:opacity-70 active:scale-95 transition-all p-1"
            title="Go Back"
          >
            <svg
              className="w-5 h-5 text-[#006B5F]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2DD4BF] flex items-center justify-center shadow-sm">
              <svg
                className="w-4 h-4 text-[#004E45]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v8l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-[#006B5F] text-[17px] tracking-tight leading-none">
                AI Coach
              </h1>
              <p className="text-[10px] font-semibold text-[#006B5F] mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CalTrack AI
              </p>
            </div>
          </div>
        </div>

        {/* Clear Chat Button */}
        <button
          onClick={handleClearChat}
          title="Reset Conversation"
          className="hover:bg-red-50 text-gray-400 hover:text-red-500 active:scale-95 transition-all w-8 h-8 flex items-center justify-center rounded-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </header>

      {/* ── Scrollable Chat Thread ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-[86px] pb-[220px] px-5 space-y-6 max-w-md mx-auto w-full"
      >
        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <div
                key={msg.id}
                className="flex flex-col items-end space-y-1.5 ml-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="bg-[#006B5F] text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-sm text-[15px] leading-relaxed">
                  {msg.content}
                </div>
                <span className="text-[10px] font-semibold text-[#555F6F]/70 uppercase tracking-[1.4px] px-1">
                  You • {msg.timestamp}
                </span>
              </div>
            );
          }

          if (msg.role === "error") {
            return (
              <div
                key={msg.id}
                className="flex flex-col items-start space-y-2 mr-4 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shadow-xs">
                    <svg
                      className="w-3.5 h-3.5 text-rose-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[1.4px]">
                    AI Service Alert • {msg.timestamp}
                  </span>
                </div>

                <div className="bg-rose-50/90 border border-rose-200/80 p-4 rounded-2xl rounded-tl-sm shadow-sm w-full space-y-3">
                  <p className="text-[13.5px] text-rose-800 leading-relaxed font-medium">
                    {msg.content}
                  </p>
                  {msg.errorDetails?.lastPrompt && (
                    <button
                      onClick={() => handleSendMessage(msg.errorDetails!.lastPrompt)}
                      disabled={isThinking}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[12px] font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retry Request
                    </button>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className="flex flex-col items-start space-y-3 mr-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#2DD4BF] flex items-center justify-center shadow-xs">
                  <svg
                    className="w-3 h-3 text-[#004E45]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 10V3L4 14h7v8l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-[#006B5F] uppercase tracking-[1.4px]">
                  Coach • {msg.timestamp}
                </span>
              </div>

              {/* Text Card Bubble */}
              <div className="bg-white border border-[#BACAC5]/20 p-5 rounded-2xl rounded-tl-sm shadow-sm w-full">
                <FormattedText text={msg.content} />
              </div>

              {/* Optional Rich Snapshot Card */}
              {msg.card === "daily-summary" && <DailySnapshotCard />}
            </div>
          );
        })}

        {/* Coach Thinking Animation */}
        {isThinking && (
          <div className="flex flex-col items-start space-y-2 mr-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#2DD4BF] flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-[#004E45]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v8l9-11h-7z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-[#006B5F] uppercase tracking-[1.4px]">
                Coach is analyzing…
              </span>
            </div>

            <div className="bg-white border border-[#BACAC5]/20 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#006B5F]"
                  style={{
                    animation: `coachBounce 1s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes coachBounce {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      {/* ── Fixed Interactive Composer & 1-Tap Chips ── */}
      <div className="fixed bottom-[80px] left-0 right-0 max-w-md mx-auto px-5 pb-4 pointer-events-none z-40">
        <div className="absolute inset-0 bg-gradient-to-t from-[#F9F9F9] via-[#F9F9F9]/95 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Prompt Chips — 1-Tap Instant Send */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pointer-events-auto">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                disabled={isThinking}
                className="whitespace-nowrap bg-white border border-[#BACAC5]/30 text-[13px] font-semibold text-[#1A1C1C] px-4 py-2.5 rounded-full shadow-sm hover:bg-[#EEF3F2] active:scale-95 transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Text Input Composer */}
          <div className="relative pointer-events-auto shadow-xl rounded-2xl overflow-hidden border border-[#BACAC5]/30 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="w-full bg-white border-none px-5 py-4 pr-16 focus:outline-none text-[#1A1C1C] placeholder:text-[#555F6F]/50 font-medium text-[15px]"
              placeholder="Ask your coach anything…"
              type="text"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isThinking}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#006B5F] disabled:bg-[#E8EDED] text-white disabled:text-[#BACAC5] rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <AppBottomNav activeTab="ai" />
    </div>
  );
}
