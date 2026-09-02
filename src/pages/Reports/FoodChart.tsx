import React, { useMemo, useState } from "react";
import ModalUI from "../../components/UI/ModalUI";
import Button from "../../components/UI/Button";
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
import { TrendingUp, TrendingDown } from "lucide-react";

interface FoodChartProps {
  showChart: boolean;
  setShowChart: (value: boolean) => void;
  filteredAllUserOrderFood?: any[];
}

const FoodChart: React.FC<FoodChartProps> = ({
  showChart,
  setShowChart,
  filteredAllUserOrderFood = [],
}) => {
  const [activeTab, setActiveTab] = useState<"top" | "bottom">("top");

  const { top5Data, bottom5Data } = useMemo(() => {
    if (!filteredAllUserOrderFood || filteredAllUserOrderFood.length === 0) {
      return { top5Data: [], bottom5Data: [] };
    }

    const formattedData = filteredAllUserOrderFood.map((item) => ({
      foodName: item.FoodName || "نامشخص",
      totalOrders: Number(item?.TotalOrdersCount) || 0,
    }));

    const sortedDesc = [...formattedData].sort(
      (a, b) => b.totalOrders - a.totalOrders,
    );

    const top5 = sortedDesc.slice(0, 5);

    const sortedAsc = [...formattedData].sort(
      (a, b) => a.totalOrders - b.totalOrders,
    );
    const bottom5 = sortedAsc.slice(0, 5);

    return { top5Data: top5, bottom5Data: bottom5 };
  }, [filteredAllUserOrderFood]);

  const isTop = activeTab === "top";
  const currentData = isTop ? top5Data : bottom5Data;

  return (
    <div className="space-y-4 bg-white p-5 rounded-xl shadow-sm">
      <div className="flex justify-center gap-2 p-1 bg-slate-100 rounded-lg max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab("top")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            isTop
              ? "bg-white text-[#0066B1] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <TrendingUp size={14} />۵ غذای برتر
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bottom")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            !isTop
              ? "bg-white text-rose-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <TrendingDown size={14} />۵ غذای کم‌طرفدار
        </button>
      </div>
      <div className="w-full h-80 pt-2" dir="ltr">
        {currentData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            داده‌ای برای نمایش یافت نشد.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentData}
              margin={{
                top: 15,
                right: 25,
                left: 0,
                bottom: 45,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis
                dataKey="foodName"
                stroke="#6B7280"
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                tick={{
                  fill: "#4B5563",
                  fontSize: 11,
                  fontFamily: "Vazirmatn, Tahoma, sans-serif",
                }}
              />

              <YAxis
                stroke="#6B7280"
                axisLine={false}
                tickLine={false}
                width={35}
                tick={{
                  fill: "#6B7280",
                  fontSize: 11,
                }}
                allowDecimals={false}
              />

              <Tooltip
                cursor={{
                  fill: isTop
                    ? "rgba(0, 102, 177, 0.05)"
                    : "rgba(225, 29, 72, 0.05)",
                }}
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontFamily: "Vazirmatn, Tahoma, sans-serif",
                  direction: "rtl",
                  textAlign: "right",
                }}
                formatter={(value: number) => [`${value} پرس`, "تعداد سفارش"]}
                labelFormatter={(label) => `نام غذا: ${label}`}
              />
              <Bar dataKey="totalOrders" radius={[6, 6, 0, 0]} maxBarSize={45}>
                {currentData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      isTop
                        ? index === 0
                          ? "#0066B1"
                          : "#3B82F6"
                        : index === 0
                          ? "#E11D48"
                          : "#F87171"
                    }
                    className="transition-all duration-200 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default FoodChart;
