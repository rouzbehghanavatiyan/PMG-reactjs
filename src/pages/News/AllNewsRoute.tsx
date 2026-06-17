import React, { useState } from "react";
import StringHelpers from "../../utils/stringHelpers";
import { ArrowUpRight, Pencil, Pin, Trash } from "lucide-react";
import MessageModal from "../../components/UI/MessageModal";
import { useAppSelector } from "../../features/store";
import { useLanguage } from "../../contexts/LanguageContext";

const AllNewsRoute = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemNews, setItemNews] = useState<any>({});
  const [showNews, setShowNews] = useState<boolean>(false);
  const news = useAppSelector((state) => state.main.fetchNewsList);
  const { t } = useLanguage();
  console.log("newsnewsnewsnews", news);

  const handleShowNews = (item: any) => {
    console.log(item);
    setItemNews(item);
    setShowNews(true);
  };

  return (
    <div
      key={news?.id}
      className="bg-bmw-surface border border-bmw-border rounded-lg overflow-hidden flex flex-col md:flex-row 
             hover:shadow-xl hover:shadow-black/10 transition-shadow h-auto md:h-[139px]"
    >
      <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative">
        {news.attachments?.length !== 0 ? (
          <img
            src={StringHelpers.getImage(news.attachments?.[0])}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            بدون تصویر
          </div>
        )}

        {news?.categories?.length !== 0 ? (
          <div className="absolute top-2 right-2 text-white text-[10px] font-bold rounded uppercase tracking-wider flex flex-col gap-1">
            {news?.categories?.map((item: any, index: number) => (
              <span className="py-1 bg-bmw-blue rounded px-1" key={index}>
                {item?.title}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-base md:text-lg font-bold text-bmw-text mb-2 line-clamp-1">
              {news.title}
            </h3>
            {news?.isPinned && (
              <Pin size={18} className="text-bmw-blue shrink-0" />
            )}
          </div>
          <p className="text-bmw-textSec text-sm line-clamp-2 md:line-clamp-3">
            {news.content}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between mt-4 gap-3">
          <span className="text-xs text-bmw-textSec whitespace-nowrap">
            {StringHelpers.toPersianDateTime(news.createdAt)}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleShowNews(news)}
              className="text-sm flex items-center gap-1 text-bmw-blue hover:underline cursor-pointer"
            >
              {t("read_more")}
              <ArrowUpRight size={14} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <MessageModal
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
        />
      )}
    </div>
  );
};

export default AllNewsRoute;
