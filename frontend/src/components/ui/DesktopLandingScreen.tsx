"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export const STAGING_URL = "https://caltrack-staging-web.vercel.app/";

export function DesktopLandingScreen() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(STAGING_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write fallback
    }
  };

  return (
    <div
      data-testid="desktop-qr-landing"
      className="hidden lg:flex fixed inset-0 z-50 w-full h-full min-h-screen bg-[#F5F7F6] overflow-y-auto flex-col justify-between"
      style={{
        backgroundImage:
          "radial-gradient(at 0% 0%, rgba(0, 107, 95, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(45, 212, 191, 0.08) 0px, transparent 50%)",
      }}
    >
      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto px-8 py-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006B5F] to-[#0D6956] flex items-center justify-center text-white shadow-md shadow-[#006B5F]/20">
            {/* CalTrack stylized nutrition flame/leaf icon */}
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <span className="text-xl font-extrabold text-[#1A1C1C] tracking-tight block leading-none">
              CalTrack
            </span>
            <span className="text-[10px] font-semibold text-[#006B5F] tracking-wider uppercase">
              Mobile Edition
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#006B5F]/10 text-[#006B5F] border border-[#006B5F]/20">
            <span className="w-2 h-2 rounded-full bg-[#006B5F] animate-pulse" />
            Designed for Phone
          </span>
        </div>
      </header>

      {/* Main Hero Card Container */}
      <main className="w-full max-w-4xl mx-auto px-6 py-4 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-[32px] p-8 sm:p-10 shadow-xl shadow-[#006B5F]/8 border border-[#BACAC5]/30 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#006B5F]/10 text-[#006B5F] text-[11px] font-bold tracking-wide uppercase mb-5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span>Mobile-First Experience</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1C1C] tracking-tight leading-tight mb-3">
            CalTrack is designed for mobile.
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-[#3C4A46] font-normal leading-relaxed mb-6 max-w-md">
            For the best experience, open CalTrack on your phone.
          </p>

          {/* QR Code Container */}
          <div className="p-5 bg-[#FAFBFB] rounded-2xl border border-gray-200/80 shadow-sm flex flex-col items-center mb-5">
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <QRCodeSVG
                value={STAGING_URL}
                size={220}
                level="M"
                includeMargin={false}
                fgColor="#1A1C1C"
                bgColor="#FFFFFF"
              />
            </div>
          </div>

          {/* Instruction */}
          <p className="text-[13.5px] font-medium text-[#1A1C1C] flex items-center justify-center gap-2 mb-5">
            <svg
              className="w-4 h-4 text-[#006B5F] flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Scan this QR code with your phone&apos;s camera to get started.</span>
          </p>

          {/* Clickable URL Alternative */}
          <div className="w-full pt-4 border-t border-gray-100 flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              Or open directly in your browser
            </span>
            <div className="flex items-center gap-2 max-w-full">
              <a
                href={STAGING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-bold text-[#006B5F] hover:text-[#0D6956] hover:underline transition-colors flex items-center gap-1.5 break-all text-center"
              >
                <span>{STAGING_URL}</span>
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              <button
                type="button"
                onClick={handleCopy}
                title="Copy link to clipboard"
                aria-label="Copy URL link"
                className="px-2.5 py-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1 active:scale-95 flex-shrink-0 cursor-pointer"
              >
                {copied ? (
                  <span className="text-[#006B5F] font-bold">Copied!</span>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 flex items-center justify-center gap-6 sm:gap-10 text-xs text-[#3C4A46] font-medium flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[#006B5F]">✦</span>
            <span>Local Sri Lankan Food Database</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#006B5F]">✦</span>
            <span>Gemini AI Ingredient Estimator</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#006B5F]">✦</span>
            <span>Daily Nutrition & Macro Tracking</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-8 py-5 text-center text-xs text-gray-400 flex-shrink-0">
        CalTrack V1 · Designed exclusively for iOS & Android mobile browsers.
      </footer>
    </div>
  );
}
