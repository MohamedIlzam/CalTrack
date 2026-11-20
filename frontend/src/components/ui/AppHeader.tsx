"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function AppHeader() {
  const router = useRouter();
  const logout = useAppStore((s) => s.logout);
  const name = useAppStore((s) => s.name);

  const [todayStr, setTodayStr] = useState<string>("");

  useEffect(() => {
    setTodayStr(formatDate(new Date()));
  }, []);

  const displayName = name && name.trim() ? name.trim() : "User";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    logout();
    router.replace("/");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 max-w-md mx-auto w-full px-6 bg-white/85 backdrop-blur-xl flex justify-between items-center border-b border-gray-100/60 transition-all"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
        paddingBottom: "14px",
      }}
    >
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          title="View Profile & Settings"
          className="w-8 h-8 rounded-full border border-[#006B5F]/20 overflow-hidden bg-[#006B5F]/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-[10px] text-[#006B5F] font-black"
        >
          {displayName.slice(0, 2).toUpperCase()}
        </Link>

        <div>
          <h1 className="text-[18px] font-extrabold text-[#006B5F] tracking-tight leading-none mb-[2px]">
            CalTrack
          </h1>
          <p className="text-[10px] font-medium text-[#3C4A46]/70 uppercase tracking-widest leading-none">
            {todayStr}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleLogout}
          title="Log Out"
          className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Log Out</span>
        </button>
      </div>
    </header>
  );
}
