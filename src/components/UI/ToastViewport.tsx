import React, { useEffect, useSyncExternalStore } from "react";
import clsx from "clsx";
import { toastStore, type ToastMessage as Toast } from "./Toast";

function useToasts(): Toast[] {
  return useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    () => []
  );
}

const typeStyles: Record<
  Toast["type"],
  { ring: string; iconBg: string; iconColor: string; bar: string }
> = {
  success: {
    ring: "border-emerald-500/30",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    bar: "bg-emerald-500",
  },
  error: {
    ring: "border-rose-500/30",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
    bar: "bg-rose-500",
  },
  warning: {
    ring: "border-amber-500/30",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    bar: "bg-amber-500",
  },
  info: {
    ring: "border-sky-500/30",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-500",
    bar: "bg-sky-500",
  },
  loading: {
    ring: "border-indigo-500/30",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    bar: "bg-indigo-500",
  },
};

function ToastIcon({ type }: { type: Toast["type"] }) {
  if (type === "loading") {
    return (
      <svg
        className="size-5 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }

  const iconClass = "size-5 shrink-0";

  switch (type) {
    case "success":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="m9 12 2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "error":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="m15 9-6 6m0-6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "warning":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9v4m0 3h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 8h.01M12 12v4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export default function ToastViewport() {
  const toasts = useToasts();

  if (!toasts || toasts.length === 0) return null;

  return (
    <aside
      aria-label="اعلان‌ها"
      className="fixed inset-x-4 top-4 z-[9999] pointer-events-none sm:inset-x-auto sm:left-4 sm:w-96 flex flex-col gap-2.5"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </aside>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const styles = typeStyles[toast.type] || typeStyles.info;

  // حذف خودکار بعد از 5 ثانیه (به جز حالت loading)
  useEffect(() => {
    if (toast.type === "loading") return;

    const timer = setTimeout(() => {
      toastStore.dismiss(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.type]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        "pointer-events-auto relative w-full overflow-hidden rounded-xl",
        "bg-neutral-900/95 text-neutral-100 backdrop-blur-md",
        "border shadow-lg shadow-black/20",
        styles.ring,
        "transition-all duration-200 animate-in fade-in slide-in-from-top-3"
      )}
    >
      {/* Accent Indicator Bar */}
      <div className={clsx("h-1 w-full", styles.bar)} />

      <div className="flex items-start gap-3 p-3.5">
        {/* Icon */}
        <div
          className={clsx(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            styles.iconBg,
            styles.iconColor
          )}
        >
          <ToastIcon type={toast.type} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {toast.title && (
            <h4 className="text-sm font-semibold leading-tight text-white mb-1">
              {toast.title}
            </h4>
          )}
          <p className="text-xs font-normal leading-relaxed text-neutral-300 break-words">
            {toast.message}
          </p>

          {toast.actionLabel && toast.onAction && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                toastStore.dismiss(toast.id);
              }}
              className="mt-2 inline-flex items-center text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              {toast.actionLabel}
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        {toast.dismissible !== false && (
          <button
            type="button"
            onClick={() => toastStore.dismiss(toast.id)}
            className="shrink-0 p-1 text-neutral-400 hover:text-white rounded-md transition-colors hover:bg-neutral-800/60"
            aria-label="بستن اعلان"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
