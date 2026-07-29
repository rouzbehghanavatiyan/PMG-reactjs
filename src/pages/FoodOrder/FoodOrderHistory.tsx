import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle } from "lucide-react";
import type { MealType } from "./type";
import WeeklyMenuGrid from "./WeeklyMenuGrid";
import WeeklyHistory from "./WeeklyHistory";
import { weeklyMenu } from "./data";
import { useLanguage } from "../../contexts/LanguageContext";

// ساختار داده شبیه‌سازی شده برای ۴ هفته گذشته
interface HistoricalWeek {
  weekLabel: string;
  startDate: string;
  selections: Record<string, MealType>;
  menu: Array<{
    id: string;
    day: string;
    label: string;
    meals: {
      Lunch: string;
      Diet: string;
      None: string;
    };
  }>;
  status: "delivered" | "canceled" | "expired";
}

const mockHistoryData: HistoricalWeek[] = [
  {
    weekLabel: "۱ هفته پیش",
    startDate: "شنبه ۲۱ تیر",
    status: "delivered",
    selections: {
      sat: "Lunch",
      sun: "Diet",
      mon: "Lunch",
      tue: "None",
      wed: "Lunch",
    },
    menu: [
      {
        id: "1",
        day: "sat",
        label: "شنبه",
        meals: {
          Lunch: "چلو کباب کوبیده",
          Diet: "سینه مرغ گریل",
          None: "بدون غذا",
        },
      },
      {
        id: "2",
        day: "sun",
        label: "یک‌شنبه",
        meals: {
          Lunch: "خورشت قیمه سیب‌زمینی",
          Diet: "عدسی با قارچ",
          None: "بدون غذا",
        },
      },
      {
        id: "3",
        day: "mon",
        label: "دوشنبه",
        meals: {
          Lunch: "ته‌چین مرغ",
          Diet: "سالاد سزار با فیله",
          None: "بدون غذا",
        },
      },
      {
        id: "4",
        day: "tue",
        label: "سه‌شنبه",
        meals: {
          Lunch: "لوبیا پلو با گوشت",
          Diet: "خوراک سبزیجات بخارپز",
          None: "بدون غذا",
        },
      },
      {
        id: "5",
        day: "wed",
        label: "چهارشنبه",
        meals: {
          Lunch: "جوجه کباب زعفرانی",
          Diet: "ماهی قزل‌آلا بخارپز",
          None: "بدون غذا",
        },
      },
    ],
  },
  {
    weekLabel: "۲ هفته پیش",
    startDate: "شنبه ۱۴ تیر",
    status: "delivered",
    selections: {
      sat: "Diet",
      sun: "Lunch",
      mon: "Diet",
      tue: "Lunch",
      wed: "None",
    },
    menu: [
      {
        id: "1",
        day: "sat",
        label: "شنبه",
        meals: {
          Lunch: "زرشک پلو با مرغ",
          Diet: "خوراک قارچ و مرغ",
          None: "بدون غذا",
        },
      },
      {
        id: "2",
        day: "sun",
        label: "یک‌شنبه",
        meals: {
          Lunch: "قورمه سبزی",
          Diet: "سوپ جو با سینه مرغ",
          None: "بدون غذا",
        },
      },
      {
        id: "3",
        day: "mon",
        label: "دوشنبه",
        meals: {
          Lunch: "کرفس پلو",
          Diet: "سالاد تبوله و فیله",
          None: "بدون غذا",
        },
      },
      {
        id: "4",
        day: "tue",
        label: "سه‌شنبه",
        meals: {
          Lunch: "اکبر جوجه",
          Diet: "کدو مسمایی و هویج",
          None: "بدون غذا",
        },
      },
      {
        id: "5",
        day: "wed",
        label: "چهارشنبه",
        meals: {
          Lunch: "شوید پلو با ماهی",
          Diet: "تخم مرغ آب‌پز و سیب‌زمینی",
          None: "بدون غذا",
        },
      },
    ],
  },
  {
    weekLabel: "۳ هفته پیش",
    startDate: "شنبه ۷ تیر",
    status: "delivered",
    selections: {
      sat: "Lunch",
      sun: "Lunch",
      mon: "Lunch",
      tue: "Lunch",
      wed: "Lunch",
    },
    menu: [
      {
        id: "1",
        day: "sat",
        label: "شنبه",
        meals: {
          Lunch: "چلو کباب کوبیده",
          Diet: "سینه مرغ گریل",
          None: "بدون غذا",
        },
      },
      {
        id: "2",
        day: "sun",
        label: "یک‌شنبه",
        meals: {
          Lunch: "خورشت قیمه سیب‌زمینی",
          Diet: "عدسی با قارچ",
          None: "بدون غذا",
        },
      },
      {
        id: "3",
        day: "mon",
        label: "دوشنبه",
        meals: {
          Lunch: "ته‌چین مرغ",
          Diet: "سالاد سزار با فیله",
          None: "بدون غذا",
        },
      },
      {
        id: "4",
        day: "tue",
        label: "سه‌شنبه",
        meals: {
          Lunch: "لوبیا پلو با گوشت",
          Diet: "خوراک سبزیجات بخارپز",
          None: "بدون غذا",
        },
      },
      {
        id: "5",
        day: "wed",
        label: "چهارشنبه",
        meals: {
          Lunch: "جوجه کباب زعفرانی",
          Diet: "ماهی قزل‌آلا بخارپز",
          None: "بدون غذا",
        },
      },
    ],
  },
  {
    weekLabel: "۴ هفته پیش",
    startDate: "شنبه ۳۱ خرداد",
    status: "expired",
    selections: {
      sat: "None",
      sun: "None",
      mon: "None",
      tue: "None",
      wed: "None",
    },
    menu: [
      {
        id: "1",
        day: "sat",
        label: "شنبه",
        meals: {
          Lunch: "زرشک پلو با مرغ",
          Diet: "خوراک قارچ و مرغ",
          None: "بدون غذا",
        },
      },
      {
        id: "2",
        day: "sun",
        label: "یک‌شنبه",
        meals: {
          Lunch: "قورمه سبزی",
          Diet: "سوپ جو با سینه مرغ",
          None: "بدون غذا",
        },
      },
      {
        id: "3",
        day: "mon",
        label: "دوشنبه",
        meals: {
          Lunch: "کرفس پلو",
          Diet: "سالاد تبوله و فیله",
          None: "بدون غذا",
        },
      },
      {
        id: "4",
        day: "tue",
        label: "سه‌شنبه",
        meals: {
          Lunch: "اکبر جوجه",
          Diet: "کدو مسمایی و هویج",
          None: "بدون غذا",
        },
      },
      {
        id: "5",
        day: "wed",
        label: "چهارشنبه",
        meals: {
          Lunch: "شوید پلو با ماهی",
          Diet: "تخم مرغ آب‌پز و سیب‌زمینی",
          None: "بدون غذا",
        },
      },
    ],
  },
];

