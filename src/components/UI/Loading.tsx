// import React from "react";

// interface LoadingProps {
//   text?: string;
//   t?: any;
// }

// const Loading: React.FC<LoadingProps> = ({ t, text }) => {
//   return (
//     <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm dark:bg-black/10">
//       <div className="relative flex items-center justify-center w-36 h-36">
//         <div className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-bmw-blue animate-spin dark:border-gray-700 dark:border-t-blue-400"></div>

//         <div className="absolute inset-5 rounded-full border-4 border-gray-200 border-b-bmw-blue animate-spin [animation-direction:reverse] dark:border-gray-700 dark:border-b-blue-400"></div>

//         <div className="absolute inset-9 rounded-full border-4 border-gray-200 border-b-bmw-blue animate-spin  [animation-duration:0.5s] dark:border-gray-700 dark:border-b-blue-400"></div>

//         {/* <div className="loader dark:invert z-10"></div> */}
//       </div>

//       {text && (
//         <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-200">
//           {text}
//         </p>
//       )}
//     </div>
//   );
// };

// export default Loading;

import React from "react";

interface LoadingProps {
  text?: string;
  t?: any;
}

const Loading: React.FC<LoadingProps> = ({ t, text }) => {
  return (
    <div className=" fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm dark:bg-black/40">
      <div className="p-5 bg-white rounded-3xl border border-gray-200">
        <div className=" relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-gray-300 bg-[#1a1a1a] p-4 shadow- dark:border-gray-500 dark:bg-black">
          <span className="absolute top-[11px] left-[20px] -rotate-[40deg] text-white font-bold text-sm font-sans">
            P
          </span>
          <span className="absolute top-[0px] left-1/2 -translate-x-1/2 text-white font-bold text-sm font-sans">
            M
          </span>
          <span className="absolute top-[11px] right-[20px] rotate-[40deg] text-white font-bold text-sm font-sans">
            G
          </span>
          <div className="relative w-full h-full rounded-full border-[3px] border-gray-300 dark:border-gray-400 overflow-hidden animate-spin [animation-duration:1.2s]">
            <div className="flex flex-wrap w-full h-full">
              <div className="w-1/2 h-1/2 bg-white"></div>
              <div className="w-1/2 h-1/2 bg-bmw-blue"></div>
              <div className="w-1/2 h-1/2 bg-bmw-blue"></div>
              <div className="w-1/2 h-1/2 bg-white"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[2px] bg-gray-300 dark:bg-gray-400"></div>
              <div className="h-full w-[2px] bg-gray-300 dark:bg-gray-400 absolute"></div>
            </div>
          </div>

          <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none"></div>
        </div>

        {text && (
          <p className="mt-6 text-lg font-bold tracking-wider text-[#1a1a1a] dark:text-gray-100 uppercase">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
