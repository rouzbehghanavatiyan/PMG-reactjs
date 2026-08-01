import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WeeklyMenuGrid from "./WeeklyMenuGrid";

const FoodOrderHistory: React.FC<any> = ({ mockHistoryData }) => {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const currentWeekData = mockHistoryData[selectedWeekIndex];
  


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

  return (
    <div className="rounded-xl p-3 space-y-6 shadow-sm border border-bmw-border bg-bmw-surface">
      <div className="flex items-center justify-between bg-bmw-surface border-b-[1px] pb-4 border-bmw-border">
        <button
          onClick={handlePrevWeek}
          disabled={selectedWeekIndex === mockHistoryData.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ChevronRight size={24} className="text-bmw-text" />
        </button>
        <div className="text-center">
          <span className="text-xs text-bmw-blue font-bold px-3 py-1 bg-bmw-blue/10 rounded-full">
            {currentWeekData.weekLabel}
          </span>
        </div>
        <button
          onClick={handleNextWeek}
          disabled={selectedWeekIndex === 0}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ChevronLeft size={24} className="text-bmw-text" />
        </button>
      </div>
      <div className="">
        <WeeklyMenuGrid
          weeklyMenu={currentWeekData.menu}
          selections={currentWeekData.selections}
          t={t}
        />
      </div>
    </div>
  );
};

export default FoodOrderHistory;
