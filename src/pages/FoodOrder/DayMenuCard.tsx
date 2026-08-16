import React from "react";
import MealOption from "./MealOption";
import NoFoodOption from "./NoFoodOption";
import type { DailyMenu, MealType } from "./type";
import StringHelpers from "../../utils/stringHelpers";

type Props = {
  day: any;
  selected: MealType;
  t: (key: string) => string;
  handleDelete: any;
  isHistory?: boolean;
  onSelect?: (menuItemId: string | number, type: MealType) => void;
};

const DayMenuCard: React.FC<Props> = ({
  day,
  selected,
  handleDelete,
  t,
  onSelect,
  isHistory,
}) => {
  const isReadOnly = !onSelect;

  return (
    <div className="bg-bmw-surface border border-bmw-border rounded-xl overflow-hidden flex flex-col h-full hover:border-bmw-textSec transition-colors">
      <div className="bg-bmw-base flex flex-col justify-center p-3 text-center border-b border-bmw-border h-[92px] shrink-0">
        <h3 className="font-bold text-bmw-text text-lg">
          {StringHelpers.getDayOfWeekName(day?.day || day?.Day)}
        </h3>
        <span className="font-thin mt-2">
          {StringHelpers.toPersianDateTime(day?.CreateDate)}
        </span>
      </div>
      <div className="p-3 flex-1 flex flex-col gap-3">
        {!isReadOnly && onSelect ? (
          <>
            <MealOption
              isHistory={isHistory}
              day={day}
              type="A"
              selected={selected}
              t={t}
              onSelect={onSelect}
            />
            {!isHistory && (
              <NoFoodOption
                day={day}
                selected={selected}
                t={t}
                onSelect={onSelect}
              />
            )}
            {!isHistory && (
              <button
                type="button"
                onClick={() => {
                  handleDelete(day.menuItemId);
                }}
                className={`relative flex items-center justify-center p-2 rounded-lg border transition-all mt-auto 
          ${
            day?.isAccepted
              ? "border-red-500 text-red-500 cursor-pointer hover:bg-red-100"
              : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
              >
                <span className="text-xs font-medium">حذف</span>
              </button>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-bmw-blue/5">
              {day.foodName ?? "تعطیل"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayMenuCard;
