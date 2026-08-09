import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WeeklyMenuGrid from "./WeeklyMenuGrid";
import type { DailyMenu } from "./type";
const PAGE_SIZE = 5;

const FoodOrderHistory: React.FC<any> = ({
  mockHistoryData,
  t,

  fixMissingDayHistory,
}) => {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const currentWeekData = mockHistoryData[selectedWeekIndex];
  const [page, setPage] = useState(0);

  const handleNextWeek = () => {
    if (selectedWeekIndex > 0) {
      setSelectedWeekIndex(selectedWeekIndex - 1);
    }
  };
  const handlePrevWeek = () => {
    if (selectedWeekIndex < mockHistoryData.length - 1) {
      setSelectedWeekIndex(selectedWeekIndex + 1);
    }
  };

  const pagedMenus = useMemo(() => {
    const chunks: DailyMenu[][] = [];

    for (let i = 0; i < fixMissingDayHistory?.length; i += PAGE_SIZE) {
      chunks.push(fixMissingDayHistory?.slice(i, i + PAGE_SIZE));
    }

    return chunks;
  }, [fixMissingDayHistory]);
  const totalPages = pagedMenus.length;
  const currentItems = pagedMenus[page] ?? [];

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(totalPages - 1, 0));
    }
  }, [page, totalPages]);

  const handlePrev = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  return (
    <div className="rounded-xl p-3 space-y-6 shadow-sm border border-bmw-border bg-bmw-surface">
      <div className="flex items-center justify-between bg-bmw-surface border-b-[1px] pb-4 border-bmw-border">
        <button
          onClick={handlePrev}
          disabled={selectedWeekIndex === mockHistoryData.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ChevronRight size={24} className="text-bmw-text" />
        </button>
        <div className="text-center">
          <span className="text-xs text-bmw-blue font-bold px-3 py-1 bg-bmw-blue/10 rounded-full">
            {currentWeekData?.weekLabel}
          </span>
        </div>
        <button
          onClick={handleNext}
          disabled={selectedWeekIndex === 0}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ChevronLeft size={24} className="text-bmw-text" />
        </button>
      </div>
      <WeeklyMenuGrid
        currentItems={fixMissingDayHistory}
        weeklyMenu={currentWeekData?.menu}
        selections={currentWeekData?.selections}
        t={t}
      />
    </div>
  );
};

export default FoodOrderHistory;
