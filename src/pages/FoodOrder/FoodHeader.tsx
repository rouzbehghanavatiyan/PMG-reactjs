import React from "react";
import { Calendar, Utensils } from "lucide-react";

type Props = {
  t: (key: string) => string;
};

const FoodHeader: React.FC<Props> = ({ t }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-bmw-text flex items-center gap-2">
          <Utensils className="text-bmw-blue" />
          {t("food_title")}
        </h1>
        <p className="text-bmw-textSec text-sm mt-1">{t("food_sub")}</p>
      </div>

      <div className="flex items-center gap-2 bg-bmw-surface border border-bmw-border px-4 py-2 rounded-lg text-sm text-bmw-textSec">
        <Calendar size={16} className="text-bmw-blue" />
        <span>{t("week_start")}</span>
      </div>
    </div>
  );
};

export default FoodHeader;
