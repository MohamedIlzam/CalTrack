import { AppBottomNav } from "@/components/ui/AppBottomNav";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-[100px] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 bg-white/80 backdrop-blur-xl flex justify-between items-center border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#006B5F]/10 overflow-hidden bg-gray-200">
            {/* Avatar Placeholder */}
            <div className="w-full h-full bg-[#006B5F]/20 flex items-center justify-center text-[10px] text-[#006B5F] font-bold">
              CH
            </div>
          </div>
          <div>
            <h1 className="text-[18px] font-extrabold text-[#006B5F] tracking-tight leading-none mb-[2px]">
              CalTrack
            </h1>
            <p className="text-[10px] font-medium text-[#3C4A46]/70 uppercase tracking-widest leading-none">
              Friday, 24 May
            </p>
          </div>
        </div>
        <button className="text-gray-500 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </header>

      <main className="px-6 pt-5 flex flex-col gap-6">
        {/* Greeting Section */}
        <div>
          <h2 className="text-2xl font-extrabold text-[#1A1C1C] tracking-[-0.6px]">
            Good morning, Chamari
          </h2>
          <p className="text-[16px] font-medium text-[#3C4A46] opacity-80 mt-1">
            Ready for a mindful day of wellness?
          </p>
        </div>

        {/* Bento Vitality Metric Card */}
        <div className="relative w-full h-[260px] flex items-stretch">
          {/* Main Teal Card */}
          <div className="relative w-[56%] bg-[#2DD4BF] rounded-[32px] overflow-hidden p-5 flex flex-col shadow-sm z-10 border border-white/20">
            {/* Decorative Blobs */}
            <div className="absolute top-[-48px] right-[-48px] w-[192px] h-[192px] bg-[#FFAD3A] opacity-20 blur-[30px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-32px] left-[-32px] w-[128px] h-[128px] bg-[#006B5F] opacity-10 blur-[20px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-[12px] font-extrabold text-[#00574D] uppercase tracking-[1.4px]">
                  Remaining
                </p>
                
                {/* Half Circle Gauge & Calories */}
                <div className="relative flex flex-col items-center mt-3 max-w-[120px] mx-auto">
                  <svg viewBox="0 0 100 50" className="w-[105px] drop-shadow-sm overflow-visible">
                    {/* Background track */}
                    <path d="M 5,45 A 40,40 0 1,1 95,45" fill="none" stroke="rgba(0, 87, 77, 0.15)" strokeWidth="10" strokeLinecap="round" />
                    {/* Progress track */}
                    <path d="M 5,45 A 40,40 0 1,1 95,45" fill="none" stroke="#00574D" strokeWidth="10" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset="40" />
                  </svg>
                  
                  <div className="absolute bottom-[2px] flex flex-col items-center justify-center">
                    <span className="text-[34px] font-extrabold text-[#00574D] tracking-[-1px] leading-none">1,250</span>
                    <span className="text-[12px] font-bold text-[#00574D]/70 mt-1 uppercase tracking-widest">kcal</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#00574D]/10 pt-3 mt-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-semibold text-[#00574D]/70 uppercase">Consumed</span>
                  <span className="text-[15px] font-bold text-[#00574D]">600</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-[#00574D]/70 uppercase">Burned</span>
                  <span className="text-[15px] font-bold text-[#00574D]">200</span>
                </div>
              </div>
            </div>
          </div>

          {/* Macro Mini Cards Container */}
          <div className="absolute right-0 top-0 bottom-0 w-[50%] flex flex-col justify-between py-1 z-0 gap-[10px] pl-2">
            {/* Carbs */}
            <div className="bg-white rounded-[20px] p-3 shadow-sm border border-[#BACAC5]/10 flex-1 ml-auto w-full max-w-[145px] pl-[34px] flex flex-col justify-center gap-1.5">
              <p className="text-[10px] font-bold text-[#3C4A46] uppercase tracking-wider">Carbs</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[18px] font-extrabold text-[#1A1C1C] leading-none">112</span>
                <span className="text-[11px] font-medium text-[#3C4A46] leading-none">/ 250g</span>
              </div>
              <div className="w-full h-[6px] bg-[#F3F3F3] rounded-full overflow-hidden">
                <div className="h-full bg-[#FFAD3A] w-[55%] rounded-full"></div>
              </div>
            </div>

            {/* Protein */}
            <div className="bg-white rounded-[20px] p-3 shadow-sm border border-[#BACAC5]/10 flex-1 ml-auto w-full max-w-[145px] pl-[34px] flex flex-col justify-center gap-1.5">
              <p className="text-[10px] font-bold text-[#3C4A46] uppercase tracking-wider">Protein</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[18px] font-extrabold text-[#1A1C1C] leading-none">45</span>
                <span className="text-[11px] font-medium text-[#3C4A46] leading-none">/ 120g</span>
              </div>
              <div className="w-full h-[6px] bg-[#F3F3F3] rounded-full overflow-hidden">
                <div className="h-full bg-[#643E00] w-[37%] rounded-full"></div>
              </div>
            </div>

            {/* Fat */}
            <div className="bg-white rounded-[20px] p-3 shadow-sm border border-[#BACAC5]/10 flex-1 ml-auto w-full max-w-[145px] pl-[34px] flex flex-col justify-center gap-1.5">
              <p className="text-[10px] font-bold text-[#3C4A46] uppercase tracking-wider">Fat</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[18px] font-extrabold text-[#1A1C1C] leading-none">18</span>
                <span className="text-[11px] font-medium text-[#3C4A46] leading-none">/ 65g</span>
              </div>
              <div className="w-full h-[6px] bg-[#F3F3F3] rounded-full overflow-hidden">
                <div className="h-full bg-[#005047] w-[27%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Scroll */}
        <div>
          <h3 className="text-[18px] font-bold text-[#1A1C1C] mb-3">Quick Actions</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E8E8E8]/40 rounded-[12px] whitespace-nowrap">
              <svg className="w-[18px] h-[18px] text-[#006B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[14px] font-semibold text-[#1A1C1C]">Recent Foods</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E8E8E8]/40 rounded-[12px] whitespace-nowrap">
              <svg className="w-[18px] h-[18px] text-[#006B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-[14px] font-semibold text-[#1A1C1C]">Saved Meals</span>
            </button>
          </div>
        </div>

        {/* Breakfast Section (Logged) */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-[20px] font-extrabold text-[#1A1C1C] tracking-[-0.5px]">Breakfast</h3>
            <span className="text-[12px] font-bold text-[#006B5F] uppercase tracking-[1.2px] mb-0.5">340 KCAL</span>
          </div>
          <div className="bg-white rounded-[16px] shadow-sm p-4 flex flex-col gap-4 border border-[#EEEEEE]/50">
            {/* Item 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F3F3F3] rounded-xl overflow-hidden flex items-center justify-center text-xl">
                  🥞
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1A1C1C]">Egg Hopper (2 pcs)</p>
                  <p className="text-[12px] font-medium text-[#3C4A46]">with Pol Sambol</p>
                </div>
              </div>
              <span className="text-[14px] font-bold text-[#3C4A46]">280</span>
            </div>

            {/* Item 2 */}
            <div className="flex items-center justify-between pt-4 border-t border-[#EEEEEE]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F3F3F3] rounded-xl overflow-hidden flex items-center justify-center text-xl">
                  ☕
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1A1C1C]">Ceylon Black Tea</p>
                  <p className="text-[12px] font-medium text-[#3C4A46]">with 1 tsp Sugar</p>
                </div>
              </div>
              <span className="text-[14px] font-bold text-[#3C4A46]">60</span>
            </div>

            {/* Add Food CTA */}
            <button className="w-full py-2.5 bg-[#F3F3F3] text-[#006B5F] rounded-xl flex items-center justify-center gap-2 mt-2 transition-colors hover:bg-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[12px] font-bold tracking-[1.2px] uppercase">Add Food</span>
            </button>
          </div>
        </div>

        {/* Lunch Section (Empty) */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-[20px] font-extrabold text-[#1A1C1C] tracking-[-0.5px]">Lunch</h3>
            <span className="text-[12px] font-bold text-[#3C4A46]/40 uppercase tracking-[1.2px] mb-0.5">EMPTY</span>
          </div>
          <div className="bg-[#F3F3F3] border-2 border-dashed border-[#BACAC5]/30 rounded-[16px] p-6 flex flex-col items-center justify-center gap-3">
            <svg className="w-8 h-8 text-[#3C4A46]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[14px] font-medium text-[#3C4A46] text-center">
              What did you have for lunch?
            </p>
            <button className="px-6 py-2.5 bg-[#006B5F] text-white rounded-full text-[12px] font-bold uppercase tracking-[1.2px] mt-1 shadow-[0_10px_15px_-3px_rgba(0,107,95,0.2)]">
              Log Lunch
            </button>
          </div>
        </div>

        {/* Dinner Section (Empty) */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-[20px] font-extrabold text-[#1A1C1C] tracking-[-0.5px]">Dinner</h3>
            <span className="text-[12px] font-bold text-[#3C4A46]/40 uppercase tracking-[1.2px] mb-0.5">EMPTY</span>
          </div>
          <div className="bg-[#F3F3F3] border-2 border-dashed border-[#BACAC5]/30 rounded-[16px] p-6 flex flex-col items-center justify-center gap-3">
            <svg className="w-8 h-8 text-[#3C4A46]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <p className="text-[14px] font-medium text-[#3C4A46] text-center">
              Plan your dinner in advance
            </p>
            <button className="px-6 py-2.5 border border-[#006B5F]/20 text-[#006B5F] rounded-full text-[12px] font-bold uppercase tracking-[1.2px] mt-1">
              Quick Add
            </button>
          </div>
        </div>

        {/* Mindful Tip / Insight Bento */}
        <div className="bg-[#F3F3F3] rounded-[24px] p-6 mt-4 relative overflow-hidden">
          <h4 className="text-[20px] font-extrabold text-[#1A1C1C] mb-2">Mindful Tip</h4>
          <p className="text-[14px] tracking-tight text-[#3C4A46] mb-8 leading-relaxed max-w-[85%]">
            Adding Gotu Kola sambol to your lunch provides essential micronutrients for brain health.
          </p>
          <div className="mt-auto">
            <div className="w-8 h-8 flex items-center justify-center bg-white/50 rounded-full">
              <svg className="w-5 h-5 text-[#006B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Weekly Streak */}
        <div className="relative bg-[#FFFBF4] border border-[#855300]/10 rounded-[24px] p-6 overflow-hidden mt-1">
          <div className="flex justify-between items-start mb-2 relative z-10 w-full">
            <div>
              <p className="text-[10px] font-bold text-[#855300] uppercase tracking-widest mb-1">
                Weekly Streak
              </p>
              <p className="text-[30px] font-extrabold text-[#855300] leading-none mb-4">
                14 Days
              </p>
            </div>
            <svg className="w-5 h-5 text-[#855300] opacity-80 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-[12px] font-medium text-[#855300]/80 pr-4 relative z-10">
            You're in the top 5% of mindful trackers in Sri Lanka this month!
          </p>
        </div>

      </main>

      {/* Floating Bottom Nav */}
      <AppBottomNav />
    </div>
  );
}
