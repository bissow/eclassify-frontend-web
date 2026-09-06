import { userSignUpData } from "@/store/slices/authSlice";
import { useTranslation } from "@/lang/useTranslation";
import { useSelector } from "react-redux";
import { ChatMessagesSkeleton } from "@/features/chat/ChatSkeletons";
import { CaretUpIcon, CircleNotchIcon } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
const SendMessage = dynamic(() => import("@/features/chat/conversation/SendMessage"), { ssr: false });
import ChatMessage from "@/features/chat/conversation/ChatMessage";
import useChatMessages from "@/features/chat/hooks/useChatMessages";
import {
  getSelectedChat,
  getMessageSelectMode,
  getSelectedMessageIds,
} from "@/store/slices/chatSlice";
import { PhotoProvider } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { getIsRtl } from "@/store/slices/languageSlice";

const ChatMessages = ({ isSelling, chatId }) => {
  const { t } = useTranslation();
  const selectedChatDetails = useSelector(getSelectedChat);
  const selectMode = useSelector(getMessageSelectMode);
  const selectedMessages = useSelector(getSelectedMessageIds);
  const isRTL = useSelector(getIsRtl);
  const userId = useSelector(userSignUpData)?.id;

  const {
    rows,
    isLoading,
    isLoadingPrev,
    hasMore,
    loadPrevious,
    scrollRef,
    handleDelete,
    handleToggleSelect,
    handleStartSelect,
  } = useChatMessages({ chatId, isSelling });

  return (
    <>
      <PhotoProvider>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 relative"
        >
          {isLoading ? (
            <ChatMessagesSkeleton />
          ) : (
            <>
              {hasMore && (
                <div className="absolute top-3 left-0 right-0 z-10 flex justify-center pb-2">
                  <button
                    onClick={loadPrevious}
                    disabled={isLoadingPrev}
                    className="text-primary text-sm font-medium px-3 py-1.5 bg-white/90 rounded-full shadow-md hover:bg-white flex items-center gap-1.5"
                  >
                    {isLoadingPrev ? (
                      <>
                        <CircleNotchIcon className="w-3.5 h-3.5 animate-spin" weight="bold" />
                        {t("loading")}
                      </>
                    ) : (
                      <>
                        <CaretUpIcon weight="bold" />
                        {t("loadPreviousMessages")}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* The opening offer, shown once the oldest page is on screen. */}
              {!hasMore && selectedChatDetails?.amount > 0 && (
                <div
                  className={`flex flex-col gap-1 rounded-md p-2 w-fit ${isSelling ? "bg-border" : "bg-primary text-white self-end"
                    }`}
                >
                  <p className="text-sm">{isSelling ? t("offer") : t("yourOffer")}</p>
                  <span className="text-xl font-medium">
                    {selectedChatDetails.formatted_amount}
                  </span>
                </div>
              )}

              {rows.map(({ msg, date, time, showDate, showTime }) => (
                <ChatMessage
                  key={msg?.id}
                  msg={msg}
                  isCurrentUser={msg.sender_id === userId}
                  date={date}
                  time={time}
                  showDate={showDate}
                  showTime={showTime}
                  selectMode={selectMode}
                  isSelected={selectedMessages.includes(msg.id)}
                  onToggleSelect={handleToggleSelect}
                  onStartSelect={handleStartSelect}
                  onDelete={handleDelete}
                  isRTL={isRTL}
                />
              ))}
            </>
          )}
        </div>
      </PhotoProvider>
      <SendMessage key={`send-${selectedChatDetails?.id || ""}`} />
    </>
  );
};

export default ChatMessages;
