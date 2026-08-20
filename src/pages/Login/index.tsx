import React, { useState } from "react";
import { ShieldCheck, ArrowRight, MessageCircleWarning } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import CustomInput from "../../components/UI/CustomInput";
import { useForm } from "react-hook-form";
import ThemeAndLang from "../../common/ThemeAndLang";
import { usersLogin } from "../../services/dotNet";
import Button from "../../components/UI/Button";
import { useToast } from "../../hooks/useToast";
import ShowCapchaModal from "./ShowCapchaModal";
import { asyncWrapper } from "../../utils/asyncWrapper";
import logoPMG from "../../assets/images/favicon.png";
import ShowListeningEarModal from "./ShowListeningEarModal";

const Login: React.FC<any> = () => {
  const { t } = useLanguage();
  const [loadingBtn, setLoadingBtn] = React.useState(false);
  const { control, handleSubmit } = useForm<any>();
  const toast = useToast();
  const [showCapchaModal, setShowCapchaModal] = useState(false);
  const [showListeningEar, setShowListeningEar] = useState(false);
  const [persoanlCode, setPersoanlCode] = useState("");

  const onSubmit = asyncWrapper(async (fields: any) => {
    setPersoanlCode(fields.personalCode);
    setLoadingBtn(true);
    const res = await usersLogin({ personalCode: fields.personalCode });
    const { code, message, data }: any = res?.data;
    if (code === 0) {
      if (data?.isSuccess) {
        setShowCapchaModal(true);
        setLoadingBtn(false);

        toast.success(data?.message);
      } else {
        setLoadingBtn(false);
        toast.warning(data?.message);
      }
    }
  }, toast);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-h-screen bg-gradient-to-b from-blue-400  to-slate-50 flex items-center justify-center relative overflow-hidden transition-colors duration-300"
      >
        <div className="w-full max-w-md bg-bmw-surface border border-gray-300 rounded-2xl p-8 relative z-10 shadow-sm">
          <ThemeAndLang />
          <div className="text-center justify-center flex mb-8">
            {/* <div className="inline-flex items-center justify-center w-16 h-16 rounded-full from-blue-900 to-bmw-blue mb-4 border border-white/10">
              <span className="text-white font-bold text-xl">PK</span>
              </div> */}
            <img
              className="rounded-full border-3  border-bmw-blue p-1"
              src={logoPMG}
              width={100}
              height={100}
            />
            {/* <p className="text-bmw-textSec text-sm mt-2">
              {t("login_subtitle")}
              </p> */}
          </div>
          <div className="flex justify-center mb-4">
            <h1 className="text-xl font-bold text-bmw-blue tracking-wide">
              Persia Khodro App
            </h1>
          </div>
          <div className="space-y-5">
            <CustomInput
              name="personalCode"
              className="w-full mt-2 bg-bmw-base border border-bmw-border text-bmw-text px-4 py-3 rounded-lg focus:outline-none focus:border-bmw-blue focus:ring-1 focus:ring-bmw-blue transition-all"
              control={control}
              label={t("employee_id")}
              numeric
              maxLength={6}
              placeholder="123456"
              rules={{
                required: "کدپرسنلی الزامی است",
                minLength: {
                  value: 5,
                  message: "کدپرسنلی باید حداقل 5 رقم باشد",
                },
              }}
            />
            <span className="flex justify-center">
              <Button
                type="submit"
                className="w-full"
                loading={loadingBtn}
                rightIcon={<ArrowRight size={18} className="rtl:rotate-180" />}
                variant="primary"
                label="ورود"
              />
            </span>
            <span className="flex justify-center">
              <Button
                onClick={() => setShowListeningEar(true)}
                type="button"
                className="w-full"
                rightIcon={<MessageCircleWarning size={16} />}
                loading={loadingBtn}
                variant="outline-primary"
                label="گوش شنوا"
              />
            </span>
          </div>
          {/* <div className="mt-8 pt-6 border-t border-bmw-border text-center">
            <div className="flex items-center justify-center gap-2 text-bmw-textSec text-xs">
              <ShieldCheck size={14} />
              <span>{t("auth_only")}</span>
            </div>
          </div> */}
        </div>
      </form>
      {showCapchaModal && (
        <ShowCapchaModal
          persoanlCode={persoanlCode}
          setPersoanlCode={setPersoanlCode}
          showCapchaModal={showCapchaModal}
          setShowCapchaModal={setShowCapchaModal}
        />
      )}
      {showListeningEar && (
        <ShowListeningEarModal
          showListeningEar={showListeningEar}
          setShowListeningEar={setShowListeningEar}
        />
      )}
    </>
  );
};

export default Login;
