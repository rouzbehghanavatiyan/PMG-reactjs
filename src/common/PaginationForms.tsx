import React from "react";

const PaginationForms: React.FC<any> = ({
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  const getPages = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    const left = currentPage - delta;
    const right = currentPage + delta;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center mt-8 gap-2 flex-wrap p-2">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev: number) => prev - 1)}
        className="px-3 py-1 md:px-4 md:py-2 rounded border cursor-pointer border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors"
      >
        قبلی
      </button>
      {getPages().map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-2 flex items-center text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => setCurrentPage(page as number)}
            className={`px-3 py-1 md:px-4 md:py-2 rounded text-sm cursor-pointer transition-colors ${
              currentPage === page
                ? "bg-bmw-blue text-white"
                : "bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ),
      )}
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev: number) => prev + 1)}
        className="px-3 py-1 md:px-4 md:py-2 rounded border border-gray-300 text-sm cursor-pointer disabled:opacity-40 hover:bg-gray-100 transition-colors"
      >
        بعدی
      </button>
    </div>
  );
};

export default PaginationForms;
