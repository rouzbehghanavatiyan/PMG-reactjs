import React, { useState } from "react";
import { categories } from "./Categories";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";

const brandColors = ["#185FA5", "#1C4282", "#C3002F", "#124734"];

const brandDots = [
  { title: "پیش‌فرض", className: "b0" },
  { title: "BMW", className: "b1" },
  { title: "Nissan", className: "b2" },
  { title: "Opel", className: "b3" },
];

const OrganizationPortal = () => {
  // const [theme, setTheme] = useState<"light" | "dark">("light");
  // const [currentBrand, setCurrentBrand] = useState(0);
  const [openCategories, setOpenCategories] = useState<number[]>([0]);

  const toggleCategory = (index: number) => {
    setOpenCategories((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  // const handleSetBrand = (index: number) => {
  //   setCurrentBrand(index);
  // };

  // const toggleTheme = () => {
  //   const nextTheme = theme === "dark" ? "light" : "dark";
  //   setTheme(nextTheme);
  //   document.documentElement.setAttribute("data-theme", nextTheme);
  // };

  return (
    <div className="py-4 rtl" id="portal" dir="rtl">
      <h2 className="sr-only">پورتال سامانه‌های سازمانی پرشیاخودرو</h2>

      <div className="mb-6 flex flex-col gap-2 border-b border-gray-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <i
              className="ti ti-layout-grid text-[22px] text-gray-500"
              aria-hidden="true"
            />
            <h1 className="text-2xl font-bold text-bmw-text">
              سامانه‌های سازمانی پرشیاخودرو
            </h1>
            <span className="text-2xl font-bold text-bmw-text">Persia ERP</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* {brandDots.map((brand, index) => (
              <button
                key={brand.title}
                type="button"
                className={`h-[18px] w-[18px] rounded-full border-2 transition-all ${
                  currentBrand === index ? "border-black" : "border-transparent"
                } ${brand.className}`}
                onClick={() => handleSetBrand(index)}
                title={brand.title}
                aria-label={brand.title}
                style={{
                  backgroundColor: brandColors[index],
                }}
              />
            ))} */}

            {/* <button
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600"
              type="button"
              onClick={toggleTheme}
            >
              <i className="ti ti-sun" aria-hidden="true" />
              تغییر ظاهر
            </button> */}
          </div>
        </div>

        <p className="text-[16px] leading-6 text-gray-500">
          دسترسی به تمامی سیستم‌ها و پرتال‌های داخلی براساس بخش‌های سازمانی.
        </p>
      </div>
      <div className="space-y-3">
        {categories.map((category, categoryIndex) => {
          const isOpen = openCategories.includes(categoryIndex);

          return (
            <div
              key={category.title}
              className="overflow-hidden  rounded-xl border-gray-200 bg-gray-100"
            >
              <button
                type="button"
                className="flex w-full items-center border border-gray-200 rounded-xl justify-between bg-white px-4 py-3 text-right hover:bg-gray-50"
                onClick={() => toggleCategory(categoryIndex)}
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2">
                  <i className={category.icon} aria-hidden="true" />
                  <span className="text-sm  font16 font-bold   text-gray-800">
                    {category.title}
                  </span>
                </div>
                <i
                  className={`ti ti-chevron-down text-base text-gray-500 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="bg-bmw-base p-4">
                    <div className="grid gap-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6">
                      {category.items.map((item) => (
                        <a
                          key={`${category.title}-${item.title}`}
                          className="flex flex-col items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-4 text-center transition hover:border-gray-300 hover:bg-gray-50"
                          href={item.href}
                          target={
                            item.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            item.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          <span className="inline-flex rounded-full bg-gray-100 p-3">
                            <i
                              className={item.icon}
                              aria-hidden="true"
                              // style={{ color: brandColors[currentBrand] }}
                            />
                          </span>
                          <span className="text-[13px]  text-gray-800">
                            {item.title}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrganizationPortal;
