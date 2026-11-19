"use client";

import React from "react";

export interface FormattedTextProps {
  text: string;
  className?: string;
  boldClassName?: string;
  bulletColor?: string;
}

/**
 * Safely parses inline markdown (bold **text**) into React elements.
 * Treats all content as React text nodes, completely eliminating XSS / dangerouslySetInnerHTML risks.
 */
export function renderSafeInline(
  str: string,
  boldClassName: string = "font-bold text-[#006B5F]"
): React.ReactNode[] {
  if (!str) return [];

  // Split on bold markdown syntax: **content**
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={i} className={boldClassName}>
          {boldText}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

/**
 * React-safe formatted text renderer supporting:
 * - Paragraphs and line breaks
 * - Bulleted lists (*, -, •)
 * - Numbered lists (1., 2., etc.)
 * - Bold markdown (**text**)
 * - Absolute safety against HTML/script injection (no dangerouslySetInnerHTML)
 */
export function FormattedText({
  text,
  className = "space-y-2 text-[14.5px] leading-relaxed text-[#1A1C1C]",
  boldClassName = "font-bold text-[#006B5F]",
  bulletColor = "bg-[#006B5F]",
}: FormattedTextProps) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className={className}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Bullet point (*, -, •)
        if (
          trimmed.startsWith("* ") ||
          trimmed.startsWith("- ") ||
          trimmed.startsWith("• ")
        ) {
          const bulletContent = trimmed.replace(/^(\*|-|•)\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${bulletColor} mt-2 flex-shrink-0`}
              />
              <span className="flex-1">
                {renderSafeInline(bulletContent, boldClassName)}
              </span>
            </div>
          );
        }

        // Numbered list (1. item, 2. item)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const listContent = numMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-5 h-5 rounded-full bg-[#2DD4BF]/20 text-[#006B5F] text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {num}
              </span>
              <span className="flex-1">
                {renderSafeInline(listContent, boldClassName)}
              </span>
            </div>
          );
        }

        // Regular paragraph / line
        return (
          <p key={idx}>
            {renderSafeInline(trimmed, boldClassName)}
          </p>
        );
      })}
    </div>
  );
}

export default FormattedText;
