import { createSelector, createSlice } from "@reduxjs/toolkit";

// The sidebar list and the open conversation are read and written by components
// on both sides of the layout (list rows, conversation header, composer), so
// they live here instead of being threaded through as props.
// The selling-ads list is not here — it is local to AdList and nothing else
// touches it.

const EMPTY_LIST = {
  list: [],
  total: 0,
  currentPage: 1,
  hasMore: false,
  isLoading: true,
  isLoadMore: false,
};

const initialState = {
  List: EMPTY_LIST,
  SelectedChat: null,
  Messages: [],
  MessageSelectMode: false,
  SelectedMessageIds: [],
};

// A block/unblock either targets one conversation (acted on from a list row or
// the conversation header) or every conversation with a user (acted on from the
// blocked-users menu, which only knows a user id).
const isBlockTarget = (row, { chatId, userId }) =>
  !!row && (chatId ? row.id === chatId : row.buyer_id === userId || row.seller_id === userId);

export const chatSlice = createSlice({
  name: "Chat",
  initialState,
  reducers: {
    // ---- list ----
    startChatListLoad: (state, action) => {
      const page = action.payload;
      state.List.isLoading = page === 1;
      state.List.isLoadMore = page > 1;
    },
    finishChatListLoad: (state, action) => {
      const { page, rows, total, currentPage, lastPage } = action.payload;
      state.List.list = page === 1 ? rows : [...state.List.list, ...rows];
      state.List.total = Number(total) || 0;
      state.List.currentPage = Number(currentPage) || page;
      state.List.hasMore = Number(currentPage) < Number(lastPage);
      state.List.isLoading = false;
      state.List.isLoadMore = false;
    },
    failChatListLoad: (state) => {
      state.List.isLoading = false;
      state.List.isLoadMore = false;
    },
    markChatRead: (state, action) => {
      const row = state.List.list.find((chat) => chat.id === action.payload);
      if (row) row.unread_chat_count = 0;
    },
    removeChats: (state, action) => {
      const ids = action.payload;
      state.List.list = state.List.list.filter((chat) => !ids.includes(chat.id));
      state.List.total = Math.max(0, state.List.total - ids.length);
    },
    setUserBlocked: (state, action) => {
      const { blocked } = action.payload;
      state.List.list.forEach((row) => {
        if (isBlockTarget(row, action.payload)) row.user_blocked = blocked;
      });
      if (isBlockTarget(state.SelectedChat, action.payload)) {
        state.SelectedChat.user_blocked = blocked;
      }
    },

    // ---- open conversation ----
    setSelectedChat: (state, action) => {
      state.SelectedChat = action.payload;
    },
    patchSelectedChat: (state, action) => {
      if (state.SelectedChat) Object.assign(state.SelectedChat, action.payload);
    },

    // ---- messages ----
    setMessages: (state, action) => {
      state.Messages = action.payload;
    },
    prependMessages: (state, action) => {
      state.Messages = [...action.payload, ...state.Messages];
    },
    appendMessage: (state, action) => {
      state.Messages.push(action.payload);
    },
    removeMessages: (state, action) => {
      const ids = action.payload;
      state.Messages = state.Messages.filter((msg) => !ids.includes(msg.id));
    },

    // ---- message selection ----
    setMessageSelectMode: (state, action) => {
      state.MessageSelectMode = action.payload;
      if (!action.payload) state.SelectedMessageIds = [];
    },
    setSelectedMessageIds: (state, action) => {
      state.SelectedMessageIds = action.payload;
    },

    resetChat: () => initialState,
  },
});

export default chatSlice.reducer;
export const {
  startChatListLoad,
  finishChatListLoad,
  failChatListLoad,
  markChatRead,
  removeChats,
  setUserBlocked,
  setSelectedChat,
  patchSelectedChat,
  setMessages,
  prependMessages,
  appendMessage,
  removeMessages,
  setMessageSelectMode,
  setSelectedMessageIds,
  resetChat,
} = chatSlice.actions;

export const getChatList = createSelector(
  (state) => state.Chat,
  (Chat) => Chat.List
);

export const getSelectedChat = createSelector(
  (state) => state.Chat,
  (Chat) => Chat.SelectedChat
);

export const getChatMessages = createSelector(
  (state) => state.Chat,
  (Chat) => Chat.Messages
);

export const getMessageSelectMode = createSelector(
  (state) => state.Chat,
  (Chat) => Chat.MessageSelectMode
);

export const getSelectedMessageIds = createSelector(
  (state) => state.Chat,
  (Chat) => Chat.SelectedMessageIds
);
