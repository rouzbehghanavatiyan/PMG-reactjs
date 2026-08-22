import React, { useEffect, useMemo, useState } from "react";
import type { PollQuestionType } from "./type";
import PollQuestion from "./PollQuestion";
import Button from "../../components/UI/Button";
import { useDispatch } from "react-redux";
import { addToast } from "../../features/slices/toastSloce";
import {
  createQuestionAnswerUser,
  getQuestionForFood,
  sendNotifToAll,
} from "../../services/dotNet";
import { useAppSelector } from "../../features/store";

const PollSection: React.FC<any> = ({
  t,
  getFoodQuestion,
  setCheckSubmitedQuestions,
}) => {
  // const handleSendNotifToAll = async () => {
  //   try {
  //     const postData = {
  //       title: "نظرسنجی",
  //       message: "نظر سنجی جدید",
  //     };

  //     const response = await sendNotifToAll(postData);
  //     console.log("Notif response:", response);
  //   } catch (error) {
  //     console.error("Failed to send notification:", error);
  //   }
  // };

  const getFood = localStorage.getItem("pollFoodName");
  const dispatch = useDispatch();
  const main = useAppSelector((state) => state?.main);
  const [pollAnswers, setPollAnswers] = useState<Record<string, number>>({});
  const personalCode = main?.userProfile?.userLogin?.personalCode;

  // const isPollFormComplete = useMemo(() => {
  //   if (!poll || poll.length === 0) return false;
  //   return poll.every((q) => pollAnswers[q.id.toString()] !== undefined);
  // }, [getFoodQuestion, pollAnswers]);

  const handlePollAnswer = (questionId: number, optionId: number) => {
    setPollAnswers((prev) => ({
      ...prev,
      [questionId.toString()]: optionId,
    }));
  };

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

  const onSubmit = async () => {
    // if (!isPollFormComplete) {
    //   showToast("info", "نظرسنجی", "لطفاً به همه سوالات پاسخ دهید.");
    //   return;
    // }

    const postData = {
      typeId: 2,
      pollId: getFoodQuestion?.id || null,
      personalCode: main?.userProfile?.userLogin?.personalCode || null,
      answers: Object.entries(pollAnswers).map(
        ([pollQuestionId, pollOptionId]) => ({
          pollQuestionId,
          pollOptionId,
        }),
      ),
    };
    console.log(postData);

    const res = await createQuestionAnswerUser(postData);
    console.log(res);
    if (res?.data?.code === 0) {
      showToast("success", "ثبت موفق", "نظرسنجی با موفقیت ثبت شد.");
      setCheckSubmitedQuestions(false);
    } else {
      showToast("error", "اخطار", res?.data?.message);
    }
  };

  // useEffect(() => {
  //   if (main?.dailyPollFood) {
  //     handleSendNotifToAll();
  //   }
  // }, [main?.dailyPollFood]);

  return (
    <div className="p-4 bg-bmw-surface border-t border-bmw-border lg:relative lg:border lg:rounded-xl lg:bg-bmw-surface lg:p-6 lg:mt-8 z-20 shadow-lg">
      <div className="max-w-7xl mx-auto md:flex-row items-center justify-between gap-4">
        <div className="flex-col">
          <div className="p-4 space-y-10">
            {getFoodQuestion?.questions?.map((q: any, index: number) => (
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
              onClick={onSubmit}
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
