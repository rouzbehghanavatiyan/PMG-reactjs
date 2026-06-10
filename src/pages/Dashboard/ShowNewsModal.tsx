import React, { useEffect, useState } from "react";
import ModalUI from "../../components/UI/ModalUI";
import Button from "../../components/UI/Button";
import StringHelpers from "../../utils/stringHelpers";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Calendar, Tag } from "lucide-react";

const ShowNewsModal: React.FC<any> = ({ showNews, setShowNews, itemNews }) => {
  const imageNews = itemNews?.attachments?.map((item: any) =>
    StringHelpers?.getImage(item),
  );

  return (
    <ModalUI
      isOpen={showNews}
      onClose={() => setShowNews(false)}
      title="اخبار شرکت"
      size="xl"
      padding="p-0"
      closeOnBackdrop={false}
    >
      <div className="relative w-full flex justify-center">
        {imageNews?.length > 0 && (
          <div className="w-full sm:w-[700px] lg:w-[1000px] h-[260px] sm:h-[400px] lg:h-[500px]">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000 }}
              className="w-full h-full"
            >
              {imageNews.map((img: string, index: number) => (
                <SwiperSlide key={index}>
                  <div className="w-full h-full flex items-center justify-center bg-black/5">
                    <img
                      src={img}
                      alt={itemNews?.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-8 lg:p-10 bg-white rounded-lg">
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            {itemNews?.title}
          </h2>

          <div className="flex flex-wrap mt-3 gap-4 items-center text-sm text-gray-500">
            <span className="flex items-center">
              <Calendar className="me-1" size={15} />
              {StringHelpers.toPersianDateTime(itemNews?.createdAt)}
            </span>

            <span className="flex items-center gap-1 flex-wrap">
              <Tag size={15} />
              {itemNews?.categories?.map((item, index) => (
                <span key={index}>{item.title}</span>
              ))}
            </span>
          </div>
        </div>

        <hr className="text-gray-200" />

        <p className="text-gray-700 leading-7 text-justify text-sm sm:text-base">
          {itemNews?.content}
        </p>
      </div>
    </ModalUI>
  );
};

export default ShowNewsModal;
