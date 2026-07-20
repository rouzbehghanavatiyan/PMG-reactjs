import React from "react";
import PollOption from "./PollOption";

type Props = {
  question: {
    id: number;
    questionText: string;
    options: { id: number; optionText: string }[];
  };
  index: number;
  selectedOption?: number;
  onSelect: (questionId: number, optionId: number) => void;
};

const PollQuestion: React.FC<Props> = ({
  question,
  index,
  selectedOption,
  onSelect,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-bmw-blue/10 text-bmw-blue flex items-center justify-center font-bold">
          {index + 1}
        </span>
        <h3 className="text-bmw-text font-semibold text-lg pt-0.5">
          {question.questionText}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:pl-10">
        {question.options.map((opt) => (
          <PollOption
            key={opt.id}
            questionId={question.id}
            option={opt}
            isSelected={selectedOption === opt.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default PollQuestion;
