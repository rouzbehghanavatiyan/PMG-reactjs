import React from "react";

const MealOption: React.FC<any> = ({
  day,
  type,
  selected,
  onSelect,
  isHistory,
}) => {
  const isA = type === "A";
  const isSelected = selected === type;
  const isDisabled = isHistory || day?.isAccepted;
  const colorClass = isA
    ? "border-bmw-blue bg-blue-900/10"
    : "border-green-600 bg-green-900/10";
  const inactiveClass =
    "border-transparent bg-bmw-hover hover:border-bmw-border";

  return (
    <label
      className={`
        relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all
        ${isSelected ? colorClass : inactiveClass}
        ${isDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}
      `}
    >
      <input
        type="radio"
        name={`meal-${day.menuItemId}`}
        className="hidden"
        checked={isSelected}
        disabled={isDisabled}
        onChange={() => {
          if (!isDisabled) {
            onSelect(day.menuItemId, type);
          }
        }}
      />
      {!day?.isAccepted ? (
        day?.foodName ? (
          <p className="text-sm justify-center my-2 text-bmw-blue font-medium leading-tight h-10 flex items-center">
            {day.foodName}
          </p>
        ) : (
          <p className="text-sm my-2 justify-center text-gray-300 font-medium leading-tight h-10 flex items-center">
            تعطیل
          </p>
        )
      ) : (
        <>
          <p className="text-sm justify-center text-gray-400   font-medium leading-tight h-10 flex items-center">
            {day.foodName}
          </p>
          <span className="text-bmw-blue font-light text-[12px] flex justify-center">
            تایید شد
          </span>
        </>
      )}
    </label>
  );
};

export default MealOption;
