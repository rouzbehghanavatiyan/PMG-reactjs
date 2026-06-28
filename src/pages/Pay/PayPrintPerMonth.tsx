import React, { forwardRef } from "react";
import StringHelpers from "../../utils/stringHelpers";

const PayPrintPerMonth = forwardRef<HTMLDivElement, any>(
  ({ historyItem }, ref) => {
    const Section = ({
      title,
      items,
      isPerformance = false,
    }: {
      isPerformance?: boolean;
      title: string;
      items?: { element: string; value: number }[];
    }) => (
      <div className="border border-gray-400 flex flex-col">
        <div className="bg-white border-b border-gray-400 text-center py-2">
          {title}
        </div>
        <div className="min-h-[320px]">
          {items?.map((item) => (
            <div
              key={item.element}
              className="flex justify-between items-center px-2 py-1 text-sm border-b border-gray-200"
            >
              <span className="text-[12px]">
                {isPerformance
                  ? item.element.includes("روزانه")
                    ? item.value
                    : StringHelpers.minutesToTime(item.value)
                  : StringHelpers.toPrice(item.value)}
              </span>
              <span className="text-end text-[11px]">{item.element}</span>
            </div>
          ))}
          {isPerformance && (
            <div className="flex justify-between items-center px-2 py-1 text-sm border-b border-gray-200 bg-white">
              <span className="text-[12px]">31</span>

              <span className="text-end text-[12px]">کارکرد موثر</span>
            </div>
          )}
        </div>
      </div>
    );

    const getValue = (element: string) =>
      historyItem?.others?.find((x: any) => x.element === element)?.value ?? 0;
    const getVam = (element: string) =>
      historyItem?.deductions?.find((x: any) => x.element === element)?.value ??
      0;

    return (
      <div
        ref={ref}
        className="bg-white text-black border-4 border-gray-400 p-2"
      >
        <span className="flex justify-center font-bold text-xl">
          پرشیا خودرو
        </span>
        <div className="flex justify-center items-center gap-4 my-2">
          <span className="font-bold text-xl">فیش حقوقی ماه</span>
          <span> {StringHelpers?.toPersianMonthName(historyItem?.month)} </span>
          <span className="font-bold text-xl">سال</span>
          <span>{historyItem?.year}</span>
        </div>
        <div className="flex px-2 justify-between border-3 border-gray-400 bg-gray-200 ">
          <div className="">
            <span className="font-bold text-xl"> کدپرسنلی: </span>
            <span> {historyItem?.personalCode} </span>
          </div>
          <div>
            <span className="font-bold text-xl"> نام و نام خانوادگی:</span>
            <span>
              {historyItem?.firstName} {historyItem?.lastName}
            </span>
          </div>
          <div>
            <span className="font-bold text-xl"> مرکز هزینه: </span>
            <span> {historyItem?.costCenterTitle} </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div>
            <Section title="وام" items={historyItem?.loans} />
            <div className="mt-2">
              <div className="my-2 flex justify-between bg-gray-200 p-2">
                <span className="text-[12px]">
                  {StringHelpers.toPrice(getVam("جمع اقساط وام"))}
                </span>
                <span className="text-[11px]">جمع اقساط وام</span>
              </div>
              <div className="my-2 flex justify-between bg-gray-200 p-2">
                <span className="text-[11px]">
                  {historyItem?.accountNumber ?? "-"}
                </span>
                <span className="text-[11px]">شماره حساب</span>
              </div>
            </div>
          </div>
          <div>
            <Section title="کسور" items={historyItem?.deductions} />
            <div className="mt-2">
              <div className="my-2 flex justify-between bg-gray-200 p-2">
                <span className="text-[12px]">
                  {StringHelpers.toPrice(getValue("جمع کسور"))}
                </span>
                <span className="text-[11px]">جمع کسور</span>
              </div>
            </div>
          </div>
          <div>
            <Section title="مزایا" items={historyItem?.benefits} />
            <div className="mt-2">
              <div className="my-2 flex justify-between bg-gray-200 p-2">
                <span className="text-[12px]">
                  {StringHelpers.toPrice(getValue("جمع مزایا"))}
                </span>
                <span className="text-[11px]">جمع مزایا</span>
              </div>

              <div className="my-1 flex justify-between bg-gray-200 p-2">
                <span className="text-[12px]">
                  {StringHelpers.toPrice(getValue("خالص پرداختی"))}
                </span>
                <span className="text-[11px]">خالص پرداختی</span>
              </div>
            </div>
          </div>
          <div>
            <Section
              isPerformance
              title="سایر"
              items={historyItem?.performance}
            />
          </div>
        </div>
      </div>
    );
  },
);

PayPrintPerMonth.displayName = "PayPrintPerMonth";

export default PayPrintPerMonth;
