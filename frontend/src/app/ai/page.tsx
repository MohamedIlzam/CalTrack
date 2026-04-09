"use client";

import React, { useState, useRef, useEffect } from "react";
import { AppBottomNav } from "@/components/ui/AppBottomNav";

type Message = {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: string;
  /** Optional rich card to render below the text */
  card?: "protein-insight" | null;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content:
      "How am I doing with my protein intake this week? I feel like I've been a bit low on energy.",
    timestamp: "10:24 AM",
  },
  {
    id: "2",
    role: "coach",
    content:
      "I've analyzed your logs for the last 7 days. You're actually hitting your caloric targets, but your protein distribution is uneven. Let's look at the breakdown.",
    timestamp: "10:25 AM",
    card: "protein-insight",
  },
];

const SUGGESTION_CHIPS = [
  "What foods push me over target?",
  "Dinner ideas (500 cal)",
  "Calories this week?",
  "High-protein Sri Lankan foods",
];

/* ─────────────── Protein Insight Card ─────────────── */
function ProteinInsightCard() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Vitality Metric Card */}
      <div className="w-full bg-[#2DD4BF]/20 rounded-[24px] p-6 relative overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#FFAD3A]/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-extrabold text-[#004E45] text-sm tracking-tight">
                Weekly Protein Average
              </h3>
              <p className="text-[12px] text-[#006B5F]/70 mt-0.5">
                Target: 145g/day
              </p>
            </div>
            {/* Chart icon */}
            <svg
              className="w-5 h-5 text-[#006B5F]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-extrabold text-[48px] text-[#004E45] tracking-tighter leading-none">
              112
            </span>
            <span className="font-bold text-xl text-[#00574D]">g</span>
          </div>

          <p className="text-[13px] font-medium text-[#005E53] leading-snug max-w-[220px]">
            You are 23% below your daily goal. This could explain the energy
            dip.
          </p>
        </div>
      </div>

      {/* Bento Data Insight Grid */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="bg-[#F3F3F3] p-4 rounded-[16px] space-y-2.5">
          <p className="text-[10px] font-bold text-[#555F6F] uppercase tracking-[1.2px]">
            Top Sources
          </p>
          <ul className="space-y-1.5">
            <li className="text-[13px] font-semibold text-[#1A1C1C] flex items-center justify-between">
              <span>Chicken Breast</span>
              <span className="text-[#006B5F]">42g</span>
            </li>
            <li className="text-[13px] font-semibold text-[#1A1C1C] flex items-center justify-between">
              <span>Dhal Curry</span>
              <span className="text-[#006B5F]">18g</span>
            </li>
          </ul>
        </div>
        <div className="bg-[#F3F3F3] p-4 rounded-[16px] space-y-2.5">
          <p className="text-[10px] font-bold text-[#555F6F] uppercase tracking-[1.2px]">
            Gap Analysis
          </p>
          <p className="text-[13px] font-semibold text-[#1A1C1C]">
            Most gaps occur during{" "}
            <span className="text-[#855300] font-bold">Breakfast</span>.
          </p>
        </div>
      </div>

      {/* Follow-up text bubble */}
      <div className="bg-white border border-[#BACAC5]/15 px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed text-[#1A1C1C]">
        Would you like some high-protein breakfast suggestions that fit within
        your remaining 500 calories for today?
      </div>
    </div>
  );
}

/* ─────────────── Main Page ─────────────── */
export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

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

    // Simulated coach reply after a short delay
    setTimeout(() => {
      const coachMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "coach",
        content:
          "That's a great question! Based on your current meal logs, I'd suggest adding a serving of Parippu (lentil dhal) or boiled chickpeas to your next meal for an easy protein boost.",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, coachMsg]);
    }, 1200);
  };

  const handleChipClick = (text: string) => {
    setInput(text);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F9F9F9] relative">
      {/* ── Fixed Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-gray-100/50 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="hover:opacity-70 active:scale-95 transition-all"
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
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2DD4BF] flex items-center justify-center">
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
            <h1 className="font-extrabold text-[#006B5F] text-lg tracking-tight">
              Chat Coach
            </h1>
          </div>
        </div>
        <button className="hover:opacity-70 active:scale-95 transition-all w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
          <svg
            className="w-4 h-4 text-[#006B5F]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </header>

      {/* ── Scrollable Chat Thread ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-[80px] pb-[220px] px-5 space-y-8"
      >
        {messages.map((msg) =>
          msg.role === "user" ? (
            /* ── User Bubble ── */
            <div
              key={msg.id}
              className="flex flex-col items-end space-y-1.5 ml-10 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="bg-[#006B5F] text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-sm text-[15px] leading-relaxed">
                {msg.content}
              </div>
              <span className="text-[10px] font-semibold text-[#555F6F] uppercase tracking-[1.5px] px-1">
                You • {msg.timestamp}
              </span>
            </div>
          ) : (
            /* ── Coach Bubble ── */
            <div
              key={msg.id}
              className="flex flex-col items-start space-y-3 mr-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {/* Coach avatar row */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#2DD4BF] flex items-center justify-center shadow-sm">
                  <svg
                    className="w-3.5 h-3.5 text-[#004E45]"
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
                <span className="text-[10px] font-semibold text-[#006B5F] uppercase tracking-[1.5px]">
                  Coach • {msg.timestamp}
                </span>
              </div>

              {/* Text bubble */}
              <div className="bg-white border border-[#BACAC5]/15 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm text-[15px] leading-relaxed text-[#1A1C1C]">
                {msg.content}
              </div>

              {/* Optional rich card */}
              {msg.card === "protein-insight" && <ProteinInsightCard />}
            </div>
          )
        )}
      </div>

      {/* ── Fixed Interactive Layer (Chips + Composer) ── */}
      <div className="fixed bottom-[80px] left-0 right-0 max-w-md mx-auto px-5 pb-4 pointer-events-none z-40">
        {/* Gradient fade for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F9F9F9] via-[#F9F9F9]/95 to-transparent pointer-events-none rounded-b-none" />

        <div className="relative z-10 space-y-3">
          {/* Prompt Chips — Horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pointer-events-auto">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="whitespace-nowrap bg-white border border-[#BACAC5]/30 text-[13px] font-semibold text-[#1A1C1C] px-4 py-2.5 rounded-full shadow-sm hover:bg-[#F3F3F3] active:scale-[0.97] transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Composer Input */}
          <div className="relative pointer-events-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="w-full bg-white border-none shadow-xl rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] text-[#1A1C1C] placeholder:text-[#555F6F]/50 font-medium text-[15px]"
              placeholder="Ask anything..."
              type="text"
            />
            <button
              onClick={sendMessage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#006B5F] text-white rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-md hover:bg-[#005E53]"
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

      {/* ── Bottom Nav ── */}
      <AppBottomNav activeTab="ai" />
    </div>
  );
}
