import React, { useEffect, useState } from "react";
import { poll, weeklyMenu } from "./data";
import { useLanguage } from "../../contexts/LanguageContext";
import type { MealType } from "./type";
import FoodHeader from "./FoodHeader";
import WeeklyMenuGrid from "./WeeklyMenuGrid";
import SummaryBar from "./SummaryBar";
import PollSection from "./PollSection";
import { Check } from "lucide-react";
import { sendNotifToAll } from "../../services/dotNet";
import { useAppSelector } from "../../features/store";

const FoodOrder: React.FC = () => {
  const { t } = useLanguage();
  const [selections, setSelections] = useState<Record<string, MealType>>({
    sat: "None",
    sun: "None",
    mon: "None",
    tue: "None",
    wed: "None",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
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
      console.log("HElow notif");
      
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
  console.log(userLogin?.personalCode);

  useEffect(() => {
    if (!userLogin?.personalCode) return;
    handleSendNotifToAll();
  }, [userLogin?.personalCode]);

  return (
    <div className="space-y-8">
      <FoodHeader t={t} />
      {success && (
        <div className="bg-green-900/20 border border-green-800 text-green-500 p-4 rounded-lg flex items-center gap-3 animate-pulse shadow-sm">
          <Check size={20} />
          {t("order_success")}
        </div>
      )}
      <div className="bg-bmw-surface rounded-2xl shadow-lg">
        <WeeklyMenuGrid
          weeklyMenu={weeklyMenu}
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
      <PollSection
        poll={poll}
        answers={answers}
        t={t}
        onSubmit={handleAnswerQuestionUser}
        onAnswer={handleAnswer}
        isFormComplete={isFormComplete}
      />

      <div className="h-20 lg:hidden"></div>
    </div>
  );
};

export default FoodOrder;

// const isFocused = useIsFocused();
// const [isDragging, setIsDragging] = useState(false);

// const shouldPlay = isPlaying && isFocused && !isDragging && !isManuallyPaused;

//  const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderGrant: (e) => {
//         setIsDragging(true);
//         seek(e.nativeEvent.locationX);
//       },
//       onPanResponderMove: (e) => {
//         seek(e.nativeEvent.locationX);
//       },
//       onPanResponderRelease: () => {
//         videoRef.current?.seek(positionRef.current);
//         setIsDragging(false);
//       },
//       onPanResponderTerminate: () => {
//         videoRef.current?.seek(positionRef.current);
//         setIsDragging(false);
//       },
//     }),
//   ).current;

// <Video
//       key={uri}
//       ref={videoRef}
//       source={{ uri }}
//       style={styles.video}
//       resizeMode="cover" // پر کردن کامل صفحه، دقیقاً مثل ریلز اینستاگرام
//       repeat
//       muted={isMuted}
//       rate={isSlowMotion ? SLOW_MOTION_RATE : 1} // اسلوموشن هنگام نگه‌داشتن انگشت
//       paused={!shouldPlay}
//       onLoad={handleLoad}
//       onProgress={handleProgress}
//       onBuffer={handleBuffer}
//       progressUpdateInterval={250}
//       playInBackground={false}
//       playWhenInactive={false}
//     />
