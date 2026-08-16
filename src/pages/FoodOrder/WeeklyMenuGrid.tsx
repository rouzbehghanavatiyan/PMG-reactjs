import React, { useEffect, useMemo, useState } from "react";
import DayMenuCard from "./DayMenuCard";
import type { DailyMenu, MealType } from "./type";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  weeklyMenu: DailyMenu[];
  selections: Record<string | number, MealType>;
  t: (key: string) => string;
  isHistory?: boolean;
  handleDelete: any;
  onSelect?: (menuItemId: string | number, type: MealType) => void;
};

const PAGE_SIZE = 5;

const isSameDate = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getItemDate = (item: any): Date | null => {
  const rawDate =
    item?.createDate ??
    item?.CreateDate ??
    item?.date ??
    item?.registerDateMenu ??
    null;

  if (!rawDate) return null;

  const parsedDate = new Date(rawDate);

  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate;
};

const WeeklyMenuGrid: React.FC<Props> = ({
  weeklyMenu,
  selections,
  isHistory,
  handleDelete,
  t,
  onSelect,
}) => {
  const [page, setPage] = useState(0);

  const pagedMenus = useMemo(() => {
    const chunks: DailyMenu[][] = [];

    for (let i = 0; i < weeklyMenu?.length; i += PAGE_SIZE) {
      chunks.push(weeklyMenu.slice(i, i + PAGE_SIZE));
    }

    return chunks;
  }, [weeklyMenu]);

  const totalPages = pagedMenus.length;
  const currentItems: any = pagedMenus[page] ?? [];

  useEffect(() => {
    if (!Array.isArray(weeklyMenu) || weeklyMenu.length === 0) {
      setPage(0);
      return;
    }

    const now = new Date();

    const todayItemIndex = weeklyMenu.findIndex((item: any) => {
      const itemDate = getItemDate(item);
      if (!itemDate) return false;

      return isSameDate(itemDate, now);
    });

    if (todayItemIndex >= 0) {
      const targetPage = Math.floor(todayItemIndex / PAGE_SIZE);
      setPage(targetPage);
    } else {
      setPage(0);
    }
  }, [weeklyMenu]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(totalPages - 1, 0));
    }
  }, [page, totalPages]);

  const getWeekTitle = (index: number) => {
    return `صفحه ${index + 1}`;
  };

  const currentItemsWithFixedDate = useMemo(() => {
    if (!currentItems.length) return [];

    const firstDate =
      (currentItems[0] as any)?.createDate ??
      (currentItems[0] as any)?.CreateDate ??
      currentItems[0]?.registerDateMenu;

    if (!firstDate) return currentItems;

    const startDate = new Date(firstDate);

    if (Number.isNaN(startDate.getTime())) return currentItems;

    return currentItems.map((item: any, index: number) => {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + index);

      return {
        ...item,
        registerDateMenu: nextDate.toISOString(),
      };
    });
  }, [currentItems]);

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
          type="button"
          onClick={handlePrev}
          disabled={page === 0}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ChevronRight size={24} className="text-bmw-text" />
        </button>

        <div className="text-center">
          <span className="text-xs text-bmw-blue font-bold px-3 py-1 bg-bmw-blue/10 rounded-full">
            {getWeekTitle(page)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleNext}
          disabled={totalPages === 0 || page >= totalPages - 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ChevronLeft size={24} className="text-bmw-text" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 lg:grid-cols-5">
        {currentItemsWithFixedDate.map((item: any, index: number) => {
          const itemKey = `${item.foodName ?? "empty"}-${
            item.dayKey ?? item.date ?? item.menuItemId ?? index
          }`;
          return (
            <DayMenuCard
              handleDelete={handleDelete}
              isHistory={isHistory}
              key={itemKey}
              day={item}
              selected={
                item.menuItemId != null
                  ? (selections[item.menuItemId] ?? "None")
                  : "None"
              }
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
