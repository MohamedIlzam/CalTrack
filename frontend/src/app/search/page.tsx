"use client";

import { useState, useEffect } from "react";
import { AppBottomNav } from "@/components/ui/AppBottomNav";

export default function SearchPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle state when scrolled past the starting position of the search bar
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-[100px] font-sans antialiased">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-6 py-4 bg-white/80 backdrop-blur-xl flex justify-between items-center border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-[#006B5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h1 className="text-[18px] font-extrabold text-[#006B5F] tracking-tight leading-none mb-[2px]">
            Search Food
          </h1>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#006B5F]/20">
          <img
            alt="User Profile"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUh-XIBE2J31PmpJvSQACtd3ynGwpljpkllwIpUwg8uNtWhuilvURliuBnwz46eEu4ZQJRvMRL9c5zl7IzfMQIuXLBocp05a8VItkdLwX_3n0M-DqhTt6SBK1ON6hl8rLqF3iGAO2HNUxtnDVOFB1vtZZEhU50dww2sT4Xjg9Br8QERzU7mh8nZlhuP5v4D9DBWQBxpQClG5JUr8sluhT1mpSSCWmYIk-ydCNhSiJX4wwB-P3t8BT0fhRr-2vZAGxpAOx_A1S_ZC0"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <main className="pt-[88px] px-6 max-w-screen-xl mx-auto flex flex-col gap-8">
        
        {/* Search Input Placeholder to prevent layout shift */}
        <div className="h-[56px] w-full">
          {/* Search Input Container */}
          <section 
            className={`transition-all duration-300 z-50 ${
              isScrolled 
                ? "fixed top-[75px] left-0 right-0 px-10 mx-auto max-w-screen-xl opacity-90" 
                : "relative w-full"
            }`}
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10 transition-transform duration-300">
                <svg className={`w-5 h-5 transition-colors ${isScrolled ? 'text-[#006B5F]/70' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                className={`w-full h-14 pl-[48px] pr-12 shadow-sm focus:ring-2 focus:ring-[#006B5F]/20 outline-none text-[#1A1C1C] font-medium transition-all duration-300 truncate ${
                  isScrolled 
                    ? "bg-white/60 backdrop-blur-xl rounded-full border border-white/60 text-[15px] placeholder-transparent" 
                    : "bg-white rounded-full border border-[#BACAC5]/15 text-[16px] placeholder-gray-400"
                }`}
                placeholder={isScrolled ? "" : "Search Kottu, Dhal..."}
                type="text"
              />
              <div className="absolute inset-y-0 right-4 flex items-center z-10">
                <svg className="w-5 h-5 text-gray-400 cursor-pointer hover:text-[#006B5F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
          </section>
        </div>

        {/* Categories Chips */}
        <section className="-mx-6">
          <div className="flex gap-3 overflow-x-auto px-6 no-scrollbar pb-2">
            <button className="flex-none px-5 py-2.5 rounded-full bg-[#006B5F]/10 text-[#006B5F] font-bold text-[13px] transition-all active:scale-95">
              Snacks
            </button>
            <button className="flex-none px-5 py-2.5 rounded-full bg-white text-[#3C4A46] shadow-sm border border-gray-100 font-semibold text-[13px] transition-all active:scale-95">
              Drinks
            </button>
            <button className="flex-none px-5 py-2.5 rounded-full bg-white text-[#3C4A46] shadow-sm border border-gray-100 font-semibold text-[13px] transition-all active:scale-95">
              Smoothies
            </button>
            <button className="flex-none px-5 py-2.5 rounded-full bg-white text-[#3C4A46] shadow-sm border border-gray-100 font-semibold text-[13px] transition-all active:scale-95">
              Short Eats
            </button>
            <button className="flex-none px-5 py-2.5 rounded-full bg-white text-[#3C4A46] shadow-sm border border-gray-100 font-semibold text-[13px] transition-all active:scale-95">
              Breakfast
            </button>
          </div>
        </section>

        {/* Recent Favorites */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[18px] font-extrabold text-[#1A1C1C] tracking-tight">Recent Favorites</h2>
            <span className="text-[#006B5F] text-[13px] font-bold cursor-pointer">See All</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
            
            {/* Favorite Card 1 */}
            <div className="flex-none w-[170px] bg-white rounded-[20px] p-3 shadow-sm border border-gray-50 transition-all active:scale-[0.98]">
              <div className="w-full h-28 rounded-[14px] mb-3 overflow-hidden bg-gray-100">
                <img
                  className="w-full h-full object-cover"
                  alt="Rice and Curry"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDXOxF60kw5njlp1MISB08Y4OTzD-dPZuPA7j8Yz-Y1DPBSSMDz7H1CjVh3KwhSUzeX9X9z8P64TWfFLWg30TZp-IVwWMVs__5OszC9wGKWLmVBl3GCQ13ARNLnj8XhrNJVl37boCbSJn-T8KmTQN_ldbmmdPgSImlK4fejeQIxckVRYVH2NXFvq3Wcg1dKeDDEkZIArbT7MOkBpjt4bv71EO9VhvnDvgfBJzqzhFGAtroNp-8FfaHN0H5uGcXwWpzSfVg7gWjPj4"
                />
              </div>
              <p className="font-bold text-[14px] text-[#1A1C1C] truncate">Rice and Curry</p>
              <p className="text-[11px] text-[#3C4A46]/70 font-bold uppercase tracking-[1px] mt-0.5">Lunch • 450 kcal</p>
            </div>

            {/* Favorite Card 2 */}
            <div className="flex-none w-[170px] bg-white rounded-[20px] p-3 shadow-sm border border-gray-50 transition-all active:scale-[0.98]">
              <div className="w-full h-28 rounded-[14px] mb-3 overflow-hidden bg-gray-100">
                <img
                  className="w-full h-full object-cover"
                  alt="Milk Tea"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDq5603o65MXRcqmq7b2MZ_HFuhNrKqywyTNzkN39yV6eu3lTkFvkKxSk6i9dvst2vyyEn7PX3cQ-WD13MV4Fz8ZZ1iBgEKfdInz9YX1C_2bEAiSoDFMlVxF2xJMZHX4fYbwoKZa_zXSNkOaLZ5hlX3I33k5M8Y8K9kkubX3yfs1P_Wdvnj-xlMRut_UzltOPqnUZ_WXuO-o8ggcMINt8o08ElJol0tj2zwV3Tc-tH3nZWVCq2YUfCkW2zKwkVq9A321wgaQ-fj2T0"
                />
              </div>
              <p className="font-bold text-[14px] text-[#1A1C1C] truncate">Milk Tea</p>
              <p className="text-[11px] text-[#3C4A46]/70 font-bold uppercase tracking-[1px] mt-0.5">Morning • 120 kcal</p>
            </div>

            {/* Favorite Card 3 */}
            <div className="flex-none w-[170px] bg-white rounded-[20px] p-3 shadow-sm border border-gray-50 transition-all active:scale-[0.98]">
              <div className="w-full h-28 rounded-[14px] mb-3 overflow-hidden bg-gray-100">
                <img
                  className="w-full h-full object-cover"
                  alt="Dhal Curry"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf337hN_rJBsBq0IZjnS1zu4QtMNMGr77NrnRndGPa4TCAxR5MD2427alcashW81Z2gwMP4pTdaObJY19hegMUW8pzJUt-oBs5EWC2DFntlYaWFOwgbvcxcW34WppWx8JLODO-6owk4cjOzJCQFxEKri28yCtdWGXzTMDxZGwr10EgQCbH9S0ICh-Ymz6ATHMgY52QPCRWdn1pQ-shmEoeuxARsAl-r-IfbDUiLYNw_xsu9HmYp20ORHRuDMjweR-c51IXDCzdE38"
                />
              </div>
              <p className="font-bold text-[14px] text-[#1A1C1C] truncate">Dhal Curry</p>
              <p className="text-[11px] text-[#3C4A46]/70 font-bold uppercase tracking-[1px] mt-0.5">Side • 180 kcal</p>
            </div>

          </div>
        </section>

        {/* Sri Lankan Specials */}
        <section className="mb-4">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[18px] font-extrabold text-[#1A1C1C] tracking-tight">Sri Lankan Specials</h2>
            <div className="flex items-center gap-1 text-[11px] text-[#3C4A46]/70 font-bold uppercase tracking-wider">
              <svg className="w-3.5 h-3.5 text-[#006B5F]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified Data
            </div>
          </div>

          <div className="flex flex-col gap-3">
            
            {/* Item 1 */}
            <div className="flex items-center justify-between p-3 bg-white rounded-[24px] shadow-sm border border-[#BACAC5]/15 group active:scale-[0.99] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Egg Hopper"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBloTyTvz7LU6XmNbTS_Nhc9l6JWFLMoZoOwAvIGINydUD0C6CSTKxs2fDeO9wlHkVw2qkK7D13rHw-8pbFyRlVUOB1LD4vY3NH6UIbGvpfsq3OJQ0JuU1nM88sF2xRvaWwtrVQ-obsrbq3aMb17uK9R9czrq444-AyA321Ex_gdBCCLzPwLgbwm-I5GsWWIsW3L7DT-IUYEsLAiKUJVNO2dC7Xxf_iAs20GgEtj6_9FZA0Cx6Kg2ZcjN6tJXRemxogFHgjaYgeuU"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-[15px] text-[#1A1C1C]">Egg Hopper</h3>
                    <svg className="w-4 h-4 text-[#006B5F]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-[13px] font-medium text-[#3C4A46] mt-0.5">125 kcal • 1 Piece</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-[#006B5F]/10 text-[#006B5F] flex items-center justify-center transition-all active:scale-90 mr-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Item 2 */}
            <div className="flex items-center justify-between p-3 bg-white rounded-[24px] shadow-sm border border-[#BACAC5]/15 group active:scale-[0.99] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="String Hoppers"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1EwlEhYtMHpOAi9RnxngKu_SA-HcY1O6kgT41QEh4Bwzmql4MOYJ8bXw3pul_M-xNPDASPSgqIrbP2MhwiiZIdOmm6kurcIJuijvPXvP3jpkhS4LqgByYMLmVgKMcFTfSLH2UGz4H0lb-YASiHwK3O-la8OfM3vI8mh2CEd-EiWfx4aL90tuVuAxXOZF_ZO6b5PKQy2-z7k97dINFcbjgmRZv6HelEUetnHarG2WYrydQ_TVYzUi8beOnBNhSMJBLCWJGJ17_83U"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[15px] text-[#1A1C1C]">String Hoppers</h3>
                    <span className="px-2 py-[2px] rounded-full bg-[#F3F3F3] text-[#3C4A46] text-[9px] font-bold uppercase tracking-wider border border-gray-200">
                      Estimated
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-[#3C4A46] mt-0.5">210 kcal • 5 Pieces</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-[#006B5F]/10 text-[#006B5F] flex items-center justify-center transition-all active:scale-90 mr-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Item 3 */}
            <div className="flex items-center justify-between p-3 bg-white rounded-[24px] shadow-sm border border-[#BACAC5]/15 group active:scale-[0.99] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Pol Sambol"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDztIA7xYv_AlycOZStOG3O99zYN9SH-34MKsOOE48pRGORsyPrZgFx-1qrBKNOb7qRVi0kL9PPQAia3h9V7SOUX-GXphkbuivmdMTZqEM9LxaCxSPDqlVJJN9RqvRXs4vEHYRUnalwULbOjO17dwnKLQuEHbFBKBJ2rDxxRMm-YCQrtSU6c0HXQsRUwO8HVVplDJGY-fIlIkkYQnr2rbJdQehS9-FPVHZowhNShPC8A2usYgWobr4pVN8lDoMoDVIa5BWaOHbokV4"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-[15px] text-[#1A1C1C]">Pol Sambol</h3>
                    <svg className="w-4 h-4 text-[#006B5F]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-[13px] font-medium text-[#3C4A46] mt-0.5">85 kcal • 2 tbsp</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-[#006B5F]/10 text-[#006B5F] flex items-center justify-center transition-all active:scale-90 mr-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Item 4 */}
            <div className="flex items-center justify-between p-3 bg-white rounded-[24px] shadow-sm border border-[#BACAC5]/15 group active:scale-[0.99] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Fish Roti"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUwKN8UbpTkdnmcNFunXzhTdGmnm6SUum8HZZC9MsDrjohEMBqX58wLN6wz0igEnZ246tcG4m7xJtzhoRR1YrJYOVFDNl95B3Aqy5LSREffKskNqmAqBWV8GI-P6q-U3_pvmnUmUyaJ1MrGFKJQRVeYNKyFvtPQV1ZAsgm9bm0tS2HlpJMYTUyrkYl4p8so3WBtJm8pAI5FhqsImW4ZUhoIMlAS98lNnIm7bvHMp5HBET0OTLH7RrbnB3oX5kbdo4yfR5FzXGk594"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[15px] text-[#1A1C1C]">Fish Roti</h3>
                    <span className="px-2 py-[2px] rounded-full bg-[#F3F3F3] text-[#3C4A46] text-[9px] font-bold uppercase tracking-wider border border-gray-200">
                      Estimated
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-[#3C4A46] mt-0.5">240 kcal • 1 Piece</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-[#006B5F]/10 text-[#006B5F] flex items-center justify-center transition-all active:scale-90 mr-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

          </div>
        </section>
      </main>

      <AppBottomNav activeTab="search" />
    </div>
  );
}