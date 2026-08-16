import { Check } from "lucide-react";
import React from "react";

const SummaryBar: React.FC<any> = ({ t, isSubmitting, onSubmit }) => {
  return (
    <div className=" px-4 bg-bmw-surface lg:relative lg:rounded-xl lg:bg-bmw-surface z-20">
      <div className=" pt-6 flex justify-end">
        <button
          onClick={onSubmit}
          className={`
            w-full md:w-auto py-3 cursor-pointer rounded-lg font-bold text-white transition-all
            ${
              isSubmitting
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 transform"
            }
          `}
        >
          <span className="flex gap-2 text-[14px] px-3">
            <Check size={22} />
            {t("submit_order")}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SummaryBar;
