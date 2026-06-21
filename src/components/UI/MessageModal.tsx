import React from "react";
import ModalUI from "./ModalUI";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "../../features/store";
import { RsetMessageModal } from "../../features/slices/mainSlice";
import Button from "./Button";

interface MessageModalPropTypes {
  setShowDeleteModal: any;
  showDeleteModal: any;
  handleAccept: any;
}

const MessageModal: React.FC<MessageModalPropTypes> = ({
  setShowDeleteModal,
  showDeleteModal,
  handleAccept,
}) => {
  const messageModal = useAppSelector((state) => state.main.messageModal);
  const dispatch = useAppDispatch();

  const handleSubmit = () => {
    dispatch(RsetMessageModal({ show: false }));
    handleAccept();
  };

  return (
    <ModalUI
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="حذف"
      size="sm"
      headColor="bg-red-500"
      closeOnBackdrop={false}
      footer={
        <>
          <Button
            onClick={() => setShowDeleteModal(false)}
            variant="outline-danger"
            label="لغو"
          />
          <Button onClick={handleSubmit} variant="success" label="تایید" />
        </>
      }
    >
      {messageModal?.title || "آیا از حذف این آیتم مطمئن هستید؟"}
    </ModalUI>
  );
};

export default MessageModal;
