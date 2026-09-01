import React, { useEffect, useMemo, useState } from "react";
import Button from "../../components/UI/Button";
import { FileText, Sheet } from "lucide-react";
import CustomTable, { type Column } from "../../components/UI/CustomTable";
import StringHelpers from "../../utils/stringHelpers";
import { useAppSelector } from "../../features/store";
import { allPolls } from "../../services/dotNet";
import * as XLSX from "xlsx";

const PAGE_SIZE = 10;

const PollReports: React.FC = () => {
  const [allPoll, setAllPoll] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("همه");

  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );

  const handleGetAllPoll = async () => {
    try {
      setLoading(true);
      const res = await allPolls();
      const { result, code } = res?.data || {};
      if (code === 0 && Array.isArray(result)) {
        setAllPoll(result);
      } else if (Array.isArray(res?.data)) {
        setAllPoll(res.data);
      }
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolls = useMemo(() => {
    return allPoll.filter((item) => {
      let matchesTab = true;

      if (activeTab === "عمومی") {
        matchesTab = item.typeId === 1;
      } else if (activeTab === "رستوران") {
        matchesTab = item.typeId !== 1;
      }
      const matchesSearch = !searchQuery.trim()
        ? true
        : item.title?.toLowerCase().includes(searchQuery.toLowerCase().trim());

      return matchesTab && matchesSearch;
    });
  }, [allPoll, activeTab, searchQuery]);

  useEffect(() => {
    if (userLogin?.personalCode) {
      handleGetAllPoll();
    }
  }, [userLogin?.personalCode]);

  const columns: Column<any>[] = useMemo(
    () => [
      {
        key: "rowIndex",
        title: "ردیف",
        align: "center",
        width: "w-24",

        hideOnMobileCard: true,
        render: (_, index) => (
          <span className="text-xs text-slate-500 font-mono">{index + 1}</span>
        ),
      },
      {
        key: "title",
        title: "عنوان",
        render: (item) => (
          <p
            className="text-xs sm:text-sm font-semibold text-slate-700 truncate"
            title={item.title}
          >
            {item.title}
          </p>
        ),
      },
      {
        key: "typeId",
        title: "نوع",
        align: "center",
        render: (item) => (
          <span className="text-xs text-slate-600">
            {item.typeId === 1 ? "عمومی" : "رستوران"}
          </span>
        ),
      },
      {
        key: "questionsCount",
        title: "تعداد سوالات",
        align: "center",
        render: (item) => (
          <span className="text-xs text-slate-600 font-mono">
            {item.questionsCount ?? item.questions?.length ?? 0}
          </span>
        ),
      },
      {
        key: "userAnswers",
        title: "تعداد پاسخ ها",
        width: "w-32",
        align: "center",
        render: (item) => (
          <span className="text-xs text-slate-600 font-mono">
            {item.userAnswers}
          </span>
        ),
      },
      // {
      //   key: "userAnswers",
      //   title: "پاسخ های مثبت",
      //   width: "w-32",
      //   align: "center",
      //   render: (item) => (
      //     <span className="text-xs text-slate-600 font-mono">
      //       {item.userAnswers}
      //     </span>
      //   ),
      // },
      // {
      //   key: "userAnswers",
      //   title: "پاسخ های منفی",
      //   width: "w-32",
      //   align: "center",
      //   render: (item) => (
      //     <span className="text-xs text-slate-600 font-mono">
      //       {item.userAnswers}
      //     </span>
      //   ),
      // },
      {
        key: "createdAt",
        title: "تاریخ ثبت",
        align: "center",
        render: (item) => (
          <span className="text-[11px] text-slate-500 whitespace-nowrap">
            {StringHelpers.toPersianDateTime?.(item.createdAt) ||
              item.createdAt}
          </span>
        ),
      },
    ],
    [],
  );

  const handleExportExcel = () => {
    if (filteredPolls.length === 0) {
      alert("داده‌ای برای خروجی گرفتن وجود ندارد.");
      return;
    }

    const exportData = filteredPolls.map((item, index) => ({
      ردیف: index + 1,
      عنوان: item.title || "—",
      نوع: item.typeId === 1 ? "عمومی" : "رستوران",
      "تعداد سوالات": item.questionsCount ?? item.questions?.length ?? 0,
      "تعداد پاسخ ها": item.userAnswers ?? 0,
      "تاریخ ثبت":
        StringHelpers.toPersianDateTime?.(item.createdAt) ||
        item.createdAt ||
        "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    worksheet["!dir"] = "rtl";

    XLSX.utils.book_append_sheet(workbook, worksheet, "گزارش نظرسنجی‌ها");

    XLSX.writeFile(workbook, "Polls_Report.xlsx");
  };


  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            کل نظرسنجی‌ها
          </p>
          <p className="text-lg sm:text-2xl font-bold text-slate-800">
            {allPoll.length}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            نظرسنجی‌های رستوران
          </p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600">
            {allPoll.filter((x) => x.typeId !== 1).length}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            نظرسنجی‌های عمومی
          </p>
          <p className="text-lg sm:text-2xl font-bold text-emerald-600">
            {allPoll.filter((x) => x.typeId === 1).length}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-12 sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 p-3 sm:p-4">
        <div className="col-span-4 flex gap-2 shrink-0">
          <Button
            variant={activeTab === "همه" ? "outline-orange" : "ghost"}
            className="lg:flex-none h-10 font-bold text-slate-800 text-xs sm:text-sm"
            onClick={() => setActiveTab("همه")}
          >
            همه
          </Button>
          <Button
            variant={activeTab === "رستوران" ? "outline-orange" : "ghost"}
            className="lg:flex-none h-10 font-bold text-slate-800 text-xs sm:text-sm"
            onClick={() => setActiveTab("رستوران")}
          >
            رستوران
          </Button>
          <Button
            variant={activeTab === "عمومی" ? "outline-orange" : "ghost"}
            className="lg:flex-none h-10 font-bold text-slate-800 text-xs sm:text-sm"
            onClick={() => setActiveTab("عمومی")}
          >
            عمومی
          </Button>
        </div>
        <div className="col-span-8 flex gap-6 w-full sm:max-w-md">
          <input
            type="text"
            placeholder="جستجو بر اساس عنوان نظرسنجی..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-10"
          />
          <Button
            variant="success"
            onClick={handleExportExcel}
            leftIcon={<Sheet size={16} />}
            className="sm:w-auto font-bold text-slate-800 h-10 shrink-0 text-xs sm:text-sm justify-center"
          >
            خروجی اکسل
          </Button>
          <Button
            variant="danger"
            onClick={handleExportExcel}
            leftIcon={<FileText size={16} />}
            className="sm:w-auto font-bold text-slate-800 h-10 shrink-0 text-xs sm:text-sm justify-center"
          >
            خروجی PDF
          </Button>
        </div>
      </div>
      <CustomTable
        data={filteredPolls}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        pageSize={PAGE_SIZE}
        emptyMessage="موردی یافت نشد."
      />
    </div>
  );
};

export default PollReports;
