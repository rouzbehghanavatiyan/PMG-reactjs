import { Check } from "lucide-react";
import React from "react";

type Props = {
  selections: Record<string, string>;
  t: (key: string) => string;
  isSubmitting: boolean;
  onSubmit: () => void;
};

const SummaryBar: React.FC<Props> = ({ t, isSubmitting, onSubmit }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-bmw-surface lg:relative lg:rounded-xl lg:bg-bmw-surface lg:p-6 lg:mt-8 z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-end gap-4">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
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
            {isSubmitting ? "Processing..." : t("submit_order")}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SummaryBar;
