import React, { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getReportQuestionFood } from "../../services/dotNet";

// تایپ‌های مدل داده
interface PollOption {
  optionId: string;
  optionText: string;
  answerCount: number;
}

interface PollQuestion {
  questionId: string;
  questionText: string;
  options: PollOption[];
}

interface PollItem {
  pollId: string;
  pollTitle: string;
  questions: PollQuestion[];
}

interface PieDataItem {
  name: string;
  value: number;
  pollId?: string;
  color?: string;
}

const generateDistinctColors = (count: number): string[] => {
  const colors: string[] = [];
  const goldenRatio = 0.618033988749895;
  let hue = Math.random();

  for (let i = 0; i < count; i++) {
    hue = (hue + goldenRatio) % 1;
    const h = Math.floor(hue * 360);
    colors.push(`hsl(${h}, 70%, 50%)`);
  }
  return colors;
};

const SinglePieChart = ({ data }: { data: PieDataItem[] }) => {
  const totalVotes = data.reduce((sum, item) => sum + item.value, 0);
  const displayData =
    totalVotes === 0
      ? [{ name: "بدون رای ثبت شده", value: 1 }]
      : data.filter((d) => d.value > 0);
  const dynamicColors = useMemo(
    () => generateDistinctColors(displayData.length),
    [displayData.length],
  );

  return (
    <div className="h-[220px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={displayData}
            dataKey="value"
            nameKey="name"
            outerRadius={75}
            paddingAngle={0}
          >
            {displayData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  totalVotes === 0
                    ? "#E5E7EB"
                    : dynamicColors[index % dynamicColors.length]
                }
              />
            ))}
          </Pie>
          {totalVotes > 0 && (
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toLocaleString("fa-IR")} رای`,
                name,
              ]}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontFamily: "Vazirmatn, Tahoma, sans-serif",
                direction: "rtl",
                textAlign: "right",
                fontSize: "12px",
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const FoodPieChart: React.FC = () => {
  const [allData, setAllData] = useState<PollItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const handleGetQuestionReport = async () => {
    try {
      setLoading(true);
      const res = await getReportQuestionFood();
      setAllData(res?.data || []);
    } catch (error) {
      console.error("خطا در دریافت گزارش نظرسنجی:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetQuestionReport();
  }, []);

  const getChartDataByFilter = (
    targetOptionKeywords: string[],
    isStaff: boolean,
  ): PieDataItem[] => {
    if (!allData || allData.length === 0) return [];

    return allData
      .map((poll) => {
        let answerCount = 0;

        poll?.questions?.forEach((q, index) => {
          const isStaffQuestion =
            index === 1 ||
            q.questionText?.includes("پرسنل") ||
            q.questionText?.includes("برخورد") ||
            q.questionText?.includes("توزیع");

          if (isStaff ? isStaffQuestion : !isStaffQuestion) {
            q.options?.forEach((opt) => {
              const isMatch = targetOptionKeywords.some((kw) =>
                opt.optionText?.includes(kw),
              );
              if (isMatch) {
                answerCount += opt.answerCount || 0;
              }
            });
          }
        });

        return {
          name: poll.pollTitle || "بدون عنوان",
          pollId: poll.pollId,
          value: answerCount,
        };
      })
      .filter((item) => item.value > 0);
  };

  const foodVeryGood = useMemo(
    () => getChartDataByFilter(["عالی", "خیلی خوب"], false),
    [allData],
  );
  const foodGood = useMemo(
    () => getChartDataByFilter(["خوب"], false),
    [allData],
  );
  const foodMedium = useMemo(
    () => getChartDataByFilter(["متوسط", "بد"], false),
    [allData],
  );
  const foodWeak = useMemo(
    () => getChartDataByFilter(["ضعیف", "خیلی بد"], false),
    [allData],
  );

  const staffVeryGood = useMemo(
    () => getChartDataByFilter(["عالی", "خیلی خوب"], true),
    [allData],
  );
  const staffGood = useMemo(
    () => getChartDataByFilter(["خوب"], true),
    [allData],
  );
  const staffMedium = useMemo(
    () => getChartDataByFilter(["متوسط", "بد"], true),
    [allData],
  );
  const staffWeak = useMemo(
    () => getChartDataByFilter(["ضعیف", "خیلی بد"], true),
    [allData],
  );

  return (
    <div className="mt-6 space-y-12 rounded-xl bg-white p-6 shadow-sm">
      <section>
        <div className="mb-6 flex items-center justify-between pb-3">
          <h3 className="text-base font-bold text-gray-800">
            گزارش کیفیت غذاها (به تفکیک آراء)
          </h3>
          <span className="text-xs text-gray-400">کیفیت و طعم غذا</span>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="flex flex-col items-center rounded-xl border border-gray-100 p-3 shadow-xs">
            <span className="bg-bmw-blue text-white px-3 py-1 rounded-md text-[13px] font-medium">
              عالی / خیلی خوب
            </span>
            <SinglePieChart data={foodVeryGood} />
          </div>

          <div className="flex flex-col items-center rounded-xl border border-gray-100 p-3 shadow-xs">
            <span className="bg-bmw-blue text-white px-3 py-1 rounded-md text-[13px] font-medium">
              خوب
            </span>
            <SinglePieChart data={foodGood} />
          </div>

          <div className="flex flex-col items-center rounded-xl border border-gray-100 p-3 shadow-xs">
            <span className="bg-bmw-blue text-white px-3 py-1 rounded-md text-[13px] font-medium">
              متوسط / بد
            </span>
            <SinglePieChart data={foodMedium} />
          </div>

          <div className="flex flex-col items-center rounded-xl border border-gray-100 p-3 shadow-xs">
            <span className="bg-bmw-blue text-white px-3 py-1 rounded-md text-[13px] font-medium">
              ضعیف / خیلی بد
            </span>
            <SinglePieChart data={foodWeak} />
          </div>
        </div>
      </section>
      <section>
        <div className="mb-6 flex items-center justify-between   pb-3">
          <h3 className="text-base font-bold text-gray-800">
            گزارش عملکرد و برخورد پرسنل (به تفکیک وعده‌ها / روزها)
          </h3>
          <span className="text-xs text-gray-400">نحوه توزیع و برخورد</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="flex flex-col items-center rounded-xl border border-gray-100 p-3 shadow-xs">
            <span className="bg-bmw-blue text-white px-3 py-1 rounded-md text-[13px] font-medium">
              عالی / خیلی خوب
            </span>
            <SinglePieChart data={staffVeryGood} />
          </div>

          <div className="flex flex-col items-center rounded-xl border border-gray-100 p-3 shadow-xs">
            <span className="bg-bmw-blue text-white px-3 py-1 rounded-md text-[13px] font-medium">
              خوب
            </span>
            <SinglePieChart data={staffGood} />
          </div>

          <div className="flex flex-col items-center rounded-xl border border-gray-100 p-3 shadow-xs">
            <span className="bg-bmw-blue text-white px-3 py-1 rounded-md text-[13px] font-medium">
              متوسط / بد
            </span>
            <SinglePieChart data={staffMedium} />
          </div>

          <div className="flex flex-col items-center rounded-xl border border-gray-100 p-3 shadow-xs">
            <span className="bg-bmw-blue text-white px-3 py-1 rounded-md text-[13px] font-medium">
              ضعیف / خیلی بد
            </span>
            <SinglePieChart data={staffWeak} />
          </div>
        </div>
      </section>
    </div>
  );
};
export default FoodPieChart;
