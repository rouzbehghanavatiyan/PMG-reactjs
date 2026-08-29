import React from "react";

export interface Column<T> {
  key: string;
  title: string;
  /** کلاس‌های عرض تیل‌ویند (مثل w-20, w-1/4, w-auto) */
  width?: string;
  align?: "right" | "center" | "left";
  /** نقطه شکستی که این ستون در جدول مخفی می‌شود (sm | md | lg | xl) */
  hideOn?: "sm" | "md" | "lg" | "xl";
  /** رندر سفارشی برای داده سلول */
  render?: (item: T, index: number) => React.ReactNode;
  /** مخفی کردن این ستون در نمای کارتی موبایل */
  hideOnMobileCard?: boolean;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

interface CustomTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationConfig;
  onRowClick?: (item: T) => void;
  className?: string;
}

export const CustomTable = <T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = "داده‌ای برای نمایش یافت نشد.",
  pagination,
  onRowClick,
  className = "",
}: CustomTableProps<T>) => {
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

  return (
    <div className={`w-full flex flex-col gap-3.5 ${className}`}>
      {/* --- نمای جدولی (دسکتاپ/تبلت) --- */}
      <div className="hidden md:block w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-right">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold text-slate-500">
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
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>در حال بارگذاری اطلاعات...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-12 text-center text-slate-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={keyExtractor(item, index)}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition-colors hover:bg-slate-50/60 ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3 px-3 min-w-0 ${getAlignClass(col.align)} ${getHideClass(col.hideOn)}`}
                      >
                        {col.render
                          ? col.render(item, index)
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

      {/* --- نمای کارتی (موبایل) --- */}
      <div className="block md:hidden space-y-2.5">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>در حال بارگذاری...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
            {emptyMessage}
          </div>
        ) : (
          data.map((item, index) => (
            <div
              key={keyExtractor(item, index)}
              onClick={() => onRowClick && onRowClick(item)}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={`rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2 ${
                onRowClick ? "cursor-pointer active:bg-slate-50" : ""
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
                        ? col.render(item, index)
                        : (item[col.key] ?? "—")}
                    </div>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>

      {/* --- صفحه‌بندی --- */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1">
          <span className="text-xs text-slate-500 text-center sm:text-right">
            نمایش{" "}
            {(
              (pagination.currentPage - 1) * pagination.pageSize +
              1
            ).toLocaleString("fa-IR")}{" "}
            تا{" "}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalCount,
            ).toLocaleString("fa-IR")}{" "}
            از {pagination.totalCount.toLocaleString("fa-IR")} مورد
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage <= 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              قبلی
            </button>

            <span className="px-2 text-xs font-semibold text-slate-700">
              صفحه {pagination.currentPage.toLocaleString("fa-IR")} از{" "}
              {pagination.totalPages.toLocaleString("fa-IR")}
            </span>

            <button
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={pagination.currentPage >= pagination.totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
