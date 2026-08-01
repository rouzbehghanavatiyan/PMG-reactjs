import React from "react";
import DayMenuCard from "./DayMenuCard";
import type { DailyMenu, MealType } from "./type";
import StringHelpers from "../../utils/stringHelpers";

type Props = {
  weeklyMenu: DailyMenu[];
  selections: Record<string, MealType>;
  t: (key: string) => string;
  onSelect?: (dayKey: string, type: MealType) => void;
};

const WeeklyMenuGrid: React.FC<Props> = ({
  weeklyMenu,
  selections,
  t,
  onSelect,
}) => {
  console.log(weeklyMenu);

  return (
    <div className="bg-bmw-surface rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-5">
        {weeklyMenu.map((item: any, index) => {
          return (
            <DayMenuCard
              key={index}
              day={item}
              selected={selections[item?.menuItemId] || "None"}
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
