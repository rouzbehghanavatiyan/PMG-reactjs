import React, { useEffect, useMemo, useState } from "react";
import ModalUI from "../../components/UI/ModalUI";
import Button from "../../components/UI/Button";
import CustomInput from "../../components/UI/CustomInput";
import { useForm } from "react-hook-form";
import InlineLoading from "../../components/UI/InlineLoading";
import { usersLogin, verifyLoginCode } from "../../services/dotNet";
import { useNavigate } from "react-router-dom";
import { RsetUserLogin } from "../../features/slices/mainSlice";
import { useDispatch } from "react-redux";

const TWO_MINUTES = 120;

const ShowCapchaModal: React.FC<any> = ({
  showCapchaModal,
  setShowCapchaModal,
  persoanlCode,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(TWO_MINUTES);
  const [code, setCode] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { control, watch } = useForm<any>();
  const capchaCode = watch("capchaCode") ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const expired = secondsLeft === 0;

  const timeText = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  const handleResend = async () => {
    setSecondsLeft(TWO_MINUTES);
    const res = await usersLogin(persoanlCode);
    const { code, message, data }: any = res?.data;
    console.log(res);
    setCode("");
  };

  const handleCheckVerifyCapcha = async () => {
    try {
      setIsLoading(true);
      const postData = {
        personalCode: persoanlCode,
        code: capchaCode,
      };
      const res = await verifyLoginCode(postData);
      const { code, message, data }: any = res?.data;
      if (code === 0) {
        setIsLoading(false);
        navigate("/dashboard");
        dispatch(RsetUserLogin(data));
        localStorage.setItem("token", data.token);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (capchaCode.length === 6) {
      handleCheckVerifyCapcha();
    }
  }, [capchaCode.length]);

  useEffect(() => {
    if (!showCapchaModal) return;
    setSecondsLeft(TWO_MINUTES);
    setCode("");
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [showCapchaModal]);

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
