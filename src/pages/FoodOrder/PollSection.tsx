import React from "react";
import type { PollQuestionType } from "./type";
import PollQuestion from "./PollQuestion";
import Button from "../../components/UI/Button";

type Props = {
  poll: PollQuestionType[];
  answers: Record<string, number>;
  t: (key: string) => string;
  onSubmit: () => void;
  onAnswer: (questionId: number, optionId: number) => void;
  isFormComplete: boolean;
};

const PollSection: React.FC<Props> = ({
  poll,
  answers,
  t,
  onSubmit,
  onAnswer,
  isFormComplete,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-bmw-surface border-t border-bmw-border lg:relative lg:border lg:rounded-xl lg:bg-bmw-surface lg:p-6 lg:mt-8 z-20 shadow-lg">
      <div className="max-w-7xl mx-auto md:flex-row items-center justify-between gap-4">
        <div className="flex-col">
          <div className="p-4 space-y-10">
            {poll.map((q, index) => (
              <PollQuestion
                key={q.id}
                question={q}
                index={index}
                selectedOption={answers[q.id.toString()]}
                onSelect={onAnswer}
              />
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-bmw-border flex justify-end">
            <Button
              disabled={!isFormComplete}
              onClick={onSubmit}
              className={`mb-5 px-6 py-3 rounded-lg font-bold text-white transition-all ${
                isFormComplete
                  ? "bg-bmw-blue hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-600 cursor-not-allowed opacity-60"
              }`}
              label={t("submit_feedback")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollSection;
