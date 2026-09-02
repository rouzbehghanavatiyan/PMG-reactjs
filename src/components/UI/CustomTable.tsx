import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";

export interface Column<T> {
  key: string;
  title: string;
  width?: string;
  align?: "right" | "center" | "left";
  hideOn?: "sm" | "md" | "lg" | "xl";
  render?: (item: T, index: number) => React.ReactNode;
  hideOnMobileCard?: boolean;
}

interface CustomTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  className?: string;
}

export const CustomTable = <T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = "داده‌ای برای نمایش یافت نشد.",
  pageSize,
  onRowClick,
  className = "",
}: CustomTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const isPaginated = pageSize !== undefined && pageSize > 0;
  const totalPages = isPaginated ? Math.ceil(data.length / pageSize!) || 1 : 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const displayData = useMemo(() => {
    if (!isPaginated) return data;
    const start = (currentPage - 1) * pageSize!;
    return data.slice(start, start + pageSize!);
  }, [data, currentPage, pageSize, isPaginated]);

  const getHideClass = (hideOn?: Column<T>["hideOn"]) => {
    switch (hideOn) {
      case "sm":
        return "hidden sm:table-cell";
      case "md":
        return "hidden md:table-cell";
      case "lg":
        return "hidden lg:table-cell";
      case "xl":
        return "hidden xl:table-cell";
      default:
        return "";
    }
  };

  const getAlignClass = (align?: Column<T>["align"]) => {
    switch (align) {
      case "center":
        return "text-center";
      case "left":
        return "text-left";
      default:
        return "text-right";
    }
  };

  const getRealIndex = (index: number) =>
    isPaginated ? (currentPage - 1) * pageSize! + index : index;

  // ساخت لیست شماره صفحات برای دکمه‌های پیجینیشن
  const getPaginationItems = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  return (
    <div className={`w-full flex flex-col gap-3.5 ${className}`}>
      <div className="hidden md:flex md:flex-col md:min-h-[500px] w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-right">
            <thead>
              <tr className="border-b border-slate-100 bg-blue-50 text-xs font-semibold text-slate-500">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3.5 px-3 truncate ${col.width || "w-auto"} ${getAlignClass(col.align)} ${getHideClass(col.hideOn)}`}
                    title={col.title}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-12 text-center text-slate-400"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-bmw-blue border-t-transparent" />
                      <span>در حال بارگذاری اطلاعات...</span>
                    </div>
                  </td>
                </tr>
              ) : displayData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-12 text-center text-slate-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                displayData.map((item, index) => (
                  <tr
                    key={keyExtractor(item, index)}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`bg-white even:bg-blue-50/40 transition-colors hover:bg-blue-100/50 ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3 px-3 min-w-0 ${getAlignClass(col.align)} ${getHideClass(col.hideOn)}`}
                      >
                        {col.render
                          ? col.render(item, getRealIndex(index))
                          : (item[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="block md:hidden space-y-2.5">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span>در حال بارگذاری...</span>
          </div>
        ) : displayData.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
            {emptyMessage}
          </div>
        ) : (
          displayData.map((item, index) => (
            <div
              key={keyExtractor(item, index)}
              onClick={() => onRowClick && onRowClick(item)}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={`rounded-xl border border-slate-200 bg-white even:bg-blue-50/40 p-3 space-y-1.5 shadow-sm transition-colors ${
                onRowClick
                  ? "cursor-pointer hover:bg-blue-100/50 active:bg-blue-200/60"
                  : ""
              }`}
            >
              {columns
                .filter((col) => !col.hideOnMobileCard)
                .map((col) => (
                  <div
                    key={col.key}
                    className="flex items-start justify-between gap-2 text-xs py-0.5 min-w-0"
                  >
                    <span className="text-slate-400 font-medium shrink-0 pt-0.5">
                      {col.title}:
                    </span>
                    <div className="min-w-0 max-w-[65%] truncate text-slate-700 font-medium text-left">
                      {col.render
                        ? col.render(item, getRealIndex(index))
                        : (item[col.key] ?? "—")}
                    </div>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
      {isPaginated && totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl text-xs sm:flex-row sm:px-2 mt-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg h-8 w-8 flex items-center justify-center border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="صفحه قبلی"
            >
              <ChevronRight size={14} />
            </button>
            <div className="flex items-center gap-1">
              {getPaginationItems().map((item, i) =>
                item === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="w-8 h-8 flex items-center justify-center text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === item
                        ? "bg-bmw-blue text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex h-8 w-8 justify-center items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="صفحه بعدی"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
