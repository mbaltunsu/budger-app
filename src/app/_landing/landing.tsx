"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── keyframes injected once ────────────────────────────────────────────── */
const CSS = `
  @keyframes float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    33%      { transform: translateY(-14px) rotate(0.4deg); }
    66%      { transform: translateY(-6px) rotate(-0.3deg); }
  }
  @keyframes floatSlow {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-10px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes drawArc {
    from { stroke-dashoffset: 252; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.5; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .animate-float       { animation: float 6s ease-in-out infinite; }
  .animate-float-slow  { animation: floatSlow 8s ease-in-out infinite; }
  .animate-fade-up     { animation: fadeUp 0.7s ease-out forwards; }
  .fade-up-hidden      { opacity: 0; transform: translateY(28px); }
  .fade-up-visible     { animation: fadeUp 0.65s ease-out forwards; }
  .pulse-ring          { animation: pulse-ring 1.8s ease-out infinite; }
`;

/* ─── Wave divider ────────────────────────────────────────────────────────── */
function Wave({ fill, flip }: { fill: string; flip?: boolean }) {
  return (
    <div className="pointer-events-none select-none leading-none" aria-hidden style={{ lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 88"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 88, ...(flip ? { transform: "scaleY(-1)" } : {}) }}
      >
        <path
          d="M0,36 C180,80 360,6 540,42 C720,78 900,10 1080,40 C1260,70 1380,18 1440,30 L1440,88 L0,88 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

/* ─── Scroll-reveal hook ──────────────────────────────────────────────────── */
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("fade-up-hidden");
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          el.classList.remove("fade-up-hidden");
          el.classList.add("fade-up-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Animated counter ────────────────────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const dur = 1600;
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Dashboard SVG ───────────────────────────────────────────────────────── */
function DashboardSVG() {
  return (
    <svg viewBox="0 0 560 380" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-[0_32px_64px_rgba(58,46,40,0.18)]" style={{ borderRadius: 28 }}>
      {/* card bg */}
      <rect width="560" height="380" rx="28" fill="#FFFBF5" />

      {/* coral header */}
      <rect width="560" height="150" rx="28" fill="#F4633A" />
      <rect y="126" width="560" height="24" fill="#F4633A" />
      {/* wave inside header */}
      <path d="M0,126 C140,150 280,112 420,134 C490,146 530,124 560,130 L560,150 L0,150 Z" fill="#FFFBF5" />

      {/* pill */}
      <rect x="184" y="22" width="192" height="24" rx="12" fill="rgba(255,255,255,0.18)" />
      <text x="280" y="38" textAnchor="middle" fill="rgba(255,255,255,0.88)" fontSize="10" fontWeight="700" fontFamily="Nunito,sans-serif" letterSpacing="1.5">DISPOSABLE INCOME</text>

      {/* big number */}
      <text x="280" y="94" textAnchor="middle" fill="white" fontSize="48" fontWeight="800" fontFamily="Nunito,sans-serif">$2,418</text>
      <text x="280" y="116" textAnchor="middle" fill="rgba(255,255,255,0.62)" fontSize="12" fontFamily="Nunito,sans-serif">April 2026</text>

      {/* 4 mini summary cards */}
      {([
        { x: 18,  label: "INCOME", value: "+$8,200", color: "#2D7A4F" },
        { x: 156, label: "TAX",    value: "−$1,640", color: "#F4633A" },
        { x: 294, label: "FIXED",  value: "−$2,100", color: "#F4633A" },
        { x: 432, label: "SAVED",  value: "+$418",   color: "#2D7A4F" },
      ] as const).map(({ x, label, value, color }) => (
        <g key={label}>
          <rect x={x} y="166" width="110" height="52" rx="14" fill="white" />
          <text x={x + 55} y="184" textAnchor="middle" fill="rgba(58,46,40,0.45)" fontSize="8.5" fontWeight="700" fontFamily="Nunito,sans-serif" letterSpacing="0.8">{label}</text>
          <text x={x + 55} y="205" textAnchor="middle" fill={color} fontSize="13.5" fontWeight="800" fontFamily="Nunito,sans-serif">{value}</text>
        </g>
      ))}

      {/* spending card */}
      <rect x="18" y="232" width="258" height="130" rx="18" fill="white" />
      <text x="34" y="254" fill="#3A2E28" fontSize="12" fontWeight="700" fontFamily="Nunito,sans-serif">Spending breakdown</text>

      {/* donut */}
      <circle cx="104" cy="314" r="40" fill="none" stroke="#F4E8DF" strokeWidth="18" />
      <circle cx="104" cy="314" r="40" fill="none" stroke="#F4633A" strokeWidth="18" strokeDasharray="105 146" strokeDashoffset="25" strokeLinecap="round" />
      <circle cx="104" cy="314" r="40" fill="none" stroke="#2D7A4F" strokeWidth="18" strokeDasharray="50 201" strokeDashoffset="-80" strokeLinecap="round" />
      <circle cx="104" cy="314" r="40" fill="none" stroke="#F9A05C" strokeWidth="18" strokeDasharray="36 215" strokeDashoffset="-130" strokeLinecap="round" />
      <text x="104" y="318" textAnchor="middle" fill="#3A2E28" fontSize="13" fontWeight="800" fontFamily="Nunito,sans-serif">$4,082</text>
      <text x="104" y="331" textAnchor="middle" fill="rgba(58,46,40,0.38)" fontSize="9" fontFamily="Nunito,sans-serif">spent</text>

      {/* legend */}
      {([
        { y: 275, c: "#F4633A", l: "Housing · $1,890" },
        { y: 294, c: "#2D7A4F", l: "Transport · $410" },
        { y: 313, c: "#F9A05C", l: "Food · $620"      },
        { y: 332, c: "#C9B8E8", l: "Other · $462"     },
      ] as const).map(({ y, c, l }) => (
        <g key={l}>
          <circle cx="168" cy={y} r="4.5" fill={c} />
          <text x="178" y={y + 4} fill="rgba(58,46,40,0.6)" fontSize="9.5" fontFamily="Nunito,sans-serif">{l}</text>
        </g>
      ))}

      {/* month at a glance card */}
      <rect x="292" y="232" width="250" height="130" rx="18" fill="white" />
      <text x="308" y="254" fill="#3A2E28" fontSize="12" fontWeight="700" fontFamily="Nunito,sans-serif">Month at a glance</text>

      {([
        { l: "Gross income", v: "$8,200",  c: "#2D7A4F", y: 276 },
        { l: "Est. tax",     v: "−$1,640", c: "#F4633A", y: 298 },
        { l: "Fixed costs",  v: "−$2,100", c: "#F4633A", y: 320 },
        { l: "Savings",      v: "+$418",   c: "#2D7A4F", y: 345 },
      ] as const).map(({ l, v, c, y }) => (
        <g key={l}>
          {y < 345 && <line x1="308" y1={y + 9} x2="526" y2={y + 9} stroke="rgba(58,46,40,0.06)" strokeWidth="1" />}
          <text x="308" y={y} fill="rgba(58,46,40,0.5)" fontSize="10" fontFamily="Nunito,sans-serif">{l}</text>
          <text x="526" y={y} textAnchor="end" fill={c} fontSize="10.5" fontWeight="700" fontFamily="Nunito,sans-serif">{v}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Floating deco blobs (background) ──────────────────────────────────── */
function FloatingBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* top-right coin */}
      <svg className="absolute -right-8 top-8 opacity-20 animate-float-slow" style={{ animationDelay: "0.4s" }} width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="56" fill="#F4633A" />
        <text x="60" y="72" textAnchor="middle" fill="white" fontSize="40" fontWeight="800" fontFamily="Nunito,sans-serif">$</text>
      </svg>
      {/* left middle bar-chart */}
      <svg className="absolute left-4 top-1/3 opacity-15 animate-float" style={{ animationDelay: "1.2s" }} width="64" height="64" viewBox="0 0 64 64">
        <rect x="6"  y="32" width="12" height="26" rx="4" fill="#F4633A" />
        <rect x="24" y="18" width="12" height="40" rx="4" fill="#2D7A4F" />
        <rect x="42" y="26" width="12" height="32" rx="4" fill="#F4633A" />
      </svg>
      {/* bottom-left coin */}
      <svg className="absolute bottom-16 left-8 opacity-10 animate-float-slow" style={{ animationDelay: "2s" }} width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#F4633A" strokeWidth="6" />
        <circle cx="40" cy="40" r="26" fill="none" stroke="#F4633A" strokeWidth="3" strokeDasharray="8 5" />
      </svg>
    </div>
  );
}

/* ─── Nav ─────────────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-[#FFFBF5]/95 shadow-[0_2px_12px_rgba(58,46,40,0.08)] backdrop-blur" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-[#3A2E28]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F4633A] text-sm font-black text-white">b</span>
          <span className="text-lg">budger</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#3A2E28]/60 md:flex">
          <a href="#features" className="hover:text-[#F4633A] transition-colors">Features</a>
          <a href="#preview"  className="hover:text-[#F4633A] transition-colors">Preview</a>
          <Link href="/login" className="hover:text-[#F4633A] transition-colors">Sign in</Link>
        </nav>
        <Link href="/signup" className="rounded-full bg-[#F4633A] px-5 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-[0_4px_14px_rgba(244,99,58,0.35)]">
          Get started free
        </Link>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen bg-[#FFFBF5] pt-24 pb-0 overflow-hidden">
      <FloatingBlobs />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-0">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* left copy */}
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F4633A]/25 bg-[#F4633A]/8 px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#F4633A] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F4633A]" />
              </span>
              <span className="text-xs font-bold text-[#F4633A]">Now in early access</span>
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-[#3A2E28] lg:text-6xl">
              Your money,<br />
              <span className="relative inline-block text-[#F4633A]">
                finally clear.
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 280 12" preserveAspectRatio="none" aria-hidden>
                  <path d="M0,10 C40,2 100,14 160,6 C220,-2 260,12 280,8" fill="none" stroke="#F4633A" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.4" />
                </svg>
              </span>
            </h1>

            <p className="mb-8 max-w-md text-lg leading-relaxed text-[#3A2E28]/55">
              Track income, bills, subscriptions and daily spending in one place — and see exactly what's left to spend, every day.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/signup" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#F4633A] px-7 py-3.5 text-sm font-bold text-white shadow-[0_6px_24px_rgba(244,99,58,0.38)] transition-all hover:shadow-[0_8px_32px_rgba(244,99,58,0.5)] hover:-translate-y-0.5">
                Get started — it&apos;s free
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/login" className="rounded-full border border-[#3A2E28]/15 px-6 py-3.5 text-sm font-bold text-[#3A2E28]/65 hover:border-[#3A2E28]/30 hover:text-[#3A2E28] transition-all">
                Sign in
              </Link>
            </div>

            {/* social proof micro */}
            <div className="mt-8 flex items-center gap-3 text-sm text-[#3A2E28]/40">
              <div className="flex -space-x-2">
                {["#F4633A","#2D7A4F","#F9A05C","#C9B8E8"].map((c, i) => (
                  <div key={i} className="h-7 w-7 rounded-full border-2 border-[#FFFBF5] flex items-center justify-center" style={{ backgroundColor: c }}>
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                  </div>
                ))}
              </div>
              <span>Trusted by early users · <strong className="text-[#3A2E28]/60">free forever</strong></span>
            </div>
          </div>

          {/* right: dashboard illustration */}
          <div className="relative flex justify-center lg:justify-end" style={{ animationDelay: "0.2s" }}>
            <div className="animate-float w-full max-w-[540px]">
              <DashboardSVG />
            </div>
            {/* floating pill decorations */}
            <div className="absolute -top-4 -left-4 animate-float-slow rounded-2xl bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(58,46,40,0.10)]" style={{ animationDelay: "0.8s" }}>
              <p className="text-xs font-semibold text-[#3A2E28]/50">This month saved</p>
              <p className="text-lg font-extrabold text-[#2D7A4F]">+$418</p>
            </div>
            <div className="absolute bottom-8 -right-2 animate-float-slow rounded-2xl bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(58,46,40,0.10)]" style={{ animationDelay: "1.6s" }}>
              <p className="text-xs font-semibold text-[#3A2E28]/50">Next bill</p>
              <p className="text-sm font-extrabold text-[#3A2E28]">Rent · <span className="text-[#F4633A]">3 days</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* wave transition → coral */}
      <div className="mt-16">
        <Wave fill="#F4633A" />
      </div>
    </section>
  );
}

/* ─── Features ────────────────────────────────────────────────────────────── */
function Features() {
  const ref = useFadeUp();
  const features = [
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="h-11 w-11">
          <rect width="48" height="48" rx="14" fill="rgba(255,255,255,0.15)" />
          <rect x="12" y="16" width="9" height="18" rx="3" fill="white" fillOpacity=".9" />
          <rect x="25" y="22" width="9" height="12" rx="3" fill="white" fillOpacity=".6" />
          <rect x="12" y="37" width="22" height="2" rx="1" fill="white" fillOpacity=".35" />
        </svg>
      ),
      title: "Track everything",
      body: "Income, bills, subscriptions and daily expenses — all in one dashboard. No more switching between apps.",
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="h-11 w-11">
          <rect width="48" height="48" rx="14" fill="rgba(255,255,255,0.15)" />
          <circle cx="24" cy="24" r="11" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
          <path d="M24,13 A11,11 0 0,1 35,24" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
          <path d="M24,13 A11,11 0 0,0 13,24" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeOpacity=".55" />
          <circle cx="24" cy="24" r="4" fill="white" />
        </svg>
      ),
      title: "Understand your money",
      body: "Soft, fluid charts break down where every dollar goes — by category, by month, at a glance.",
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="h-11 w-11">
          <rect width="48" height="48" rx="14" fill="rgba(255,255,255,0.15)" />
          <rect x="12" y="17" width="24" height="18" rx="3.5" fill="none" stroke="white" strokeWidth="2" strokeOpacity=".65" />
          <line x1="17" y1="13" x2="17" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="31" y1="13" x2="31" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="17" y1="29" x2="31" y2="29" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity=".7" />
          <line x1="17" y1="25" x2="26" y2="25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity=".7" />
        </svg>
      ),
      title: "Plan ahead",
      body: "Know your disposable income before you spend it. See upcoming bills and never be caught off-guard.",
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="h-11 w-11">
          <rect width="48" height="48" rx="14" fill="rgba(255,255,255,0.15)" />
          <path d="M14,30 L14,22 C14,18 17,16 22,16 L26,16 C31,16 34,18 34,22 L34,26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity=".65" />
          <rect x="12" y="28" width="24" height="10" rx="5" fill="white" fillOpacity=".85" />
          <circle cx="24" cy="33" r="2" fill="#F4633A" />
        </svg>
      ),
      title: "Private & secure",
      body: "Your financial data belongs to you. No ads, no selling your data. Just a clean tool that works.",
    },
  ];
  return (
    <section id="features" className="bg-[#F4633A] pb-0 pt-6">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div ref={ref} className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-white lg:text-4xl">Built for real life</h2>
          <p className="mt-3 text-base text-white/65 max-w-md mx-auto">No jargon, no spreadsheets. Just clear numbers that help you make better decisions.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon, title, body }) => (
            <div key={title} className="group rounded-2xl bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/18 hover:-translate-y-1 cursor-default border border-white/10">
              <div className="mb-4">{icon}</div>
              <h3 className="mb-2 text-base font-extrabold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-white/65">{body}</p>
            </div>
          ))}
        </div>
      </div>
      <Wave fill="#FFFBF5" />
    </section>
  );
}

