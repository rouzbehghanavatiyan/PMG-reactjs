import React, { useEffect, useMemo, useState } from "react";
import Loading from "../../components/UI/Loading";
import Button from "../../components/UI/Button";
import ComboBox from "../../components/UI/ComboBox";
import { CustomTable, type Column } from "../../components/UI/CustomTable";
import { Sheet } from "lucide-react";
import { getAllFeedback } from "../../services/dotNet";
import StringHelpers from "../../utils/stringHelpers";
import * as XLSX from "xlsx";

const PAGE_SIZE = 6;
interface FeedbackItem {
  id: string | number;
  title: string;
  category?: { fa?: string } | string;
  status: string;
  userName?: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, { fa: string; style: string; en: string }> = {
  submitted: {
    fa: "ثبت اولیه",
    style: " text-sky-700 ring-sky-600/20",
    en: "submitted",
  },
  under_review: {
    fa: "در دست بررسی",
    style: " text-amber-700 ring-amber-600/20",
    en: "under_review",
  },
  approved: {
    fa: "تأیید شده",
    style: " text-emerald-700 ring-emerald-600/20",
    en: "approved",
  },
  rejected: {
    fa: "رد شده",
    style: " text-rose-700 ring-rose-600/20",
    en: "rejected",
  },
};

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([key, val]) => ({
  id: key,
  title: val.fa,
  en: val.en,
}));

const getStatusDetails = (statusEn: string) => {
  return (
    STATUS_MAP[statusEn] ?? {
      fa: statusEn || "نامشخص",
      style: "bg-slate-50 text-slate-600 ring-slate-400/20",
    }
  );
};

