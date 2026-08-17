import React, { useEffect, useMemo, useState } from "react";
import type { PollQuestionType } from "./type";
import PollQuestion from "./PollQuestion";
import Button from "../../components/UI/Button";
import { useDispatch } from "react-redux";
import { addToast } from "../../features/slices/toastSloce";
import { getQuestionForFood, sendNotifToAll } from "../../services/dotNet";
import { useAppSelector } from "../../features/store";

type Props = {
  poll?: PollQuestionType[];
  t?: (key: string) => string;
  onSubmit?: (answers: Record<string, number>) => void;
};

const mockPollData: PollQuestionType[] = [
  {
    id: 1,
    questionText: "کیفیت غذای امروز چطور بود؟",
    options: [
      { id: 1, optionText: "عالی" },
      { id: 2, optionText: "خوب" },
      { id: 3, optionText: "متوسط" },
      { id: 4, optionText: "ضعیف" },
    ],
  },
  {
    id: 2,
    questionText: "نحوه برخورد پرسنل توزیع غذا چگونه بود؟",
    options: [
      { id: 1, optionText: "خیلی خوب" },
      { id: 2, optionText: "خوب" },
      { id: 3, optionText: "نیاز به بهبود" },
    ],
  },
];

const PollSection: React.FC<Props> = ({ poll = mockPollData, t, onSubmit }) => {
  const handleSendNotifToAll = async () => {
    try {
      const postData = {
        title: "نظرسنجی",
        message: "نظر سنجی جدید",
      };

      const response = await sendNotifToAll(postData);
      console.log("Notif response:", response);
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  const getFood = localStorage.getItem("pollFood");
  const dispatch = useDispatch();
  const main = useAppSelector((state) => state?.main);
  const [pollAnswers, setPollAnswers] = useState<Record<string, number>>({});
  const [getFoodQuestion, setGetFoodQuestion] = useState([]);

  const isPollFormComplete = useMemo(() => {
    if (!poll || poll.length === 0) return false;
    return poll.every((q) => pollAnswers[q.id.toString()] !== undefined);
  }, [poll, pollAnswers]);

  const handlePollAnswer = (questionId: number, optionId: number) => {
    setPollAnswers((prev) => ({
      ...prev,
      [questionId.toString()]: optionId,
    }));
  };

  const handleGetQuestionForFood = async () => {
    const res = await getQuestionForFood();
    if (res?.data?.length !== 0) {
      setGetFoodQuestion(res?.data?.[0]);
    }
  };

  console.log(main?.dailyPollFood, getFood);

  const showToast = (
    type: "success" | "error" | "info" | "loading",
    title: string,
    message: string,
    duration = 4500,
  ) => {
    dispatch(
      addToast({
        id: Date.now().toString(),
        type,
        title,
        message,
        duration,
      }),
    );
  };

  const handleSubmit = () => {
    if (!isPollFormComplete) {
      showToast("info", "نظرسنجی", "لطفاً به همه سوالات پاسخ دهید.");
      return;
    }

    console.log("پاسخ‌های ثبت‌شده:", pollAnswers);
    showToast("success", "ثبت موفق", "نظرسنجی با موفقیت ثبت شد.");

    if (onSubmit) {
      onSubmit(pollAnswers);
    }
  };
  useEffect(() => {
    if (main?.dailyPollFood?.length > 0) {
      handleSendNotifToAll();
    }
  }, [main?.dailyPollFood]);

  useEffect(() => {
    handleGetQuestionForFood();
  }, []);

  return (
    <div className="p-4 bg-bmw-surface border-t border-bmw-border lg:relative lg:border lg:rounded-xl lg:bg-bmw-surface lg:p-6 lg:mt-8 z-20 shadow-lg">
      <div className="max-w-7xl mx-auto md:flex-row items-center justify-between gap-4">
        <div className="flex-col">
          <div className="p-4 space-y-10">
            {poll.map((q, index) => (
              <PollQuestion
                key={q.id}
                question={q}
                index={index}
                selectedOption={pollAnswers[q.id.toString()]}
                onSelect={handlePollAnswer}
              />
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-bmw-border flex justify-end">
            <Button
              onClick={handleSubmit}
              className={`mb-5 px-6 py-3 rounded-lg font-bold text-white transition-all bg-bmw-blue hover:bg-blue-700 cursor-pointer`}
              label={t("submit_feedback")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollSection;
