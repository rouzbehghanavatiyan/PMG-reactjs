import React, { useMemo } from "react";
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
import FoodPieChart from "./FoodPieChart";

interface FoodChartProps {
  filteredAllUserOrderFood?: any[];
}

interface FoodChartData {
  foodName: string;
  totalOrders: number;
}

const FoodChart: React.FC<FoodChartProps> = ({
  filteredAllUserOrderFood = [],
}) => {
  const { top10Data, bottom10Data } = useMemo(() => {
    const formattedData: FoodChartData[] = filteredAllUserOrderFood.map(
      (item) => ({
        foodName: item?.FoodName || "نامشخص",
        totalOrders: Number(item?.TotalOrdersCount) || 0,
        orderDate: item?.OrderDate || null,
      }),
    );

    const top10 = [...formattedData]
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 10);

    const bottom10 = [...formattedData]
      .sort((a, b) => a.totalOrders - b.totalOrders)
      .slice(0, 10);

    return {
      top10Data: top10,
      bottom10Data: bottom10,
    };
  }, [filteredAllUserOrderFood]);

  const formatPersianDate = (date: string | null) => {
    if (!date) return "نامشخص";

    try {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date));
    } catch {
      return "نامشخص";
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const data = payload[0].payload as FoodChartData;

    return (
      <div
        className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
        dir="rtl"
      >
        <p className="mb-2 text-sm font-semibold text-slate-800">
          {data.foodName}
        </p>

        <p className="text-xs text-slate-600">
          تعداد کاربران ثبت‌کننده:
          <span className="mr-1 font-bold text-[#0066B1]">
            {data.totalOrders.toLocaleString("fa-IR")}
          </span>
        </p>

        <p className="mt-2 text-xs text-slate-600">
          تاریخ:
          <span className="mr-1 font-bold text-slate-800">
            {formatPersianDate(data.orderDate)}
          </span>
        </p>
      </div>
    );
  };

  const renderChart = (data: FoodChartData[], type: "top" | "bottom") => {
    const isTop = type === "top";

    if (data.length === 0) {
      return (
        <div className="flex h-80 items-center justify-center text-xs text-slate-400">
          داده‌ای برای نمایش یافت نشد.
        </div>
      );
    }

    return (
      <>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 15,
              right: 25,
              left: 0,
              bottom: 55,
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
              angle={-25}
              textAnchor="end"
              height={70}
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
              allowDecimals={false}
              tick={{
                fill: "#6B7280",
                fontSize: 11,
                fontFamily: "Vazirmatn, Tahoma, sans-serif",
              }}
            />

            <Tooltip
              cursor={{
                fill: isTop
                  ? "rgba(0, 102, 177, 0.05)"
                  : "rgba(225, 29, 72, 0.05)",
              }}
              content={<CustomTooltip />}
            />

            <Bar dataKey="totalOrders" radius={[6, 6, 0, 0]} maxBarSize={45}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${type}-${index}`}
                  fill={
                    isTop
                      ? index === 0
                        ? "#0066B1"
                        : "#3B82F6"
                      : index === 0
                        ? "#E11D48"
                        : "#F87171"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </>
    );
  };

  return (
    <>
      <div className="space-y-6 rounded-xl bg-white p-5 shadow-sm">
        <section>
          <div className="mb-3 flex items-center justify-center gap-2">
            <TrendingUp size={18} className="text-[#0066B1]" />

            <h3 className="text-sm font-semibold text-[#0066B1]">
              ۱۰ غذای برتر
            </h3>
          </div>

          <div className="h-80 w-full" dir="ltr">
            {renderChart(top10Data, "top")}
          </div>
        </section>

        {/* <section>
          <div className="mb-3 flex items-center justify-center gap-2">
            <TrendingDown size={18} className="text-rose-600" />

            <h3 className="text-sm font-semibold text-rose-600">
              ۱۰ غذای کم‌طرفدار
            </h3>
          </div>

          <div className="h-80 w-full" dir="ltr">
            {renderChart(bottom10Data, "bottom")}
          </div>
        </section> */}
      </div>
      <FoodPieChart />
     
    </>
  );
};

export default FoodChart;
