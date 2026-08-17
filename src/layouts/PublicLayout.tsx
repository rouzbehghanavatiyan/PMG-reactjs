import React, { useEffect, useCallback, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import Sidebar from "../pages/Sidebar";
import { useLanguage } from "../contexts/LanguageContext";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import {
  RsetDailyPollFood,
  RsetNotifMessage,
  RsetUserProfile,
} from "../features/slices/mainSlice";
import { getUserProfile, subscribePushNotification } from "../services/dotNet";
import * as signalR from "@microsoft/signalr";
import { subscribeUserToPush } from "../utils/pushNotification";
import { ToastContainer } from "../../components/Toast";
import { useAppSelector } from "../features/store";
import { addToast, removeToast } from "../features/slices/toastSloce";

const baseURL = import.meta.env.VITE_API_URL;

const PublicLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const [showNotifPrompt, setShowNotifPrompt] = useState(false); // استیت برای نمایش درخواست

  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );
  const connectionStarted = useRef(false);
  const { dir } = useLanguage();
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  const toasts = useAppSelector((state) => state.toast.toasts);

  // ثبت Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => console.log("Service Worker Registered!", reg.scope))
        .catch((err) =>
          console.error("Service worker registration failed:", err),
        );
    }
  }, []);

  const handleRefreshUser = async () => {
    if (!token) return;
    const decoded: any = jwtDecode(token);
    const res = await getUserProfile();
    const { code, result }: any = res?.data;

    if (code === 0) {
      dispatch(RsetUserProfile({ token: decoded, userLogin: result }));
    }
  };

  const subscribeToPush = useCallback(async () => {
    if (!userLogin?.personalCode) return;

    try {
      const subscription: any = await subscribeUserToPush();
      if (subscription) {
        const postData = {
          personalCode: userLogin.personalCode, // الان حتما مقدار دارد
          endpoint: subscription.endpoint,
          p256dh: subscription.toJSON().keys?.p256dh,
          auth: subscription.toJSON().keys?.auth,
        };
        await subscribePushNotification(postData);
      }
    } catch (error) {
      console.error("خطا در ارسال اطلاعات به سرور:", error);
    }
  }, [userLogin]);

  const requestNotificationPermission = async () => {
    setShowNotifPrompt(false);
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      subscribeToPush();
    } else {
      setShowNotifPrompt(false);
    }
  };

  useEffect(() => {
    handleRefreshUser();
  }, []);

  useEffect(() => {
    if (!("Notification" in window) || !userLogin) return;

    if (Notification.permission === "default") {
      setShowNotifPrompt(true); // نمایش پیغام به کاربر
    } else if (Notification.permission === "granted") {
      subscribeToPush(); // اگر قبلا تایید کرده، فقط در سرور ثبت کن
    }
  }, [userLogin, subscribeToPush]);

  const getPersonalCodeFromToken = (token: string) => {
    try {
      const decoded: any = jwtDecode(token);
      return (
        decoded?.PersonalCode ||
        decoded?.personalCode ||
        decoded?.unique_name ||
        decoded?.sub ||
        ""
      );
    } catch (error) {
      return "";
    }
  };

  useEffect(() => {
    if (!token || connectionStarted.current) return;

    const pCode = getPersonalCodeFromToken(token);
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseURL}/chatHub?personalCode=${pCode}`)
      .withAutomaticReconnect()
      .build();

    newConnection.on("ReceiveMessage", (user: string, message: string) => {
      dispatch(RsetNotifMessage({ user, message, hasNew: true }));
      dispatch(
        addToast({
          id: Date.now().toString(),
          type: "info",
          title: user,
          message,
          duration: 4500,
        }),
      );
    });

    newConnection.on("ReceiveDailyQuestions", (foodData: any) => {
      dispatch(RsetDailyPollFood(foodData));
      localStorage.setItem("pollFood", foodData?.[0]?.foodName);
    });

    newConnection
      .start()
      .then(() => {
        connectionStarted.current = true;
      })
      .catch((e) => console.error("SignalR Connection Failed: ", e));

    setConnection(newConnection);

    return () => {
      if (newConnection) {
        newConnection.stop();
        connectionStarted.current = false;
      }
    };
  }, [token, dispatch]);

  return (
    <div className="flex min-h-screen bg-bmw-base transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main
        className={`flex-1 transition-all duration-300 relative ${
          dir === "rtl" ? "lg:mr-64" : "lg:ml-64"
        }`}
      >
        <div className="lg:hidden h-16 bg-bmw-surface border-b border-bmw-border flex items-center px-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-bmw-textSec hover:text-bmw-text"
          >
            <Menu size={24} />
          </button>
          <span className="mx-4 font-bold text-bmw-text">Persia Khodro</span>
        </div>

        {showNotifPrompt && (
          <div className="bg-bmw-blue text-white p-3 justify-between items-center shadow-md m-4 rounded-lg grid grid-cols-12">
            <div className="flex items-center font-light gap-2 col-span-10">
              <Bell size={20} />
              <span>برای دریافت آخرین پیام‌ها، اعلان‌ها را فعال کنید.</span>
            </div>
            <div className="flex justify-end gap-2 col-span-2">
              <button
                onClick={requestNotificationPermission}
                className="bg-white font-light text-bmw-blue cursor-pointer px-4 py-1 rounded hover:bg-gray-100 transition"
              >
                فعال‌سازی
              </button>
              <button
                onClick={() => setShowNotifPrompt(false)}
                className="px-3 py-1 cursor-pointer rounded font-light transition"
              >
                بعدا
              </button>
            </div>
          </div>
        )}

        <div className="p-5 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => dispatch(removeToast(id))}
        dir={dir}
      />
    </div>
  );
};

export default PublicLayout;
