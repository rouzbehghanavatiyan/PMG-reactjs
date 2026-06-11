import React, { useEffect, useMemo, useState } from "react";
import ModalUI from "../../components/UI/ModalUI";
import Button from "../../components/UI/Button";
import CustomInput from "../../components/UI/CustomInput";
import { useForm } from "react-hook-form";
import InlineLoading from "../../components/UI/InlineLoading";
import { usersLogin, verifyLoginCode } from "../../services/dotNet";
import { useNavigate } from "react-router-dom";
import { RsetPermission, RsetUserLogin } from "../../features/slices/mainSlice";
import { useDispatch } from "react-redux";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { useToast } from "../../hooks/useToast";

const TWO_MINUTES = 120;

const ShowCapchaModal: React.FC<any> = ({
  showCapchaModal,
  setShowCapchaModal,
  persoanlCode,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(TWO_MINUTES);
  const [timerKey, setTimerKey] = useState(0);
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { control, watch, setValue } = useForm<any>();
  const capchaCode = watch("capchaCode") ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const expired = secondsLeft === 0;

  const timeText = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  const handleResend = asyncWrapper(async () => {
    const postData = {
      personalCode: persoanlCode,
    };

    const res = await usersLogin(postData);
    const { code }: any = res?.data;

    if (code === 0) {
      setValue("capchaCode", "");
      setSecondsLeft(TWO_MINUTES);
      setTimerKey((prev) => prev + 1);
    }
  }, toast);

  const handleCheckVerifyCapcha = asyncWrapper(async () => {
    if (expired) return;

    setIsLoading(true);
    const postData = {
      personalCode: persoanlCode,
      code: capchaCode,
    };
    const res = await verifyLoginCode(postData);
    const { code, data }: any = res?.data;
    if (code === 0) {
      navigate("/dashboard");
      localStorage.setItem("permissions", data.permissions);
      dispatch(RsetUserLogin(data));
      localStorage.setItem("token", data.token);
    }

    setIsLoading(false);
  }, toast);

  useEffect(() => {
    if (capchaCode.length === 6 && !expired) {
      handleCheckVerifyCapcha();
    }
  }, [capchaCode]);

  useEffect(() => {
    if (!showCapchaModal) return;

    setSecondsLeft(TWO_MINUTES);

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [showCapchaModal, timerKey]);

  return (
    <ModalUI
      isOpen={showCapchaModal}
      onClose={() => setShowCapchaModal(false)}
      title=""
      size="md"
      closeOnBackdrop={false}
      footer={
        <>
          {expired && (
            <Button
              onClick={handleResend}
              variant="outline-primary"
              label="ارسال مجدد کد"
            />
          )}
        </>
      }
    >
      <div className="space-y-4">
        <span className="flex justify-between">
          <p className="leading-7 text-gray-700">
            لطفاً کد ارسالی را وارد کنید.
          </p>
          <span className="font-bold text-xl">{timeText}</span>
        </span>

        <div className="space-y-2">
          <CustomInput
            maxLength={6}
            name="capchaCode"
            control={control}
            numeric
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-bmw-blue"
            placeholder="123456"
          />

          {isLoading && (
            <span className="flex justify-center mt-8">
              <InlineLoading isActive={isLoading} size="lg" />
            </span>
          )}

          {expired && (
            <p className="text-sm text-red-600">
              زمان وارد کردن کد به پایان رسید. لطفاً «ارسال مجدد کد» را بزنید.
            </p>
          )}
        </div>
      </div>
    </ModalUI>
  );
};

export default ShowCapchaModal;
