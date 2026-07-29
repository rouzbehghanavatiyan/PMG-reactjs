import React from "react";
import DayMenuCard from "./DayMenuCard";

const WeeklyHistory = () => {
  return (
    <div className="bg-bmw-surface rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-5">
        {["weeklyMenu"].map((day) => (
          <DayMenuCard
            // key={day.dayKey}
            // day={day}
            // selected={selections[day.dayKey]}
            // t={t}
          />
        ))}
      </div>
    </div>
  );
};

export default WeeklyHistory;
