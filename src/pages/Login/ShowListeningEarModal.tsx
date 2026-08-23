import React from "react";
import ModalUI from "../../components/UI/ModalUI";
import Button from "../../components/UI/Button";
import CustomInput from "../../components/UI/CustomInput";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { createListeningEar } from "../../services/dotNet";
import { useToast } from "../../hooks/useToast";

const ShowListeningEarModal: React.FC<any> = ({
  showListeningEar,
  setShowListeningEar,
}) => {
  const toast = useToast();

  const { control, handleSubmit } = useForm<any>({
    defaultValues: {
      fullName: "",
      description: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const postData = {
        nameAndLastName: data?.fullName,
        desc: data?.description,
      };

      const res = await createListeningEar(postData);

      if (res?.data?.isSuccess) {
        toast.success(res?.data?.message || "با موفقیت ثبت شد");
        setShowListeningEar(false);
      } else {
        toast.error(res?.data?.message || "خطایی رخ داده است");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("ارتباط با سرور برقرار نشد.");
    }
  };

  return (
    <ModalUI
      isOpen={showListeningEar}
      onClose={() => setShowListeningEar(false)}
      title="گوش شنوا"
      size="xl"
      closeOnBackdrop={false}
      footer={
        <>
          <Button
            onClick={() => setShowListeningEar(false)}
            variant="outline-danger"
            label="انصراف"
          />
          <Button
            onClick={handleSubmit(onSubmit)}
            rightIcon={<ArrowLeft size={16} />}
            variant="success"
            label="تایید و ارسال"
          />
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <CustomInput
              // label="اگر دوست داری مشخصاتت را وارد کن: (اختیاری)"
              label="اگر دوست داری مشخصاتت را وارد کن:"
              name="fullName"
              control={control}
              className="bg rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-bmw-blue"
            />
          </div>
          <CustomInput
            label="هر چیزی که دوست داری مدیریت بشنود را بنویس:"
            isTextArea
            name="description"
            control={control}
            rules={{
              required: "وارد کردن توضیحات الزامی است",
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-bmw-blue min-h-[120px]"
          />
        </div>
      </div>
    </ModalUI>
  );
};

export default ShowListeningEarModal;
