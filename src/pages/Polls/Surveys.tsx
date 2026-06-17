import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock,
  Trophy,
  CheckCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import Button from "../../components/UI/Button";
import AddPollsModal from "./AddPollsModal";
import { useForm } from "react-hook-form";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { useToast } from "../../hooks/useToast";
import { allPolls, createPoll } from "../../services/dotNet";
import StringHelpers from "../../utils/stringHelpers";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../features/store";
import { RsetPoll } from "../../features/slices/mainSlice";

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface Survey {
  id: string;
  title: string;
  description: string;
  points: number;
  questionsCount: number;
  timeEst: number; // minutes
  deadline: string;
  status: "active" | "completed" | "expired";
  questions: Question[];
}

const Surveys: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [allPoll, setAllPoll] = useState([]);
  const [showAddPolls, setShowAddPolls] = useState(false);
  const toast = useToast();
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const dispatch = useAppDispatch();
  const { control, handleSubmit, reset } = useForm<any>();
  const navigate = useNavigate();

  const onSubmit = asyncWrapper(async (data: any) => {
    const postData = {
      title: data.title,
      description: data.content,
      isActive: true,
      timeLeft: data?.leftTime,
      expireTime: data.date?.toDate?.().toISOString(),
      score: Number(data.score),
      questions: data.questions.map((q: any, index: number) => ({
        questionText: q.questionTitle,
        displayOrder: index + 1,
        options: q.options.map((opt: any, optIndex: number) => ({
          optionText: opt.text,
          displayOrder: optIndex + 1,
        })),
      })),
    };
    const res = await createPoll(postData);
    console.log(" res  res  res", res);
    const { message, result, code }: any = res?.data;
    if (code === 0) {
      toast.success(message);
      handleGetAllPoll();
    } else {
      toast.error(message);
    }
  }, toast);

  const handleStartSurvey = (item: any) => {
    navigate("questions");
    dispatch(RsetPoll(item));
  };

  const handleGetAllPoll = asyncWrapper(async () => {
    const res = await allPolls(userLogin?.PersonalCode);
    console.log(res);
    const { result, code, message } = res?.data;

    if (code === 0) {
      setAllPoll(result);
    }
  }, toast);

  useEffect(() => {
    if (!userLogin?.PersonalCode) return;
    handleGetAllPoll();
  }, [userLogin]);

  const filteredPolls = allPoll.filter((poll: any) =>
    activeTab === "history"
      ? poll.checkAnswerPoll === true
      : poll.checkAnswerPoll === false,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bmw-text flex items-center gap-2">
            <ClipboardList className="text-bmw-blue" />
            {t("surveys_title")}
          </h1>
          <p className="text-bmw-textSec text-sm mt-1">{t("surveys_sub")}</p>
        </div>
      </div>
      <div className="flex gap-1 bg-bmw-surface p-1 rounded-lg border border-bmw-border w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 cursor-pointer py-2 rounded-md text-sm font-medium transition-all ${activeTab === "active" ? "bg-bmw-blue text-white shadow" : "text-bmw-textSec hover:text-bmw-text"}`}
        >
          {t("active_surveys")}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 cursor-pointer py-2 rounded-md text-sm font-medium transition-all ${activeTab === "history" ? "bg-bmw-blue text-white shadow" : "text-bmw-textSec hover:text-bmw-text"}`}
        >
          {t("survey_history")}
        </button>
      </div>
      <Button
        onClick={() => setShowAddPolls(true)}
        leftIcon={<Plus />}
        label="افزودن نظرسنجی"
        variant="success"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolls?.map((survey: any) => {
          return (
            <div
              key={survey.id}
              className="bg-bmw-surface border border-bmw-border rounded-xl overflow-hidden hover:border-bmw-blue/50 transition-all group flex flex-col h-full shadow-sm"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="px-2 py-1 bg-bmw-base rounded border border-bmw-border text-xs text-bmw-textSec font-mono">
                    {survey.questions?.length} {t("questions_count")}
                  </div>
                  {activeTab === "history" ? (
                    <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-900/10 px-2 py-1 rounded">
                      <CheckCircle size={12} /> {t("completed")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-900/10 px-2 py-1 rounded">
                      <Trophy size={12} /> {survey.score} {t("points")}
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-bmw-text mb-2 line-clamp-2 group-hover:text-bmw-blue transition-colors">
                  {survey.title}
                </h3>
                <p className="text-bmw-textSec text-sm line-clamp-3 mb-4">
                  {survey.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-bmw-textSec">
                  <div className="flex items-center gap-1">
                    <Clock size={14} /> {survey.timeLeft} {t("minutes")}
                  </div>
                  <div>
                    Deadline:{" "}
                    <span className="text-bmw-text font-medium">
                      {StringHelpers.toPersianFullDateTime(survey.expireTime)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-bmw-border bg-bmw-base/50">
                {activeTab === "active" ? (
                  <button
                    onClick={() => handleStartSurvey(survey)}
                    className={`
                  w-full py-2.5 cursor-pointer rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                  bg-bmw-blue text-white hover:bg-blue-600 shadow-lg shadow-blue-900/20"
                `}
                  >
                    <>
                      {t("start_survey")}{" "}
                      <ArrowRight size={16} className="rtl:rotate-180" />
                    </>
                  </button>
                ) : (
                  <button
                    className={`
                  w-full py-2.5 cursor-pointer rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                  bg-gray-200 text-bmw-textSec hover:bg-blue-600 "
                `}
                  >
                    <>تکمیل شد </>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredPolls.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-bmw-textSec opacity-60">
            <ClipboardList size={48} className="mb-4" />
            <p>نظرسنجی تکمیل شده ای وجود ندارد</p>
          </div>
        )}
      </div>
      <AddPollsModal
        control={control}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        showAddPolls={showAddPolls}
        setShowAddPolls={setShowAddPolls}
      />
    </div>
  );
};

export default Surveys;
