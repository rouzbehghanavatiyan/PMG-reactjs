import { useEffect, useState, useRef } from "react";
import { useAppSelector } from "../../features/store";
import { getNotifAll, isReadNotif } from "../../services/dotNet";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { useToast } from "../../hooks/useToast";
import StringHelpers from "../../utils/stringHelpers";
import Button from "../../components/UI/Button";
import { Check, Eye } from "lucide-react";

interface NotificationItem {
  id?: number;
  personalCode?: string;
  title?: string;
  message: string;
  time?: string;
  createdAt?: string;
  isRead?: boolean;
}

const NotificationPage: React.FC<any> = ({
  allNotif,
  handleGetAllNotif,
  setAllNotif,
}) => {
  const notifMessage = useAppSelector((state) => state.main.notifMessage);
  const toast = useToast();
  const userProfile = useAppSelector((state) => state?.main?.userProfile);
  const userId = userProfile?.userLogin?.id;
  const lastProcessedMessageRef = useRef<string | null>(null);
  console.log(notifMessage);

  useEffect(() => {
    const newMessage = notifMessage?.user?.newMessage;
    if (!newMessage) return;

    const uniqueId =
      notifMessage?.user?.notificationId ??
      `${newMessage}-${notifMessage?.user?.createdAt ?? notifMessage?.createdAt ?? ""}`;

    if (lastProcessedMessageRef.current === uniqueId) return;
    lastProcessedMessageRef.current = uniqueId;

    handleGetAllNotif();
  }, [notifMessage, handleGetAllNotif]);

  const handleIsReadMessage = asyncWrapper(async (note) => {
    console.log("note note note", note);

    const postData = {
      userId: userId,
      notifId: note?.id,
    };
    const res = await isReadNotif(postData);
    console.log(res);
    const { success } = res?.data;
    if (success) {
      handleGetAllNotif();
    }
  }, toast);

  return (
    <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-bmw-border">
      {allNotif.length > 0 ? (
        allNotif.map((note: any, i: number) => (
          <div
            key={i}
            className="flex justify-between items-start border-b border-bmw-border last:border-0 last:pb-0"
          >
            <div className="flex justify-between gap-2 items-start">
              <div className="w-2 h-2 rounded-full bg-bmw-blue mt-2 shrink-0" />
              <div>
                <p className="text-[12px] text-bmw-textSec">{note.message}</p>
                <span className="text-[10px] text-bmw-textSec opacity-70 mt-1 block">
                  {StringHelpers?.toPersianFullDateTime(note.createdAt)}
                </span>
              </div>
            </div>
            {!note?.isRead ? (
              <Button
                className="text-[10px]"
                size="sm"
                onClick={() => handleIsReadMessage(note)}
                variant="outline-ghost-danger"
                leftIcon={<Eye size={15} />}
                label="خوانده نشده"
              />
            ) : (
              <Button
                className="text-[10px]"
                size="sm"
                onClick={() => handleIsReadMessage(note)}
                variant="outline-ghost-bmw-textSec"
                leftIcon={<Check size={15} />}
                label="خوانده شد"
              />
            )}
          </div>
        ))
      ) : (
        <div className="text-center text-sm  text-bmw-textSec opacity-60 py-4">
          هیچ اعلانی وجود ندارد.
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
