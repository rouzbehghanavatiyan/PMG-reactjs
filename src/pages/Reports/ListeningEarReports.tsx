import { useEffect, useMemo, useState, useCallback } from "react";
import { getListeningEarPerDate } from "../../services/dotNet";
import CustomTable, { type Column } from "../../components/UI/CustomTable";
import StringHelpers from "../../utils/stringHelpers";
import CustomDatePicker from "../../components/UI/CustomDatePicker";
import { useForm } from "react-hook-form";
import Button from "../../components/UI/Button";
import { Sheet } from "lucide-react";
import * as XLSX from "xlsx";

export interface ListeningEarReportItem {
  id?: number | string;
  nameAndLastName?: string;
  createDate?: string;
  desc?: string;
  [key: string]: any;
}

interface DateFilterParams {
  fromDate?: string | null;
  toDate?: string | null;
}

interface SearchFormValues {
  fromDate?: any;
  toDate?: any;
}

const PAGE_SIZE = 10;

const toIsoString = (val: any): string | null => {
  if (!val) return null;

  if (typeof val?.toDate === "function") {
    return val.toDate().toISOString();
  }

  if (typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val.toISOString();
  }

  if (typeof val === "string") {
    if (!isNaN(Number(val))) {
      const d = new Date(Number(val));
      return isNaN(d.getTime()) ? null : d.toISOString();
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toISOString();
  }

  return null;
};

const ListeningEarReports = () => {
  const [dataList, setDataList] = useState<ListeningEarReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<SearchFormValues>();

  const handleGetAllData = useCallback(async (filters?: DateFilterParams) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await getListeningEarPerDate({
        fromDate: filters?.fromDate ?? null,
        toDate: filters?.toDate ?? null,
      });

      setDataList(res?.data?.data ?? []);
    } catch (error) {
      console.error("Error fetching listening ear reports:", error);
      setErrorMessage(
        "خطایی در دریافت اطلاعات رخ داد. لطفاً دوباره تلاش کنید.",
      );
      setDataList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetAllData();
  }, [handleGetAllData]);

  const handleSearch = handleSubmit((values) => {
    handleGetAllData({
      fromDate: toIsoString(values.fromDate),
      toDate: toIsoString(values.toDate),
    });
  });

  const columns: Column<ListeningEarReportItem>[] = useMemo(
    () => [
      {
        key: "rowIndex",
        title: "ردیف",
        align: "center",
        width: "w-16 sm:w-20",
        hideOnMobileCard: true,
        render: (_, index) => (
          <span className="text-xs text-slate-500 font-mono">{index + 1}</span>
        ),
      },
      {
        key: "nameAndLastName",
        title: "مشخصات",
        render: (item) => (
          <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
            {item?.nameAndLastName || "—"}
          </p>
        ),
      },
      {
        key: "createDate",
        title: "تاریخ ثبت",
        render: (item) => (
          <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
            {StringHelpers.toPersianDateTime(item?.createDate) || "—"}
          </p>
        ),
      },
      {
        key: "desc",
        title: "گزارش",
        align: "center",
        render: (item) => (
          <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {item?.desc || "—"}
          </span>
        ),
      },
    ],
    [],
  );

  const handleExportExcel = () => {
    if (!dataList || dataList.length === 0) {
      alert("داده‌ای برای خروجی اکسل وجود ندارد.");
      return;
    }

    const excelData = dataList.map((item, index) => ({
      ردیف: index + 1,
      مشخصات: item?.nameAndLastName || "—",
      "تاریخ ثبت": StringHelpers.toPersianDateTime(item?.createDate) || "—",
      گزارش: item?.desc || "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!views"] = [{ RTL: true }];

    worksheet["!cols"] = [
      { wch: 8 }, // ردیف
      { wch: 25 }, // مشخصات
      { wch: 20 }, // تاریخ ثبت
      { wch: 40 }, // گزارش
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "گزارش گوش شنوا");

    // ۳. دانلود فایل اکسل با تاریخ روز
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `listening-ear-report-${today}.xlsx`);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {errorMessage && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="w-full md:flex-1">
          <CustomDatePicker
            control={control}
            name="fromDate"
            maxDate={new Date()}
            label="از تاریخ"
            rules={{
              required: "لطفا تاریخ را انتخاب کنید",
            }}
          />
        </div>
        <div className="w-full md:flex-1">
          <CustomDatePicker
            control={control}
            name="toDate"
            maxDate={new Date()}
            label="تا تاریخ"
            rules={{
              required: "لطفا تاریخ را انتخاب کنید",
            }}
          />
        </div>
        <div className="w-full md:w-auto md:min-w-[120px]">
          <Button
            type="button"
            fullWidth
            onClick={handleSearch}
            className="h-11 justify-center"
          >
            جستجو
          </Button>
        </div>
        <div className="w-full md:w-auto md:min-w-[140px]">
          <Button
            type="button"
            fullWidth
            variant="success"
            onClick={handleExportExcel}
            leftIcon={<Sheet size={16} />}
            className="h-11 justify-center whitespace-nowrap text-xs font-bold text-slate-800 sm:text-sm"
          >
            خروجی اکسل
          </Button>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <CustomTable
          data={dataList}
          columns={columns}
          keyExtractor={(item, index) => String(item.id ?? index)}
          isLoading={isLoading}
          pageSize={PAGE_SIZE}
          emptyMessage="موردی یافت نشد."
        />
      </div>
    </div>
  );
};

export default ListeningEarReports;
