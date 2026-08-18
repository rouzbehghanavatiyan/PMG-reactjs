import React from "react";

interface LoadingProps {
  text?: string;
  t?: any;
}

const Loading: React.FC<LoadingProps> = ({ t, text }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm dark:bg-black/10">
      <div className="loader dark:invert"></div>
      <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-200" />{" "}
    </div>
  );
};

export default Loading;
