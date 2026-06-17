import React from "react";
import Button from "../../components/UI/Button";
import ModalUI from "../../components/UI/ModalUI";
import CustomInput from "../../components/UI/CustomInput";
import { useForm, useFieldArray } from "react-hook-form";

const AddQuestions: React.FC<any> = ({
  showAddQuestions,
  setShowAddQuestions,
  onAddQuestion,
}) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: "",
      options: [{ text: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const handleAdd = (data: any) => {
    const question = {
      questionTitle: data.questionTitle,
      optionTitle: data.options,
    };

    onAddQuestion(question);

    setShowAddQuestions(false);
  };

  const addOption = () => {
    if (fields.length < 4) append({ text: "" });
  };

  return (
    <ModalUI
      isOpen={showAddQuestions}
      onClose={() => setShowAddQuestions(false)}
      title="افزودن سوال"
      size="lg"
      closeOnBackdrop={false}
      footer={
        <>
          <Button
            onClick={() => setShowAddQuestions(false)}
            variant="outline-danger"
            label="لغو"
          />
          <Button
            onClick={handleSubmit(handleAdd)}
            variant="primary"
            label="تایید"
          />
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <CustomInput
          label="متن سوال"
          name="questionTitle"
          control={control}
          className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-blue-500"
        />
        <div className="flex flex-col gap-4">
          <label className="font-medium">گزینه های پاسخ</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-2 p-2 rounded-lg"
              >
                <span className="flex items-center justify-center rounded-full text-sm font-semibold">
                  {index + 1}.
                </span>
                <CustomInput
                  name={`options.${index}.text`}
                  control={control}
                  placeholder={`گزینه ${index + 1}`}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-blue-500"
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 text-sm hover:text-red-600 whitespace-nowrap"
                  >
                    حذف
                  </button>
                )}
              </div>
            ))}
          </div>
          {fields.length < 4 && (
            <Button
              type="button"
              variant="outline-ghost"
              onClick={addOption}
              className="w-fit text-sm text-blue-600 hover:text-blue-700"
              label="+ افزودن گزینه"
            />
          )}
        </div>
      </div>
    </ModalUI>
  );
};

export default AddQuestions;
