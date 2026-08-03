import React, { useEffect, useState } from "react";
import { poll, weeklyMenu } from "./data";
import { useLanguage } from "../../contexts/LanguageContext";
import type { MealType } from "./type";
import FoodHeader from "./FoodHeader";
import WeeklyMenuGrid from "./WeeklyMenuGrid";
import SummaryBar from "./SummaryBar";
import PollSection from "./PollSection";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllFoodPerWeek, sendNotifToAll } from "../../services/dotNet";
import { useAppSelector } from "../../features/store";
import FoodOrderHistory from "./FoodOrderHistory";
import StringHelpers from "../../utils/stringHelpers";

const FoodOrder: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [allFoodMenu, setAllFoodMenu] = useState<any>([]);

  const [selections, setSelections] = useState<Record<string, MealType>>({
    sat: "None",
    sun: "None",
    mon: "None",
    tue: "None",
    wed: "None",
  });
  const mockHistoryData: any[] = [
    {
      weekLabel: " هفته اول تیر",
      startDate: "شنبه ۲۱ تیر",
      status: "delivered",
      selections: {
        sat: "A",
        sun: "B",
        mon: "A",
        tue: "None",
        wed: "A",
      },
      menu: [
        {
          dayKey: "sat",
          date: "1405/04/21",
          optionA: { nameKey: "kabab_koubideh", calories: 650 },
          optionB: { nameKey: "grilled_chicken", calories: 400 },
        },
        {
          dayKey: "sun",
          date: "1405/04/22",
          optionA: { nameKey: "gheimeh", calories: 600 },
          optionB: { nameKey: "adasi", calories: 350 },
        },
        {
          dayKey: "mon",
          date: "1405/04/23",
          optionA: { nameKey: "tahchin", calories: 700 },
          optionB: { nameKey: "caesar_salad", calories: 450 },
        },
        {
          dayKey: "tue",
          date: "1405/04/24",
          optionA: { nameKey: "loobia_polo", calories: 580 },
          optionB: { nameKey: "steamed_vegetables", calories: 250 },
        },
        {
          dayKey: "wed",
          date: "1405/04/25",
          optionA: { nameKey: "joojeh", calories: 620 },
          optionB: { nameKey: "steamed_fish", calories: 380 },
        },
      ],
    },
    {
      weekLabel: "هفته دوم تیر",
      startDate: "شنبه ۲۱ تیر",
      status: "delivered",
      selections: {
        sat: "A",
        sun: "B",
        mon: "A",
        tue: "None",
        wed: "A",
      },
      menu: [
        {
          dayKey: "sat",
          date: "1405/04/21",
          optionA: { nameKey: "kabab_koubideh", calories: 650 },
          optionB: { nameKey: "grilled_chicken", calories: 400 },
        },
        {
          dayKey: "sun",
          date: "1405/04/22",
          optionA: { nameKey: "gheimeh", calories: 600 },
          optionB: { nameKey: "adasi", calories: 350 },
        },
        {
          dayKey: "mon",
          date: "1405/04/23",
          optionA: { nameKey: "tahchin", calories: 700 },
          optionB: { nameKey: "caesar_salad", calories: 450 },
        },
        {
          dayKey: "tue",
          date: "1405/04/24",
          optionA: { nameKey: "loobia_polo", calories: 580 },
          optionB: { nameKey: "steamed_vegetables", calories: 250 },
        },
        {
          dayKey: "wed",
          date: "1405/04/25",
          optionA: { nameKey: "joojeh", calories: 620 },
          optionB: { nameKey: "steamed_fish", calories: 380 },
        },
      ],
    },
    {
      weekLabel: "هفته سوم تیر",
      startDate: "شنبه ۲۱ تیر",
      status: "delivered",
      selections: {
        sat: "A",
        sun: "B",
        mon: "A",
        tue: "None",
        wed: "A",
      },
      menu: [
        {
          dayKey: "sat",
          date: "1405/04/21",
          optionA: { nameKey: "kabab_koubideh", calories: 650 },
          optionB: { nameKey: "grilled_chicken", calories: 400 },
        },
        {
          dayKey: "sun",
          date: "1405/04/22",
          optionA: { nameKey: "gheimeh", calories: 600 },
          optionB: { nameKey: "adasi", calories: 350 },
        },
        {
          dayKey: "mon",
          date: "1405/04/23",
          optionA: { nameKey: "tahchin", calories: 700 },
          optionB: { nameKey: "caesar_salad", calories: 450 },
        },
        {
          dayKey: "tue",
          date: "1405/04/24",
          optionA: { nameKey: "loobia_polo", calories: 580 },
          optionB: { nameKey: "steamed_vegetables", calories: 250 },
        },
        {
          dayKey: "wed",
          date: "1405/04/25",
          optionA: { nameKey: "joojeh", calories: 620 },
          optionB: { nameKey: "steamed_fish", calories: 380 },
        },
      ],
    },
    {
      weekLabel: "هفته چهارم تیر",
      startDate: "شنبه ۲۱ تیر",
      status: "delivered",
      selections: {
        sat: "A",
        sun: "B",
        mon: "A",
        tue: "None",
        wed: "A",
      },
      menu: [
        {
          dayKey: "sat",
          date: "1405/04/21",
          optionA: { nameKey: "kabab_koubideh", calories: 650 },
          optionB: { nameKey: "grilled_chicken", calories: 400 },
        },
        {
          dayKey: "sun",
          date: "1405/04/22",
          optionA: { nameKey: "gheimeh", calories: 600 },
          optionB: { nameKey: "adasi", calories: 350 },
        },
        {
          dayKey: "mon",
          date: "1405/04/23",
          optionA: { nameKey: "tahchin", calories: 700 },
          optionB: { nameKey: "caesar_salad", calories: 450 },
        },
        {
          dayKey: "tue",
          date: "1405/04/24",
          optionA: { nameKey: "loobia_polo", calories: 580 },
          optionB: { nameKey: "steamed_vegetables", calories: 250 },
        },
        {
          dayKey: "wed",
          date: "1405/04/25",
          optionA: { nameKey: "joojeh", calories: 620 },
          optionB: { nameKey: "steamed_fish", calories: 380 },
        },
      ],
    },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );

  const handleSelect = (day: string, type: MealType) => {
    setSelections((prev) => ({ ...prev, [day]: type }));
    setSuccess(false);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1000);
  };

  const handleAnswer = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId.toString()]: optionId }));
  };

  const handleAnswerQuestionUser = () => {};

  const isFormComplete =
    poll.length > 0 && Object.keys(answers).length === poll.length;

  const handleSendNotifToAll = async () => {
    try {
      console.log("Hellow notif");
      const postData = {
        personalCode: userLogin?.personalCode,
        title: "Helllllllllllllllll",
        message: "نظر سنجی جدید",
      };
      const response = await sendNotifToAll(postData);
      console.log("Notif response:", response);
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  const handleGetAllFoodPerWeek = async () => {
    const res = await getAllFoodPerWeek();
    if (res?.data !== 0) {
      setAllFoodMenu(res?.data);
    }
  };

  useEffect(() => {
    if (!userLogin?.personalCode) return;
    // handleSendNotifToAll();
    handleGetAllFoodPerWeek();
  }, [userLogin?.personalCode]);

  const handlePrevWeek = () => {
    if (selectedWeekIndex < mockHistoryData.length - 1) {
      setSelectedWeekIndex(selectedWeekIndex + 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeekIndex > 0) {
      setSelectedWeekIndex(selectedWeekIndex - 1);
    }
  };
  const currentWeekData = mockHistoryData[selectedWeekIndex];

  const fixMissingDayWeek = StringHelpers.fillMissingDays(allFoodMenu);
  console.log("fixMissingDayWeek", fixMissingDayWeek);

  return (
    <div className="space-y-8">
      <FoodHeader t={t} activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "current" ? (
        <>
          <div className="shadow-sm border border-bmw-border bg-bmw-surface rounded-xl p-3">
            <div className="bg-bmw-surface rounded-2xl">
              <WeeklyMenuGrid
                weeklyMenu={fixMissingDayWeek}
                selections={selections}
                t={t}
                onSelect={handleSelect}
              />
              <SummaryBar
                selections={selections}
                t={t}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
          <PollSection
            poll={poll}
            answers={answers}
            t={t}
            onSubmit={handleAnswerQuestionUser}
            onAnswer={handleAnswer}
            isFormComplete={isFormComplete}
          />
        </>
      ) : (
        <FoodOrderHistory mockHistoryData={mockHistoryData} />
      )}

      <div className="h-20 lg:hidden"></div>
    </div>
  );
};

export default FoodOrder;
