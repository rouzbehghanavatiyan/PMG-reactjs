import React from "react";
import { Calendar, History, Utensils } from "lucide-react";

type Props = {
  t: (key: string) => string;
  activeTab: "current" | "history";
  setActiveTab: (tab: "current" | "history") => void;
};

const FoodHeader: React.FC<Props> = ({ t, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-bmw-text flex items-center gap-2">
          <Utensils className="text-bmw-blue" />
          {activeTab === "current" ? t("food_title") : "تاریخچه سفارشات"}
        </h1>
        <p className="text-bmw-textSec text-sm mt-1">
          {activeTab === "current" ? t("food_sub") : "مشاهده و پیگیری سفارش‌های قبلی شما"}
        </p>
      </div>
      
      {/* Tabs Bar */}
      <div className="flex items-center gap-2 bg-bmw-surface border border-bmw-border p-1 rounded-xl text-sm">
        <button
          onClick={() => setActiveTab("current")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "current"
              ? "bg-bmw-blue text-white shadow-sm"
              : "text-bmw-textSec hover:text-bmw-text"
          }`}
        >
          <Calendar size={16} />
          <span>{t("week_start")}</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-bmw-blue text-white shadow-sm"
              : "text-bmw-textSec hover:text-bmw-text"
          }`}
        >
          <History size={16} />
          <span>تاریخچه</span>
        </button>
      </div>
    </div>
  );
};

export default FoodHeader;
