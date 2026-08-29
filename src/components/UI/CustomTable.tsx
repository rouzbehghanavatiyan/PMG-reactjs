import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export interface Column<T> {
  key: string;
  title: string;
  width?: string;
  align?: "right" | "center" | "left";
  hideOn?: "sm" | "md" | "lg" | "xl";
  render?: (item: T, index: number) => React.ReactNode;
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
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl text-xs sm:flex-row sm:px-4">
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage <= 1}
              className="rounded-lg h-8 w-8 flex items-center justify-center border border-slate-200 bg-white text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
            <div className="flex items-center gap-1">
              {(() => {
                const currentPage = pagination!.currentPage;
                const totalPages = pagination!.totalPages;

                const pages: (number | "...")[] = [];

                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  pages.push(1);
                  if (currentPage <= 4) {
                    pages.push(2, 3, 4, 5);
                    pages.push("...");
                  } else if (currentPage >= totalPages - 3) {
                    pages.push("...");
                    pages.push(
                      totalPages - 4,
                      totalPages - 3,
                      totalPages - 2,
                      totalPages - 1,
                    );
                  } else {
                    pages.push("...");
                    pages.push(currentPage - 1, currentPage, currentPage + 1);
                    pages.push("...");
                  }
                  pages.push(totalPages);
                }
                return pages.map((page, index) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="flex h-8 w-8 items-center justify-center text-xs font-bold text-slate-400"
                      >
                        ...
                      </span>
                    );
                  }
                  const isCurrent = currentPage === page;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => pagination!.onPageChange(page)}
                      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                        isCurrent
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {page.toLocaleString("fa-IR")}
                    </button>
                  );
                });
              })()}
            </div>
            <button
              type="button"
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={pagination.currentPage >= pagination.totalPages}
              className="flex h-8 w-8 justify-center cursor-pointer items-center rounded-lg border border-slate-200 bg-white font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
