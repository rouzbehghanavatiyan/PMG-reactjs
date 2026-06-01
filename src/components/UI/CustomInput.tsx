import React from "react";
import { Controller } from "react-hook-form";

interface CustomInputProps {
  name: string;
  control: any;
  rules?: any;
  label?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  numeric?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
}

const CustomInput: React.FC<CustomInputProps> = ({
  name,
  control,
  rules,
  label,
  maxLength,
  defaultValue = "",
  onValueChange,
  numeric = false,
  type,
  className = "",
  ...rest
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-bmw-textSec">
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => (
          <>
            <input
              {...rest}
              name={field.name}
              maxLength={maxLength}
              type={type}
              value={field.value ?? ""}
              onChange={(e) => {
                let value = e.target.value;

                if (numeric) {
                  value = value.replace(/[^0-9]/g, "");
                }

                field.onChange(value);
                onValueChange?.(value);
              }}
              onBlur={field.onBlur}
              ref={field.ref}
              className={`w-full rounded-lg border px-3 py-2 outline-none transition
                ${
                  fieldState.error
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }
                ${className}`}
            />

            {fieldState.error?.message && (
              <p className="mt-1 text-xs text-red-500">
                {fieldState.error.message}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
};

export default CustomInput;
