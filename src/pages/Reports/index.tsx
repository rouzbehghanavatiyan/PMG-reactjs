import React, { useEffect, useMemo, useRef, useState } from "react";
import Loading from "../../components/UI/Loading";
import Button from "../../components/UI/Button";
import ComboBox from "../../components/UI/ComboBox";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircleWarning,
  Sheet,
} from "lucide-react";
import { getAllFeedback } from "../../services/dotNet";
import StringHelpers from "../../utils/stringHelpers";

const PAGE_SIZE = 6;

const STATUS_MAP: Record<string, { fa: string; style: string }> = {
  submitted: {
    fa: "ثبت اولیه",
    style: "bg-sky-50 text-sky-700 ring-sky-600/20",
  },
  under_review: {
    fa: "در دست بررسی",
    style: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  approved: {
    fa: "تأیید شده",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  rejected: {
    fa: "رد شده",
    style: "bg-rose-50 text-rose-700 ring-rose-600/20",
  },
};

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
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [allStatus, setAllStatus] = useState<any[]>([]);
  const [status, setStatus] = useState<any[]>([]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await getAllFeedback();
      const { data } = response;
      if (response?.data?.length !== 0) {
        setFeedbackList(data || []);
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

  // فیلتر و پیجینیشن لیست
  const filteredList = useMemo(() => {
    return feedbackList.filter(
      (item) =>
        item?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.userName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [feedbackList, searchQuery]);

  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE) || 1;

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {isLoading && <Loading />}
      <div className="flex gap-4 rounded-xl border border-bmw-border bg-bmw-surface p-4 shadow-sm sm:flex-row">
        <Button> نظام پیشنهادها و انتقادات </Button>
        <Button variant="ghost"> نظرسنجی </Button>
      </div>

      <div className="grid grid-cols-7 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <div className="flex items-center justify-around rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">کل پیشنهادات</p>
          <p className="text-2xl font-bold text-slate-800">
            {feedbackList.length.toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="flex items-center justify-around rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">در حال بررسی</p>
          <p className="text-2xl font-bold text-amber-500">۳</p>
        </div>
        <div className="flex items-center justify-around rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">تأیید شده</p>
          <p className=" text-2xl font-bold text-indigo-500">۲</p>
        </div>
        <div className="flex items-center justify-around rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">انجام شده</p>
          <p className=" text-2xl font-bold text-emerald-500">۲</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-bmw-border bg-bmw-surface shadow-sm">
        <div className="grid grid-cols-12 border-b border-slate-100 p-4 md:items-center md:justify-between">
          <div className="col-span-2">
            <Button
              variant={activeTab === "پیشنهادات" ? "outline-orange" : "ghost"}
              className="font-bold text-slate-800"
              onClick={() => setActiveTab("پیشنهادات")}
            >
              پیشنهادات
            </Button>
            <Button
              variant={activeTab === "انتقادات" ? "outline-orange" : "ghost"}
              className="font-bold text-slate-800"
              onClick={() => setActiveTab("انتقادات")}
            >
              انتقادات
            </Button>
          </div>
          <div className="grid grid-cols-12 col-span-10 items-end gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="جستجو در پیشنهادات..."
              className="col-span-12 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 sm:col-span-4"
            />

            <Button
              variant="success"
              leftIcon={<Sheet size={16} />}
              className="col-span-12 font-bold text-slate-800 sm:col-span-2"
            >
              اکسل
            </Button>

            <div className="col-span-12 sm:col-span-4">
              <ComboBox
                placeholder="وضعیت‌ها"
                options={allStatus}
                keyId="id"
                keyValue="title"
                value={status}
                onChange={setStatus}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-right">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  کد
                </th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  عنوان پیشنهاد
                </th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  دسته‌بندی
                </th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  وضعیت
                </th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  ثبت کننده
                </th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500">
                  تاریخ ثبت
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.map((report: any) => {
                const statusInfo = getStatusDetails(report?.status);
                return (
                  <tr
                    key={report.id}
                    className="group transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {report.id}
                    </td>
                    <td className="max-w-[280px] px-5 py-4">
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {report.title}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {report?.category?.fa ?? report?.category ?? "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusInfo.style}`}
                      >
                        {statusInfo.fa}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-600">
                        {report.userName ?? "ناشناس"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {StringHelpers.toPersianDateTime(report.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* پیجینیشن */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs sm:flex-row">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-bmw-border bg-bmw-surface px-3 py-1.5 font-bold text-bmw-text transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={14} />
              <span>قبلی</span>
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-xs font-extrabold transition-colors ${
                      isCurrent
                        ? "border-bmw-blue bg-bmw-blue text-white shadow shadow-blue-500/20"
                        : "border-bmw-border bg-bmw-surface text-bmw-text hover:bg-slate-50"
                    }`}
                  >
                    {pageNum.toLocaleString("fa-IR")}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-bmw-border bg-bmw-surface px-3 py-1.5 font-bold text-bmw-text transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>بعدی</span>
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
