import React, { useEffect, useCallback, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../pages/Sidebar";
import { useLanguage } from "../contexts/LanguageContext";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import {
  RsetNotifMessage,
  RsetUserProfile,
} from "../features/slices/mainSlice";
import { getUserProfile, sendNotifUser } from "../services/dotNet";
import { asyncWrapper } from "../utils/asyncWrapper";
import { useToast } from "../hooks/useToast";
import * as signalR from "@microsoft/signalr";
const baseURL = import.meta.env.VITE_API_URL;

const PublicLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const connectionStarted = useRef(false);

  const { dir } = useLanguage();
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const toast = useToast();

  const handleRefreshUser = asyncWrapper(async () => {
    if (!token) return;
    const decoded: any = jwtDecode(token);
    const postData = {
      personalCode: "11880",
      Title: "سلام",
      message: " این تسته هستش برای شما",
    };
    const res = await getUserProfile();
    const { code, result }: any = res?.data;

    if (code === 0) {
      dispatch(RsetUserProfile({ token: decoded, userLogin: result }));
    }
  }, toast);

  // const handlePushPermission = useCallback(async () => {
  //   if (!token) return;
  //   if (!("Notification" in window)) return;
  //   if (!("serviceWorker" in navigator)) return;
  //   if (!("PushManager" in window)) return;

  //   if (Notification.permission === "granted") {
  //     const subscription: any = await subscribeUserToPush();
  //     const postData = {
  //       personalCode: "11907",
  //       endpoint: subscription?.endpoint,
  //       p256dh: subscription?.toJSON().keys?.p256dh,
  //       auth: subscription?.toJSON()?.keys?.auth,
  //     };
  //     if (subscription) {
  //       await subscribePushNotification(postData);
  //     }
  //     return;
  //   }

  //   if (Notification.permission === "default") {
  //     const permission = await Notification.requestPermission();

  //     if (permission === "granted") {
  //       const subscription: any = await subscribeUserToPush();
  //       const postData = {
  //         personalCode: "11907",
  //         endpoint: subscription?.endpoint,
  //         p256dh: subscription?.toJSON().keys?.p256dh,
  //         auth: subscription?.toJSON()?.keys?.auth,
  //       };
  //       if (subscription) {
  //         await subscribePushNotification(postData);
  //       }
  //     }
  //   }
  // }, [token]);

  useEffect(() => {
    handleRefreshUser();
  }, []);

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
      console.error("Token decode error:", error);
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

    console.log("laaaaaaaaaaaaaaaa", newConnection);

    newConnection.on("ReceiveMessage", (user: string, message: string) => {
      console.log("ReceiveMessage:", user, message);
      dispatch(
        RsetNotifMessage({
          user,
          message,
          hasNew: true,
        }),
      );
    });

    newConnection
      .start()
      .then(() => {
        console.log("SignalR Connected with personalCode:", pCode);
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
  }, [token]);

  // useEffect(() => {
  //   handlePushPermission();
  // }, [handlePushPermission]);

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