const Reports = () => {
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("پیشنهادات");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [allStatus] = useState(STATUS_OPTIONS);
  const [status, setStatus] = useState<any | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await getAllFeedback();
      const { data } = response;
      if (data && data.length !== 0) {
        setFeedbackList(data);
      }
    } catch (error) {
      console.error("Error fetching feedback from database:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const filteredList = useMemo(() => {
    return feedbackList.filter((item) => {
      const matchesSearch =
        item?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.userName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = status
        ? item?.status?.trim().toLowerCase() === status.id?.toLowerCase()
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [feedbackList, searchQuery, status]);

  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE) || 1;

  const exportToExcel = () => {
    if (!filteredList || filteredList.length === 0) return;

    const dataToExport = filteredList.map((item, index) => {
      const catTitle =
        typeof item.category === "object" ? item.category?.fa : item.category;

      return {
        ردیف: index + 1,
        کد: item.id,
        عنوان: item.title || "—",
        دسته‌بندی: catTitle || "—",
        وضعیت: getStatusDetails(item.status)?.fa || "نامشخص",
        کاربر: item.userName || "ناشناس",
        "تاریخ ثبت": item.createdAt
          ? StringHelpers.toPersianDateTime(item.createdAt)
          : "—",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // تنظیم جهت نمایش راست‌به‌چپ (RTL) در اکسل
    if (!worksheet["!views"]) worksheet["!views"] = [];
    worksheet["!views"].push({ rightToLeft: true });

    // تنظیم عرض ستون‌ها
    worksheet["!cols"] = [
      { wch: 8 }, // ردیف
      { wch: 12 }, // کد
      { wch: 35 }, // عنوان
      { wch: 20 }, // دسته‌بندی
      { wch: 18 }, // وضعیت
      { wch: 20 }, // کاربر
      { wch: 22 }, // تاریخ ثبت
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab);

    const fileName = `گزارش_${activeTab}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage]);

  const stats = useMemo(() => {
    return {
      total: feedbackList.length,
      underReview: feedbackList.filter(
        (item) => item?.status?.trim().toLowerCase() === "under_review",
      ).length,
      approved: feedbackList.filter(
        (item) => item?.status?.trim().toLowerCase() === "approved",
      ).length,
      rejected: feedbackList.filter(
        (item) => item?.status?.trim().toLowerCase() === "rejected",
      ).length,
    };
  }, [feedbackList]);

  const columns: Column<FeedbackItem>[] = useMemo(
    () => [
      {
        key: "rowIndex",
        title: "ردیف",
        width: "w-14",
        align: "center",
        hideOnMobileCard: true,
        render: (_, index) => (
          <span className="text-xs text-slate-500 font-mono">
            {((currentPage - 1) * PAGE_SIZE + index + 1).toLocaleString(
              "fa-IR",
            )}
          </span>
        ),
      },
      {
        key: "title",
        title: "عنوان",
        width: "",
        render: (item) => (
          <p
            className=" text-xs sm:text-sm font-semibold text-slate-700"
            title={item.title}
          >
            {item.title}
          </p>
        ),
      },
      {
        key: "id",
        title: "کد",
        width: "w-24",
        align: "center",
        render: (item) => (
          <span className="text-xs text-slate-400 font-mono truncate block">
            {item.id}
          </span>
        ),
      },
      {
        key: "category",
        title: "دسته‌بندی",
        width: "w-32",
        align: "center",
        render: (item) => {
          const catTitle =
            typeof item.category === "object"
              ? item.category?.fa
              : item.category;
          return (
            <span className="truncate block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 text-center">
              {catTitle ?? "—"}
            </span>
          );
        },
      },
      {
        key: "status",
        title: "وضعیت",
        width: "w-28",
        align: "center",
        render: (item) => {
          const statusInfo = getStatusDetails(item?.status);
          return (
            <span
              className={`truncate block text-center rounded-full px-2 py-1 text-[10px] sm:text-[11px] font-semibold ${statusInfo.style}`}
            >
              {statusInfo.fa}
            </span>
          );
        },
      },
      {
        key: "userName",
        title: "کاربر",
        width: "w-32",
        align: "center",
        render: (item) => (
          <span className="text-xs text-slate-600 truncate block">
            {item?.userName ?? "ناشناس"}
          </span>
        ),
      },
      {
        key: "createdAt",
        title: "تاریخ ثبت",
        width: "w-36",
        align: "center",
        render: (item) => (
          <span className="text-[11px] text-slate-500 whitespace-nowrap">
            {StringHelpers.toPersianDateTime(item.createdAt)}
          </span>
        ),
      },
    ],
    [currentPage],
  );

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {isLoading && <Loading />}

      <div className="flex flex-wrap gap-2 sm:gap-4 rounded-xl border border-bmw-border bg-bmw-surface p-3 sm:p-4 shadow-sm">
        <Button className="flex-1 sm:flex-none text-xs sm:text-sm">
          نظام پیشنهادها و انتقادات
        </Button>
        <Button
          variant="ghost"
          className="flex-1 sm:flex-none text-xs sm:text-sm"
        >
          نظرسنجی
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            کل پیشنهادات
          </p>
          <p className="text-lg sm:text-2xl font-bold text-slate-800">
            {stats.total.toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            در دست بررسی
          </p>
          <p className="text-lg sm:text-2xl font-bold text-amber-500">
            {stats.underReview.toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            تأیید شده
          </p>
          <p className="text-lg sm:text-2xl font-bold text-green-500">
            {stats.approved.toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            رد شده
          </p>
          <p className="text-lg sm:text-2xl font-bold text-red-500">
            {stats.rejected.toLocaleString("fa-IR")}
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl">
        <div className="grid grid-cols-12  gap-3 border-b border-slate-100 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="col-span-12 md:col-span-3 flex gap-2 shrink-0">
            <Button
              variant={activeTab === "پیشنهادات" ? "outline-orange" : "ghost"}
              className="flex-1 lg:flex-none h-10 font-bold text-slate-800 text-xs sm:text-sm"
              onClick={() => setActiveTab("پیشنهادات")}
            >
              پیشنهادات
            </Button>
            <Button
              variant={activeTab === "انتقادات" ? "outline-orange" : "ghost"}
              className="flex-1 lg:flex-none h-10 font-bold text-slate-800 text-xs sm:text-sm"
              onClick={() => setActiveTab("انتقادات")}
            >
              انتقادات
            </Button>
          </div>
          <span className="col-span-12 md:col-span-4 w-full sm:w-64">
            <input
              type="text"
              placeholder="جستجو در عنوان یا نام کاربر..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-64 rounded-lg border border-bmw-border bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 h-10"
            />
          </span>
          <div className="col-span-12 md:col-span-5 flex sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <div className="w-full sm:w-52">
              <ComboBox
                placeholder="فیلتر بر اساس وضعیت..."
                options={allStatus}
                keyId="id"
                keyValue="title"
                value={status}
                onChange={(val) => {
                  setStatus(val);
                  setCurrentPage(1);
                }}
              />
            </div>
            <span className="col-span-2">
              <Button
                variant="success"
                onClick={exportToExcel}
                leftIcon={<Sheet size={16} />}
                className="w-full sm:w-auto font-bold text-slate-800 h-10 shrink-0 text-xs sm:text-sm justify-center"
              >
                اکسل
              </Button>
            </span>
          </div>
        </div>
        <CustomTable<FeedbackItem>
          data={paginatedList}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="موردی یافت نشد."
          pagination={{
            currentPage,
            totalPages,
            pageSize: PAGE_SIZE,
            totalCount: filteredList.length,
            onPageChange: (page) => setCurrentPage(page),
          }}
        />
      </div>
    </div>
  );
};

export default Reports;