const FoodOrderHistory: React.FC = () => {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const currentWeekData = mockHistoryData[selectedWeekIndex];

  const [success, setSuccess] = useState(false);

  const handleNextWeek = () => {
    if (selectedWeekIndex > 0) {
      setSelectedWeekIndex(selectedWeekIndex - 1);
    }
  };

  const handlePrevWeek = () => {
    if (selectedWeekIndex < mockHistoryData.length - 1) {
      setSelectedWeekIndex(selectedWeekIndex + 1);
    }
  };

  const [selections, setSelections] = useState<Record<string, MealType>>({
    sat: "None",
    sun: "None",
    mon: "None",
    tue: "None",
    wed: "None",
  });
  const { t } = useLanguage();

  const handleSelect = (day: string, type: MealType) => {
    setSelections((prev) => ({ ...prev, [day]: type }));
    setSuccess(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-bmw-surface border border-bmw-border p-4 rounded-2xl shadow-sm">
        <button
          onClick={handlePrevWeek}
          disabled={selectedWeekIndex === mockHistoryData.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ChevronRight size={24} className="text-bmw-text" />
        </button>

        <div className="text-center">
          <span className="text-xs text-bmw-blue font-bold px-3 py-1 bg-bmw-blue/10 rounded-full">
            {currentWeekData.weekLabel}
          </span>
          <h2 className="text-lg font-bold text-bmw-text mt-2">
            شروع از {currentWeekData.startDate}
          </h2>
        </div>

        <button
          onClick={handleNextWeek}
          disabled={selectedWeekIndex === 0}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ChevronLeft size={24} className="text-bmw-text" />
        </button>
      </div>

      <div className="bg-bmw-surface rounded-2xl shadow-lg border border-bmw-border overflow-hidden">
        <WeeklyMenuGrid
          weeklyMenu={currentWeekData.menu} 
          selections={currentWeekData.selections} 
          t={t}
          // onSelect={null}  <-- وقتی این را ننویسیم، اتوماتیک ReadOnly می‌شود
        />
      </div>
    </div>
  );
};

export default FoodOrderHistory;
