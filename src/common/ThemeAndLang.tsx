import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Globe, Moon, Sun } from "lucide-react";

const ThemeAndLang = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage, dir } = useLanguage();
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fa" : "en");
  };
  return (
    <div className="flex justify-between mt-2 mx-2 ">
      <button
        type="button"
        onClick={toggleLanguage}
        className="flex items-center justify-center gap-2 text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover rounded-md transition-colors"
        title="Toggle Language"
      >
        <Globe size={20} />
        <span className="text-sm font-medium">
          {language === "en" ? "FA" : "EN"}
        </span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center justify-center   text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover rounded-md transition-colors"
        title="Toggle Theme"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
};

export default ThemeAndLang;
