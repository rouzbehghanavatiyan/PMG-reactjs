import React from "react";
import clsx from "clsx";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "dark"
  | "ghost"
  | "outline-primary"
  | "outline-secondary"
  | "outline-danger"
  | "outline-ghost"
  | "warning" // زرد
  | "success" // سبز
  | "orange" // نارنجی
  | "purple" // بنفش
  | "brown" // قهوه ای
  | "outline-warning"
  | "outline-success"
  | "outline-orange"
  | "outline-purple"
  | "outline-dark"
  | "outline-brown"
  | "outline-ghost-success"
  | "outline-ghost-danger"
  | "outline-ghost-bmw-textSec";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  spinnerClassName?: string;
  label?: React.ReactNode;
};

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={clsx(
      "inline-block size-4 rounded-full border-2 border-white/40 border-t-white animate-spin",
      className,
    )}
    aria-hidden="true"
  />
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      label,
      children,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      variant = "primary",
      size = "md",
      fullWidth = false,
      spinnerClassName,
      type,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const base =
      "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all select-none " +
      "cursor-pointer " +
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-bmw-blue focus-visible:ring-offset-2 " +
      "focus-visible:ring-offset-bmw-surface disabled:opacity-60 disabled:cursor-not-allowed";

    const sizes: Record<ButtonSize, string> = {
      sm: "px-3 py-1 text-sm ",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-3.5 text-base",
    };

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-bmw-blue text-white hover:bg-blue-600",
      secondary: "bg-bmw-surface text-bmw-text hover:bg-bmw-base",
      danger: "bg-red-600 text-white hover:bg-red-700",
      ghost: "bg-transparent text-bmw-text hover:bg-bmw-base",
      dark: "bg-gray-900 text-white hover:bg-blue-800",
      warning: "bg-yellow-500 text-black hover:bg-yellow-600",
      success: "bg-green-500 text-white hover:bg-green-600",
      orange: "bg-orange-500 text-white hover:bg-orange-600",
      purple: "bg-purple-500 text-white hover:bg-purple-600",
      brown: "bg-yellow-800 text-white hover:bg-yellow-900",

      "outline-primary":
        "border border-bmw-blue bg-transparent text-bmw-blue hover:bg-bmw-blue/10",
      "outline-secondary":
        "border border-bmw-border bg-transparent text-bmw-text hover:bg-bmw-base",
      "outline-danger":
        "border border-red-600 bg-transparent text-red-600 hover:bg-red-50",
      "outline-ghost":
        "border border-transparent text-bmw-blue hover:bg-bmw-base",
      "outline-ghost-success":
        "border border-transparent text-green-400 hover:bg-bmw-base",
      "outline-ghost-danger":
        "border border-transparent text-red-400 hover:bg-bmw-base",
      "outline-ghost-bmw-textSec":
        "border border-transparent text-[#0066B1] hover:bg-bmw-base",
      "outline-warning":
        "border border-yellow-500 bg-transparent text-yellow-500 hover:bg-yellow-50",
      "outline-success":
        "border border-green-500 bg-transparent text-green-500 hover:bg-green-50",
      "outline-orange":
        "border border-amber-400 bg-transparent text-amber-400 hover:bg-orange-50",
      "outline-purple":
        "border border-purple-500 bg-transparent text-purple-500 hover:bg-purple-50",
      "outline-dark":
        "border border-gray-900 bg-transparent text-gray-900 hover:bg-blue-800",
      "outline-brown":
        "border border-yellow-800 bg-transparent text-yellow-800 hover:bg-yellow-700",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={clsx(
          base,
          sizes[size],
          variants[variant],
          fullWidth ? "w-full" : "w-auto",
          className,
        )}
        aria-busy={loading ? true : undefined}
        {...rest}
      >
        {loading ? (
          <Spinner
            className={clsx(
              variant === "primary" ||
                variant === "danger" ||
                variant === "success" ||
                variant === "orange" ||
                variant === "purple"
                ? "border-white/40 border-t-white"
                : "border-current/30 border-t-current",
              spinnerClassName,
            )}
          />
        ) : (
          <>
            {leftIcon}
            {label ?? children}
            {rightIcon}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
