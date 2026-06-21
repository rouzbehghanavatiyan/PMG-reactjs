import React, { useState } from "react";
import StringHelpers from "../../utils/stringHelpers";
import { ArrowUpRight, Pencil, Pin, Trash } from "lucide-react";
import { deleteCompanyNews } from "../../services/dotNet";
import { useApi } from "../../hooks/useApi";
import MessageModal from "../../components/UI/MessageModal";
import EditNews from "./EditNews";
import { useHasPermission } from "../../hooks/usePermissions";
const AllNews: React.FC<any> = ({
  handleShowNews,
  news,
  t,
  key,
  handleGetAllNews,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showEditNews, setShowEditNews] = useState<boolean>(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const { hasPermission } = useHasPermission();
  const { call } = useApi({ loading, setLoading });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteNews = () => {
    call(() => deleteCompanyNews(news?.id), {
      onSuccess: () => {
        handleGetAllNews();
      },
    });
  };

  console.log(news.attachments);

  return (
    <div
      key={key}
      className="bg-bmw-surface border border-bmw-border rounded-lg overflow-hidden flex flex-col md:flex-row 
             hover:shadow-xl hover:shadow-black/10 transition-shadow h-auto md:h-[139px]"
    >
      <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative">
        {news.attachments?.length !== 0 ? (
          <img
            src={StringHelpers.getImage(news.attachments?.[0]?.url)}
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
            {news?.isActive ? (
              <>
                {hasPermission("CompanyNews.Delete") && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1 border border-red-500 rounded px-2 py-1 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <span className="text-xs font-light">حذف</span>
                    <Trash size={14} />
                  </button>
                )}
                {hasPermission("CompanyNews.Edit") && (
                  <button
                    onClick={() => {
                      setEditingNews(news);
                      setShowEditNews(true);
                    }}
                    className="flex items-center gap-1 border border-amber-400 rounded px-2 py-1 text-amber-400 hover:bg-amber-50 transition-colors"
                  >
                    <span className="text-xs font-light">ویرایش</span>
                    <Pencil size={14} />
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1 border border-bmw-blue rounded px-2 py-1 text-bmw-blue text-xs">
                <span>حذف شده</span>
              </div>
            )}

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
          handleAccept={() => handleDeleteNews()}
        />
      )}
      {showEditNews && (
        <EditNews
          key={editingNews?.id}
          showEditNews={showEditNews}
          setShowEditNews={setShowEditNews}
          handleGetAllNews={handleGetAllNews}
          initialData={editingNews}
        />
      )}
    </div>
  );
};
export default AllNews;
