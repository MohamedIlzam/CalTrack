import Link from "next/link";

interface AppBottomNavProps {
  activeTab?: "today" | "search" | "ai" | "progress";
}

export function AppBottomNav({ activeTab = "today" }: AppBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] z-50 flex justify-between items-center px-4 pb-safe">
      
      {/* Today */}
      <Link href="/home" className={`flex flex-col items-center justify-center w-[60px] h-[52px] ${activeTab === 'today' ? 'bg-[#F0FDFA] rounded-2xl text-[#0F766E]' : 'text-gray-400'}`}>
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={`text-[10px] uppercase tracking-wide ${activeTab === 'today' ? 'font-bold' : 'font-medium'}`}>Today</span>
      </Link>

      {/* Search */}
      <Link href="/search" className={`flex flex-col items-center justify-center w-[60px] h-[52px] ${activeTab === 'search' ? 'bg-[#F0FDFA] rounded-2xl text-[#0F766E]' : 'text-gray-400'}`}>
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className={`text-[10px] uppercase tracking-wide ${activeTab === 'search' ? 'font-bold' : 'font-medium'}`}>Search</span>
      </Link>

      {/* floating Action Button Placeholder (Add) */}
      <div className="relative w-[60px] flex justify-center">
        <button className="absolute -top-[34px] w-[56px] h-[56px] rounded-full bg-[#001E1B] text-white flex items-center justify-center shadow-lg border-[4px] border-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* AI */}
      <Link href="/ai" className={`flex flex-col items-center justify-center w-[60px] h-[52px] ${activeTab === 'ai' ? 'bg-[#F0FDFA] rounded-2xl text-[#0F766E]' : 'text-gray-400'}`}>
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v8l9-11h-7z" />
        </svg>
        <span className={`text-[10px] uppercase tracking-wide ${activeTab === 'ai' ? 'font-bold' : 'font-medium'}`}>AI</span>
      </Link>

      {/* Progress */}
      <Link href="/progress" className={`flex flex-col items-center justify-center w-[60px] h-[52px] ${activeTab === 'progress' ? 'bg-[#F0FDFA] rounded-2xl text-[#0F766E]' : 'text-gray-400'}`}>
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <span className={`text-[10px] uppercase tracking-wide ${activeTab === 'progress' ? 'font-bold' : 'font-medium'}`}>Progress</span>
      </Link>

    </div>
  );
}
