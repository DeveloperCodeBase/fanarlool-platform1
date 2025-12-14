import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiActivity,
  FiAlertTriangle,
  FiDownload,
  FiGlobe,
  FiLock,
  FiMenu,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { translations } from "./i18n";
import { useLanguage } from "./context/LanguageContext.jsx";

const carriers = [
  { key: "electricity", color: "#22d3ee", label: { fa: "برق", en: "Electricity" } },
  { key: "gas", color: "#a855f7", label: { fa: "گاز", en: "Gas" } },
  { key: "air", color: "#f97316", label: { fa: "هوای فشرده", en: "Compressed Air" } },
];

const baselineEnergy = { electricity: 8200, gas: 4300, air: 1400 };

const energyTimeline = {
  week: [
    { labelFa: "شنبه", labelEn: "Sat", electricity: 1120, gas: 580, air: 210, cost: 4200 },
    { labelFa: "یکشنبه", labelEn: "Sun", electricity: 1180, gas: 610, air: 225, cost: 4380 },
    { labelFa: "دوشنبه", labelEn: "Mon", electricity: 1210, gas: 640, air: 240, cost: 4510 },
    { labelFa: "سه‌شنبه", labelEn: "Tue", electricity: 1190, gas: 620, air: 230, cost: 4440 },
    { labelFa: "چهارشنبه", labelEn: "Wed", electricity: 1255, gas: 655, air: 245, cost: 4630 },
    { labelFa: "پنج‌شنبه", labelEn: "Thu", electricity: 1170, gas: 600, air: 220, cost: 4320 },
    { labelFa: "جمعه", labelEn: "Fri", electricity: 980, gas: 540, air: 205, cost: 3900 },
  ],
  month: [
    { labelFa: "هفته ۱", labelEn: "Week 1", electricity: 4700, gas: 2400, air: 830, cost: 16900 },
    { labelFa: "هفته ۲", labelEn: "Week 2", electricity: 4860, gas: 2470, air: 860, cost: 17420 },
    { labelFa: "هفته ۳", labelEn: "Week 3", electricity: 4950, gas: 2530, air: 870, cost: 17760 },
    { labelFa: "هفته ۴", labelEn: "Week 4", electricity: 4820, gas: 2460, air: 850, cost: 17310 },
  ],
  year: [
    { labelFa: "بهار", labelEn: "Spring", electricity: 13300, gas: 7200, air: 2620, cost: 52000 },
    { labelFa: "تابستان", labelEn: "Summer", electricity: 14100, gas: 7600, air: 2780, cost: 54700 },
    { labelFa: "پاییز", labelEn: "Autumn", electricity: 12900, gas: 6900, air: 2490, cost: 49800 },
    { labelFa: "زمستان", labelEn: "Winter", electricity: 12500, gas: 8100, air: 2700, cost: 50500 },
  ],
};

const oeeHistory = {
  week: [
    { labelFa: "شنبه", labelEn: "Sat", lineA: 88, lineB: 91, lineC: 86 },
    { labelFa: "یکشنبه", labelEn: "Sun", lineA: 87, lineB: 92, lineC: 85 },
    { labelFa: "دوشنبه", labelEn: "Mon", lineA: 89, lineB: 93, lineC: 86 },
    { labelFa: "سه‌شنبه", labelEn: "Tue", lineA: 90, lineB: 94, lineC: 87 },
    { labelFa: "چهارشنبه", labelEn: "Wed", lineA: 89, lineB: 92, lineC: 86 },
    { labelFa: "پنج‌شنبه", labelEn: "Thu", lineA: 88, lineB: 91, lineC: 85 },
    { labelFa: "جمعه", labelEn: "Fri", lineA: 86, lineB: 90, lineC: 84 },
  ],
  month: [
    { labelFa: "هفته ۱", labelEn: "Week 1", lineA: 86, lineB: 90, lineC: 83 },
    { labelFa: "هفته ۲", labelEn: "Week 2", lineA: 88, lineB: 92, lineC: 84 },
    { labelFa: "هفته ۳", labelEn: "Week 3", lineA: 89, lineB: 92, lineC: 86 },
    { labelFa: "هفته ۴", labelEn: "Week 4", lineA: 90, lineB: 93, lineC: 87 },
  ],
  year: [
    { labelFa: "بهار", labelEn: "Spring", lineA: 84, lineB: 88, lineC: 82 },
    { labelFa: "تابستان", labelEn: "Summer", lineA: 86, lineB: 90, lineC: 84 },
    { labelFa: "پاییز", labelEn: "Autumn", lineA: 88, lineB: 91, lineC: 85 },
    { labelFa: "زمستان", labelEn: "Winter", lineA: 87, lineB: 90, lineC: 84 },
  ],
};

