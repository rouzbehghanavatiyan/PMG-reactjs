import React, { useState, useEffect } from "react";
import Button from "../../components/UI/Button";
import ModalUI from "../../components/UI/ModalUI";
import CustomInput from "../../components/UI/CustomInput";
import AddQuestions from "./AddQuestions";
import CustomDatePicker from "../../components/UI/CustomDatePicker";
import { Check, Pencil, Trash2, X } from "lucide-react";
import {} from "react";

const AddPollsModal: React.FC<any> = ({
  control,
  showAddPolls,
  setShowAddPolls,
  handleSubmit,
  onSubmit,
  editingPoll,
  setEditingPoll,
  setValue,
}) => {
  const [showAddQuestions, setShowAddQuestions] = useState(false);
  const [questions, setQuestions] = useState<any>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null,
  );
  const [editDraft, setEditDraft] = useState<any>(null);

  const handleFinalSubmit = (formData: any) => {
    const finalData = {
      ...formData,
      questions: questions,
    };
    onSubmit(finalData);
  };

  const handleStartEdit = (question: any) => {
    setEditingQuestionId(question.id);
    setEditDraft({
      id: question.id,
      title: question.title,
      options: question.options.map((option) => ({ ...option })),
    });
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditDraft(null);
  };

  const handleChangeQuestionTitle = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!editDraft) return;

    setEditDraft({
      ...editDraft,
      title: e.target.value,
    });
  };

  const handleChangeOptionText = (optionIndex: number, value: string) => {
    if (!editDraft) return;

    const updatedOptions = editDraft.options.map((option, index) =>
      index === optionIndex ? { ...option, text: value } : option,
    );

    setEditDraft({
      ...editDraft,
      options: updatedOptions,
    });
  };

  const handleDeleteQuestion = (questionId: number) => {
    setQuestions((prev) =>
      prev.filter((question) => question.id !== questionId),
    );
    if (editingQuestionId === questionId) {
      setEditingQuestionId(null);
      setEditDraft(null);
    }
  };

  const handleAddQuestion = (data: any) => {
    console.log("handleAddQuestion", data);
    setQuestions((prev: any) => [
      ...prev,
      {
        id: Date.now(),
        questionTitle: data.questionTitle,
        options: data.optionTitle,
      },
    ]);
  };

  useEffect(() => {
    if (editingPoll) {
      setValue("title", editingPoll.title);
      setValue("score", editingPoll.score);
      setValue("content", editingPoll.description);
      setValue("leftTime", editingPoll.timeLeft);
      setValue(
        "date",
        editingPoll.expireTime ? new Date(editingPoll.expireTime) : null,
      );

      setQuestions(
        editingPoll.questions?.map((q: any) => ({
          id: q.id || Date.now() + Math.random(),
          questionTitle: q.questionText,
          options: q.options.map((opt: any) => ({
            text: opt.optionText,
          })),
        })) || [],
      );
    }
  }, [editingPoll]);

  return (
    <ModalUI
      isOpen={showAddPolls}
      onClose={() => {
        setShowAddPolls(false);
        setEditingPoll(null);
      }}
      title={"افزودن نظرسنجی"}
      size="xl"
      closeOnBackdrop={false}
      footer={
        <Button
          onClick={handleSubmit(handleFinalSubmit)}
          variant="primary"
          label="تایید"
        />
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-4">
          <CustomInput
            label="عنوان"
            name="title"
            control={control}
            className="rounded-xl border border-gray-200 px-4 outline-none focus:border-bmw-blue"
          />
          <CustomInput
            label="امتیاز"
            name="score"
            control={control}
            className="rounded-xl border border-gray-200 px-4 outline-none focus:border-bmw-blue"
          />
          <CustomDatePicker
            minDate={new Date()}
            control={control}
            name="date"
            label="تاریخ پایان نظرسنجی"
            rules={{
              required: "لطفا تاریخ را انتخاب کنید",
            }}
          />
          <span className="flex items-end">
            <CustomInput
              numeric
              maxLength={2}
              label="زمان حدودی پاسخ"
              name="leftTime"
              control={control}
              className="rounded-xl border border-gray-200 px-4 outline-none focus:border-bmw-blue"
            />
            <span className="flex  items-end mb-2 ms-2">دقیقه</span>
          </span>
          <CustomInput
            isTextArea
            label="توضیحات"
            rows={4}
            name="content"
            control={control}
            containerClassName="col-span-full"
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-bmw-blue"
          />
          <div className="col-span-full flex justify-start">
            <Button
              onClick={() => setShowAddQuestions(true)}
              variant="success"
              label="+ افزودن سوال"
            />
          </div>
        </div>
        <div className="col-span-3 md:col-span-3 xl:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs md:text-sm text-gray-500">
              {questions.length} سوال
            </span>
          </div>
          <div className="border border-gray-200 rounded-2xl bg-gray-50/60 p-3 md:p-4">
            <div className="h-[300px] overflow-y-auto pr-1">
              <div className="space-y-4">
                {questions.map((q: any, index: number) => {

                  const isEditing = editingQuestionId === q.id;
                  return (
                    <div
                      key={q.id}
                      className={`bg-white w-full border rounded-xl p-4 shadow-sm hover:shadow-md transition ${
                        isEditing
                          ? "border-blue-200 ring-2 ring-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">
                            سوال {index + 1}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          {isEditing ? (
                            <>
                              <Check
                                size={19}
                                // onClick={handleSaveEdit}
                                className="cursor-pointer text-green-500 hover:text-green-600 transition"
                              />

                              <X
                                size={19}
                                onClick={handleCancelEdit}
                                className="cursor-pointer text-gray-400 hover:text-gray-600 transition"
                              />
                            </>
                          ) : (
                            <>
                              <Pencil
                                size={18}
                                onClick={() => handleStartEdit(q)}
                                className="cursor-pointer text-blue-500 hover:text-blue-600 transition"
                              />

                              <Trash2
                                size={18}
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="cursor-pointer text-red-500 hover:text-red-600 transition"
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {isEditing && editDraft ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              متن سوال
                            </label>

                            <input
                              value={editDraft.title}
                              onChange={handleChangeQuestionTitle}
                              className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
                              placeholder="متن سوال را وارد کنید"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-2">
                              گزینه‌های پاسخ
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {editDraft.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center gap-2"
                                >
                                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-medium shrink-0">
                                    {optionIndex + 1}
                                  </span>

                                  <input
                                    value={option.text}
                                    onChange={(e) =>
                                      handleChangeOptionText(
                                        optionIndex,
                                        e.target.value,
                                      )
                                    }
                                    className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
                                    placeholder={`گزینه ${optionIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-700 mb-4 leading-6">
                            {q.questionTitle}
                          </p>

                          <div className="overflow-x-auto pb-1">
                            <div className="flex gap-2 min-w-max">
                              {q.options.map((opt, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm whitespace-nowrap"
                                >
                                  <span className="text-gray-500 font-medium">
                                    {i + 1}.
                                  </span>
                                  <span className="text-gray-700">
                                    {opt.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                {questions.length === 0 && (
                  <div className="h-full min-h-[200px] flex items-center justify-center text-sm text-gray-500">
                    هنوز سوالی اضافه نشده است
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAddQuestions && (
        <AddQuestions
          onAddQuestion={handleAddQuestion}
          showAddQuestions={showAddQuestions}
          setShowAddQuestions={setShowAddQuestions}
        />
      )}
    </ModalUI>
  );
};

export default AddPollsModal;
