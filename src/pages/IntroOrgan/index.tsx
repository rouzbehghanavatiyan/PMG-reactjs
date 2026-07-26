import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronLeft, Award, Building2 } from "lucide-react";
// import BackPMG from "../../assets/profilecover.png";
import BackPMG from "../../assets/images/1024x338 بنر معرفی (3).jpg";
import img1 from "../../assets/images/338x253 بنر افتخارات (3).jpg";

const honorsSlides = [
  {
    id: 1,
    image: img1,
  },
];

const IntroOrgan: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentSlide((prevIndex) =>
        prevIndex === honorsSlides.length - 1 ? 0 : prevIndex + 1,
      );
    }, 5000);

    return () => {
      resetTimeout();
    };
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === honorsSlides.length - 1 ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? honorsSlides.length - 1 : prev - 1,
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-6 lg:px-0 pb-12">
      {/* Intro Card */}
      <div className="overflow-hidden rounded-xl shadow-lg bg-bmw-surface">
        <img
          src={BackPMG}
          alt="Persia Khodro Cover"
          className="w-full aspect-[16/6] sm:aspect-[16/5] object-cover opacity-90"
        />

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-bmw-border pb-3">
            <Building2 className="text-bmw-blue shrink-0" size={24} />
            <h2 className="text-lg sm:text-xl font-extrabold text-bmw-text">
              معرفی شرکت پرشیا خودرو
            </h2>
          </div>

          <div className="text-bmw-textSec text-sm sm:text-[15px] leading-7 sm:leading-8 space-y-4 text-justify">
            <p>
              شرکت <strong>پرشیا خودرو</strong> به عنوان نماینده و ارائه‌دهنده
              خدمات فروش و پس از فروش خودروهای ب‌ام‌و (BMW) و مینی (MINI) در
              ایران، با بیش از دو دهه تجربه، جایگاهی ممتاز و پیشتاز را در بازار
              خودروهای لوکس و پرمیوم کشور به خود اختصاص داده است. این مجموعه با
              استقرار شبکه‌ای گسترده از نمایندگی‌های فروش و تعمیرگاه‌های مجرب
              تخصصی در سراسر کشور، استانداردهای بین‌المللی کمپانی ب‌ام‌و را در
              ایران بومی‌سازی کرده است.
            </p>
            <p>
              ما در پرشیا خودرو همواره بر این باوریم که مشتریان لایق بهترین‌ها
              هستند؛ از این رو، با بهره‌گیری از متخصصان آموزش‌دیده، تجهیزات
              پیشرفته تشخیصی مطابق استاندارد آلمان و تامین قطعات یدکی اصلی،
              تجربه‌ای متمایز و فراتر از انتظار از مالکیت خودرو را برای مشتریان
              خود فراهم می‌سازیم. تعهد به کیفیت پایدار، نوآوری در خدمات دیجیتال
              و پشتیبانی همه‌جانبه، ارکان اصلی هویت سازمانی پرشیا خودرو را تشکیل
              می‌دهند.
            </p>
          </div>
        </div>
      </div>

      {/* Honors Slider */}
      <div className="bg-bmw-surface border border-bmw-border rounded-lg p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-bmw-border pb-3">
          <Award className="text-yellow-500 shrink-0" size={24} />
          <h2 className="text-lg sm:text-xl font-extrabold text-bmw-text">
            افتخارات ما
          </h2>
        </div>

        <div className="relative rounded-lg overflow-hidden group border border-bmw-border/60">
          <img
            src={honorsSlides[currentSlide].image}
            alt={honorsSlides[currentSlide].title ?? "افتخارات"}
            className="w-full aspect-[4/3] sm:aspect-[16/9] object-cover transition-all duration-700 ease-in-out"
          />

          <button
            onClick={prevSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-bmw-blue/80 text-white p-2 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
            aria-label="اسلاید قبلی"
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-bmw-blue/80 text-white p-2 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
            aria-label="اسلاید بعدی"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="flex justify-center gap-2 pt-1">
          {honorsSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-6 bg-bmw-blue" : "w-2 bg-gray-600"
              }`}
              aria-label={`رفتن به اسلاید ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="bg-bmw-surface border border-bmw-border rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black">
          <iframe
            src="https://drive.google.com/file/d/1LclTY8aWZTSl9dQRWtkrnJpj403sprUe/preview"
            title="ویدیوی معرفی شرکت پرشیا خودرو"
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default IntroOrgan;
