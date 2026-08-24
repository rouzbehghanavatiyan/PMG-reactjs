import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Mail,
  Briefcase,
  RefreshCw,
  UserCheck,
  Filter,
  UserX,
  AlertCircle,
  Download,
} from "lucide-react";
import { useLanguage } from "../src/contexts/LanguageContext";
import { ToastContainer } from "./Toast";
import { getAllUsers, updatedLimitUsedPhotoAi } from "../src/services/dotNet";
import CustomImage from "../src/components/UI/CustomImage";
import { useAppSelector } from "../src/features/store";
import StringHelpers from "../src/utils/stringHelpers";

interface UserItem {
  user_id: string;
  name_fa: string;
  name_en: string;
  email: string;
  role_fa: string;
  role_en: string;
  department_fa: string;
  department_en: string;
  code: string;
  avatar_url: string;
  aiPhotoUsed: number;
}

const UsersManagement: React.FC = () => {
  const { language, dir } = useLanguage();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "allowed" | "disabled"
  >("all");
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;
  const [toasts, setToasts] = useState<any[]>([]);
  const user = useAppSelector((state) => state);
  const personalCode = user?.main?.userProfile?.userLogin?.personalCode;

  const formatCardDateTime = (dateStr?: string, lang: "fa" | "en" = "en") => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (lang === "fa") {
        return new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(date);
      } else {
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(date);
      }
    } catch (e) {
      return dateStr;
    }
  };

  // const handleDownloadImage = async (user: any) => {
  //   const imagePath =
  //     user?.profileAttachment &&
  //     StringHelpers.getImage(user?.profileAttachment);

  //   if (!imagePath) {
  //     addToast("error", "تصویر یافت نشد", "این کاربر عکسی برای دانلود ندارد.");
  //     return;
  //   }

  //   const originalName = user?.profileAttachment?.fileName ?? "";
  //   const extension = originalName.match(/\.[^.]+$/)?.[0] ?? ".jpg";

  //   const downloadName = originalName
  //     ? originalName
  //     : `profile_image${extension}`;

  //   try {
  //     const response = await fetch(imagePath);

  //     if (!response.ok) {
  //       throw new Error("مشکل در دریافت فایل از سرور");
  //     }

  //     const blob = await response.blob();
  //     window.open(imagePath, "_blank");

  //     const blobUrl = window.URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = blobUrl;
  //     link.download = downloadName;

  //     document.body.appendChild(link);
  //     link.click();

  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(blobUrl);
  //   } catch (err) {
  //     console.error(err);
  //     addToast(
  //       "error",
  //       "خطا",
  //       "دانلود تصویر انجام نشد. (ممکن است مشکل CORS باشد)",
  //     );
  //   }
  // };

  //   const handleDownloadImage = async (user: any) => {
  //   const imagePath =
  //     user?.profileAttachment &&
  //     StringHelpers.getImage(user?.profileAttachment);

  //   if (!imagePath) {
  //     addToast("error", "تصویر یافت نشد", "این کاربر عکسی برای دانلود ندارد.");
  //     return;
  //   }

  //   const originalName = user?.profileAttachment?.fileName ?? "";
  //   const extension = originalName.match(/\.[^.]+$/)?.[0] ?? ".jpg";

  //   const downloadName = originalName
  //     ? originalName
  //     : `profile_image${extension}`;

  //   try {
  //     const response = await fetch(imagePath);

  //     if (!response.ok) {
  //       throw new Error("مشکل در دریافت فایل از سرور");
  //     }

  //     // ۲. تبدیل فایل به داده خام مرورگر (Blob)
  //     const blob = await response.blob();

  //     // ۳. ساخت یک آدرس موقت داخلی برای دانلود
  //     const blobUrl = window.URL.createObjectURL(blob);

  //     // ۴. ایجاد تگ a مخفی و شبیه‌سازی کلیک روی آن
  //     const link = document.createElement("a");
  //     link.href = blobUrl;
  //     link.download = downloadName;

  //     document.body.appendChild(link);
  //     link.click();

  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(blobUrl);

  //     // در صورت نیاز می‌توانید اینجا یک پیغام موفقیت هم نمایش دهید
  //     // addToast("success", "موفق", "تصویر با موفقیت دانلود شد.");
  //   } catch (err) {
  //     console.error(err);
  //     addToast(
  //       "error",
  //       "خطا",
  //       "دانلود تصویر انجام نشد. (ممکن است مشکل CORS باشد)",
  //     );
  //   }
  // };

  const handleDownloadImage = async (user: any) => {
    // ۱. گرفتن نام فایل و کد پرسنلی
    const fileName = user?.profileAttachment?.fileName;
    const personalCode = user?.personalCode;

    if (!fileName) {
      addToast("error", "تصویر یافت نشد", "این کاربر عکسی برای دانلود ندارد.");
      return;
    }

    const baseUrl = "http://localhost:5132";
    const downloadUrl = `${baseUrl}/api/users/downloadProfileImage?fileName=${encodeURIComponent(fileName)}&personalCode=${encodeURIComponent(personalCode || "profile")}`;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("عدم دسترسی. توکن نامعتبر است یا ارسال نشده است.");
        } else if (response.status === 404) {
          throw new Error("تصویر در سرور یافت نشد.");
        }
        throw new Error("خطا در دریافت فایل از سرور");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;

      const extension = fileName.match(/\.[^.]+$/)?.[0] ?? ".png";
      link.download = `${personalCode || "profile"}${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error("Download Error:", err);
      addToast("error", "خطا در دانلود", err.message);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const addToast = (
    type: "success" | "error" | "info" | "warning",
    title: string,
    message: string,
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      console.log(res);

      if (res?.data?.code === 0) {
        setUsers(res?.data?.result);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      addToast(
        "error",
        language === "fa" ? "خطا در دریافت لیست" : "Fetch Error",
        language === "fa"
          ? "امکان دریافت لیست کاربران وجود ندارد."
          : "Failed to load users list.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuota = async (user: any, newStatus: number) => {
    const postData = {
      personalCode: user.personalCode,
      id: user?.id,
      aiPhotoUsed: newStatus,
    };
    if (!isAdmin) {
      addToast(
        "error",
        language === "fa" ? "عدم دسترسی ادمین" : "Admin Permission Required",
        language === "fa"
          ? "تغییر سقف فقط توسط مدیر سیستم (Admin) امکان‌پذیر است."
          : "Only Admin users can change quota settings.",
      );
      return;
    }
    setUpdatingUserId(user?.id);
    try {
      const res = await updatedLimitUsedPhotoAi(postData);
      if (res?.data?.code === 0) {
        setUsers((prev) =>
          prev.map((u: any) =>
            u?.id === user?.id ? { ...u, aiPhotoUsed: newStatus } : u,
          ),
        );

        const targetUser = users.find((u) => u?.id === user?.id);
        const userName = targetUser?.name;

        addToast(
          "success",
          language === "fa" ? "بروزرسانی سقف پرسنلی" : "Quota Updated",
          newStatus === 1
            ? language === "fa"
              ? `ساخت تصویر برای کاربر غیرفعال شد.`
              : `AI photo disabled.`
            : language === "fa"
              ? `ساخت تصویر برای کاربر مجدداً فعال گردید.`
              : `AI photo re-enabled.`,
        );
      } else {
        throw new Error(data.error || "Failed to update limit");
      }
    } catch (err: any) {
      addToast(
        "error",
        language === "fa" ? "خطا در ثبت" : "Error",
        err.message ||
          (language === "fa"
            ? "عملیات بروزرسانی با خطا مواجه شد."
            : "Update operation failed."),
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter((u: any) => {
    const name = u?.name;
    const role = u?.role;
    const dept = u?.department;
    const matchesSearch =
      name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      u?.email?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      u?.personalCode?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      role?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      dept?.toLowerCase().includes(searchQuery?.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "allowed" && u?.aiPhotoUsed) return false;
    if (filterStatus === "disabled" && !u?.aiPhotoUsed) return false;
    return true;
  });

  const totalAllowed = users.filter((u) => !u?.aiPhotoUsed).length;
  const totalDisabled = users.filter((u) => u?.aiPhotoUsed).length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="space-y-6 pb-12">
      <ToastContainer toasts={toasts} onDismiss={removeToast} dir={dir} />

      <div className="via-bmw-surface relative overflow-hidden bg-bmw-surface shadow-sm rounded-2xl p-6  border border-bmw-border">
        <div className="mb-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bmw-blue via-sky-400 to-indigo-500" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bmw-blue/20 border border-bmw-blue/40 flex items-center justify-center text-bmw-blue shadow-inner">
                  <Users className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold text-bmw-text tracking-tight">
                  {language === "fa"
                    ? "مدیریت کاربران و سقف تصویر هوشمند"
                    : "Users Directory & Quota Management"}
                </h1>
              </div>
              <p className="text-xs text-bmw-textSec max-w-2xl leading-relaxed">
                {language === "fa"
                  ? "مشاهده و مدیریت کاربران پرشیا خودرو، کنترل دقیق سقف یک‌باره درخواست ساخت تصویر پرسنلی (Quota Enforcement) و فعال‌سازی یا غیرفعال‌سازی توسط مدیر سیستم."
                  : "Browse Persia Khodro team members, monitor 1-time AI Passport Photo quotas, and enable/disable request allowances."}
              </p>
            </div>
            {/*<div className="flex items-center gap-3 shrink-0">
               <button
                onClick={() => {
                  setIsAdmin(!isAdmin);
                  addToast(
                    "info",
                    language === "fa" ? "تغییر نقش دسترسی" : "Role Changed",
                    !isAdmin
                      ? language === "fa"
                        ? "نقش شما به مدیر سیستم (Admin) تغییر یافت."
                        : "Switched to System Admin role."
                      : language === "fa"
                        ? "نقش شما به کاربر عادی تغییر یافت."
                        : "Switched to Normal User role.",
                  );
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all shadow-md ${
                  isAdmin
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-400 hover:bg-amber-500/20 shadow-amber-950/20"
                    : "bg-bmw-surface border-bmw-border text-bmw-textSec hover:text-bmw-text"
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>
                  {isAdmin
                    ? language === "fa"
                      ? "نقش: مدیر سیستم (Admin)"
                      : "Role: System Admin"
                    : language === "fa"
                      ? "نقش: کاربر عادی"
                      : "Role: Normal User"}
                </span>
              </button>

              <button
                onClick={fetchUsers}
                className="p-2.5 rounded-xl bg-bmw-surface border border-bmw-border text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover transition-colors"
                title={language === "fa" ? "بروزرسانی لیست" : "Refresh List"}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div> */}
          </div>
          <div className="grid grid-cols-12 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-bmw-border/60">
            <div className="bg-bmw-hover/60 col-span-12 lg:col-span-4 border border-bmw-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-bmw-textSec">
                  {language === "fa" ? "کل پرسنل ثبت‌شده" : "Total Employees"}
                </div>
                <div className="text-xl font-extrabold text-bmw-text mt-0.5">
                  {users?.length}
                </div>
              </div>
            </div>

            <div className="bg-bmw-hover/60 col-span-12 lg:col-span-4 border border-bmw-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-bmw-textSec">
                  {language === "fa"
                    ? "مجاز به ساخت تصویر"
                    : "Allowed Quotas (0)"}
                </div>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  {totalAllowed}
                </div>
              </div>
            </div>

            <div className="bg-bmw-hover/60 border col-span-12 lg:col-span-4 border-bmw-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-bmw-textSec">
                  {language === "fa"
                    ? "تکمیل‌شده / غیرفعال"
                    : "Used/Disabled Quotas (1)"}
                </div>
                <div className="text-xl font-extrabold text-rose-400 mt-0.5">
                  {totalDisabled}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search
              className={`absolute top-1/2 -translate-y-1/2 ${dir === "rtl" ? "right-3" : "left-3"} w-4 h-4 text-bmw-textSec`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "fa"
                  ? "جستجوی نام، کد کارمندی، ایمیل یا واحد..."
                  : "Search name, code, email, department..."
              }
              className={`w-full bg-bmw-base border border-bmw-border rounded-lg py-2 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue transition-colors ${
                dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"
              }`}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterStatus === "all"
                  ? "bg-bmw-blue text-white shadow-md"
                  : "bg-bmw-base border border-bmw-border text-bmw-textSec hover:text-bmw-text"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {language === "fa" ? `همه کاربران` : `All Users `}
            </button>

            <button
              onClick={() => setFilterStatus("allowed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterStatus === "allowed"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-bmw-base border border-bmw-border text-bmw-textSec hover:text-bmw-text"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              {language === "fa" ? `مجاز` : `Allowed (0)`}
            </button>

            <button
              onClick={() => setFilterStatus("disabled")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterStatus === "disabled"
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-bmw-base border border-bmw-border text-bmw-textSec hover:text-bmw-text"
              }`}
            >
              <UserX className="w-3.5 h-3.5 text-rose-400" />
              {language === "fa" ? `غیرفعال` : `Disabled (1)`}
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-bmw-surface border border-bmw-border rounded-xl space-y-3">
          <RefreshCw className="w-8 h-8 text-bmw-blue animate-spin" />
          <p className="text-xs text-bmw-textSec">
            {language === "fa"
              ? "در حال بارگذاری لیست کاربران..."
              : "Loading users list..."}
          </p>
        </div>
      ) : filteredUsers?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-bmw-surface border border-bmw-border rounded-xl space-y-3 text-center p-6">
          <AlertCircle className="w-10 h-10 text-bmw-textSec" />
          <h3 className="text-sm font-bold text-bmw-text">
            {language === "fa" ? "هیچ کاربری یافت نشد" : "No users found"}
          </h3>
          <p className="text-xs text-bmw-textSec max-w-sm">
            {language === "fa"
              ? "کاربری با این مشخصات یا فیلتر در سیستم پیدا نشد."
              : "No user matched your search criteria or filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((user: any) => {
              const isAllowed = !user.aiPhotoUsed;
              const isUpdatingThisUser = updatingUserId === user.id;
              console.log("avatar", user);
              const fixImage =
                user?.profileAttachment &&
                StringHelpers.getImage(user?.profileAttachment);
              return (
                <div
                  key={user?.id}
                  className="bg-bmw-surface border border-bmw-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CustomImage src={fixImage} size={55} />
                        {/* <img
                        src={}
                        alt={user?.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-bmw-blue/40 shadow-sm shrink-0"
                      /> */}
                        <div className="space-y-0.5 min-w-0">
                          <h3 className="text-sm font-bold text-bmw-text truncate">
                            {user?.firstName} {user?.lastName}
                          </h3>
                          <div className="text-[11px] text-bmw-textSec flex items-center gap-1 truncate">
                            <span className="truncate flex items-center">
                              {user?.email}
                            </span>
                            <Mail className="w-3 h-3 flex items-center justify-center mb-1 text-bmw-blue shrink-0" />
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded bg-bmw-hover text-[10px] font-mono font-bold text-bmw-textSec border border-bmw-border/60 shrink-0">
                        {user?.personalCode}
                      </span>
                    </div>

                    {/* Department & Role */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-bmw-hover/50 p-2 rounded-lg border border-bmw-border/40">
                        <span className="text-bmw-textSec block text-[10px]">
                          {language === "fa" ? "واحد سازمانی:" : "Department:"}
                        </span>
                        <span className="font-semibold text-bmw-text truncate block">
                          {user?.department}
                        </span>
                      </div>

                      <div className="bg-bmw-hover/50 p-2 rounded-lg border border-bmw-border/40">
                        <span className="text-bmw-textSec block text-[10px]">
                          {user?.organizationalUnit}
                        </span>
                        <span className="font-semibold text-bmw-text truncate block">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadImage(user)}
                      className="w-full py-2.5 cursor-pointer px-3 rounded-xl bg-bmw-blue/10 hover:bg-bmw-blue/20 text-bmw-blue border border-bmw-blue/30 hover:border-bmw-blue/50 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>
                        {language === "fa"
                          ? "دانلود تصویر پرسنل"
                          : "Download Photo"}
                      </span>
                    </button>
                  </div>
                  <div className="pt-3 border-t border-bmw-border space-y-3">
                    {/* <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-bmw-text flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-bmw-blue" />
                      {language === "fa"
                        ? "سقف ساخت تصویر هوشمند:"
                        : "AI Photo Quota:"}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                        isAllowed
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {isAllowed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          {language === "fa" ? "مجاز (۰)" : "Active (0)"}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          {language === "fa" ? "غیرفعال (۱)" : "Disabled (1)"}
                        </>
                      )}
                    </span>
                  </div> */}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-bmw-textSec">
                        <span>
                          {language === "fa"
                            ? "مدیریت وضعیت توسط ادمین:"
                            : "Admin Quota Enforcement:"}
                        </span>
                        {!isAdmin && (
                          <span className="text-amber-500/80 font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            {language === "fa" ? "فقط ادمین" : "Admin Only"}
                          </span>
                        )}
                      </div>

                      {isAdmin ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isUpdatingThisUser}
                            onClick={() => handleToggleQuota(user, 0)}
                            className={`py-1.5 cursor-pointer px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                              isAllowed
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-sm"
                                : "bg-bmw-hover border-bmw-border text-bmw-textSec hover:text-bmw-text"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {language === "fa" ? "فعال" : "Enable (0)"}
                          </button>
                          <button
                            type="button"
                            disabled={isUpdatingThisUser}
                            onClick={() => handleToggleQuota(user, 1)}
                            className={`py-1.5 cursor-pointer px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                              !isAllowed
                                ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-sm"
                                : "bg-bmw-hover border-bmw-border text-bmw-textSec hover:text-bmw-text"
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {language === "fa" ? "غیرفعال" : "Disable (1)"}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-bmw-hover/40 border border-bmw-border/60 rounded-lg p-2 text-[11px] text-bmw-textSec flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>
                            {language === "fa"
                              ? "تغییر این فیلد نیازمند دسترسی ادمین است."
                              : "Changing this quota requires Admin rights."}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-bmw-border/40 mt-6 animate-fade-in">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  currentPage === 1
                    ? "bg-bmw-surface/30 border-bmw-border/30 text-bmw-textSec/30 cursor-not-allowed opacity-55"
                    : "bg-bmw-surface border-bmw-border text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover"
                }`}
              >
                {language === "fa" ? "قبلی" : "Previous"}
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (pageNum) => (
                  <button
                    type="button"
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                      currentPage === pageNum
                        ? "bg-bmw-blue border-bmw-blue text-white shadow-md"
                        : "bg-bmw-surface border-bmw-border text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover"
                    }`}
                  >
                    {language === "fa"
                      ? pageNum.toLocaleString("fa-IR")
                      : pageNum}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  currentPage === totalPages
                    ? "bg-bmw-surface/30 border-bmw-border/30 text-bmw-textSec/30 cursor-not-allowed opacity-55"
                    : "bg-bmw-surface border-bmw-border text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover"
                }`}
              >
                {language === "fa" ? "بعدی" : "Next"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
