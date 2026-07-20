import React from "react";

type Props = {
  questionId: number;
  option: { id: number; optionText: string };
  isSelected: boolean;
  onSelect: (questionId: number, optionId: number) => void;
};

const PollOption: React.FC<Props> = ({ questionId, option, isSelected, onSelect }) => {
  return (
    <label
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
          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
        <span className={`transition-colors ${isSelected ? "text-bmw-text font-medium" : "text-bmw-textSec"}`}>
          {option.optionText}
        </span>
      </div>

      <input
        type="radio"
        name={`question-${questionId}`}
        className="hidden"
        checked={isSelected}
        onChange={() => onSelect(questionId, option.id)}
      />
    </label>
  );
};

export default PollOption;
