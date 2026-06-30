import React, { useState } from "react";
import {
  Users,
  ChevronDown,
  ChevronUp,
  Network,
  Landmark,
  Phone,
} from "lucide-react";
import CustomImage from "../../components/UI/CustomImage";

const orgStructureData = [
  {
    id: "management",
    title: "۱. مدیریت ارشد و هیئت مدیره",
    icon: <Landmark className="text-bmw-blue" size={20} />,
    departments: [
      "مجمع عمومی صاحبان سهام",
      "هیئت مدیره",
      "مدیر عامل (CEO)",
      "دفتر مدیریت عامل و روابط عمومی",
      "کمیته حسابرسی و کنترل‌های داخلی",
    ],
    people: [
      {
        name: "امیرحسین صدر",
        role: "مدیر عامل (CEO)",
        phone: "1234",
        avatar: "https://i.pravatar.cc/150?img=32",
      },
      {
        name: "محمدرضا نادری",
        role: "رئیس هیئت مدیره",
        phone: "1234",
        avatar: "https://i.pravatar.cc/150?img=12",
      },
      {
        name: "لیلا کیانی",
        role: "مدیر دفتر مدیرعامل و روابط عمومی",
        phone: "1234",
        avatar: "https://i.pravatar.cc/150?img=48",
      },
    ],
  },

  {
    id: "sales",
    title: "۲. معاونت فروش و بازاریابی",
    icon: <Network className="text-bmw-blue" size={20} />,
    departments: [
      "مدیریت فروش خودروهای نو (BMW & MINI)",
      "Premium Selection",
      "اداره بازاریابی (Marketing)",
      "فروش سازمانی",
      "تحقیقات بازار",
    ],
    people: [
      {
        name: "کاوه رستمی",
        role: "معاون فروش و بازاریابی",
        phone: "1234",
        avatar: "https://i.pravatar.cc/150?img=14",
      },
      {
        name: "فرزین اسحاقی",
        role: "مدیر فروش BMW",
        phone: "1234",
        avatar: "https://i.pravatar.cc/150?img=21",
      },
      {
        name: "مریم احمدپور",
        role: "مدیر بازاریابی و تبلیغات",
        phone: "1234",
        avatar: "https://i.pravatar.cc/150?img=36",
      },
    ],
  },

  {
    id: "aftersales",
    title: "۳. معاونت خدمات پس از فروش",
    icon: <Network className="text-bmw-blue" size={20} />,
    departments: [
      "تعمیرگاه‌های مرکزی",
      "مدیریت قطعات یدکی",
      "گارانتی",
      "تکنیکال ساپورت",
      "شبکه نمایندگی شهرستان‌ها",
    ],
    people: [
      {
        name: "محمود شریفی",
        role: "معاون خدمات پس از فروش",
        phone: "1234",
        avatar: "https://i.pravatar.cc/150?img=7",
      },
      {
        name: "نازنین کرامتی",
        role: "مدیر گارانتی",
        phone: "1234",
        avatar: "https://i.pravatar.cc/150?img=24",
      },
    ],
  },

  {
    id: "support",
    title: "۴. معاونت منابع انسانی و پشتیبانی",
    icon: <Network className="text-bmw-blue" size={20} />,
    departments: [
      "جذب و استخدام",
      "آکادمی آموزش",
      "کارگزینی و رفاهی",
      "اداری و تدارکات",
      "ایمنی (HSE)",
    ],
    people: [
      {
        name: "سحر فلاح‌پور",
        role: "معاون منابع انسانی",
        phone: "1234",
        avatar: "https://i.pravatar.cc/150?img=50",
      },
    ],
  },

  {
    id: "finance",
    title: "۵. معاونت مالی و برنامه‌ریزی",
    icon: <Network className="text-bmw-blue" size={20} />,
    departments: [
      "حسابداری مالی",
      "خزانه‌داری",
      "بودجه و گزارشات",
      "ترخیص و امور گمرکی",
    ],
    people: [
      {
        name: "فرهاد سلیمانی",
        role: "معاون مالی",
        phone: "1234",
        avatar: "https://i.pravatar.cc/150?img=18",
      },
      {
        name: "نیلوفر ساحلی",
        role: "مدیر حسابداری مالی",
        phone: "1234",
        avatar: "https://i.pravatar.cc/150?img=45",
      },
    ],
  },
];

const OrgStructure: React.FC = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    management: true, // به طور پیش‌فرض بخش اول باز باشد
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-bmw-border pb-3">
        <Users className="text-bmw-blue" size={24} />
        <div className="flex flex-col">
          <h2 className="text-xl font-extrabold text-bmw-text">
            ساختار و چارت سازمانی
          </h2>
          <span className="text-xs text-bmw-textSec mt-1">
            سلسله مراتب دپارتمان‌ها و چیدمان واحدهای سازمانی شرکت پرشیا خودرو
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {orgStructureData.map((section) => {
          const isOpen = !!openSections[section.id];
          return (
            <div
              key={section.id}
              className="border border-bmw-border/80 rounded-lg overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between p-4 text-right transition-colors ${
                  isOpen
                    ? "bg-bmw-hover/30"
                    : "bg-transparent hover:bg-bmw-hover/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  {section.icon}
                  <span className="font-bold text-bmw-text text-sm md:text-base">
                    {section.title}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="text-bmw-textSec" size={18} />
                ) : (
                  <ChevronDown className="text-bmw-textSec" size={18} />
                )}
              </button>

              {isOpen && (
                <div className="p-4 bg-bmw-base/10 border-t border-bmw-border/50 space-y-4">
                  {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {section.departments.map((dept, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2.5 rounded bg-bmw-surface border border-bmw-border/40 hover:border-bmw-blue/40 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-bmw-blue shrink-0"></span>
                        <span className="text-xs text-bmw-textSec font-medium">
                          {dept}
                        </span>
                      </div>
                    ))}
                  </div> */}
                  {section.people && section.people.length > 0 && (
                    <div className="mt-4">
                      {/* <h3 className="text-sm font-bold text-bmw-text mb-3 flex items-center gap-2">
                        <Users className="text-bmw-blue" size={16} />
                        افراد و سمت‌های مرتبط
                      </h3> */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {section.people.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center gap-3 p-3 rounded-lg bg-bmw-surface border border-bmw-border hover:border-bmw-blue/50 transition"
                          >
                            <div className="flex  items-center gap-3 bg-bmw-surface">
                              <CustomImage size={40} />
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-bmw-text">
                                  {p.name}
                                </span>
                                <span className="text-[11px] text-bmw-textSec">
                                  {p.role}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center  gap-2 text-[11px] text-sm text-bmw-text">
                              <Phone size={14} className="mb-1 text-gray-400" />
                              <span className="  text-bmw-textSec">
                                {" "}
                                {p.phone}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrgStructure;
