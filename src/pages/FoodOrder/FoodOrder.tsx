import React, { useEffect, useState } from "react";
import { poll } from "./data";
import { useLanguage } from "../../contexts/LanguageContext";
import type { MealType } from "./type";
import FoodHeader from "./FoodHeader";
import WeeklyMenuGrid from "./WeeklyMenuGrid";
import SummaryBar from "./SummaryBar";
import PollSection from "./PollSection";
import { getAllFoodPerWeek, sendNotifToAll } from "../../services/dotNet";
import { useAppSelector } from "../../features/store";
import FoodOrderHistory from "./FoodOrderHistory";
import StringHelpers from "../../utils/stringHelpers";

const FoodOrder: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [allFoodMenu, setAllFoodMenu] = useState<any[]>([]);
  const [selections, setSelections] = useState<
    Record<string | number, MealType>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [mockHistoryData] = useState<any[]>([]);

  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );

  const handleSelect = (menuItemId: string | number, type: MealType) => {
    setSelections((prev) => ({
      ...prev,
      [menuItemId]: type,
    }));

    const selectedMenuItem = allFoodMenu.find(
      (item: any) => item.menuItemId === menuItemId,
    );

    console.log("--- Meal Option Clicked ---");
    console.log("Selected Type:", type);
    console.log("Raw Menu Item from allFoodMenu:", selectedMenuItem);

    if (selectedMenuItem) {
      const selectedFood = {
        ...selectedMenuItem,
        selectedType: type,
        selectedFoodName:
          type === "A"
            ? selectedMenuItem.foodName || selectedMenuItem.menuA?.foodName
            : type === "B"
              ? selectedMenuItem.menuB?.foodName
              : null,
      };
      console.log("Final Processed Selected Food Object:", selectedFood);
    }

    setSuccess(false);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      console.log("Submitted selections: ", selections);
    }, 1000);
  };

  const handleAnswer = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId.toString()]: optionId }));
  };

  const handleAnswerQuestionUser = () => {
    console.log("Poll answers submitted: ", answers);
  };

  const isFormComplete =
    poll.length > 0 && Object.keys(answers).length === poll.length;

  const handleSendNotifToAll = async () => {
    try {
      const postData = {
        personalCode: userLogin?.personalCode,
        title: "نظرسنجی",
        message: "نظر سنجی جدید",
      };
      const response = await sendNotifToAll(postData);
      console.log("Notif response:", response);
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  const handleGetAllFoodPerWeek = async () => {
    try {
      const res = await getAllFoodPerWeek();
      if (res?.data && res.data !== 0) {
        setAllFoodMenu(res.data);
      }
    } catch (error) {
      console.error("Error fetching weekly menu:", error);
    }
  };

  useEffect(() => {
    if (!userLogin?.personalCode) return;
    handleGetAllFoodPerWeek();
  }, [userLogin?.personalCode]);

  const fixMissingDayWeek = StringHelpers.fillMissingDays(allFoodMenu);

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
