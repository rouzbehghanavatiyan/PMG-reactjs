import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import BirthdaysWidget from "../BirthdaysWidget";
import { allNewsData } from "../../data/news";
import { useAppSelector } from "../../features/store";
import { getallcompanynews } from "../../services/dotNet";

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [getAllNews, setGetAllNews] = useState([]);
  const user = useAppSelector((state) => state);
  const firstName = user?.main?.userLogin?.FirstName;
  const notificationsData = {
    en: [
      {
        text: "Your leave request for Nov 12 has been approved.",
        time: "2 hours ago",
      },
      { text: "New IT security policy update available.", time: "5 hours ago" },
      {
        text: "Meeting reminder: Sales Team Weekly at 2 PM.",
        time: "1 day ago",
      },
    ],
    fa: [
      { text: "درخواست مرخصی شما برای ۲۱ آبان تایید شد.", time: "۲ ساعت پیش" },
      {
        text: "به‌روزرسانی جدید خط‌مشی امنیت IT در دسترس است.",
        time: "۵ ساعت پیش",
      },
      {
        text: "یادآوری جلسه: جلسه هفتگی تیم فروش ساعت ۱۴:۰۰.",
        time: "۱ روز پیش",
      },
    ],
  };

  const linksData = {
    en: ["Rahkaran Portal", "BMW Global", "Insurance Portal"],
    fa: ["پرتال راهکاران", "بی‌ام‌و گلوبال", "پرتال بیمه تکمیلی"],
  };

  const currentNews = (allNewsData[language] || allNewsData["en"]).slice(0, 3);
  const currentNotifications =
    notificationsData[language === "fa" ? "fa" : "en"];
  const currentLinks = linksData[language === "fa" ? "fa" : "en"];

  const handleGetAllNews = async () => {
    const res = await getallcompanynews();
    const { result, message, code } = res?.data;
    if (code === 0) {
      setGetAllNews(result);
    } else {
    }
  };

  useEffect(() => {
    handleGetAllNews();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-bmw-text tracking-tight">
            {t("welcome")}
            <span className="mx-2">{firstName}</span>
          </h1>
          <p className="text-bmw-textSec mt-1">{t("welcome_sub")}</p>
        </div>
        <div className="flex gap-3">
          <button className="p-2 rounded-full bg-bmw-surface border border-bmw-border text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover transition-colors relative shadow-sm">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bmw-surface"></span>
          </button>
          <div
            onClick={() => navigate("/profile")}
            className="h-10 w-10 rounded-full overflow-hidden border-2 border-bmw-blue cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/1002.jpg"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { labelKey: "food", icon: "🍔", descKey: "food_desc", link: "/food" },
          { labelKey: "it", icon: "💻", descKey: "it_desc", link: "/support" },
          { labelKey: "ricoh", icon: "🏆", descKey: "ricoh_desc", link: "#" },
          {
            labelKey: "surveys",
            icon: "📋",
            descKey: "surveys_desc",
            link: "/surveys",
          },
        ].map((action, idx) => (
          <div
            key={idx}
            onClick={() => action.link !== "#" && navigate(action.link)}
            className="bg-bmw-surface border border-bmw-border p-5 rounded-lg hover:border-bmw-blue transition-all cursor-pointer group shadow-sm"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-bmw-text">
              {t("latest_news")}
            </h2>
            <button
              onClick={() => navigate("/news")}
              className="text-sm text-bmw-blue hover:text-blue-400"
            >
              {t("view_all")}
            </button>
          </div>

          <div className="grid gap-6">
            {getAllNews.map((news: any) => (
              <div
                key={news.id}
                className="bg-bmw-surface border border-bmw-border rounded-lg overflow-hidden flex flex-col md:flex-row hover:shadow-xl hover:shadow-black/10 transition-shadow"
              >
                <div className="md:w-48 h-48 md:h-auto shrink-0 relative">
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 start-2 bg-bmw-blue text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {news.categoryTitle}
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg font-bold text-bmw-text mb-2">
                      {news.content}
                    </h3>
                    <p className="text-bmw-textSec text-sm line-clamp-2">
                      {news.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-bmw-textSec">
                      {news.date}
                    </span>
                    <button
                      onClick={() => navigate(`/news/${news.id}`)}
                      className="text-sm text-bmw-text flex items-center gap-1 hover:text-bmw-blue transition-colors"
                    >
                      {t("read_more")}{" "}
                      <ArrowUpRight size={14} className="rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-bmw-surface border border-bmw-border rounded-lg p-5 shadow-sm">
            <h3 className="text-lg font-bold text-bmw-text mb-4 flex items-center gap-2">
              <Bell size={18} className="text-bmw-blue" /> {t("notifications")}
            </h3>
            <div className="space-y-4">
              {currentNotifications.map((note, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start pb-3 border-b border-bmw-border last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-bmw-blue mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-bmw-textSec">{note.text}</p>
                    <span className="text-xs text-bmw-textSec opacity-70 mt-1 block">
                      {note.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <BirthdaysWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
