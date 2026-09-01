import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock,
  Trophy,
  CheckCircle,
  ArrowRight,
  Plus,
  Pencil,
  Trash,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import Button from "../../components/UI/Button";
import AddPollsModal from "./AddPollsModal";
import { useForm } from "react-hook-form";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { useToast } from "../../hooks/useToast";
import {
  allPollsByUsers,
  createPoll,
  deletePoll,
  updatePolls,
} from "../../services/dotNet";
import StringHelpers from "../../utils/stringHelpers";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../features/store";
import { RsetPoll } from "../../features/slices/mainSlice";
import MessageModal from "../../components/UI/MessageModal";
import { useApi } from "../../hooks/useApi";
import { useHasPermission } from "../../hooks/usePermissions";

interface Question {
  id: string;
  text: string;
  options: string[];
}

const Surveys: React.FC = () => {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [pollItem, setPollItem] = useState<Record<string, number>>({});
  const [allPoll, setAllPoll] = useState([]);
  const [showAddPolls, setShowAddPolls] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeletePoll, setShowDeletePoll] = useState(false);
  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );
  const { control, handleSubmit, setValue } = useForm<any>();
  const { hasPermission } = useHasPermission();
  const { call } = useApi({ loading, setLoading });
  const handleDeletePoll = (survey: any) => {
    setPollItem(survey);
    setShowDeletePoll(true);
  };
  const [editingPoll, setEditingPoll] = useState<any>(null);

  const onSubmit = asyncWrapper(async (data: any) => {
    const postData = {
      ...(editingPoll && { id: editingPoll.id }),
      title: data.title,
      typeId: 1,
      description: data.content,
      isActive: true,
      timeLeft: data?.leftTime,
      expireTime: data.date?.toDate?.().toISOString(),
      score: Number(data.score),
      questions: data.questions.map((q: any, index: number) => {
        const editingQuestion = editingPoll?.questions?.find(
          (question: any) =>
            question.id === q.id || question.questionText === q.questionTitle,
        );

        return {
          ...(editingQuestion && { id: editingQuestion.id }),

          questionText: q.questionTitle,
          displayOrder: index + 1,

          options: q.options.map((opt: any, optIndex: number) => {
            const editingOption = editingQuestion?.options?.find(
              (option: any) =>
                option.id === opt.id || option.optionText === opt.text,
            );

            return {
              ...(editingOption && { id: editingOption.id }),

              optionText: opt.text,
              displayOrder: optIndex + 1,
            };
          }),
        };
      }),
    };

    if (editingPoll) {
      await updatePolls(postData);
      toast.success("نظرسنجی با موفقیت ویرایش شد");
    } else {
      await createPoll(postData);
      toast.success("نظرسنجی ایجاد شد");
    }

    setEditingPoll(null);
    setShowAddPolls(false);
    handleGetAllPoll();
  }, toast);

  const handleDeletePolls = () => {
    call(() => deletePoll(pollItem?.id), {
      onSuccess: () => {
        setShowDeletePoll(false);
        handleGetAllPoll();
      },
    });
  };

  const handleStartSurvey = (item: any) => {
    navigate("questions");
    dispatch(RsetPoll(item));
  };

  const handleGetAllPoll = asyncWrapper(async () => {
    const res = await allPollsByUsers(userLogin?.personalCode);
    const { result, code, message } = res?.data;
    if (code === 0) {
      setAllPoll(result);
    }
  }, toast);

  useEffect(() => {
    if (!userLogin?.personalCode) return;
    handleGetAllPoll();
  }, [userLogin]);

  const filteredPolls = allPoll.filter((poll: any) => {
    const expireTime = poll?.expireTime ? new Date(poll.expireTime) : null;
    const now = new Date();
    const isNotExpired = expireTime && expireTime > now;

    if (!isNotExpired) return false;

    return activeTab === "history"
      ? poll.checkAnswerPoll === true
      : poll.checkAnswerPoll === false;
  });

  console.log(allPoll, filteredPolls);

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
      {hasPermission("Poll.Create") && (
        <Button
          onClick={() => setShowAddPolls(true)}
          leftIcon={<Plus />}
          label="افزودن نظرسنجی"
          variant="success"
        />
      )}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {filteredPolls?.map((survey: any) => {
          return (
            survey?.isActive && (
              <div
                key={survey.id}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-bmw-border bg-bmw-surface shadow-sm transition-all hover:border-bmw-blue/50"
              >
                <div className="flex-1 p-4 sm:p-5 md:p-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="rounded border border-bmw-border bg-bmw-base px-2 py-1 text-xs font-mono text-bmw-textSec">
                        {survey.questions?.length} {t("questions_count")}
                      </div>

                      {activeTab === "history" ? (
                        <div className="flex items-center gap-1 rounded bg-green-900/10 px-2 py-1 text-xs font-bold text-green-500">
                          <CheckCircle size={12} /> {t("completed")}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 rounded bg-yellow-900/10 px-2 py-1 text-xs font-bold text-yellow-500">
                          <Trophy size={12} /> {survey.score} {t("points")}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {hasPermission("Poll.Delete") && (
                        <Button
                          size="sm"
                          type="button"
                          variant="outline-danger"
                          onClick={() => handleDeletePoll(survey)}
                          className="whitespace-nowrap rounded border px-2 py-1 text-red-500 hover:text-red-600"
                          label="حذف"
                          leftIcon={<Trash size={14} />}
                        />
                      )}
                      {hasPermission("Poll.Edit") && (
                        <Button
                          size="sm"
                          type="button"
                          variant="outline-orange"
                          label="ویرایش"
                          leftIcon={<Pencil size={14} />}
                          onClick={() => {
                            setEditingPoll(survey);
                            setShowAddPolls(true);
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-lg font-bold text-bmw-text transition-colors group-hover:text-bmw-blue sm:text-xl">
                    {survey.title}
                  </h3>

                  <p className="mb-4 line-clamp-3 text-sm leading-6 text-bmw-textSec">
                    {survey.description}
                  </p>

                  <div className="flex flex-col gap-2 text-xs text-bmw-textSec sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    <div className="flex items-center gap-1">
                      <Clock size={14} /> {survey.timeLeft} {t("minutes")}
                    </div>

                    <div className="break-words">
                      Deadline:{" "}
                      <span className="font-medium text-bmw-text">
                        {StringHelpers.toPersianFullDateTime(survey.expireTime)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-bmw-border bg-bmw-base/50 p-3 sm:p-4">
                  {activeTab === "active" ? (
                    <button
                      onClick={() => handleStartSurvey(survey)}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-bmw-blue py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-600"
                    >
                      {t("start_survey")}
                      <ArrowRight size={16} className="rtl:rotate-180" />
                    </button>
                  ) : (
                    <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-200 py-2.5 text-sm font-medium text-bmw-textSec transition-all">
                      تکمیل شد
                    </button>
                  )}
                </div>
              </div>
            )
          );
        })}

        {filteredPolls.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-bmw-textSec opacity-60">
            <ClipboardList size={48} className="mb-4" />
            <p className="text-sm sm:text-base">
              نظرسنجی تکمیل شده ای وجود ندارد
            </p>
          </div>
        )}
      </div>

      <AddPollsModal
        control={control}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        showAddPolls={showAddPolls}
        setShowAddPolls={setShowAddPolls}
        editingPoll={editingPoll}
        setEditingPoll={setEditingPoll}
        setValue={setValue}
      />
      {showDeletePoll && (
        <MessageModal
          showDeleteModal={showDeletePoll}
          setShowDeleteModal={setShowDeletePoll}
          handleAccept={() => handleDeletePolls()}
        />
      )}
    </div>
  );
};

export default Surveys;
