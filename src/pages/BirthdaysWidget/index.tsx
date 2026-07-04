import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import CustomImage from "../../components/UI/CustomImage";
import { getBirthday } from "../../services/dotNet";
import { useApi } from "../../hooks/useApi";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { useToast } from "../../hooks/useToast";

interface Employee {
  id: string;
  name: string;
  department: string;
  day: number;
  imageUrl: string;
}

const BirthdaysWidget: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [birthdays, setBirthdays] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const currentMonthEn = new Date().toLocaleString("en-US", { month: "long" });
  const currentMonthFa = new Intl.DateTimeFormat("fa-IR", {
    month: "long",
  }).format(new Date());

  const monthName = language === "fa" ? currentMonthFa : currentMonthEn;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === birthdays.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? birthdays.length - 1 : prev - 1));
  };

  const handleGetBirthday = asyncWrapper(async () => {
    const res = await getBirthday();
    if (res?.data !== 0) {
      setBirthdays(res?.data);
    }
  }, toast);

  useEffect(() => {
    handleGetBirthday();
  }, []);

  if (!birthdays.length) {
    return (
      <div className="bg-bmw-surface border border-bmw-border rounded-lg p-5 shadow-sm">
        <span>{t("statuses.progress")}...</span>
      </div>
    );
  }

  const currentEmployee: any = birthdays[currentIndex];
  const fixBirthdayDay = currentEmployee?.BirthDate?.split("/")?.[2];

  return (
    <div className="bg-bmw-surface border border-bmw-border rounded-lg p-5 shadow-sm flex flex-col min-h-[200px]">
      <h3 className="text-lg font-bold text-bmw-text mb-4 flex items-center gap-2">
        <Gift size={18} className="text-bmw-blue" />
        {t("born_in_month")} {monthName}
      </h3>
      <div className="flex-1 flex items-center justify-between">
        <button
          onClick={dir === "rtl" ? nextSlide : prevSlide}
          className="p-2 cursor-pointer text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover rounded-full transition-colors"
        >
          <ChevronRight size={24} />
        </button>
        <div
          className="flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-300"
          key={currentEmployee.id}
        >
          <span className="mb-6">
            <CustomImage size={70} src={currentEmployee.imageUrl} />
          </span>
          <h4 className="font-bold text-lg text-bmw-text">
            {currentEmployee.FirstName} {currentEmployee.LastName}
          </h4>
          <p className="text-sm text-bmw-textSec my-1">
            {currentEmployee.Department}
          </p>
          <p className="text-xs font-medium bg-bmw-hover text-bmw-text px-2 py-1 rounded mt-2">
            {/* {language === "fa"
              ? `${currentEmployee.day} ${monthName}`
              : `${monthName} ${currentEmployee.day}`} */}
            {fixBirthdayDay} {monthName}
            {/* {currentEmployee?.BirthDate} */}
          </p>
        </div>
        <button
          onClick={dir === "rtl" ? prevSlide : nextSlide}
          className="p-2 cursor-pointer text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      {/* <div className="flex justify-center mt-3 text-xs text-bmw-textSec">
        {currentIndex + 1} / {birthdays.length}
      </div> */}
    </div>
  );
};

export default BirthdaysWidget;
