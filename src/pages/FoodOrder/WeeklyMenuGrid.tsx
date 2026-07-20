import React from "react";
import DayMenuCard from "./DayMenuCard";
import type { DailyMenu, MealType } from "./type";

type Props = {
  weeklyMenu: DailyMenu[];
  selections: Record<string, MealType>;
  t: (key: string) => string;
  onSelect: (dayKey: string, type: MealType) => void;
};

const WeeklyMenuGrid: React.FC<Props> = ({ weeklyMenu, selections, t, onSelect }) => {
  return (
    <div className="bg-bmw-surface rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {weeklyMenu.map((day) => (
          <DayMenuCard
            key={day.dayKey}
            day={day}
            selected={selections[day.dayKey]}
            t={t}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default WeeklyMenuGrid;
