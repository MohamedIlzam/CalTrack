"use client";

import React from "react";
import Image from "next/image";
import { Button } from "../ui/Button";

interface Props {
  onNext: () => void;
}

export function Step0Welcome({ onNext }: Props) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-white w-full relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="fixed -bottom-24 -right-24 w-64 h-64 bg-[#2DD4BF]/10 blur-[32px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-1/2 -left-24 w-48 h-48 bg-[#FFAD3A]/10 blur-[32px] rounded-full pointer-events-none z-0" />

      {/* Top Visual Section: Asymmetric Hero Image */}
      <div className="relative w-full h-[45dvh] min-h-[350px] max-h-[440px] flex-shrink-0 z-10">
        <Image
          src="/images/new-hero.png"
          alt="Sri Lankan Cuisine"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient to blend nicely into the white content area */}
        <div 
          className="absolute inset-0 pointer-events-none flex"
          style={{ background: 'linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0) 100%)' }}
        />
      </div>

      {/* Content Canvas */}
      <div className="relative -mt-20 px-8 flex flex-col z-20 pb-8 flex-1">
        {/* Branding Accent */}
        <div className="flex items-center gap-2 mb-4 mt-2">
          <div className="w-12 h-1 bg-[#2DD4BF] rounded-full" />
          <span className="text-[#006B5F] text-[10px] font-bold tracking-[2px] uppercase">
            CalTrack
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-extrabold text-[#1A1C1C] leading-[1.1] tracking-[-0.9px] mb-3">
          The easiest calorie tracker for Sri Lankan food.
        </h1>

        {/* Subheadline */}
        <p className="text-[1.125rem] text-[#3C4A46] leading-relaxed mb-6 w-[95%]">
          Personalized insights for Kottu, Hoppers, and your daily Rice & Curry.
        </p>

        {/* Bento-lite Feature Highlights */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#F3F3F3] rounded-[24px] p-5 flex flex-col gap-3 h-[100px] justify-center relative shadow-sm overflow-hidden border border-white/50">
            <svg className="w-[20px] h-[20px] text-[#006B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[#1A1C1C] text-[13px] font-semibold leading-tight">Local Cuisine Databases</span>
          </div>

          <div className="bg-[#FFDDB8]/30 rounded-[24px] p-5 flex flex-col gap-3 h-[100px] justify-center relative shadow-sm overflow-hidden border border-white/50">
            <svg className="w-[17px] h-[17px] text-[#855300]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-[#1A1C1C] text-[13px] font-semibold leading-tight">Health Trends</span>
          </div>
        </div>

        <div className="flex-1" /> {/* Spacer */}

        {/* CTA Section */}
        <div className="flex flex-col items-center mt-auto pt-2">
          <Button fullWidth size="large" onClick={onNext} className="mb-4 !rounded-[24px]">
            Get Started
          </Button>
          <div className="flex items-center justify-center gap-1 text-[12px] font-bold w-full uppercase leading-[16px]">
            <span className="text-[#94A3B8] tracking-[0.3px]">ALREADY A MEMBER?</span>
            <button className="text-[#006B5F] tracking-[0.3px] hover:underline">SIGN IN</button>
          </div>
        </div>
      </div>
    </div>
  );
}
