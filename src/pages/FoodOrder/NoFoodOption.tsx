import React from "react";
import type { DailyMenu, MealType } from "./type";

type Props = {
  day: DailyMenu;
  selected: MealType;
  t: (key: string) => string;
  onSelect: (dayKey: string, type: MealType) => void;
};

const NoFoodOption: React.FC<Props> = ({ day, selected, t, onSelect }) => {
  const isSelected = selected === "None";

  return (
    <label
      className={`
        relative flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all mt-auto
        ${
          isSelected
            ? "border-bmw-textSec bg-bmw-textSec text-gray-300"
            : "border-dashed border-bmw-textSec text-bmw-textSec hover:text-bmw-text"
        }
      `}
    >
      <input
        type="radio"
        name={`meal-${day.dayKey}`}
        className="hidden"
        checked={isSelected}
        onChange={() => onSelect(day.dayKey, "None")}
      />
      <span className="text-xs font-medium">{t("no_food")}</span>
    </label>
  );
};

export default NoFoodOption;
