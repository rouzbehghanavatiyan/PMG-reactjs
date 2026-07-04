import React from "react";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";

const Head: React.FC<any> = ({ navigate, t }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        {
          labelKey: "food",
          icon: "🍔",
          descKey: "food_desc",
          link: "/food",
          disabled: true,
        },
        {
          labelKey: "it",
          icon: "💻",
          descKey: "it_desc",
          link: "/support",
          disabled: true,
        },
        {
          labelKey: "ricoh",
          icon: "🏆",
          descKey: "ricoh_desc",
          link: "#",
          disabled: true,
        },
        {
          labelKey: "surveys",
          icon: "📋",
          descKey: "surveys_desc",
          link: "/surveys",
          disabled: false,
        },
      ].map((action, idx) => (
        <div
          key={idx}
          onClick={() =>
            !action.disabled && action.link !== "#" && navigate(action.link)
          }
          className={clsx(
            "bg-bmw-surface border border-bmw-border p-5 rounded-lg transition-all group shadow-sm",
            action.disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-bmw-blue cursor-pointer",
          )}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-2xl">{action.icon}</span>
            <ArrowUpRight
              size={16}
              className="text-bmw-textSec group-hover:text-bmw-blue transition-colors rtl:rotate-180"
            />
          </div>
          <h3 className="text-bmw-text font-semibold">
            {t(`quick_actions.${action.labelKey}`)}
          </h3>
          <p className="text-xs text-bmw-textSec mt-1">
            {t(`quick_actions.${action.descKey}`)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Head;
