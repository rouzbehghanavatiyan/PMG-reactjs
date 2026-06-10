import React from "react";
import clsx from "clsx";

type InlineLoadingProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isActive?: boolean;
};

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-16 bg-danger h-16 border-[3px]",
  xl: "w-26 bg-danger h-26 border-[3px]",
};

const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = "lg",
  isActive = false,
  className,
}) => {
  if (!isActive) return null;

  return (
    <span
      className={clsx(
        "inline-block animate-spin rounded-full border-current border-t-transparent text-gray-500",
        sizeClasses[size],
        className,
      )}
    />
  );
};

export default InlineLoading;