const lineShiftData = [
  {
    id: "L1",
    nameFa: "خط فرمینگ",
    nameEn: "Forming Line",
    availability: 93,
    performance: 89,
    quality: 97,
    shifts: [
      { nameFa: "روز", nameEn: "Day", availability: 94, performance: 90, quality: 98 },
      { nameFa: "شب", nameEn: "Night", availability: 92, performance: 88, quality: 96 },
    ],
    downtime: { planned: 38, unplanned: 42 },
  },
  {
    id: "L2",
    nameFa: "خط مونتاژ",
    nameEn: "Assembly Line",
    availability: 91,
    performance: 90,
    quality: 95,
    shifts: [
      { nameFa: "روز", nameEn: "Day", availability: 92, performance: 91, quality: 96 },
      { nameFa: "شب", nameEn: "Night", availability: 90, performance: 89, quality: 94 },
    ],
    downtime: { planned: 44, unplanned: 36 },
  },
  {
    id: "L3",
    nameFa: "خط بسته‌بندی",
    nameEn: "Packing Line",
    availability: 90,
    performance: 87,
    quality: 96,
    shifts: [
      { nameFa: "روز", nameEn: "Day", availability: 91, performance: 88, quality: 96 },
      { nameFa: "شب", nameEn: "Night", availability: 89, performance: 86, quality: 95 },
    ],
    downtime: { planned: 40, unplanned: 48 },
  },
];

const energyGoals = [
  { id: "G1", lineFa: "خط X", lineEn: "Line X", carrier: "electricity", baseline: 14800, current: 13200 },
  { id: "G2", lineFa: "خط Y", lineEn: "Line Y", carrier: "gas", baseline: 9300, current: 8520 },
  { id: "G3", lineFa: "خط Z", lineEn: "Line Z", carrier: "air", baseline: 3100, current: 2670 },
];

const downtimeReasons = [
  { reasonFa: "کمبود مواد اولیه", reasonEn: "Material shortage", minutes: 46 },
  { reasonFa: "عیب مکانیکی", reasonEn: "Mechanical fault", minutes: 54 },
  { reasonFa: "تنظیم مجدد", reasonEn: "Changeover", minutes: 32 },
  { reasonFa: "بازرسی کیفیت", reasonEn: "Quality inspection", minutes: 25 },
  { reasonFa: "نگهداری پیشگیرانه", reasonEn: "Preventive maintenance", minutes: 29 },
];

const downtimeScatter = [
  { reasonFa: "عیب مکانیکی", reasonEn: "Mechanical fault", freq: 7, minutes: 54 },
  { reasonFa: "کمبود مواد", reasonEn: "Material shortage", freq: 5, minutes: 42 },
  { reasonFa: "قطع برق", reasonEn: "Power loss", freq: 3, minutes: 70 },
  { reasonFa: "تنظیم اپراتور", reasonEn: "Operator setup", freq: 6, minutes: 28 },
  { reasonFa: "بازرسی کیفیت", reasonEn: "Quality inspection", freq: 4, minutes: 33 },
];

const tariff = { electricity: 0.12, gas: 0.08, air: 0.05 };

const formatNumber = (lang, value, options = {}) =>
  new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", {
    maximumFractionDigits: 1,
    ...options,
  }).format(value);

const computeOee = (availability, performance, quality) =>
  Number(((availability * performance * quality) / 10000).toFixed(1));

const StatPill = ({ icon: Icon, title, value, accent }) => (
  <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl glass p-4">
    <div className="flex items-center gap-3">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ background: `${accent}22`, color: accent }}
      >
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
        <p className="text-lg font-semibold text-white break-words">{value}</p>
      </div>
    </div>
    <div className="h-9 w-9 shrink-0 rounded-full border border-white/10 bg-white/5" />
  </div>
);

