import React, { useEffect, useState } from "react";
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
import { getSalaryPerMonth } from "../services/dotNet";
import { asyncWrapper } from "../utils/asyncWrapper";
import { useToast } from "../hooks/useToast";
import { useAppSelector } from "../features/store";
import StringHelpers from "../utils/stringHelpers";

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
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const [allAmount, setAllAmount] = useState([]);
  const lastPay = allAmount
    ?.filter((item: any) => Number(item?.netPayment) > 0)
    ?.reduce((latest: any, current: any) => {
      if (!latest) return current;

      const currentYear = Number(current.year);
      const latestYear = Number(latest.year);

      const currentMonth = Number(current.month);
      const latestMonth = Number(latest.month);

      if (
        currentYear > latestYear ||
        (currentYear === latestYear && currentMonth > latestMonth)
      ) {
        return current;
      }

      return latest;
    }, null);

  const { theme } = useTheme();
  const toast = useToast();
  const isFa = language === "fa";
  const exchangeRate = isFa ? 50000 : 1;
  const currencySymbol = isFa ? "ریال" : "$";

  const data =
    allAmount
      ?.filter((item: any) => Number(item?.netPayment) > 0)
      ?.sort((a: any, b: any) => {
        const yearDiff = Number(a.year) - Number(b.year);
        if (yearDiff !== 0) return yearDiff;

        return Number(a.month) - Number(b.month);
      })
      ?.map((item: any) => ({
        month: StringHelpers.toPersianMonthName(item.month),
        total: Number(item.netPayment),
        year: item.year,
        rawMonth: item.month,
      })) ?? [];
  const handleGetSalaryPerMonth = asyncWrapper(async () => {
    const res = await getSalaryPerMonth(Number(userLogin?.PersonalCode));
    const { code, data, message }: any = res;
    setAllAmount(data);
  }, toast);

  const latest = rawData[rawData.length - 1];

  useEffect(() => {
    if (!userLogin?.PersonalCode) return;
    handleGetSalaryPerMonth();
  }, [userLogin?.PersonalCode]);

  console.log(lastPay);

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
        <div className="lg:col-span-2 bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-bmw-text mb-6">
            {t("income_overview")}
          </h3>
          <div className="h-72 w-full" style={{ direction: "ltr" }}>
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
                  width={isFa ? 80 : 60}
                  tickFormatter={(val) => {
                    if (isFa) {
                      const millions = Number(val) / 1000000;
                      return ` ${millions.toLocaleString("fa-IR")} م`;
                    }
                    return Number(val).toLocaleString("en-US");
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
                    `${StringHelpers.toPrice(value)} ریال`,
                    "دریافتی",
                  ]}
                  labelFormatter={(label) => `ماه ${label}`}
                  labelStyle={{ textAlign: isFa ? "right" : "left" }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={40}>
                  {data.map((entry: any, index: number) => (
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
              {StringHelpers?.toPrice(lastPay?.netPayment)}
            </h2>
            <p className="text-sm text-blue-200 mt-2">
              پرداخت شده در {StringHelpers?.toPersianMonthName(lastPay?.month)}{" "}
              {lastPay?.year}
            </p>
          </div>
          <div className="space-y-3 mt-8">
            <div className="flex justify-between text-sm border-b border-white/20 pb-2">
              <span className="text-blue-100">{t("base_salary")}</span>
              <span className="font-semibold" dir="ltr">
                {StringHelpers?.toPrice(lastPay?.baseAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-b border-white/20 pb-2">
              <span className="text-blue-100">{t("overtime_bonus")}</span>
              <span className="font-semibold text-green-300" dir="ltr">
                {StringHelpers?.toPrice(lastPay?.totalBenefits)}
              </span>
            </div>
            <div className="flex justify-between text-sm pb-2">
              <span className="text-blue-100">{t("deductions")}</span>
              <span className="font-semibold text-red-300" dir="ltr">
                - {StringHelpers?.toPrice(lastPay?.totalDeductions)}
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

                <div className="flex  items-center  gap-4 md:gap-6">
                  <span
                    className="text-bmw-text  font-mono hidden sm:block"
                    dir="ltr"
                  >
                    {/* {formatCurrency(item.total)} */}
                  </span>

                  <button className="p-2 text-bmw-textSec hover:text-bmw-text transition-colors">
                    <Download
                      size={18}
                      className="cursor-pointer hover:text-bmw-blue"
                    />
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
