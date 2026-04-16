"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { BuildCustomMealModal } from "./BuildCustomMealModal";

interface AppBottomNavProps {
  activeTab?: "today" | "search" | "ai" | "progress";
}

// ─── Dial geometry ────────────────────────────────────────────────────────────
// Nav is 80px tall; FAB centre sits 46px above the nav's bottom edge.
// Items are placed at DIAL_RADIUS from that centre, fanning 143°→37°.
const DIAL_RADIUS        = 108;
const FAB_CENTER_BOTTOM  = 46;   // px from nav bottom edge to FAB centre
const ITEM_SIZE          = 52;   // dial button diameter (px)
const HALF               = ITEM_SIZE / 2;
const DRAG_THRESHOLD     = 12;   // px movement before drag mode kicks in

const DIAL_ITEMS = [
  // Left-most → 143°
  {
    id: "capture",
    label: "Capture",
    angleDeg: 143,
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  // 108°
  {
    id: "text",
    label: "Text",
    angleDeg: 108,
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  // 72°
  {
    id: "scan",
    label: "Scan",
    angleDeg: 72,
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 012-2h2" />
        <path d="M17 3h2a2 2 0 012 2v2" />
        <path d="M21 17v2a2 2 0 01-2 2h-2" />
        <path d="M7 21H5a2 2 0 01-2-2v-2" />
        <line x1="7"  y1="8" x2="7"  y2="16" />
        <line x1="10" y1="8" x2="10" y2="16" />
        <line x1="13" y1="8" x2="13" y2="16" />
        <line x1="17" y1="8" x2="17" y2="16" />
      </svg>
    ),
  },
  // Right-most → 37°
  {
    id: "log",
    label: "Create Food",
    angleDeg: 37,
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5C8.69 5 6 7.69 6 11s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
        <path d="M12 5c0-1.2.8-2.2 2-2.5" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <line x1="10" y1="19" x2="14" y2="19" />
      </svg>
    ),
  },
];

// ─── Viewport hit-test ───────────────────────────────────────────────────────
// Returns the id of whichever dial item the pointer is within, or null.
function hitTestDial(clientX: number, clientY: number): string | null {
  const fabX = window.innerWidth  / 2;
  const fabY = window.innerHeight - FAB_CENTER_BOTTOM; // viewport-top coords
  for (const item of DIAL_ITEMS) {
    const rad = (item.angleDeg * Math.PI) / 180;
    const cx  = fabX + DIAL_RADIUS * Math.cos(rad);
    const cy  = fabY - DIAL_RADIUS * Math.sin(rad);   // invert Y axis
    if (Math.hypot(clientX - cx, clientY - cy) <= HALF + 8) return item.id;
  }
  return null;
}

