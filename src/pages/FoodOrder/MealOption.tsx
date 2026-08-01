import React from "react";
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

  const inactiveClass =
    "border-transparent bg-bmw-hover hover:border-bmw-border";

  return (
    <label
      className={`
        relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all
        ${isSelected ? colorClass : inactiveClass}
      `}
    >
      <input
        type="radio"
        name={`meal-${day.menuItemId}`}
        className="hidden"
        checked={isSelected}
        onChange={() => onSelect(day.dayKey, type)}
      />

      {/* <div className="flex justify-between items-start mb-1">
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
      </div> */}
      <div>
        {day?.foodName ? (
          <p className="text-sm justify-center text-bmw-blue font-medium leading-tight h-10 flex items-center">
            {day?.foodName}
          </p>
        ) : (
          <p className="text-sm justify-center text-gray-300 font-medium leading-tight h-10 flex items-center">
            تعطیل
          </p>
        )}
      </div>
    </label>
  );
};

export default MealOption;
