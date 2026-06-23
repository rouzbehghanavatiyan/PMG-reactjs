import React, { useState } from "react";
import clsx from "clsx";
import { toastStore, type Toast } from "./Toast";

function useToasts() {
  const [list, setList] = useState<Toast[]>([]);
  React.useEffect(() => {
    return toastStore.subscribe(setList);
  }, []);

  return list;
}

const typeStyles: Record<
  Toast["type"],
  { ring: string; iconBg: string; icon: string; bar: string }
> = {
  success: {
    ring: "ring-emerald-500/25",
    iconBg: "bg-emerald-500/15",
    icon: "text-emerald-400",
    bar: "bg-emerald-400",
  },
  error: {
    ring: "ring-red-500/25",
    iconBg: "bg-red-500/15",
    icon: "text-red-400",
    bar: "bg-red-400",
  },
  warning: {
    ring: "ring-amber-500/25",
    iconBg: "bg-amber-500/15",
    icon: "text-amber-300",
    bar: "bg-amber-300",
  },
  info: {
    ring: "ring-sky-500/25",
    iconBg: "bg-sky-500/15",
    icon: "text-sky-300",
    bar: "bg-sky-300",
  },
  loading: {
    ring: "ring-indigo-500/25",
    iconBg: "bg-indigo-500/15",
    icon: "text-indigo-300",
    bar: "bg-indigo-300",
  },
};

function Icon({ type }: { type: Toast["type"] }) {
  // pure tailwind icons (no deps)
  if (type === "loading")
    return (
      <span className="inline-block size-5 rounded-full border-2 border-indigo-300/40 border-t-indigo-300 animate-spin" />
    );

  const common = "size-5";
  switch (type) {
    case "success":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6 9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "error":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6 6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "warning":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9v4m0 4h.01M10.3 4.6 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-11v6m0-10h.01"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export default function ToastViewport() {
  const toasts = useToasts();

  return (
    <div
      className={clsx(
        "fixed z-[9999] pointer-events-none",
        "top-4 right-4 left-4 sm:left-auto sm:w-[420px]",
      )}
    >
      <div className="relative flex flex-col items-end">
        {toasts.map((t, i) => (
          <ToastItem key={t.id} toast={t} index={i} />
        ))}
      </div>
    </div>
  );
}

function ToastItem({ toast, index }: { toast: Toast; index: number }) {
  const styles = typeStyles[toast.type];

  return (
    <div
      style={{
        transform: `translateY(${index * 12}px) scale(${1 - index * 0.03})`,
        zIndex: 100 - index,
      }}
      className={clsx(
        "pointer-events-auto overflow-hidden absolute w-full",
        "rounded-2xl bg-bmw-surface/95 backdrop-blur border border-bmw-border",
        "shadow-2xl shadow-black/25 ring-1",
        styles.ring,
        "transition-all duration-300",
        "animate-in fade-in slide-in-from-top-2",
      )}
      role="status"
      aria-live="polite"
    >
      {/* accent bar */}
      <div className={clsx("h-1 w-full", styles.bar)} />

      <div className="p-4 flex gap-3">
        <div
          className={clsx(
            "shrink-0 rounded-xl p-2",
            styles.iconBg,
            styles.icon,
          )}
        >
          <Icon type={toast.type} />
        </div>

        <div className="min-w-0 flex-1">
          {toast.title ? (
            <div className="text-bmw-text font-bold leading-6">
              {toast.title}
            </div>
          ) : null}
          <div className="text-bmw-textSec text-sm leading-6 break-words">
            {toast.message}
          </div>

          {toast.actionLabel && toast.onAction ? (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                toastStore.dismiss(toast.id);
              }}
              className="mt-2 text-sm font-bold text-bmw-blue hover:underline"
            >
              {toast.actionLabel}
            </button>
          ) : null}
        </div>

        {toast.dismissible !== false ? (
          <button
            type="button"
            className="shrink-0 text-bmw-textSec hover:text-bmw-text transition-colors"
            onClick={() => toastStore.dismiss(toast.id)}
            aria-label="Close"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