/* ─── App Preview ─────────────────────────────────────────────────────────── */
function AppPreview() {
  const ref = useFadeUp();
  return (
    <section id="preview" className="bg-[#FFFBF5] pb-0 pt-4">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div ref={ref} className="mb-14 text-center">
          <h2 className="text-3xl font-extrabold text-[#3A2E28] lg:text-4xl">Everything in one view</h2>
          <p className="mt-3 text-base text-[#3A2E28]/50 max-w-sm mx-auto">Your full financial picture — income, costs, spending — in a single beautiful dashboard.</p>
        </div>

        {/* browser chrome around dashboard */}
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl shadow-[0_40px_80px_rgba(58,46,40,0.14)] border border-[#3A2E28]/6">
            {/* browser bar */}
            <div className="flex items-center gap-2 bg-[#F2EDE6] px-5 py-3.5">
              <div className="h-3 w-3 rounded-full bg-[#F4633A]/60" />
              <div className="h-3 w-3 rounded-full bg-[#F9A05C]/60" />
              <div className="h-3 w-3 rounded-full bg-[#2D7A4F]/40" />
              <div className="mx-3 flex-1 rounded-md bg-[#3A2E28]/8 px-3 py-1 text-xs text-[#3A2E28]/35">app.budger.io/dashboard</div>
            </div>
            {/* dashboard SVG */}
            <div className="animate-float-slow bg-[#FFFBF5] p-4" style={{ animationDelay: "0.6s" }}>
              <DashboardSVG />
            </div>
          </div>
        </div>
      </div>
      <Wave fill="#F4633A" />
    </section>
  );
}

/* ─── Stats ───────────────────────────────────────────────────────────────── */
function Stats() {
  const ref = useFadeUp();
  return (
    <section className="bg-[#F4633A] pb-0 pt-6">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div ref={ref} className="grid gap-8 text-center sm:grid-cols-3">
          {[
            { n: 0,   suffix: "",  label: "Setup in minutes", sub: "No bank connection required" },
            { n: 15,  suffix: "+", label: "Expense categories", sub: "Pre-seeded and ready to use" },
            { n: 100, suffix: "%", label: "Free to start", sub: "No credit card, no trial" },
          ].map(({ n, suffix, label, sub }) => (
            <div key={label}>
              <p className="text-5xl font-extrabold text-white tabular-nums">
                {n === 0 ? "5" : <Counter to={n} suffix={suffix} />}
                {n === 0 ? suffix : ""}
              </p>
              <p className="mt-2 text-base font-bold text-white">{label}</p>
              <p className="mt-1 text-sm text-white/55">{sub}</p>
            </div>
          ))}
        </div>
      </div>
      <Wave fill="#FFFBF5" />
    </section>
  );
}

/* ─── CTA ─────────────────────────────────────────────────────────────────── */
function CTA() {
  const ref = useFadeUp();
  return (
    <section className="bg-[#FFFBF5] pb-24 pt-4">
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div ref={ref}>
          {/* decorative donut */}
          <div className="mb-8 flex justify-center">
            <svg viewBox="0 0 80 80" className="h-16 w-16 animate-float" style={{ animationDelay: "0.3s" }}>
              <circle cx="40" cy="40" r="34" fill="none" stroke="#F4E8DF" strokeWidth="14" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#F4633A" strokeWidth="14" strokeDasharray="110 104" strokeDashoffset="25" strokeLinecap="round" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#2D7A4F" strokeWidth="14" strokeDasharray="55 159" strokeDashoffset="-85" strokeLinecap="round" />
              <circle cx="40" cy="40" r="7" fill="#FFFBF5" />
            </svg>
          </div>

          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-[#3A2E28] lg:text-5xl">
            Ready to see where<br />your money really goes?
          </h2>
          <p className="mb-8 text-base text-[#3A2E28]/50">
            Sign up in 30 seconds. No bank connection. No credit card.
          </p>

          <Link href="/signup" className="group inline-flex items-center gap-2 rounded-full bg-[#F4633A] px-8 py-4 text-base font-bold text-white shadow-[0_8px_32px_rgba(244,99,58,0.38)] transition-all hover:shadow-[0_12px_40px_rgba(244,99,58,0.5)] hover:-translate-y-1">
            Get started free
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
          <p className="mt-4 text-xs text-[#3A2E28]/35">Free forever · No credit card</p>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-[#3A2E28]/8 bg-[#FFFBF5] px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[#3A2E28]/40 sm:flex-row">
        <div className="flex items-center gap-2 font-bold text-[#3A2E28]/60">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F4633A] text-xs font-black text-white">b</span>
          budger
        </div>
        <span>© {new Date().getFullYear()} budger. Made with care.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-[#F4633A] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#F4633A] transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Root export ─────────────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <>
      <style>{CSS}</style>
      <div className="bg-[#FFFBF5]">
        <Nav />
        <Hero />
        <Features />
        <AppPreview />
        <Stats />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
