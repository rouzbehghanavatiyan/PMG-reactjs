import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronLeft, Award, Building2 } from "lucide-react";
import BackPMG from "../../assets/profilecover.png";
import img1 from "../../assets/images/Awards_02.jpg";
import img2 from "../../assets/images/Awards_03.jpg";
import img3 from "../../assets/images/Awards_Persiakhodro.ir.jpg";

const honorsSlides = [
  {
    id: 1,
    title: "رتبه نخست رضایتمندی مشتریان (ISQI)",
    year: "۱۴۰۲",
    image: img1,
    desc: "کسب مقام اول در ارائه خدمات پس از فروش خودروهای لوکس",
  },
  {
    id: 2,
    title: "تندیس طلایی حمایت از حقوق مصرف‌کنندگان",
    year: "۱۴۰۱",
    image: img2,
    desc: "تقدیر از عملکرد متعهدانه در زنجیره تامین و خدمات مشتریان",
  },
  {
    id: 3,
    title: "برترین شرکت واردکننده و ارائه دهنده خدمات BMW",
    year: "۱۴۰۰",
    image: img3,
    desc: "احراز استانداردهای بین‌المللی در ارزیابی‌های کیفی سالانه",
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
    timeoutRef.current = setTimeout(
      () =>
        setCurrentSlide((prevIndex) =>
          prevIndex === honorsSlides.length - 1 ? 0 : prevIndex + 1,
        ),
      5000,
    );

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
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg bg-bmw-surface">
        <img
          src={BackPMG}
          alt="Persia Khodro Cover"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="md:col-span-2 bg-bmw-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-bmw-border pb-3">
            <Building2 className="text-bmw-blue" size={24} />
            <h2 className="text-xl font-extrabold text-bmw-text">
              معرفی شرکت پرشیا خودرو
            </h2>
          </div>
          <div className="text-bmw-textSec text-sm leading-8 space-y-4 text-justify">
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
      <div className="bg-bmw-surface border border-bmw-border rounded-lg p-0 lg:p-6 shadow-sm  space-y-4 flex flex-col justify-between h-full">
        <div className="flex items-center gap-3 border-b border-bmw-border pb-3">
          <Award className="text-yellow-500" size={24} />
          <h2 className="text-xl font-extrabold text-bmw-text">افتخارات ما</h2>
        </div>
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden group border border-bmw-border/60">
          <img
            src={honorsSlides[currentSlide].image}
            alt={honorsSlides[currentSlide].title}
            className="w-full h-full object-cover transition-all duration-700 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

          <button
            onClick={prevSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-bmw-blue/80 text-white p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-bmw-blue/80 text-white p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
            <span className="inline-block text-[10px] font-bold bg-bmw-blue px-2 py-0.5 rounded mb-1.5">
              سال {honorsSlides[currentSlide].year}
            </span>
            <h4 className="text-sm font-extrabold line-clamp-1">
              {honorsSlides[currentSlide].title}
            </h4>
            <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-5">
              {honorsSlides[currentSlide].desc}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 pt-2">
          {honorsSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-5 bg-bmw-blue" : "w-2 bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <iframe
            src="https://www.aparat.com/video/video/embed/videohash/fenl79a/vt/frame"
            allowFullScreen
            className="w-full h-full border-0"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default IntroOrgan;
