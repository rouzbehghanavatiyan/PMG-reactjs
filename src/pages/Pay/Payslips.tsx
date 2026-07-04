import React, { useRef, useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Download, FileText, Lock } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import type { SalaryData } from "../../utils/masterTypes";
import { getSalaryPerMonth } from "../../services/dotNet";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { useToast } from "../../hooks/useToast";
import { useAppSelector } from "../../features/store";
import StringHelpers from "../../utils/stringHelpers";
import PayPrintPerMonth from "./PayPrintPerMonth";
import { useMediaQuery } from "react-responsive";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";

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
  const printRef = useRef<HTMLDivElement | null>(null);
  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );

  const [pendingPrintItem, setPendingPrintItem] = useState<any>(null);
  const [allAmount, setAllAmount] = useState<any>([]);
  const [historyItem, setHistoryItem] = useState({});
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const lastPay = allAmount?.find((item: any) => {
    const netPayment = item.others?.find(
      (x: any) => x.element === "خالص پرداختی",
    );

    return Number(netPayment?.value ?? 0) > 0;
  });

  const benefits = lastPay?.benefits?.map((item: any) => ({
    title: item.element,
    amount: item.value,
  }));

  const getValue = (list: any[] = [], element: string) =>
    list.find((item) => item.element === element)?.value ?? 0;

  const baseSalary = getValue(lastPay?.benefits, "حقوق پایه");
  const overtime = getValue(lastPay?.benefits, "اضافه کاری");
  const totalBenefits = getValue(lastPay?.others, "جمع مزایا");
  const totalDeductions = getValue(lastPay?.others, "جمع کسور");
  const netPayment = getValue(lastPay?.others, "خالص پرداختی");
  const tax = getValue(lastPay?.deductions, "مالیات");

  console.log();

  const { theme } = useTheme();
  const toast = useToast();
  const isFa = language === "fa";

  const data =
    allAmount
      ?.map((item: any) => {
        const netPayment =
          item?.others?.find((x: any) => x.element === "خالص پرداختی")?.value ??
          0;

        return {
          month: StringHelpers.toPersianMonthName(item.month),
          total: Number(netPayment),
          year: item.year,
          rawMonth: item.month,
        };
      })
      ?.filter((item: any) => item.total > 0)
      ?.sort((a: any, b: any) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.rawMonth - b.rawMonth;
      }) ?? [];

  const handleGetSalaryPerMonth = asyncWrapper(async () => {
    const res = await getSalaryPerMonth(Number(userLogin?.personalCode));
    const { code, data, message }: any = res;
    setAllAmount(data);
  }, toast);

  useEffect(() => {
    if (!userLogin?.personalCode) return;
    handleGetSalaryPerMonth();
  }, [userLogin?.personalCode]);

  console.log(historyItem);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `فیش-حقوقی- ${historyItem?.month}-${historyItem?.year}`,
  });

  const handlePrintHistoryPerMonth = (item: any) => {
    setHistoryItem(item);
    setPendingPrintItem(item);
    if (isMobile) {
      handleDownloadPDF(item);
    } else {
      handlePrint();
    }
  };

  useEffect(() => {
    if (!pendingPrintItem) return;

    if (isMobile) {
      handleDownloadPDF(pendingPrintItem);
    } else {
      handlePrint();
    }

    setPendingPrintItem(null);
  }, [historyItem]);

  const handleDownloadPDF = async (item: any) => {
    console.log(item);

    const element = printRef.current;

    if (!element) {
      console.error("Print element not found");
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 5;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`فیش-حقوقی-${item.month}-${item.year}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
    }
  };

  return (
    <>
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
        {/* header pay */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-bmw-text mb-6">
              {t("income_overview")}
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === "dark" ? "#333" : "#E5E7EB"}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    stroke={theme === "dark" ? "#666" : "#9CA3AF"}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: theme === "dark" ? "#999" : "#6B7280",
                      fontSize: 12,
                      fontFamily: isFa ? "Vazirmatn" : "Inter",
                    }}
                  />

                  <YAxis
                    stroke={theme === "dark" ? "#666" : "#9CA3AF"}
                    axisLine={false}
                    tickLine={false}
                    width={isFa ? 80 : 60}
                    tick={{
                      fill: theme === "dark" ? "#999" : "#6B7280",
                      fontSize: 12,
                      fontFamily: isFa ? "Vazirmatn" : "Inter",
                    }}
                    tickFormatter={(value) =>
                      isFa
                        ? `${(Number(value) / 1_000_000).toLocaleString("fa-IR")} م`
                        : Number(value).toLocaleString("en-US")
                    }
                  />

                  <Tooltip
                    cursor={{
                      fill:
                        theme === "dark"
                          ? "rgba(255,255,255,.05)"
                          : "rgba(0,0,0,.05)",
                    }}
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1C1C1C" : "#FFF",
                      border:
                        theme === "dark"
                          ? "1px solid #444"
                          : "1px solid #E5E7EB",
                      borderRadius: 8,
                      color: theme === "dark" ? "#FFF" : "#111827",
                      fontFamily: isFa ? "Vazirmatn" : "Inter",
                    }}
                    formatter={(value: number) => [
                      `${StringHelpers.toPrice(value)} ریال`,
                      "دریافتی",
                    ]}
                    labelFormatter={(label) => `ماه ${label}`}
                  />

                  <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {data.map((_, index) => (
                      <Cell
                        key={index}
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
                {StringHelpers?.toPrice(netPayment)}
              </h2>
              <p className="text-sm text-blue-200 mt-2">
                پرداخت شده در{" "}
                {StringHelpers?.toPersianMonthName(lastPay?.month)}{" "}
                {lastPay?.year}
              </p>
            </div>
            <div className="space-y-3 mt-8">
              <div className="flex justify-between text-sm border-b border-white/20 pb-2">
                <span className="text-blue-100">{t("base_salary")}</span>
                <span className="font-semibold" dir="ltr">
                  {StringHelpers?.toPrice(baseSalary)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-b border-white/20 pb-2">
                <span className="text-blue-100">{t("overtime_bonus")}</span>
                <span className="font-semibold text-green-300" dir="ltr">
                  {StringHelpers?.toPrice(totalBenefits)}
                </span>
              </div>
              <div className="flex justify-between text-sm pb-2">
                <span className="text-blue-100">{t("deductions")}</span>
                <span className="font-semibold text-red-300" dir="ltr">
                  - {StringHelpers?.toPrice(totalDeductions)}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* history pay */}
        <div
          className="bg-bmw-surface
                w-full
                max-h-[60vh] md:max-h-[400px]
                border border-bmw-border
                rounded-lg
                shadow-sm
                flex flex-col"
        >
          <div className="p-4 border-b border-bmw-bord flex justify-between items-center shrink-0">
            <h3 className="text-lg font-bold text-bmw-text">
              {t("history_title")}
            </h3>
            <button className="text-sm text-bmw-blue hover:text-blue-400 transition-colors">
              {t("view_history")}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-bmw-border">
            {allAmount.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between hover:bg-bmw-hover transition-colors group"
                >
                  <div className="flex items-center gap-4 group-hover:text-bmw-blue">
                    <div className="p-2 bg-bmw-base rounded text-bmw-textSec group-hover:text-bmw-blue transition-colors">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-bmw-text font-medium group-hover:text-bmw-blue">
                        فیش حقوقی -
                        {StringHelpers.toPersianMonthName(item?.month)}/
                        {item?.year}
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
                    <button
                      onClick={() => handlePrintHistoryPerMonth(item)}
                      className="p-2 text-bmw-textSec hover:text-bmw-text transition-colors"
                    >
                      <Download
                        size={18}
                        className="cursor-pointer hover:text-bmw-blue"
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          left: "-2000px",
          top: "0",
          width: "900px",
          background: "#ffffff",
        }}
      >
        <div ref={printRef}>
          <PayPrintPerMonth historyItem={historyItem} />
        </div>
      </div>
    </>
  );
};

export default Payslips;
