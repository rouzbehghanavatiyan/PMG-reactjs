import React, { forwardRef } from "react";
import StringHelpers from "../../utils/stringHelpers";

const PayPrintPerMonth = forwardRef<HTMLDivElement, any>(
  ({ historyItem }, ref) => {
    const rowStyle: React.CSSProperties = {
      marginTop: 2,
      marginBottom: 2,
      paddingLeft: 3,
      paddingRight: 3,
      fontSize: 13,
      display: "flex",
      justifyContent: "space-between",
    };
    return (
      <div
        ref={ref}
        dir="rtl"
        style={{ fontFamily: "Vazirmatn, sans-serif" }}
        className="bg-white text-black border-4 border-gray-400 w-[900px] p-10"
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
        <div className="grid grid-cols-4 justify-between border-2 border-gray-400 mt-1">
          <div className="col-span-1 border">
            <span className="flex row border justify-center"> سایر</span>
            <div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span> کارکرد ساعتی نهایی </span>
                <span> 0 </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span> ماموریت روزانه تعطیل ماهانه نهایی </span>
                <span> 0 </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>ماموریت روزانه عادی ماهانه نهایی </span>
                <span> 0 </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>کسر کار ماهانه نهایی </span>
                <span> 0 </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>غیبت ماهانه نهایی </span>
                <span>
                  {StringHelpers.minutesToTime(historyItem?.monthlyAbsence)}
                </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>اضافه کار روز عادی نهایی </span>
                <span>
                  {StringHelpers.minutesToTime(
                    historyItem?.overtimeFinalRegularDay,
                  )}
                </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>تعطیل کاری ماهانه نهایی </span>
                <span>
                  {StringHelpers.minutesToTime(
                    historyItem?.finalMonthlyWorkday,
                  )}
                </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>کارکرد موثر </span>
                <span>
                  {StringHelpers.getDaysInPersianMonth(historyItem?.month)}
                </span>
              </div>
            </div>
          </div>
          <div className="col-span-1 border">
            <span className="flex row border justify-center"> مزایا</span>
            <div className="">
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span> حقوق پایه</span>
                <span>{StringHelpers.toPrice(historyItem?.baseAmount)}</span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>ایاب و ذهاب </span>
                <span>
                  {StringHelpers.toPrice(historyItem?.transportation)}
                </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>حق مسکن </span>
                <span>
                  {StringHelpers.toPrice(historyItem?.housingAllowance)}
                </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>حق خوار و بار </span>
                <span>
                  {StringHelpers.toPrice(historyItem?.groceryAllowance)}
                </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>فوق العاده جذب </span>
                <span>
                  {StringHelpers.toPrice(historyItem?.attractionAllowance)}
                </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>حق مسئولیت </span>
                <span>
                  {StringHelpers.toPrice(historyItem?.responsibilityAllowance)}
                </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>اضافه کاری </span>
                <span>{StringHelpers.toPrice(historyItem?.overtime)}</span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>سایر مزایا (م) </span>
                <span>{StringHelpers.toPrice(historyItem?.otherBenefits)}</span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>پایه سنوات </span>
                <span>{StringHelpers.toPrice(historyItem?.longevityPay)}</span>
              </div>
            </div>
          </div>
          <div className="col-span-1 border">
            <span className="flex border row justify-center"> کسور</span>
            <div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span> بیمه تامین اجتماعی سهم کارمند</span>
                <span>
                  {StringHelpers?.toPrice(historyItem?.socialSecurityEmployee)}
                </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>مالیات</span>
                <span> {StringHelpers?.toPrice(historyItem?.tax)} </span>
              </div>
              <div
                style={rowStyle}
                className="my-4  text-[13px] flex justify-between px-2 "
              >
                <span>بیمه تکمیلی سهم کارمند </span>
                <span>
                  {StringHelpers?.toPrice(historyItem?.supplementaryInsurance)}
                </span>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <span className="flex row border justify-center"> وام</span>
            <div className=""></div>
          </div>
        </div>
        <div className="grid grid-cols-4">
          <div className="col-span-1"></div>
          <div className="col-span-1">
            <div className="border bg-gray-300 my-1 px-2 flex justify-between items-center ">
              <span>جمع مزایا</span>
              <span style={rowStyle}>
                {" "}
                {StringHelpers?.toPrice(historyItem?.totalBenefits)}{" "}
              </span>
            </div>
          </div>
          <div className="col-span-1">
            <div className="border bg-gray-300 my-1 px-2 flex justify-between items-center ">
              <span>جمع کسور </span>
              <span style={rowStyle}>
                {StringHelpers?.toPrice(historyItem?.totalDeductions)}
              </span>
            </div>
          </div>
          <div className="col-span-1">
            <div className="border bg-gray-300 my-1 px-2 flex justify-between items-center ">
              <span>جمع اقساط وام </span>
              <span style={rowStyle}> </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4">
          <div className="col-span-1"></div>
          <div className="col-span-1">
            <div className="border bg-gray-300 my-1 px-2 flex justify-between items-center ">
              <span>خالص پرداختی </span>
              <span style={rowStyle}>
                {StringHelpers?.toPrice(historyItem?.netPayment)}{" "}
              </span>
            </div>
          </div>
          <div className="col-span-1"></div>
          <div className="col-span-1">
            <div className="border bg-gray-300 my-1 px-2 flex justify-between items-center ">
              <span>شماره حساب </span>
              <span style={rowStyle}> {historyItem?.accountNumber} </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default PayPrintPerMonth;
