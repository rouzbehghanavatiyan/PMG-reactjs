import React, { useEffect, useMemo, useState } from "react";
import DayMenuCard from "./DayMenuCard";
import type { DailyMenu, MealType } from "./type";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  weeklyMenu: DailyMenu[];
  selections: Record<string, MealType>;
  t: (key: string) => string;
  onSelect?: (dayKey: string, type: MealType) => void;
};

const PAGE_SIZE = 5;

const WeeklyMenuGrid: React.FC<Props> = ({
  weeklyMenu,
  selections,
  t,
  onSelect,
}) => {
  const [page, setPage] = useState(0);

  const pagedMenus = useMemo(() => {
    const chunks: DailyMenu[][] = [];

    for (let i = 0; i < weeklyMenu.length; i += PAGE_SIZE) {
      chunks.push(weeklyMenu.slice(i, i + PAGE_SIZE));
    }

    return chunks;
  }, [weeklyMenu]);

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
    <div className="bg-bmw-surface rounded-2xl">
      <div className="flex border-b-[1px] border-gray-200 pb-3 items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ChevronRight size={24} className="text-bmw-text" />
        </button>
        <div className="text-center">
          <span className="text-xs text-bmw-blue font-bold px-3 py-1 bg-bmw-blue/10 rounded-full">
            هفته{totalPages === 0 ? 0 : page + 1}
          </span>
        </div>
        <button
          onClick={handleNext}
          disabled={totalPages === 0 || page >= totalPages - 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ChevronLeft size={24} className="text-bmw-text" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-5">
        {currentItems.map((item, index) => {
          const itemKey = `${item.menuItemId}-${item.dayKey ?? item.date ?? index}`;

          return (
            <DayMenuCard
              key={itemKey}
              day={item}
              selected={selections[item.menuItemId] ?? "None"}
              t={t}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyMenuGrid;
