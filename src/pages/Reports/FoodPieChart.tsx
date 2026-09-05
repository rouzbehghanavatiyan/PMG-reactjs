import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PieData {
  name: string;
  value: number;
}

const testData: PieData[] = [
  { name: "غذای ایرانی", value: 45 },
  { name: "فست فود", value: 30 },
  { name: "غذای دریایی", value: 15 },
  { name: "دسر", value: 10 },
];

const COLORS = ["#0066B1", "#3B82F6", "#60A5FA", "#93C5FD"];

const SinglePieChart = () => (
  <div className="h-[250px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={testData}
          dataKey="value"
          nameKey="name"
          outerRadius={80} 
        >
          {testData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip
          formatter={(value) => [
            `${Number(value).toLocaleString("fa-IR")} مورد`,
            "تعداد",
          ]}
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            fontFamily: "Vazirmatn, Tahoma, sans-serif",
            direction: "rtl",
            textAlign: "right",
          }}
        />

        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span
              style={{
                fontFamily: "Vazirmatn, Tahoma, sans-serif",
                fontSize: 12,
              }}
            >
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const FoodPieChart: React.FC = () => {
  return (
    <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
      <h3 className="mb-6 text-center text-sm font-semibold text-[#0066B1]">
        پاسخ نظرسنجی کاربران به غذاها
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SinglePieChart />
        <SinglePieChart />
        <SinglePieChart />
        <SinglePieChart />
      </div>
    </div>
  );
};

export default FoodPieChart;
