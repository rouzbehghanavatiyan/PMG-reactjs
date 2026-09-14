import { Controller } from "react-hook-form";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const CustomDatePicker = ({
  control,
  name,
  label,
  rules,
  minDate,
  maxDate,
}: any) => {
  return (
    <div className="flex w-full flex-col">
      {label && (
        <label className="mb-1 text-sm font-light tracking-wider text-gray-600">
          {label}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <div className="relative w-full flex items-center">
              <DatePicker
                minDate={minDate}
                maxDate={maxDate}
                value={field.value || ""}
                onChange={(date) => field.onChange(date)}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                calendarPosition="bottom-right"
                containerClassName="w-full"
                inputClass={`
                  w-full
                  bg-white
                  rounded-xl
                  border
                  p-2.5
                  pl-9
                  outline-none
                  transition-all
                  duration-200
                  ${
                    fieldState.error
                      ? "border-red-400"
                      : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }
                `}
              />

              {field.value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    field.onChange(null);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
                  title="پاک کردن تاریخ"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {fieldState.error && (
              <span className="mt-1 text-xs text-red-500">
                {fieldState.error.message}
              </span>
            )}
          </>
        )}
      />
    </div>
  );
};

export default CustomDatePicker;
