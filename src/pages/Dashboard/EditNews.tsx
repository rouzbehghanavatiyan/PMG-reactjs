import React, { useEffect, useState } from "react";
import ModalUI from "../../components/UI/ModalUI";
import Button from "../../components/UI/Button";
import CustomInput from "../../components/UI/CustomInput";
import { Controller, useForm } from "react-hook-form";
import ComboBox from "../../components/UI/ComboBox";
import {
  addAttachment,
  addNewsAttachments,
  getAllCategoryNews,
  updateCompanyNews,
} from "../../services/dotNet";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { useToast } from "../../hooks/useToast";
import { Upload, X } from "lucide-react";
import StringHelpers from "../../utils/stringHelpers";

const EditNews: React.FC<any> = ({
  handleGetAllNews,
  initialData,
  showEditNews,
  setShowEditNews,
}) => {
  const defaultFormValues = {
    title: "",
    content: "",
    isPinned: false,
  };
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>(
    [],
  );
  const { control, handleSubmit, reset } = useForm<any>({
    defaultValues: defaultFormValues,
  });
  const toast = useToast();
  const [allCategory, setAllCategory] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
    }
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (attachment: any) => {
    console.log("attachment attachment attachment", attachment);

    setExistingImages((prev) =>
      prev.filter((item) => item.id !== attachment.id),
    );

    setRemovedAttachmentIds((prev) => {
      if (prev.includes(attachment.id)) return prev;
      return [...prev, attachment.id];
    });
  };

  const handleEdit = asyncWrapper(async (data: any) => {
    const postData = {
      id: initialData?.id,
      title: data?.title,
      content: data?.content,
      isPinned: data?.isPinned || false,
      categoryIds: selectedUser.map((x: any) => x.id),
      removedAttachmentIds: removedAttachmentIds,
    };
    const res = await updateCompanyNews(postData);
    const { code, message } = res?.data || {};

    if (code === 0) {
      if (selectedImages.length > 0) {
        const formData = new FormData();

        selectedImages.forEach((file) => {
          formData.append("FormFiles", file);
        });

        formData.append("CompanyNewsId", String(initialData.id));

        await addNewsAttachments(formData);
      }

      setShowEditNews(false);
      handleGetAllNews();
      toast.success(message);
    }
  }, toast);

  const fixImages = initialData?.attachments?.map((item) =>
    StringHelpers.getImage(item?.url),
  );
  console.log(fixImages);

  useEffect(() => {
    if (!showEditNews) return;
    if (!initialData?.id) return;

    reset({
      title: initialData.title ?? "",
      content: initialData.content ?? "",
      isPinned: initialData.isPinned ?? false,
    });

    setSelectedUser(initialData.categories || []);
    setSelectedImages([]);

    setExistingImages(initialData.attachments || []);
    setRemovedAttachmentIds([]);
  }, [showEditNews, initialData?.id, reset]);

  const handleGetAllCategory = asyncWrapper(async () => {
    const res = await getAllCategoryNews();
    const { code, result, message } = res?.data || {};
    if (code === 0) {
      setAllCategory(result);
    }
  }, toast);

  useEffect(() => {
    handleGetAllCategory();
  }, []);

  return (
    <ModalUI
      isOpen={showEditNews}
      onClose={() => setShowEditNews(false)}
      title={initialData ? "ویرایش خبر" : "افزودن خبر"}
      size="xl"
      closeOnBackdrop={false}
      footer={
        <>
          <Button
            onClick={() => setShowEditNews(false)}
            variant="outline-danger"
            label="لغو"
          />
          <Button
            onClick={handleSubmit(handleEdit)}
            variant="primary"
            label="تایید"
          />
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInput
          label="تیتر"
          name="title"
          control={control}
          className="rounded-xl border border-gray-200 px-4 outline-none focus:border-bmw-blue"
        />
        <ComboBox
          label="دسته بندی"
          isMulti
          options={allCategory}
          keyId="id"
          keyValue="title"
          value={selectedUser}
          onChange={setSelectedUser}
        />
        <CustomInput
          isTextArea
          label="محتوا"
          rows={4}
          name="content"
          control={control}
          containerClassName="md:col-span-2"
          className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-bmw-blue"
        />
        <div className="flex justify-between md:col-span-2 w-full">
          <div className="">
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-xl px-4 py-3 w-fit hover:bg-gray-50">
              <Upload size={18} />
              <span className="text-sm">افزودن عکس</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Controller
              name="isPinned"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 accent-bmw-blue"
                />
              )}
            />
            <label className="text-sm">پین شود</label>
          </div>
        </div>

        {(fixImages?.length > 0 || selectedImages.length > 0) && (
          <div className="md:col-span-2 flex flex-wrap gap-4 mt-2">
            {existingImages.map((attachment: any, index: number) => {
              console.log("{existingImages.map((", attachment);

              return (
                <div
                  key={`old-${attachment.id || index}`}
                  className="relative group"
                >
                  <img
                    src={StringHelpers.getImage(attachment?.url)}
                    alt={`news-${index}`}
                    className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(attachment)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-90 hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
            {selectedImages.map((file, index) => (
              <div key={`new-${index}`} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-90 hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalUI>
  );
};

export default EditNews;