function App() {
  const { lang, toggleLanguage } = useLanguage();
  const t = translations[lang];
  const [timeframe, setTimeframe] = useState("week");
  const [energyTargets, setEnergyTargets] = useState({ electricity: 10, gas: 8, air: 12 });
  const [oeeTargets, setOeeTargets] = useState({ L1: 92, L2: 90, L3: 88 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const navItems = useMemo(
    () => [
      { href: "#overview", label: lang === "fa" ? "داشبورد" : "Dashboard" },
      { href: "#energy", label: lang === "fa" ? "انرژی" : "Energy" },
      { href: "#oee", label: lang === "fa" ? "عملکرد" : "OEE" },
      { href: "#reports", label: lang === "fa" ? "گزارش‌ها" : "Reports" },
      { href: "#contact", label: lang === "fa" ? "ارتباط" : "Contact" },
    ],
    [lang]
  );
  const sidebarRef = useRef(null);
  const sidebarTriggerRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const energyData = energyTimeline[timeframe];
  const oeeTrendData = oeeHistory[timeframe];

  const oeeLines = useMemo(
    () =>
      lineShiftData.map((line) => ({
        ...line,
        oee: computeOee(line.availability, line.performance, line.quality),
      })),
    []
  );

  const aggregatedEnergy = useMemo(() => {
    const totals = carriers.map((carrier) => ({
      key: carrier.key,
      value: energyData.reduce((acc, curr) => acc + curr[carrier.key], 0),
    }));
    const cost = energyData.reduce((acc, curr) => acc + curr.cost, 0);
    const totalKwh = totals.reduce((acc, curr) => acc + curr.value, 0);
    return { totals, cost, totalKwh };
  }, [energyData]);

  const costBreakdown = aggregatedEnergy.totals.map((item) => ({
    ...item,
    cost: Number((item.value * tariff[item.key]).toFixed(2)),
  }));

  const energyGoalRows = useMemo(
    () =>
      energyGoals.map((row) => {
        const target = energyTargets[row.carrier];
        const achieved = ((row.baseline - row.current) / row.baseline) * 100;
        const progress = Math.min(100, (achieved / target) * 100);
        return { ...row, target, achieved: achieved.toFixed(1), progress: progress.toFixed(0) };
      }),
    [energyTargets]
  );

  const averageOee = useMemo(
    () => Number((oeeLines.reduce((sum, item) => sum + item.oee, 0) / oeeLines.length).toFixed(1)),
    [oeeLines]
  );

  const tooltipStyles = useMemo(
    () => ({
      backgroundColor: "#0f172a",
      border: "1px solid #1e293b",
      borderRadius: 12,
      maxWidth: 280,
      whiteSpace: "pre-wrap",
      direction: lang === "fa" ? "rtl" : "ltr",
    }),
    [lang]
  );

  const alerts = useMemo(() => {
    const active = [];
    aggregatedEnergy.totals.forEach((item) => {
      const allowed = baselineEnergy[item.key] * (1 - energyTargets[item.key] / 100);
      if (item.value > allowed) {
        active.push({
          type: "energy",
          severity: "high",
          message:
            lang === "fa"
              ? `مصرف ${carriers.find((c) => c.key === item.key).label.fa} بالاتر از هدف است`
              : `${carriers.find((c) => c.key === item.key).label.en} usage is above target`,
        });
      }
    });
    oeeLines.forEach((line) => {
      const target = oeeTargets[line.id];
      if (line.oee < target) {
        active.push({
          type: "oee",
          severity: "medium",
          message:
            lang === "fa"
              ? `${line.nameFa} کمتر از هدف OEE است`
              : `${line.nameEn} below OEE target`,
        });
      }
    });
    return active;
  }, [aggregatedEnergy.totals, energyTargets, lang, oeeLines, oeeTargets]);

  const handleExport = () => {
    if (!isAuthed) return;
    const rows = [
      ["Section", "Label", "Electricity", "Gas", "Air", "Cost"].join(","),
      ...energyData.map((item) =>
        [
          "Energy",
          lang === "fa" ? item.labelFa : item.labelEn,
          item.electricity,
          item.gas,
          item.air,
          item.cost,
        ].join(",")
      ),
      "",
      ["OEE", "Line", "Availability", "Performance", "Quality", "OEE"].join(","),
      ...oeeLines.map((line) =>
        [
          "OEE",
          lang === "fa" ? line.nameFa : line.nameEn,
          line.availability,
          line.performance,
          line.quality,
          line.oee,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "dashboard-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleAuth = (event) => {
    event.preventDefault();
    if (password.trim() === "energy123") {
      setIsAuthed(true);
    }
  };

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const syncDesktopSidebar = () => {
      if (mq.matches) {
        setSidebarOpen(false);
      }
    };
    syncDesktopSidebar();
    mq.addEventListener("change", syncDesktopSidebar);
    return () => mq.removeEventListener("change", syncDesktopSidebar);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      lastFocusedRef.current = document.activeElement;
      const focusable = sidebarRef.current?.querySelectorAll(
        "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      const firstElement = Array.from(focusable || []).find((el) => !el.hasAttribute("disabled"));
      firstElement?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (lastFocusedRef.current instanceof HTMLElement) {
        lastFocusedRef.current.focus();
        lastFocusedRef.current = null;
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
      if (event.key === "Tab" && sidebarRef.current) {
        const focusable = sidebarRef.current.querySelectorAll(
          "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        const items = Array.from(focusable).filter((el) => !el.hasAttribute("disabled"));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey) {
          if (document.activeElement === first || document.activeElement === sidebarRef.current) {
            event.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeSidebar, sidebarOpen]);

  const SidebarContent = ({ isDesktop = false }) => (
    <div className="flex h-full flex-col">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-royal-500 to-teal-500 text-xl font-bold text-white shadow-lg">
            IV
          </div>
          <div>
            <p className="text-sm font-semibold">Smart Vista</p>
            <p className="text-xs text-slate-400">Energy & OEE Cloud</p>
          </div>
        </div>
        <button
          className={`rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/5 ${isDesktop ? "hidden" : ""}`}
          onClick={closeSidebar}
          aria-label={lang === "fa" ? "بستن منو" : "Close navigation"}
        >
          ✕
        </button>
      </div>
      <nav className="space-y-2 text-sm">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-base text-slate-200 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
            onClick={isDesktop ? undefined : closeSidebar}
          >
            <span>{item.label}</span>
            <span className="text-xs text-slate-500 rtl:rotate-180">↗</span>
          </a>
        ))}
      </nav>
      <div className="mt-10 space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-widest text-slate-400">{t.targets}</p>
        <p className="text-base font-semibold text-white">{t.energyHub}</p>
        <p className="text-xs text-slate-400">
          {lang === "fa"
            ? "پایش لحظه‌ای، اهداف و هشدارهای خود را از یک داشبورد لوکس مدیریت کنید."
            : "Manage live monitoring, targets, and alerts from one refined dashboard."}
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">{t.exportData}</span>
          <span className="rounded-full bg-teal-500/20 px-3 py-1 text-teal-100">CSV</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen text-slate-100">
      <div
        className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={closeSidebar}
        aria-hidden={!sidebarOpen}
      />
      <aside
        id="dashboard-drawer"
        ref={sidebarRef}
        role="navigation"
        aria-label={lang === "fa" ? "ناوبری داشبورد" : "Dashboard navigation"}
        aria-hidden={!sidebarOpen}
        tabIndex={sidebarOpen ? 0 : -1}
        className={`glass fixed inset-y-0 right-0 z-50 w-72 max-w-[92vw] transform border-l border-white/10 bg-slate-900/80 p-6 transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? "translate-x-0" : "translate-x-full"} max-h-screen overflow-y-auto`}
      >
        <SidebarContent />
      </aside>

      <aside
        role="navigation"
        aria-label={lang === "fa" ? "ناوبری داشبورد" : "Dashboard navigation"}
        className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:flex lg:w-72"
      >
        <div className="glass flex h-full w-full flex-col overflow-y-auto border-l border-white/10 bg-slate-900/80 p-6">
          <SidebarContent isDesktop />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300 lg:pr-72">
        <header className="sticky top-0 z-20 backdrop-blur-md">
          <div className="flex min-w-0 flex-col gap-3 border-b border-white/10 bg-slate-900/80 px-4 py-4 md:px-6 lg:px-8">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                <button
                  ref={sidebarTriggerRef}
                  className="flex items-center justify-center rounded-xl border border-white/10 p-2 text-slate-200 hover:bg-white/5 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-expanded={sidebarOpen}
                  aria-controls="dashboard-drawer"
                  aria-label={lang === "fa" ? "باز کردن منو" : "Open menu"}
                >
                  <FiMenu size={18} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-royal-500 to-teal-500 text-sm font-bold text-white">
                    IV
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight text-white">Smart Vista</p>
                    <p className="text-xs leading-tight text-slate-400">{t.energyHub}</p>
                  </div>
                </div>
                <nav className="hidden md:flex flex-1 flex-wrap items-center gap-3 lg:gap-4 text-sm text-slate-200">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-3 py-1.5 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  <FiGlobe />
                  {lang === "fa" ? "English" : "فارسی"}
                </button>
                <a
                  href="#overview"
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-royal-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:from-royal-400 hover:to-teal-400"
                >
                  {lang === "fa" ? "مشاهده دمو" : "View demo"}
                </a>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
                <FiActivity />
                <span className="truncate">{t.energyHub}</span>
              </span>
              <span className="hidden items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 sm:flex">
                <FiGlobe />
                <span className="truncate">{t.languageName}</span>
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 pb-10 pt-6">
          <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col space-y-8 px-4 sm:px-6 lg:px-8">
            <section id="overview" className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 min-w-0 space-y-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 p-6 shadow-2xl ring-1 ring-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{t.energyHub}</p>
                    <h1 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl">{t.heroTitle}</h1>
                    <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">{t.heroSubtitle}</p>
                  </div>
                  <div className="hidden rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-slate-200 sm:block">
                    <p className="font-semibold">{lang === "fa" ? "پشتیبانی ۲۴/۷" : "24/7 Support"}</p>
                    <p className="text-slate-400">{lang === "fa" ? "تماس مستقیم با تیم عملیاتی" : "Direct with ops team"}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <StatPill
                    icon={FiZap}
                    title={t.totalEnergy}
                    value={`${formatNumber(lang, aggregatedEnergy.totalKwh, { maximumFractionDigits: 0 })} kWh`}
                    accent="#22d3ee"
                  />
                  <StatPill
                    icon={FiTrendingUp}
                    title={t.energyCost}
                    value={`$${formatNumber(lang, aggregatedEnergy.cost, { maximumFractionDigits: 0 })}`}
                    accent="#a855f7"
                  />
                  <StatPill icon={FiActivity} title={t.oeeScore} value={`${averageOee}%`} accent="#34d399" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {carriers.map((carrier) => {
                    const data = aggregatedEnergy.totals.find((item) => item.key === carrier.key);
                    return (
                      <div key={carrier.key} className="glass min-w-0 rounded-2xl p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-slate-300">
                            {lang === "fa" ? carrier.label.fa : carrier.label.en}
                          </p>
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: carrier.color, boxShadow: `0 0 0 6px ${carrier.color}33` }}
                          />
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {formatNumber(lang, data?.value || 0, { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-slate-400">
                          {lang === "fa" ? "کیلووات ساعت معادل" : "kWh equivalent"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="min-w-0 space-y-4 rounded-3xl glass p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{t.realtimeAlerts}</p>
                  <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-100">
                    {alerts.length || 1}
                  </span>
                </div>
                <div className="space-y-3">
                  {(alerts.length ? alerts : [{ severity: "info", message: lang === "fa" ? "سیستم پایدار است" : "System stable" }]).map(
                    (alert, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm"
                      >
                        <span
                          className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${alert.severity === "high"
                            ? "bg-rose-500/20 text-rose-200"
                            : alert.severity === "medium"
                              ? "bg-amber-500/20 text-amber-100"
                              : "bg-teal-500/20 text-teal-100"
                            }`}
                        >
                          {alert.severity === "high" ? <FiAlertTriangle /> : <FiActivity />}
                        </span>
                        <div>
                          <p className="font-semibold text-white">{alert.message}</p>
                          <p className="text-xs text-slate-400">
                            {lang === "fa" ? "تحلیل خودکار آستانه‌ها" : "Auto threshold analysis"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{t.targets}</p>
                    <FiTarget className="text-teal-200" />
                  </div>
                  <div className="mt-3 space-y-3">
                    {carriers.map((carrier) => (
                      <div key={carrier.key}>
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-300">
                          <span>{lang === "fa" ? carrier.label.fa : carrier.label.en}</span>
                          <span className="text-teal-200">{energyTargets[carrier.key]}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="25"
                          step="1"
                          value={energyTargets[carrier.key]}
                          onChange={(e) =>
                            setEnergyTargets((prev) => ({ ...prev, [carrier.key]: Number(e.target.value) }))
                          }
                          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
                        />
                      </div>
                    ))}
                    <p className="text-[11px] text-slate-400">
                      {lang === "fa"
                        ? "اهداف کاهش مصرف برای محاسبات هشدار به‌کار می‌رود."
                        : "Targets feed alerting and forecast logic."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="energy" className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 min-w-0 rounded-3xl glass p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.energyDashboard}</p>
                    <p className="text-lg font-semibold text-white">{t.usageTrends}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {["week", "month", "year"].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`rounded-full px-3 py-1 text-xs ${timeframe === tf ? "bg-teal-500 text-white" : "bg-white/5 text-slate-300"
                          }`}
                      >
                        {t.timeframes[tf]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 h-[clamp(260px,35vh,420px)] w-full min-w-0 overflow-hidden">
                  <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <AreaChart data={energyData}>
                        <defs>
                          <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey={lang === "fa" ? "labelFa" : "labelEn"}
                          tick={{ fill: "#cbd5e1", fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                        <Tooltip contentStyle={tooltipStyles} labelStyle={{ color: "#e2e8f0" }} />
                        <Legend />
                        {carriers.map((carrier) => (
                          <Area
                            key={carrier.key}
                            type="monotone"
                            dataKey={carrier.key}
                            name={lang === "fa" ? carrier.label.fa : carrier.label.en}
                            stroke={carrier.color}
                            fill={carrier.color}
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="min-w-0 space-y-4 rounded-3xl glass p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{t.energyCostBreakdown}</p>
                  <FiTrendingUp className="text-teal-200" />
                </div>
                <div className="space-y-3">
                  {costBreakdown.map((item) => {
                    const carrier = carriers.find((c) => c.key === item.key);
                    const percent = ((item.cost / aggregatedEnergy.cost) * 100).toFixed(1);
                    return (
                      <div key={item.key} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: carrier.color }} />
                            <span>{lang === "fa" ? carrier.label.fa : carrier.label.en}</span>
                          </div>
                          <span className="text-slate-300">${formatNumber(lang, item.cost)}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${percent}%`, backgroundColor: carrier.color }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {percent}% {lang === "fa" ? "از هزینه دوره" : "of this period spend"}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{t.reductionGoals}</p>
                  <div className="mt-3 space-y-3">
                    {energyGoalRows.map((row) => (
                      <div key={row.id} className="rounded-xl bg-slate-900/50 p-3">
                        <div className="flex items-center justify-between gap-3 text-sm text-white">
                          <span>{lang === "fa" ? row.lineFa : row.lineEn}</span>
                          <span className="text-xs text-teal-200">{row.achieved}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-royal-500 to-teal-500"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {lang === "fa" ? `هدف ${row.target}%` : `Target ${row.target}%`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="min-w-0 space-y-4 rounded-3xl glass p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{t.energyByCarrier}</p>
                  <FiZap className="text-cyan-200" />
                </div>
                <div className="h-[clamp(260px,32vh,380px)] w-full min-w-0">
                  <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={aggregatedEnergy.totals}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="key" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={tooltipStyles}
                          labelStyle={{ color: "#e2e8f0" }}
                          labelFormatter={(label) =>
                            lang === "fa"
                              ? carriers.find((c) => c.key === label).label.fa
                              : carriers.find((c) => c.key === label).label.en
                          }
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {aggregatedEnergy.totals.map((entry) => (
                            <Cell key={entry.key} fill={carriers.find((c) => c.key === entry.key).color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="min-w-0 rounded-3xl glass p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{t.energyCost}</p>
                  <FiTrendingUp className="text-emerald-200" />
                </div>
                <div className="h-[clamp(260px,32vh,380px)] w-full min-w-0">
                  <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie
                          data={costBreakdown}
                          dataKey="cost"
                          nameKey="key"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                        >
                          {costBreakdown.map((entry) => (
                            <Cell key={entry.key} fill={carriers.find((c) => c.key === entry.key).color} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-400">
                  {lang === "fa" ? "تقسیم هزینه حامل‌ها در دوره انتخابی" : "Carrier spend split for selected period"}
                </p>
              </div>

              <div className="min-w-0 rounded-3xl glass p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{t.reductionGoals}</p>
                  <FiTarget className="text-indigo-200" />
                </div>
                <div className="mt-4 space-y-3">
                  {carriers.map((carrier) => {
                    const achieved =
                      ((baselineEnergy[carrier.key] - aggregatedEnergy.totals.find((c) => c.key === carrier.key).value) /
                        baselineEnergy[carrier.key]) *
                      100;
                    const progress = Math.min(100, (achieved / energyTargets[carrier.key]) * 100);
                    return (
                      <div key={carrier.key} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span>{lang === "fa" ? carrier.label.fa : carrier.label.en}</span>
                          <span className="text-xs text-teal-200">{energyTargets[carrier.key]}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-royal-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {lang === "fa" ? `پیشرفت ${progress.toFixed(0)}%` : `Progress ${progress.toFixed(0)}%`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section id="oee" className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 min-w-0 rounded-3xl glass p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">OEE</p>
                    <p className="text-lg font-semibold text-white">{t.oeeByLine}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {oeeLines.map((line) => (
                      <span
                        key={line.id}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300"
                      >
                        {lang === "fa" ? line.nameFa : line.nameEn}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 h-[clamp(260px,35vh,420px)] w-full min-w-0 overflow-hidden">
                  <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <LineChart data={oeeTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey={lang === "fa" ? "labelFa" : "labelEn"}
                          tick={{ fill: "#cbd5e1", fontSize: 12 }}
                        />
                        <YAxis domain={[70, 100]} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                        <Tooltip contentStyle={tooltipStyles} labelStyle={{ color: "#e2e8f0" }} />
                        <Legend />
                        <Line type="monotone" dataKey="lineA" name={lang === "fa" ? "خط A" : "Line A"} stroke="#22d3ee" strokeWidth={2} />
                        <Line type="monotone" dataKey="lineB" name={lang === "fa" ? "خط B" : "Line B"} stroke="#a855f7" strokeWidth={2} />
                        <Line type="monotone" dataKey="lineC" name={lang === "fa" ? "خط C" : "Line C"} stroke="#f97316" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="min-w-0 space-y-4 rounded-3xl glass p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{t.compareTarget}</p>
                  <FiTarget className="text-teal-200" />
                </div>
                <div className="space-y-3">
                  {oeeLines.map((line) => (
                    <div key={line.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-3 text-sm text-white">
                        <span>{lang === "fa" ? line.nameFa : line.nameEn}</span>
                        <span className="text-xs text-teal-200">{line.oee}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-royal-500"
                          style={{ width: `${Math.min(100, (line.oee / oeeTargets[line.id]) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex flex-col gap-1 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                        <span>{lang === "fa" ? `هدف ${oeeTargets[line.id]}%` : `Target ${oeeTargets[line.id]}%`}</span>
                        <span className="text-slate-200">
                          {lang === "fa" ? "شیفت‌ها" : "Shifts"}:{" "}
                          {line.shifts
                            .map((shift) => `${lang === "fa" ? shift.nameFa : shift.nameEn} ${computeOee(shift.availability, shift.performance, shift.quality)}%`)
                            .join(" | ")}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="98"
                        value={oeeTargets[line.id]}
                        onChange={(e) => setOeeTargets((prev) => ({ ...prev, [line.id]: Number(e.target.value) }))}
                        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="min-w-0 rounded-3xl glass p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{t.downtimeReasons}</p>
                  <FiAlertTriangle className="text-amber-200" />
                </div>
                <div className="h-[clamp(260px,35vh,420px)] w-full min-w-0 overflow-hidden">
                  <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={downtimeReasons}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey={lang === "fa" ? "reasonFa" : "reasonEn"}
                          tick={{ fill: "#cbd5e1", fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                        <Tooltip contentStyle={tooltipStyles} labelStyle={{ color: "#e2e8f0" }} />
                        <Bar dataKey="minutes" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="min-w-0 rounded-3xl glass p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{t.scatterTitle}</p>
                  <FiActivity className="text-emerald-200" />
                </div>
                <div className="h-[clamp(260px,35vh,420px)] w-full min-w-0 overflow-hidden">
                  <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis type="number" dataKey="freq" name="Frequency" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                        <YAxis type="number" dataKey="minutes" name="Minutes" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          contentStyle={tooltipStyles}
                          labelStyle={{ color: "#e2e8f0" }}
                          formatter={(value, _name, props) => {
                            const payload = props?.payload?.payload;
                            const label = payload
                              ? lang === "fa"
                                ? payload.reasonFa
                                : payload.reasonEn
                              : "";
                            return [value, label];
                          }}
                        />
                        <Scatter data={downtimeScatter} fill="#a855f7" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="min-w-0 rounded-3xl glass p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{t.targets}</p>
                  <FiTarget className="text-indigo-200" />
                </div>
                <div className="mt-3 space-y-3">
                  {lineShiftData.map((line) => (
                    <div key={line.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-3 text-sm text-white">
                        <span>{lang === "fa" ? line.nameFa : line.nameEn}</span>
                        <span className="text-xs text-teal-200">{computeOee(line.availability, line.performance, line.quality)}%</span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2 text-[11px] text-slate-300 sm:grid-cols-3">
                        <span>{t.availability}: {line.availability}%</span>
                        <span>{t.performance}: {line.performance}%</span>
                        <span>{t.quality}: {line.quality}%</span>
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400">
                        {lang === "fa"
                          ? `توقف برنامه‌ریزی‌شده ${line.downtime.planned}دقیقه / ناخواسته ${line.downtime.unplanned}دقیقه`
                          : `Planned ${line.downtime.planned}m / Unplanned ${line.downtime.unplanned}m`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="reports" className="grid gap-6 lg:grid-cols-3">
              <div className="min-w-0 rounded-3xl glass p-5 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{t.reports}</p>
                  <div className="flex items-center gap-2">
                    <FiDownload className="text-slate-200" />
                    <span className="text-xs text-slate-300">{t.viewReport}</span>
                  </div>
                </div>
                <div className="mt-4 max-w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                  <table className="min-w-[640px] w-full text-xs sm:text-sm">
                    <thead className="bg-white/5 text-start text-slate-400">
                      <tr>
                        <th className="px-4 py-3">{lang === "fa" ? "دوره" : "Period"}</th>
                        <th className="px-4 py-3">{t.totalEnergy}</th>
                        <th className="px-4 py-3">{t.energyCost}</th>
                        <th className="px-4 py-3">OEE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {energyData.map((row, idx) => (
                        <tr key={idx} className="border-t border-white/5 text-white">
                          <td className="px-4 py-3">{lang === "fa" ? row.labelFa : row.labelEn}</td>
                          <td className="px-4 py-3">
                            {formatNumber(lang, row.electricity + row.gas + row.air, { maximumFractionDigits: 0 })} kWh
                          </td>
                          <td className="px-4 py-3">${formatNumber(lang, row.cost)}</td>
                          <td className="px-4 py-3">{formatNumber(lang, averageOee)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="min-w-0 space-y-3 rounded-3xl glass p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{lang === "fa" ? "احراز هویت پایه" : "Basic Authentication"}</p>
                  <FiLock className="text-slate-200" />
                </div>
                <form onSubmit={handleAuth} className="space-y-3">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={lang === "fa" ? "رمز عبور: energy123" : "Password: energy123"}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-500 focus:border-teal-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-royal-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/20"
                  >
                    {isAuthed ? (lang === "fa" ? "ورود انجام شد" : "Authenticated") : lang === "fa" ? "ورود" : "Login"}
                  </button>
                </form>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3 text-sm text-white">
                    <span>{t.exportData}</span>
                    <span className={`text-xs ${isAuthed ? "text-teal-200" : "text-rose-200"}`}>
                      {isAuthed ? (lang === "fa" ? "فعال" : "Ready") : lang === "fa" ? "قفل" : "Locked"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {lang === "fa"
                      ? "برای دریافت خروجی CSV ابتدا ورود انجام دهید."
                      : "Authenticate to enable CSV export."}
                  </p>
                  <button
                    onClick={handleExport}
                    disabled={!isAuthed}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${isAuthed
                      ? "bg-gradient-to-r from-teal-500 to-royal-500 text-white shadow-lg shadow-teal-500/30"
                      : "cursor-not-allowed border border-white/10 bg-white/5 text-slate-400"
                      }`}
                  >
                    <FiDownload />
                    {t.download}
                  </button>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                  <p className="font-semibold text-white">{lang === "fa" ? "امنیت ابری" : "Cloud security"}</p>
                  <p className="mt-1">
                    {lang === "fa"
                      ? "ارتباط رمزنگاری شده و احراز هویت پایه برای مدیریت صفحات حساس."
                      : "Encrypted transport and basic authentication guard sensitive panels."}
                  </p>
                </div>
              </div>
            </section>

            <section id="contact" className="grid gap-6 lg:grid-cols-2">
              <div className="min-w-0 space-y-3 rounded-3xl glass p-6">
                <p className="text-sm font-semibold text-white">{t.contactTitle}</p>
                <p className="text-sm text-slate-300">{t.companyDesc}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Mohammadreza Yousefi</p>
                    <p className="text-sm font-semibold text-white">+98 910 296 8816</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Masoud Bakhshi</p>
                    <p className="text-sm font-semibold text-white">۰۹۱۲۴۷۳۳۲۳۴</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Mohammad Bakhshi</p>
                    <p className="text-sm font-semibold text-white">۰۹۱۲۳۳۱۱۹۲۱</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm font-semibold text-white">Devcodebase.dev@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                  <FiGlobe />
                  <span>شرکت شبکه هوشمند ابتکار ویستا</span>
                </div>
              </div>
              <div className="min-w-0 rounded-3xl bg-gradient-to-br from-royal-500/50 via-teal-500/40 to-slate-900 p-6 text-white shadow-2xl">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">{t.energyHub}</p>
                <h3 className="mt-2 text-2xl font-bold">{lang === "fa" ? "گزارش‌های هوشمند" : "Intelligent reports"}</h3>
                <p className="mt-2 text-sm text-white/80">
                  {lang === "fa"
                    ? "داده‌های انرژی، اهداف OEE، هشدارهای لحظه‌ای و خروجی CSV تنها بخشی از امکانات نسخه نمایشی هستند."
                    : "Energy data, OEE targets, live alerts and CSV export are bundled in this polished demo."}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs text-white/70">{lang === "fa" ? "محیط دو زبانه" : "Bilingual UI"}</p>
                    <p className="text-lg font-semibold">RTL / LTR</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs text-white/70">{lang === "fa" ? "گزارش گیری" : "Reporting"}</p>
                    <p className="text-lg font-semibold">CSV & KPIs</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
