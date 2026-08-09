import React from "react";

const MealOption: React.FC<any> = ({
  day,
  type,
  selected,
  t,
  onSelect,
  isHistory,
}) => {
  const isA = type === "A";
  const isSelected = selected === type;

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
      `}
    >
      <input
        type="radio"
        name={`meal-${day.menuItemId}`}
        className="hidden"
        checked={isSelected}
        onChange={() => {
          console.log("Clicked menu item:", day);
          console.log("Clicked meal type:", type);

          if (!isHistory) {
            onSelect(day.menuItemId, type);
          } else {
            return null;
          }
        }}
      />

      <div>
        {day?.foodName ? (
          <p className="text-sm justify-center text-bmw-blue font-medium leading-tight h-10 flex items-center">
            {day.foodName}
          </p>
        ) : (
          <p className="text-sm justify-center text-gray-300 font-medium leading-tight h-10 flex items-center">
            تعطیل
          </p>
        )}
      </div>
    </label>
  );
};

export default MealOption;
