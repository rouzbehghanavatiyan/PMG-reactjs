import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ArrowUpRight, Plus } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import BirthdaysWidget from "../BirthdaysWidget";
import { useAppDispatch, useAppSelector } from "../../features/store";
import { getallcompanynews } from "../../services/dotNet";
import { useApi } from "../../hooks/useApi";
import Button from "../../components/UI/Button";
import AddNews from "./AddNews";
import InlineLoading from "../../components/UI/InlineLoading";
import ShowNewsModal from "./ShowNewsModal";
import AllNews from "./AllNews";
import PaginationForms from "../../common/PaginationForms";
import { useHasPermission } from "../../hooks/usePermissions";
import StringHelpers from "../../utils/stringHelpers";
import CustomImage from "../../components/UI/CustomImage";
import clsx from "clsx";

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [getAllNews, setGetAllNews] = useState([]);
  const [showAddNews, setShowAddNews] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showNews, setShowNews] = useState<boolean>(false);
  const [itemNews, setItemNews] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const user = useAppSelector((state) => state);
  const firstName = user?.main?.userLogin?.FirstName;
  const { hasPermission } = useHasPermission();
  const { call } = useApi({ loading, setLoading });

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

  const currentNotifications =
    notificationsData[language === "fa" ? "fa" : "en"];

  const handleGetAllNews = () => {
    return call(getallcompanynews, {
      showSuccessMessage: false,
      onSuccess: (data) => {
        setGetAllNews(data?.result);
        // dispatch(RsetFetchNewsList(data?.result));
      },
    });
  };

  const handleShowAddNews = () => {
    setShowAddNews(true);
  };

  useEffect(() => {
    handleGetAllNews();
  }, []);

  const handleShowNews = (item: any) => {
    console.log(item);
    setItemNews(item);
    setShowNews(true);
  };

  const activeNews = StringHelpers.filterIsActive(getAllNews) || [];
  const totalPages = Math.ceil(activeNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNews = activeNews.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-bmw-text tracking-tight">
            {t("welcome")}
            <span className="mx-2">{firstName}</span>
          </h1>
          {/* <p className="text-bmw-textSec mt-1">{t("welcome_sub")}</p> */}
        </div>
        <div className="flex gap-3">
          <button className="p-2 rounded-full bg-bmw-surface border border-bmw-border text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover transition-colors relative shadow-sm">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bmw-surface"></span>
          </button>
          <div onClick={() => navigate("/profile")} className="">
            <CustomImage size={50} />
          </div>
        </div>
      </div>
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
      <div className="grid grid-cols-1  lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6  rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl  font-bold text-bmw-text">
              {t("latest_news")}
            </h2>
            {hasPermission("CompanyNews.Create") && (
              <Button
                onClick={handleShowAddNews}
                leftIcon={<Plus />}
                label="افزودن خبر"
                variant="success"
              />
            )}
            {/* <button
              onClick={() => navigate("/dashboard/allNews")}
              className="text-sm text-bmw-blue hover:text-blue-400 cursor-pointer"
            >
              {t("view_all")}
            </button> */}
          </div>
          <div className="grid gap-6">
            {loading ? (
              <span className="flex justify-center mt-10">
                <InlineLoading isActive={loading} size="xl" />
              </span>
            ) : (
              currentNews.map((news: any) => {
                return (
                  currentNews && (
                    <AllNews
                      key={news.id}
                      showAddNews={showAddNews}
                      setShowAddNews={setShowAddNews}
                      handleGetAllNews={handleGetAllNews}
                      handleShowNews={handleShowNews}
                      news={news}
                      t={t}
                      navigate={navigate}
                    />
                  )
                );
              })
            )}
          </div>
          {!loading && totalPages > 1 && (
            <PaginationForms
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          )}
        </div>
        <div className="space-y-6">
          <div className="bg-bmw-surface border border-bmw-border rounded-lg p-5 shadow-sm">
            <h3 className="text-lg font-bold text-bmw-text mb-4 flex items-center gap-2 ">
              <Bell size={18} className="text-bmw-blue" /> {t("notifications")}
            </h3>
            {t("statuses.progress")}. . .
            {/* <div className="space-y-4">
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
            </div> */}
          </div>
          <BirthdaysWidget />
        </div>
      </div>
      {showNews && (
        <ShowNewsModal
          itemNews={itemNews}
          showNews={showNews}
          setShowNews={setShowNews}
        />
      )}
      {showAddNews && (
        <AddNews
          showAddNews={showAddNews}
          setShowAddNews={setShowAddNews}
          handleGetAllNews={handleGetAllNews}
        />
      )}
    </div>
  );
};

export default Dashboard;
