import React from "react";

interface ProTipCardProps {
  title: string;
  content: string | React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function ProTipCard({ title, content, icon, className = "" }: ProTipCardProps) {
  return (
    <div className={`bg-warning-bg rounded-2xl p-5 flex flex-col items-start ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-warning-text bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
          {icon || (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <div className="text-sm text-gray-800 leading-relaxed font-medium opacity-90 pl-11">
        {content}
      </div>
    </div>
  );
}
