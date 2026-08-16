import React from "react";
import ModalUI from "../../components/UI/ModalUI";
import Button from "../../components/UI/Button";
import { deleteFoodByUser } from "../../services/dotNet";
import { useAppSelector } from "../../features/store";

type Props = {
  showDeleteModal: boolean;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDeleteItem?: any;
  handleFindAcceptedFood: any;
  showToast: any;
};

const DeleteFoodModal: React.FC<Props> = ({
  showDeleteModal,
  handleFindAcceptedFood,
  setShowDeleteModal,
  selectedDeleteItem,
  showToast,
}) => {
  const foodName =
    selectedDeleteItem?.foodName || selectedDeleteItem?.FoodName || "این غذا";
  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );
  const handleConfirmDelete = async () => {
    console.log("حذف تایید شد:", selectedDeleteItem);
    const postData = {
      menuItemID: selectedDeleteItem?.menuItemId,
      personalCode: userLogin?.personalCode,
    };
    const res = await deleteFoodByUser(postData);
    if (res?.data?.isSuccess) {
      handleFindAcceptedFood();
      setShowDeleteModal(false);
      showToast("success", res?.data?.message);
    } else {
      setShowDeleteModal(false);
      showToast("error", res?.data?.message);
    }
    console.log(res);
  };

  return (
    <ModalUI
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="حذف غذا"
      size="sm"
      closeOnBackdrop={false}
    >
      <div className="space-y-5">
        <p className="text-sm text-bmw-text">
          آیا از حذف غذای <span className="font-bold">{foodName}</span> اطمینان
          دارید؟
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline-ghost-bmw-textSec"
            type="button"
            onClick={() => setShowDeleteModal(false)}
          >
            لغو
          </Button>
          <Button variant="danger" type="button" onClick={handleConfirmDelete}>
            تأیید
          </Button>
        </div>
      </div>
    </ModalUI>
  );
};

export default DeleteFoodModal;
