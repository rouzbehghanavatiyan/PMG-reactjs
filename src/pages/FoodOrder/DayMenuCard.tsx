import React from "react";
import MealOption from "./MealOption";
import NoFoodOption from "./NoFoodOption";
import type { DailyMenu, MealType } from "./type";
import { Check, Flame } from "lucide-react";

type Props = {
  day: DailyMenu;
  selected: MealType;
  t: (key: string) => string;
  onSelect?: (dayKey: string, type: MealType) => void; // اختیاری شد
};

const DayMenuCard: React.FC<Props> = ({ day, selected, t, onSelect }) => {
  const isReadOnly = !onSelect;

  return (
    <div className="bg-bmw-surface border border-bmw-border rounded-xl overflow-hidden flex flex-col h-full hover:border-bmw-textSec transition-colors">
      <div className="bg-bmw-base p-3 text-center border-b border-bmw-border">
        <h3 className="font-bold text-bmw-text text-lg">
          {t(`days.${day.dayKey}`)}
        </h3>
        <span className="text-xs text-bmw-textSec font-mono">{day.date}</span>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-3">
        {!isReadOnly ? (
          <>
            <MealOption
              day={day}
              type="A"
              selected={selected}
              t={t}
              onSelect={onSelect}
            />
            <MealOption
              day={day}
              type="B"
              selected={selected}
              t={t}
              onSelect={onSelect}
            />
            <NoFoodOption
              day={day}
              selected={selected}
              t={t}
              onSelect={onSelect}
            />
          </>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-lg  bg-bmw-blue/5 relative">بسیلسل</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayMenuCard;
