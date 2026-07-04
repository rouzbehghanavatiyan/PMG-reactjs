import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ArrowUpRight, Plus } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import BirthdaysWidget from "../BirthdaysWidget";
import { useAppSelector } from "../../features/store";
import { getallcompanynews, getNotifAll } from "../../services/dotNet";
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
import * as signalR from "@microsoft/signalr";
import ModalUI from "../../components/UI/ModalUI";
import CustomInput from "../../components/UI/CustomInput";
import { useForm } from "react-hook-form";
import NotificationPage from "../NotificationPage";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { useToast } from "../../hooks/useToast";
import Head from "./Head";

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [getAllNews, setGetAllNews] = useState([]);
  const [showAddNews, setShowAddNews] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSendNotifToAll, setShowSendNotifToAll] = useState<boolean>(false);
  const { control, handleSubmit } = useForm<any>();
  const [showNews, setShowNews] = useState<boolean>(false);
  const [itemNews, setItemNews] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const user = useAppSelector((state) => state);
  const firstName = user?.main?.userProfile?.userLogin?.firstName;
  const { hasPermission } = useHasPermission();
  const { call } = useApi({ loading, setLoading });
  const activeNews = StringHelpers.filterIsActive(getAllNews) || [];
  const totalPages = Math.ceil(activeNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNews = activeNews.slice(startIndex, startIndex + itemsPerPage);
  const personalCode = user?.main?.userProfile?.userLogin?.personalCode;
  const [allNotif, setAllNotif] = useState<any>([]);
  const toast = useToast();
  const isReadLength = allNotif?.filter((itm: any) => !itm?.isRead);
  const userId = user?.main?.userProfile?.userLogin?.id;

  const handleGetAllNotif = asyncWrapper(async () => {
    const res = await getNotifAll(userId);
    setAllNotif(res?.data || []);
  }, toast);

  useEffect(() => {
    if (!userId) return;
    handleGetAllNotif();
  }, [userId]);

  const handleSendNotif = async (data: any) => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/chatHub`)
      .withAutomaticReconnect()
      .build();

    console.log("connection connection connection", connection);

    try {
      await connection.start();
      await connection.invoke("SendMessage", personalCode, data?.title);
      toast.success?.("اعلان با موفقیت ارسال شد");
      setShowSendNotifToAll(false);
      await handleGetAllNotif();
    } catch (error) {
      console.error("Send notification error:", error);
      toast.error?.("خطا در ارسال اعلان");
    } finally {
      if (connection.state !== signalR.HubConnectionState.Disconnected) {
        await connection.stop();
      }
    }
  };

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-bmw-text tracking-tight">
            {t("welcome")}
            <span className="mx-2">{firstName}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell
              className="rounded-full text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover transition-colors p-2 bg-bmw-surface border border-bmw-border"
              size={45}
            />
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-bmw-surface">
              {isReadLength?.length}
            </span>
          </div>
          <div onClick={() => navigate("/profile")}>
            <CustomImage size={50} />
          </div>
        </div>
      </div>
      <Head t={t} navigate={navigate} />
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
          {hasPermission("CompanyNews.Create") && (
            <span className="flex justify-end">
              <Button
                onClick={() => setShowSendNotifToAll(true)}
                leftIcon={<Plus />}
                label="ثبت اعلان"
                variant="success"
              />
            </span>
          )}
          <div className="bg-bmw-surface border border-bmw-border rounded-lg p-5 shadow-sm">
            <h3 className="text-lg font-bold text-bmw-text mb-4 flex items-center gap-2 ">
              <Bell size={18} className="text-bmw-blue" /> {t("notifications")}
            </h3>
            <NotificationPage
              setAllNotif={setAllNotif}
              handleGetAllNotif={handleGetAllNotif}
              allNotif={allNotif}
            />
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
      <ModalUI
        isOpen={showSendNotifToAll}
        onClose={() => setShowSendNotifToAll(false)}
        title={"اعلان جامع"}
        size="sm"
        closeOnBackdrop={false}
        footer={
          <>
            <Button
              onClick={() => setShowSendNotifToAll(false)}
              variant="outline-danger"
              label="لغو"
            />
            <Button
              onClick={handleSubmit(handleSendNotif)}
              variant="primary"
              label="تایید"
            />
          </>
        }
      >
        <CustomInput
          label="متن"
          name="title"
          control={control}
          className="rounded-xl border border-gray-200 px-4 outline-none focus:border-bmw-blue"
        />
      </ModalUI>
    </div>
  );
};

export default Dashboard;
