import React from "react";
import { Controller } from "react-hook-form";

interface CustomInputProps {
  name: string;
  control: any;
  rules?: any;
  label?: string;
  onValueChange?: (value: string) => void;
  numeric?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  containerClassName?: string;
  isTextArea?: boolean;
  rows?: number;
}

const CustomInput: React.FC<CustomInputProps> = ({
  name,
  control,
  rules,
  label,
  maxLength,
  onValueChange,
  numeric = false,
  type,
  className = "",
  containerClassName,
  isTextArea = false,
  rows = 3,
  ...rest
}) => {
  const Component = isTextArea ? "textarea" : "input";

  return (
    <div className={`w-full ${containerClassName || ""}`}>
      {label && (
        <label className="mb-1 block font-light text-sm text-bmw-textSec">
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <Component
              {...rest}
              name={field.name}
              maxLength={maxLength}
              type={isTextArea ? undefined : type}
              rows={isTextArea ? rows : undefined}
              value={field.value ?? ""}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => {
                let value = e.target.value;

                if (numeric) {
                  value = value.replace(/[^0-9]/g, "");
                }

                field.onChange(value);
                onValueChange?.(value);
              }}
              onBlur={field.onBlur}
              ref={field.ref}
              style={{ fontSize: "14px" }}
              className={`w-full rounded-lg thick-text border px-3 py-2 outline-none transition ${
                fieldState.error
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              } ${className}`}
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
