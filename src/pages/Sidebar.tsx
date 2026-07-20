import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FileText,
  CreditCard,
  Utensils,
  Ticket,
  LogOut,
  Settings,
  X,
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  Building,
  MessageSquare,
  Network,
  Lightbulb,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import ThemeAndLang from "../common/ThemeAndLang";
import { useAppSelector } from "../features/store";
import { useHasPermission } from "../hooks/usePermissions";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { t, language, setLanguage, dir } = useLanguage();
  const user = useAppSelector((state) => state);
  const { hasPermission } = useHasPermission();
  const handleLogout = () => {
    navigate("/");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fa" : "en");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "dashboard", path: "/dashboard" },
    { icon: User, label: "profile", path: "/profile" },
    {
      icon: Building,
      label: "introductionOrganization",
      path: "/introductionOrganization",
    },
    { icon: CreditCard, label: "payslips", path: "/payslips" },
    {
      icon: CalendarDays,
      label: "calendar",
      path: "/calendar",
      disabled: true,
    },
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
    { icon: FileText, label: "documents", path: "/documents", disabled: true },
    { icon: Utensils, label: "food_order", path: "/food" },
    { icon: ClipboardList, label: "surveys", path: "/surveys" },
    { icon: Ticket, label: "support", path: "/support", disabled: true },
    { icon: Lightbulb, label: "suggestions_feedback", path: "/feedbackSystem" },
  ];

  const hiddenTransform =
    dir === "rtl" ? "translate-x-full" : "-translate-x-full";

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={`
    fixed inset-y-0 
    ${dir === "rtl" ? "right-0 border-l" : "left-0 border-r"}
    w-64
    bg-bmw-surface
    border-bmw-border
    z-50
    flex flex-col
    transform transition-transform duration-300 ease-in-out
    lg:translate-x-0
    ${isOpen ? "translate-x-0" : dir === "rtl" ? "translate-x-full" : "-translate-x-full"}
  `}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-bmw-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-900 to-bmw-blue flex items-center justify-center border border-white/20">
              <span className="text-white font-bold text-xs">PMG</span>
            </div>
            <span className="text-bmw-text font-semibold tracking-wide text-lg">
              PERSIA<span className="font-light">KHODRO</span>
            </span>
          </div>
          <button className="lg:hidden text-bmw-textSec hover:text-bmw-text">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-x"
              aria-hidden="true"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        <div className="flex flex-col h-full">
          {/* <div className="bg-gray-100 mt-4 py-2 flex items-center justify-center gap-2 ">
            <span className="font-light text-lg">{firstName}</span>
            <span className="font-light">{lastName}</span>
          </div> */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-bmw-textSec hover:text-bmw-text"
          >
            <X size={24} />
          </button>
          <nav className="flex-1 py-2 px-2 space-y-1">
            {navItems.map((item) =>
              item.disabled ? (
                <div
                  key={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-500 cursor-not-allowed opacity-50"
                >
                  <item.icon size={20} className="stroke-[1.5]" />
                  <span className="text-sm font-medium tracking-wide">
                    {t(item.label)}
                  </span>
                </div>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
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
              ),
            )}
          </nav>
          <div className="p-4 border-t mb-5 border-bmw-border space-y-2 w-full">
            <ThemeAndLang />
            <button
              disabled={true}
              className="flex text-gray-300 items-center gap-3 px-4 py-3 w-full max-w-full text-bmw-textSec rounded-md transition-colors"
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
      </aside>
    </>
  );
};

export default Sidebar;