export function AppBottomNav({ activeTab = "today" }: AppBottomNavProps) {
  const [isOpen,         setIsOpen]         = useState(false);
  const [dragHoverId,    setDragHoverId]    = useState<string | null>(null);
  const [showCreateMeal, setShowCreateMeal] = useState(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const hasDragged   = useRef(false);
  const router       = useRouter();

  // ── Shared dial action dispatcher ────────────────────────────────────────
  function dispatchDialAction(id: string) {
    setIsOpen(false);
    if (id === "log")    { setShowCreateMeal(true); return; }
    if (id === "ai")     { router.push("/ai");      return; }
    // camera / scan: placeholder until those flows are built
  }

  // ── FAB pointer handlers ─────────────────────────────────────────────────
  function onFabPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    hasDragged.current  = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onFabPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const dist = Math.hypot(
      e.clientX - pointerStart.current.x,
      e.clientY - pointerStart.current.y,
    );
    if (dist > DRAG_THRESHOLD) {
      hasDragged.current = true;
      if (!isOpen) setIsOpen(true);            // open dial as soon as drag starts
      setDragHoverId(hitTestDial(e.clientX, e.clientY));
    }
  }

  function onFabPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (hasDragged.current) {
      // Drag release: activate the item the finger lifted over (if any)
      const hitId = hitTestDial(e.clientX, e.clientY) ?? dragHoverId;
      if (hitId) dispatchDialAction(hitId);
      // No item hit → dial stays open; user can tap an item normally
    } else {
      // Plain tap → toggle open / close
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }

    hasDragged.current = false;
    setDragHoverId(null);
  }

  return (
    <>
      <BuildCustomMealModal
        isOpen={showCreateMeal}
        onClose={() => setShowCreateMeal(false)}
      />

      {/* ── Scrim ──────────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          pointerEvents: isOpen ? "auto" : "none",
          background: isOpen ? "rgba(0,0,0,0.25)" : "transparent",
        }}
        onClick={() => setIsOpen(false)}
      />

      {/* ── Bottom Nav ─────────────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-[80px] bg-white/90 backdrop-blur-xl
          border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]
          z-50 flex justify-between items-center px-4"
        style={{ overflow: "visible" }}
      >

        {/* ── Radial Speed Dial items ──────────────────────────────────────── */}
        {DIAL_ITEMS.map((item, i) => {
          const rad = (item.angleDeg * Math.PI) / 180;
          const dx  = DIAL_RADIUS * Math.cos(rad);
          const dy  = DIAL_RADIUS * Math.sin(rad);

          const isHovered = dragHoverId === item.id;
          const delay     = isOpen ? i * 45 : (DIAL_ITEMS.length - 1 - i) * 35;

          return (
            <div
              key={item.id}
              className="absolute flex flex-col items-center gap-[5px]"
              style={{
                left:   `calc(50% + ${dx}px - ${HALF}px)`,
                bottom: `${FAB_CENTER_BOTTOM + dy - HALF}px`,
                width:  ITEM_SIZE,
                zIndex: 55,
                opacity:   isOpen ? 1 : 0,
                transform: isOpen
                  ? `translate(0px,0px) scale(${isHovered ? 1.18 : 1})`
                  : `translate(${-dx}px,${dy}px) scale(0.25)`,
                transition: [
                  `transform 380ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
                  `opacity 200ms ease ${delay}ms`,
                ].join(", "),
                pointerEvents: isOpen ? "auto" : "none",
              }}
            >
              {/* Label pill */}
              <span
                className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap
                  rounded-full px-[7px] py-[2px] text-white transition-colors duration-150"
                style={{
                  background: isHovered ? "rgba(0,107,95,0.85)" : "rgba(0,30,27,0.55)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                {item.label}
              </span>

              {/* Glassmorphic icon button */}
              <button
                aria-label={item.label}
                onClick={() => dispatchDialAction(item.id)}
                className="flex items-center justify-center rounded-full active:scale-90
                  transition-all duration-150"
                style={{
                  width:  ITEM_SIZE,
                  height: ITEM_SIZE,
                  color:  isHovered ? "#ffffff" : "#006B5F",
                  border: isHovered ? "2px solid rgba(0,107,95,0.6)" : "1.5px solid rgba(255,255,255,0.5)",
                  background: isHovered
                    ? "rgba(0,107,95,0.88)"
                    : "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  boxShadow: isHovered
                    ? "0 8px 28px rgba(0,107,95,0.40), inset 0 1px 0 rgba(255,255,255,0.3)"
                    : "0 8px 24px rgba(0,107,95,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                {item.icon}
              </button>
            </div>
          );
        })}

        {/* ── Today ───────────────────────────────────────────────────────── */}
        <Link
          href="/home"
          className={`flex flex-col items-center justify-center w-[60px] h-[52px]
            ${activeTab === "today" ? "bg-[#F0FDFA] rounded-2xl text-[#0F766E]" : "text-gray-400"}`}
        >
          <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={`text-[10px] uppercase tracking-wide
            ${activeTab === "today" ? "font-bold" : "font-medium"}`}>Today</span>
        </Link>

        {/* ── Search ──────────────────────────────────────────────────────── */}
        <Link
          href="/search"
          className={`flex flex-col items-center justify-center w-[60px] h-[52px]
            ${activeTab === "search" ? "bg-[#F0FDFA] rounded-2xl text-[#0F766E]" : "text-gray-400"}`}
        >
          <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className={`text-[10px] uppercase tracking-wide
            ${activeTab === "search" ? "font-bold" : "font-medium"}`}>Search</span>
        </Link>

        {/* ── FAB (centre) ─────────────────────────────────────────────────── */}
        <div className="relative w-[60px] flex justify-center">

          {/* Glow ring when open */}
          <span
            className="absolute rounded-full pointer-events-none transition-opacity duration-300"
            style={{
              width:   56 + 20,
              height:  56 + 20,
              top:    -34 - 10,
              left:   (60 - 76) / 2,
              background: "radial-gradient(circle, rgba(0,107,95,0.22) 0%, transparent 70%)",
              opacity: isOpen ? 1 : 0,
            }}
          />

          <button
            aria-label={isOpen ? "Close quick-log menu" : "Open quick-log menu"}
            className="absolute select-none border-[4px] border-white rounded-full text-white
              flex items-center justify-center shadow-lg transition-all duration-300"
            style={{
              top:    -34,
              width:  56,
              height: 56,
              zIndex: 56,
              background: isOpen ? "#006B5F" : "#001E1B",
              transform:  isOpen ? "scale(1.08)" : "scale(1)",
            }}
            onPointerDown={onFabPointerDown}
            onPointerMove={onFabPointerMove}
            onPointerUp={onFabPointerUp}
            onContextMenu={(e) => e.preventDefault()}
          >
            <svg
              className="w-6 h-6"
              style={{
                transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
                transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* ── AI ──────────────────────────────────────────────────────────── */}
        <Link
          href="/ai"
          className={`flex flex-col items-center justify-center w-[60px] h-[52px]
            ${activeTab === "ai" ? "bg-[#F0FDFA] rounded-2xl text-[#0F766E]" : "text-gray-400"}`}
        >
          <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M13 10V3L4 14h7v8l9-11h-7z" />
          </svg>
          <span className={`text-[10px] uppercase tracking-wide
            ${activeTab === "ai" ? "font-bold" : "font-medium"}`}>AI</span>
        </Link>

        {/* ── Progress ────────────────────────────────────────────────────── */}
        <Link
          href="/progress"
          className={`flex flex-col items-center justify-center w-[60px] h-[52px]
            ${activeTab === "progress" ? "bg-[#F0FDFA] rounded-2xl text-[#0F766E]" : "text-gray-400"}`}
        >
          <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span className={`text-[10px] uppercase tracking-wide
            ${activeTab === "progress" ? "font-bold" : "font-medium"}`}>Progress</span>
        </Link>

      </nav>
    </>
  );
}
