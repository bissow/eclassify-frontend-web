import { useTranslation } from "@/lang/useTranslation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomLink from "@/components/common/CustomLink";
import { deleteChatMessagesApi } from "@/lib/api";
import useChatSelectMode from "@/features/chat/hooks/useChatSelectMode";
import useChatBlockUser from "@/features/chat/hooks/useChatBlockUser";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { getIsRtl } from "@/store/slices/languageSlice";
import {
  getSelectedChat,
  getMessageSelectMode,
  getSelectedMessageIds,
  removeMessages,
  setMessageSelectMode,
} from "@/store/slices/chatSlice";
import CustomImage from "@/components/common/CustomImage";
import UserAvatar from "@/components/common/UserAvatar";
import { ArrowLeftIcon, CircleNotchIcon, DotsThreeVerticalIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SelectedChatHeader = ({ isSelling, handleBack, chatId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedChat = useSelector(getSelectedChat);
  const selectMode = useSelector(getMessageSelectMode);
  const selectedMessages = useSelector(getSelectedMessageIds);
  const isBlocked = selectedChat?.user_blocked;
  const userData = isSelling ? selectedChat?.buyer : selectedChat?.seller;
  const itemData = selectedChat?.item;
  const isRTL = useSelector(getIsRtl);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    isDeleteModalOpen, setIsDeleteModalOpen,
    isDeleting: isChatDeleting, handleBulkDelete: handleDeleteChat,
    requestDelete,
  } = useChatSelectMode({ isSelling });

  const toggleBlock = useChatBlockUser();

  const handleToggleBlock = () =>
    toggleBlock(userData?.id, !isBlocked, selectedChat?.id);

  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    try {
      setIsDeleting(true)
      const response = await deleteChatMessagesApi.deleteChatMessages({
        item_offer_id: chatId,
        message_ids: selectedMessages,
      });
      if (response?.data?.error === false) {
        toast.success(response?.data?.message);
        dispatch(removeMessages(selectedMessages));
        dispatch(setMessageSelectMode(false));
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("somthingWentWrong"));
    } finally {
      setIsDeleting(false)
    }
  };


  return (
    <>
      <div className="flex items-center justify-between gap-1 px-4 py-3 border-b">
        <div className="flex items-center gap-4 min-w-0">

          <button onClick={handleBack} className={cn(
            "block xl:hidden"
          )}>
            <ArrowLeftIcon size={20} weight="bold" />
          </button>

          <div className="relative shrink-0">
            <CustomLink href={`/seller/${userData?.id}`}>
              <UserAvatar
                src={userData?.profile}
                initial={userData?.initial}
                avatarColor={userData?.avatar_color}
                alt="avatar"
                size={56}
                className="w-14 h-14"
              />
            </CustomLink>
            <CustomImage
              src={itemData?.image}
              alt="avatar"
              width={24}
              height={24}
              className="w-6 h-auto aspect-square object-cover rounded-full absolute top-8 -bottom-1.5 -right-1.5"
            />
          </div>
          <div className="flex flex-col gap-2 w-full min-w-0">
            <CustomLink
              href={`/seller/${userData?.id}`}
              className="font-medium truncate"
              title={userData?.name}
            >
              {userData?.name}
            </CustomLink>
            <p
              className="truncate text-sm"
              title={itemData?.translation?.name}
            >
              {itemData?.translation?.name}
            </p>
          </div>
        </div>
        {/* Dropdown Menu for Actions */}
        <div className="flex items-center gap-4">
          {selectMode ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">
                {selectedMessages.length} {t("selected")}
              </span>
              <button
                onClick={handleDeleteMessages}
                className="text-destructive"
                title={t("delete")}
                disabled={selectedMessages.length === 0 || isDeleting}
              >
                {
                  isDeleting ? <CircleNotchIcon className="size-5 animate-spin" weight="bold" /> : <TrashIcon size={20} />
                }
              </button>
              <button
                onClick={() => dispatch(setMessageSelectMode(false))}
                title={t("cancel")}
              >
                <XIcon size={20} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="self-end">
                    <DotsThreeVerticalIcon size={22} weight="bold" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"}>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleToggleBlock}
                  >
                    <span>{isBlocked ? t("unblock") : t("block")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={() => requestDelete(selectedChat?.id)}
                  >
                    <span>{t("deleteChat")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="text-xs whitespace-nowrap">
                {itemData?.formatted_price || itemData?.formatted_salary_range}
              </div>
            </div>
          )}
        </div>
      </div>
      <DeleteConfirmDialog
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteChat}
        title={t("deleteChat")}
        description={t("deleteChatDescription")}
        confirmDisabled={isChatDeleting}
      />
    </>
  );
};

export default SelectedChatHeader;
