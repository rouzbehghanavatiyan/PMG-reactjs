import React, { useEffect, useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../pages/Sidebar";
import { useLanguage } from "../contexts/LanguageContext";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { RsetUserProfile } from "../features/slices/mainSlice";
import { getUserProfile } from "../services/dotNet";
import { asyncWrapper } from "../utils/asyncWrapper";
import { useToast } from "../hooks/useToast";

import { subscribePushNotification } from "../services/dotNet";
import { subscribeUserToPush } from "../utils/pushNotification";

const PublicLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dir } = useLanguage();
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const toast = useToast();

  const handleRefreshUser = asyncWrapper(async () => {
    if (!token) return;
    const decoded: any = jwtDecode(token);
    const res = await getUserProfile();
    const { code, result }: any = res?.data;

    if (code === 0) {
      dispatch(RsetUserProfile({ token: decoded, userLogin: result }));
    }
  }, toast);

  const handlePushPermission = useCallback(async () => {
    if (!token) return;
    if (!("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;
    if (!("PushManager" in window)) return;

    if (Notification.permission === "granted") {
      const subscription = await subscribeUserToPush();
      if (subscription) {
        await subscribePushNotification(subscription);
      }
      return;
    }

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const subscription = await subscribeUserToPush();
        if (subscription) {
          await subscribePushNotification(subscription);
        }
      }
    }
  }, [token]);

  useEffect(() => {
    handleRefreshUser();
  }, []);

  useEffect(() => {
    handlePushPermission();
  }, [handlePushPermission]);

  return (
    <div className="flex min-h-screen bg-bmw-base transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main
        className={`flex-1 transition-all duration-300 ${
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

        <div className="p-5 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PublicLayout;
