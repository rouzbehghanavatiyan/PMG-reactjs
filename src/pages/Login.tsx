import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, Globe } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const Login: React.FC<any> = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  // We can choose to keep login always dark or theme it. Let's theme it for consistency.
  const { theme } = useTheme();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fa" : "en");
  };

  return (
    <div className="min-h-screen bg-bmw-base flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-bmw-blue rounded-full blur-[150px] opacity-10"></div>
      </div>

      <div className="w-full max-w-md bg-bmw-surface border border-bmw-border rounded-2xl p-8 relative z-10 shadow-2xl shadow-black/20">
        {/* Language Toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleLanguage}
            className="text-bmw-textSec hover:text-bmw-text flex items-center gap-1 text-xs"
          >
            <Globe size={16} />
            {language === "en" ? "FA" : "EN"}
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-900 to-bmw-blue mb-4 border border-white/10">
            <span className="text-white font-bold text-xl">PK</span>
          </div>
          <h1 className="text-2xl font-bold text-bmw-text tracking-wide">
            Persia Khodro App
          </h1>
          <p className="text-bmw-textSec text-sm mt-2">{t("login_subtitle")}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-bmw-textSec mb-1 uppercase tracking-wider">
              {t("employee_id")}
            </label>
            <input
              type="text"
              defaultValue="PK-8921"
              className="w-full bg-bmw-base border border-bmw-border text-bmw-text px-4 py-3 rounded-lg focus:outline-none focus:border-bmw-blue focus:ring-1 focus:ring-bmw-blue transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-bmw-textSec mb-1 uppercase tracking-wider">
              {t("password")}
            </label>
            <input
              type="password"
              defaultValue="password"
              className="w-full bg-bmw-base border border-bmw-border text-bmw-text px-4 py-3 rounded-lg focus:outline-none focus:border-bmw-blue focus:ring-1 focus:ring-bmw-blue transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-bmw-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
          >
            {t("sign_in")} <ArrowRight size={18} className="rtl:rotate-180" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-bmw-border text-center">
          <div className="flex items-center justify-center gap-2 text-bmw-textSec text-xs">
            <ShieldCheck size={14} />
            <span>{t("auth_only")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
