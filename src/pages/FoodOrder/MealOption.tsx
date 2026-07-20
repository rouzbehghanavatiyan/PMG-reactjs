import React from "react";
import { Check, Flame, Leaf } from "lucide-react";
import type { DailyMenu, MealType } from "./type";

type Props = {
  day: DailyMenu;
  type: "A" | "B";
  selected: MealType;
  t: (key: string) => string;
  onSelect: (dayKey: string, type: MealType) => void;
};

const MealOption: React.FC<Props> = ({ day, type, selected, t, onSelect }) => {
  const isA = type === "A";
  const isSelected = selected === type;

  const option = isA ? day.menuA : day.menuB;
  const colorClass = isA
    ? "border-bmw-blue bg-blue-900/10"
    : "border-green-600 bg-green-900/10";

  const inactiveClass = "border-transparent bg-bmw-hover hover:border-bmw-border";

  return (
    <label
      className={`
        relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all
        ${isSelected ? colorClass : inactiveClass}
      `}
    >
      <input
        type="radio"
        name={`meal-${day.dayKey}`}
        className="hidden"
        checked={isSelected}
        onChange={() => onSelect(day.dayKey, type)}
      />

      <div className="flex justify-between items-start mb-1">
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            isA ? "text-bmw-blue" : "text-green-500"
          }`}
        >
          {t(isA ? "menu_a" : "menu_b")}
        </span>
        {isSelected && (
          <Check
            size={14}
            className={isA ? "text-bmw-blue" : "text-green-500"}
          />
        )}
      </div>

      <p className="text-sm text-bmw-text font-medium leading-tight mb-2 h-10 flex items-center">
        {t(`meals.${option.nameKey}`)}
      </p>

      <div className="flex items-center gap-2 mt-auto">
        <span className="text-[10px] text-gray-500 flex items-center gap-1">
          {isA ? <Flame size={10} /> : <Leaf size={10} />}
          {option.cals} {t("calories")}
        </span>
      </div>
    </label>
  );
};

export default MealOption;
