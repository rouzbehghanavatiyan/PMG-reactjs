import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Trophy,
  CheckCircle,
  ArrowRight,
  Timer,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAppSelector } from "../../features/store";
import Button from "../../components/UI/Button";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { useToast } from "../../hooks/useToast";
import { createQuestionAnswerUser } from "../../services/dotNet";

interface Option {
  id: string | number;
  optionText: string;
}

interface Question {
  id: string | number;
  questionText: string;
  options: Option[];
}

interface ShowQuestionsPollProps {
  survey: {
    id: string | number;
    title: string;
    description: string;
    score: number;
    questions: Question[];
  };
  onClose: () => void;
  onSubmitAnswers: (answers: Record<string, any>) => void;
}

const ShowQuestionsPoll: React.FC<ShowQuestionsPollProps> = () => {
  const { t } = useLanguage();
  const poll = useAppSelector((state) => state?.main?.poll);
  const toast = useToast();
  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = (questionId: string | number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId.toString()]: optionId,
    }));
  };

  useEffect(() => {
    if (!poll || !poll?.questions?.length) {
      navigate("/surveys", { replace: true });
    }
  }, [poll, navigate]);

  const handleAnswerQuestionUser = asyncWrapper(async () => {
    const postData = {
      pollId: poll?.id || null,
      personalCode: userLogin?.personalCode || null,
      answers: Object.entries(answers).map(
        ([pollQuestionId, pollOptionId]) => ({
          pollQuestionId,
          pollOptionId,
        }),
      ),
    };

    const res = await createQuestionAnswerUser(postData);
    const { code, message, result }: any = res?.data;
    if (code === 0) {
      toast.success(message);
      setIsSubmitted(true);
    }
  }, toast);

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-900/40">
          <CheckCircle size={48} className="text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-bmw-text">{t("thank_you")}</h2>
          <p className="text-bmw-textSec text-lg">
            {t("survey_completed_msg")}
          </p>
        </div>
        <div className="flex items-center gap-3 text-yellow-500 font-bold bg-yellow-500/10 px-6 py-3 rounded-full text-xl border border-yellow-500/20">
          <Trophy size={24} />
          <span>
            +{poll.score} {t("points")}
          </span>
        </div>
        <span
          onClick={() => navigate("/surveys")}
          className="mt-4 flex px-8 py-2 cursor-pointer text-bmw-text rounded-lg hover:bg-bmw-hover transition-all"
        >
          بازگشت
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform rtl:rotate-180"
          />
        </span>
      </div>
    );
  }

  console.log(answers);

  const isFormComplete =
    poll?.questions?.length > 0 &&
    Object.keys(answers).length === poll.questions.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate("/surveys")}
          className="text-bmw-textSec cursor-pointer hover:text-bmw-text transition-colors flex items-center gap-2 group"
        >
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform rtl:rotate-180"
          />
          {t("cancel")}
        </button>
        <div className="flex items-center gap-2 text-yellow-500 font-bold bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20">
          <Trophy size={18} />
          <span>
            {poll.score} {t("points")}
          </span>
        </div>
      </div>
      <div className="px-4 border border-bmw-border rounded-2xl overflow-hidden shadow-xl bg-white">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-bmw-text mb-3">
            {poll.title}
          </h2>
          <p className="text-bmw-textSec leading-relaxed">{poll.description}</p>
        </div>
        <div className="p-4 space-y-10">
          {poll?.questions?.map((q: any, index: number) => (
            <div key={q.id} className="space-y-4">
              <div className="flex gap-2">
                <span className="flex-shrink-0 rounded-lg text-bmw-dark flex items-center justify-center font-bold">
                  {index + 1}.
                </span>
                <h3 className="text-bmw-text font-semibold text-lg pt-0.5">
                  {q.questionText}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:pl-11">
                {q.options?.map((opt: any, index: number) => {
                  const isSelected = answers[q.id.toString()] === opt?.id;
                  return (
                    <label
                      key={opt.id || index}
                      className={`
                        group flex items-center justify-between gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200
                        ${
                          isSelected
                            ? "border-bmw-blue bg-bmw-blue/5 shadow-[0_0_15px_rgba(0,102,177,0.1)]"
                            : "border-bmw-border hover:border-bmw-textSec hover:bg-bmw-hover"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                          ${isSelected ? "border-bmw-blue bg-bmw-blue" : "border-bmw-textSec group-hover:border-bmw-text"}
                        `}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span
                          className={`transition-colors ${isSelected ? "text-bmw-text font-medium" : "text-bmw-textSec"}`}
                        >
                          {opt.optionText}
                        </span>
                      </div>
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        className="hidden"
                        checked={isSelected}
                        onChange={() => handleAnswer(q.id, opt?.id)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-bmw-border flex justify-end">
          <Button
            disabled={!isFormComplete}
            onClick={handleAnswerQuestionUser}
            className={`
    mb-5 px-6 py-3 rounded-lg font-bold text-white transition-all
    ${
      isFormComplete
        ? "bg-bmw-blue hover:bg-blue-700 cursor-pointer"
        : "bg-gray-600 cursor-not-allowed opacity-60"
    }
  `}
            label={t("submit_feedback")}
          />
        </div>
      </div>
    </div>
  );
};

export default ShowQuestionsPoll;
