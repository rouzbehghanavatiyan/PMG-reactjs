import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

type ModalUIProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  closeOnBackdrop?: boolean;
  headColor?: string;
  padding?: string;
  maxContentHeight?: string;
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-6xl",
  xxl: "max-w-8xl",
} as const;

const ANIMATION_MS = 220;

const ModalUI: React.FC<ModalUIProps> = ({
  isOpen,
  onClose,
  headColor = "bg-bmw-blue",
  title,
  children,
  padding = "p-6",
  footer,
  size = "md",
  closeOnBackdrop = false,
  maxContentHeight = "max-h-[85vh]",
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = window.setTimeout(() => setMounted(false), ANIMATION_MS);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className={clsx(
          "absolute inset-0 bg-black/50 backdrop-blur-sm",
          "transition-opacity duration-200 ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      <div
        className={clsx(
          "relative z-10 w-full rounded-2xl bg-white shadow-2xl flex flex-col",
          "transition-all duration-200 ease-out will-change-transform will-change-opacity",
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2",
          sizeClasses[size],
        )}
        style={{ transitionDuration: `${ANIMATION_MS}ms` }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!visible}
      >
        <div
          className={`flex items-center justify-between ${headColor} rounded-t-xl border-b border-gray-100 px-6 py-4`}
        >
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-white hover:bg-gray-600"
            aria-label="Close modal"
          >
            <X />
          </button>
        </div>

        <div
          className={`${padding} ${maxContentHeight} overflow-y-auto text-gray-600 `}
        >
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
};

export default ModalUI;
