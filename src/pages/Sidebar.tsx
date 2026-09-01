import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  LogOut,
  Settings,
  X,
  MessageCircleWarning,
  Building,
  CreditCard,
  LayoutGrid,
  MessageSquare,
  Utensils,
  ClipboardList,
  Ticket,
  Lightbulb,
  ClipboardMinus,
  Network,
  Users,
  // سایر آیکون‌های مورد نیاز خود را اینجا ایمپورت کنید
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import ThemeAndLang from "../common/ThemeAndLang";
import { useAppSelector } from "../features/store";
import { useHasPermission } from "../hooks/usePermissions";
import ShowListeningEarModal from "./Login/ShowListeningEarModal";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// تایپ مربوط به آیتم‌های منو
interface NavItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  action?: () => void;
  disabled?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { t, language, setLanguage, dir } = useLanguage();
  const user = useAppSelector((state) => state);
  const { hasPermission } = useHasPermission();
  const [showListeningEar, setShowListeningEar] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: "dashboard", path: "/dashboard" },
    { icon: User, label: "profile", path: "/profile" },
    {
      icon: MessageCircleWarning,
      label: "listening_ear",
      action: () => setShowListeningEar(true),
    },
    // ...(hasPermission("chatSmart.read")
    //   ? [{ icon: MessageCircleWarning, label: "chat", path: "/chat" }]
    //   : []),
    {
      icon: Building,
      label: "introductionOrganization",
      path: "/introductionOrganization",
    },
    { icon: CreditCard, label: "payslips", path: "/payslips" },
    // {
    //   icon: CalendarDays,
    //   label: "calendar",
    //   path: "/calendar",
    //   disabled: true,
    // },
    { icon: LayoutGrid, label: "erp_title", path: "/erp" },
    { icon: MessageSquare, label: "chat_pdf", path: "/chatWithPDF" },
    ...(hasPermission("chatSmart.read")
      ? [
          {
            icon: Network,
            label: "knowledge_graph",
            path: "/smartKnowledgeGraph",
          },
        ]
      : []),

    // { icon: FileText, label: "documents", path: "/documents", disabled: true },
    { icon: Utensils, label: "food_order", path: "/food" },
    { icon: ClipboardList, label: "surveys", path: "/surveys" },
    { icon: Ticket, label: "support", path: "/support", disabled: true },
    { icon: Lightbulb, label: "suggestions_feedback", path: "/feedbackSystem" },
    // ...(hasPermission("chatSmart.read")
    //   ? [
    //       {
    //         icon: ClipboardMinus,
    //         label: "گزارشات",
    //         path: "/reports",
    //         disabled: true,
    //       },
    //     ]
    //   : []),
    {
      icon: ClipboardMinus,
      label: "گزارشات",
      path: "/reports",
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 bottom-0 
          ${dir === "rtl" ? "right-0 border-l" : "left-0 border-r"}
          w-64 bg-bmw-surface border-bmw-border z-50 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : dir === "rtl" ? "translate-x-full" : "-translate-x-full"}
        `}
      >
        {/* هدر و لوگو */}
        <div className="h-20 flex items-center justify-between py-2 px-6 border-b border-bmw-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-900 to-bmw-blue flex items-center justify-center border border-white/20">
              <span className="text-white font-bold text-xs">PMG</span>
            </div>
            <span className="text-bmw-text font-semibold tracking-wide text-lg">
              PERSIA<span className="font-light">KHODRO</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col h-full overflow-hidden">
          {/* دکمه بستن در حالت موبایل */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-bmw-textSec hover:text-bmw-text absolute top-6 rtl:left-6 ltr:right-6"
          >
            <X size={24} />
          </button>

          {/* لیست آیتم‌های منو */}
          <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
            {navItems.map((item, index) => {
              const itemKey = item.path || item.label || index;

              // ۱. حالت غیرفعال (Disabled)
              if (item.disabled) {
                return (
                  <div
                    key={itemKey}
                    className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-500 cursor-not-allowed opacity-50"
                  >
                    <item.icon size={20} className="stroke-[1.5]" />
                    <span className="text-sm font-medium tracking-wide">
                      {t(item.label)}
                    </span>
                  </div>
                );
              }

              // ۲. حالت اجرای تابع (Action) مانند باز کردن مودال
              if (item.action) {
                return (
                  <button
                    key={itemKey}
                    onClick={() => {
                      item.action!();
                      setIsOpen(false); // بستن سایدبار در موبایل پس از کلیک
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full text-start rounded-md transition-all duration-200 group text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text"
                  >
                    <item.icon size={20} className="stroke-[1.5]" />
                    <span className="text-sm font-medium tracking-wide">
                      {t(item.label)}
                    </span>
                  </button>
                );
              }

              // ۳. حالت لینک مسیریابی عادی (NavLink)
              return (
                <NavLink
                  key={itemKey}
                  to={item.path as string}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-bmw-blue text-white shadow-sm shadow-blue-900/50"
                        : "text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text"
                    }
                  `}
                >
                  <item.icon size={20} className="stroke-[1.5]" />
                  <span className="text-sm font-medium tracking-wide">
                    {t(item.label)}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* فوتر سایدبار */}
          <div className="p-4 border-t mb-5 border-bmw-border space-y-2 w-full">
            <ThemeAndLang />
            <button
              disabled={true}
              className="flex items-center gap-3 px-4 py-3 w-full max-w-full text-bmw-textSec rounded-md transition-colors opacity-50 cursor-not-allowed"
            >
              <Settings size={20} className="shrink-0" />
              <span className="text-sm font-medium truncate">
                {t("settings")}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full max-w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
            >
              <LogOut size={20} className="shrink-0" />
              <span className="text-sm font-medium truncate">
                {t("sign_out")}
              </span>
            </button>
          </div>
        </div>

        {/* مودال گوش شنوا */}
      </aside>
      {showListeningEar && (
        <ShowListeningEarModal
          showListeningEar={showListeningEar}
          setShowListeningEar={setShowListeningEar}
        />
      )}
    </>
  );
};

export default Sidebar;
