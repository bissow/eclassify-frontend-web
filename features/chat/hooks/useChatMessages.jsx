import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";
import { deleteChatMessagesApi, getMessagesApi } from "@/lib/api";
import { formatChatMessageTime, formatMessageDate } from "@/lib/format";
import { getNotification } from "@/store/slices/globalStateSlice";
import { getReduxCurrentLangCode } from "@/store/slices/languageSlice";
import {
  getChatMessages,
  getSelectedMessageIds,
  setMessages,
  prependMessages,
  appendMessage,
  removeMessages,
  setMessageSelectMode,
  setSelectedMessageIds,
} from "@/store/slices/chatSlice";

// True when a chat notification belongs to the conversation currently open —
// used below to live-append the message, and by PushNotificationLayout to skip its popup for it.
export const isNotificationForOpenChat = (notification, { chatId, isSelling }) =>
  notification?.type === "chat" &&
  Number(notification?.item_offer_id) === Number(chatId) &&
  (notification?.user_type === "Seller" ? !isSelling : isSelling);

// Everything behind the message list: paging, live push messages, deletion,
// selection and the scroll-to-bottom. ChatMessages only renders what this returns.
const useChatMessages = ({ chatId, isSelling }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const messages = useSelector(getChatMessages);
  const selectedIds = useSelector(getSelectedMessageIds);
  const notification = useSelector(getNotification);
  const langCode = useSelector(getReduxCurrentLangCode);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const fetchMessages = async (nextPage) => {
    try {
      nextPage > 1 ? setIsLoadingPrev(true) : setIsLoading(true);
      const response = await getMessagesApi.chatMessages({
        item_offer_id: chatId,
        page: nextPage,
      });
      if (response?.data?.error === false) {
        const currentPage = Number(response?.data?.data?.current_page);
        const lastPage = Number(response?.data?.data?.last_page);
        // API returns newest-first; the UI renders oldest-first.
        const pageMessages = [...(response?.data?.data?.data ?? [])].reverse();
        setPage(currentPage);
        setHasMore(currentPage < lastPage);
        // Older pages go on top; page 1 replaces whatever was there.
        dispatch(nextPage > 1 ? prependMessages(pageMessages) : setMessages(pageMessages));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingPrev(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatId) fetchMessages(1);
  }, [chatId]);

  // A push notification for the open conversation is appended straight to the
  // list — the sender's own copy already arrived from the send response.
  useEffect(() => {
    if (isNotificationForOpenChat(notification, { chatId, isSelling })) {
      dispatch(appendMessage({
        message_type: notification?.message_type_temp,
        message: notification?.message,
        sender_id: Number(notification?.sender_id),
        created_at: notification?.created_at,
        audio: notification?.audio,
        file: notification?.file,
        id: Number(notification?.id),
        item_offer_id: Number(notification?.item_offer_id),
        updated_at: notification?.updated_at,
      }));
    }
  }, [notification]);

  // Runs after the newest message changes, deferred a tick so the row it should
  // scroll past is already laid out.
  useEffect(() => {
    if (messages.length === 0 || isLoading) return;
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 0);
  }, [messages[messages.length - 1]?.id, isLoading]);

  const handleDelete = async (messageId) => {
    try {
      const response = await deleteChatMessagesApi.deleteChatMessages({
        item_offer_id: chatId,
        message_ids: [messageId],
      });
      if (response?.data?.error === false) {
        dispatch(removeMessages([messageId]));
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("somthingWentWrong"));
    }
  };

  const handleToggleSelect = (messageId) =>
    dispatch(setSelectedMessageIds(
      selectedIds.includes(messageId)
        ? selectedIds.filter((id) => id !== messageId)
        : [...selectedIds, messageId]
    ));

  const handleStartSelect = (messageId) => {
    dispatch(setMessageSelectMode(true));
    dispatch(setSelectedMessageIds([messageId]));
  };

  // Single pass: formats date/time once per message and groups consecutive
  // messages from the same sender within the same minute, so only the last
  // message of each group renders a timestamp.
  // langCode and t are dependencies because the formatters take them as arguments.
  const rows = useMemo(() => {
    const out = [];
    let prevDate = null;
    for (const msg of messages) {
      const date = formatMessageDate(msg.created_at, t, langCode);
      const time = formatChatMessageTime(msg.created_at, langCode);
      const showDate = date !== prevDate;
      const prev = out[out.length - 1];
      if (prev) {
        prev.showTime =
          showDate ||
          prev.time !== time ||
          Number(prev.msg.sender_id) !== Number(msg.sender_id);
      }
      out.push({ msg, date, time, showDate, showTime: true });
      prevDate = date;
    }
    return out;
  }, [messages, langCode, t]);

  return {
    rows,
    isLoading,
    isLoadingPrev,
    hasMore,
    loadPrevious: () => fetchMessages(page + 1),
    scrollRef,
    handleDelete,
    handleToggleSelect,
    handleStartSelect,
  };
};

export default useChatMessages;
