import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Download, FileText, Lock } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import type { SalaryData } from "../utils/masterTypes";

const rawData: SalaryData[] = [
  { month: "Jan", base: 4500, bonus: 200, deductions: 100, total: 4600 },
  { month: "Feb", base: 4500, bonus: 350, deductions: 100, total: 4750 },
  { month: "Mar", base: 4500, bonus: 200, deductions: 100, total: 4600 },
  { month: "Apr", base: 4700, bonus: 400, deductions: 150, total: 4950 },
  { month: "May", base: 4700, bonus: 250, deductions: 150, total: 4800 },
  { month: "Jun", base: 4700, bonus: 600, deductions: 150, total: 5150 },
];

const Payslips: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isFa = language === "fa";

  // Currency Configuration
  // We scale the mock data values by 50,000 for Rial to make it look realistic (e.g. 4500 -> 225,000,000)
  const exchangeRate = isFa ? 50000 : 1;
  const currencySymbol = isFa ? "ریال" : "$";

  const formatCurrency = (val: number, withSign: boolean = false) => {
    const amount = val * exchangeRate;
    const formatted = Math.abs(amount).toLocaleString(isFa ? "fa-IR" : "en-US");
    const sign = withSign ? (val > 0 ? "+" : val < 0 ? "-" : "") : ""; // Handle passed-in logic or inherent sign

    // For input like -150, val is negative.
    // If withSign is true, we want to ensure we show the sign.
    // If val is strictly positive and withSign is true, we add '+'.
    const displaySign = val < 0 ? "-" : withSign && val > 0 ? "+" : "";

    if (isFa) {
      // Persian: +۲۵۰,۰۰۰ ریال
      return `${displaySign}${formatted} ${currencySymbol}`;
    }
    // English: +$250
    return `${displaySign}${currencySymbol}${formatted}`;
  };

  // Translate month names for the chart
  const data = rawData.map((d, index) => ({
    ...d,
    month: t("months")[index] || d.month,
  }));

  const paymentDate = isFa ? "۷ تیر ۱۴۰۲" : "June 28, 2023";
  const paidOnText = isFa
    ? `پرداخت شده در ${paymentDate}`
    : `Paid on ${paymentDate}`;

  // Get latest month data for the summary card
  const latest = rawData[rawData.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bmw-text">
            {t("salary_title")}
          </h1>
          <p className="text-bmw-textSec text-sm mt-1">{t("salary_sub")}</p>
        </div>
        <button className="flex items-center gap-2 bg-bmw-surface border border-bmw-border px-4 py-2 rounded hover:border-bmw-blue transition-colors">
          <Lock size={16} className="text-bmw-blue" />
          <span className="text-sm font-medium text-bmw-text">
            {t("password_protected")}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-bmw-text mb-6">
            {t("income_overview")}
          </h3>
          <div className="h-72 w-full" style={{ direction: "ltr" }}>
            {/* Force LTR for chart to keep X-axis consistent left-to-right for time */}
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === "dark" ? "#333" : "#E5E7EB"}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke={theme === "dark" ? "#666" : "#9CA3AF"}
                  tick={{
                    fill: theme === "dark" ? "#999" : "#6B7280",
                    fontSize: 12,
                    fontFamily: isFa ? "Vazirmatn" : "Inter",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke={theme === "dark" ? "#666" : "#9CA3AF"}
                  tick={{
                    fill: theme === "dark" ? "#999" : "#6B7280",
                    fontSize: 12,
                    fontFamily: isFa ? "Vazirmatn" : "Inter",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={isFa ? 50 : 40}
                  tickFormatter={(val) => {
                    if (isFa) {
                      // Show in Millions for Persian to save space (e.g. 200 M)
                      const millions = (val * exchangeRate) / 1000000;
                      return `${millions.toLocaleString("fa-IR")} م`;
                    }
                    return `$${val}`;
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
                    border:
                      theme === "dark" ? "1px solid #444" : "1px solid #E5E7EB",
                    borderRadius: "4px",
                    color: theme === "dark" ? "#fff" : "#111827",
                    fontFamily: isFa ? "Vazirmatn" : "Inter",
                    direction: isFa ? "rtl" : "ltr",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  cursor={{
                    fill:
                      theme === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)",
                  }}
                  formatter={(value: number) => [
                    formatCurrency(value),
                    t("table.size")?.replace("Size", "Amount") || "Amount",
                  ]}
                  labelStyle={{ textAlign: isFa ? "right" : "left" }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === data.length - 1
                          ? "#0066B1"
                          : theme === "dark"
                            ? "#4A4A4A"
                            : "#9CA3AF"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-bmw-blue rounded-lg p-6 text-white flex flex-col justify-between shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
          <div>
            <p className="text-blue-100 font-medium mb-1">
              {t("last_net_salary")}
            </p>
            <h2 className="text-4xl font-bold tracking-tight" dir="ltr">
              {formatCurrency(latest.total)}
            </h2>
            <p className="text-sm text-blue-200 mt-2">{paidOnText}</p>
          </div>

          <div className="space-y-3 mt-8">
            <div className="flex justify-between text-sm border-b border-white/20 pb-2">
              <span className="text-blue-100">{t("base_salary")}</span>
              <span className="font-semibold" dir="ltr">
                {formatCurrency(latest.base)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-b border-white/20 pb-2">
              <span className="text-blue-100">{t("overtime_bonus")}</span>
              <span className="font-semibold text-green-300" dir="ltr">
                {formatCurrency(latest.bonus, true)}
              </span>
            </div>
            <div className="flex justify-between text-sm pb-2">
              <span className="text-blue-100">{t("deductions")}</span>
              <span className="font-semibold text-red-300" dir="ltr">
                {formatCurrency(-latest.deductions)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="bg-bmw-surface 
                w-full 
                max-h-[60vh] md:max-h-[400px] 
                border border-bmw-border 
                rounded-lg 
                shadow-sm 
                flex flex-col"
      >
        <div className="p-4 border-b border-bmw-border flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-bmw-text">
            {t("history_title")}
          </h3>
          <button className="text-sm text-bmw-blue hover:text-blue-400 transition-colors">
            {t("view_history")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-bmw-border">
          {data
            .slice()
            .reverse()
            .map((item, idx) => (
              <div
                key={idx}
                className="p-4 flex items-center justify-between hover:bg-bmw-hover transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-bmw-base rounded text-bmw-textSec group-hover:text-bmw-blue transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-bmw-text font-medium">
                      Salary Slip - {item.month} 2023
                    </p>
                    <p className="text-xs text-bmw-textSec">
                      {t("processed_via")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                  <span
                    className="text-bmw-text font-mono hidden sm:block"
                    dir="ltr"
                  >
                    {formatCurrency(item.total)}
                  </span>

                  <button className="p-2 text-bmw-textSec hover:text-bmw-text transition-colors">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Payslips;
