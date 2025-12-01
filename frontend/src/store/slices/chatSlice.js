import { createSlice } from "@reduxjs/toolkit";
import { fetchChat, fetchMessages, sendMessage } from "./bookingThunks";

const initialState = {
    chatId: null,
    messages: [],
    loading: false,
    error: null,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage(state, action) {
            state.messages.push(action.payload);
        },
        updateMessageRead(state, action) {
            const msg = state.messages.find(m => m._id === action.payload.messageId);
            if (msg) msg.read = true;
        },
        clearChat(state) {
            state.chatId = null;
            state.messages = [];
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        /* ---------------------- FETCH CHAT ---------------------- */
        builder.addCase(fetchChat.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchChat.fulfilled, (state, action) => {
            console.log("fetchChat fulfilled with payload:", action.payload.chatId);
            state.loading = false;
            state.chatId = action.payload.chatId;   // IMPORTANT
            state.messages = action.payload.chat?.messages || [];
        });
        builder.addCase(fetchChat.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to load chat";
        });

        /* ---------------------- FETCH MESSAGES ---------------------- */
        builder.addCase(fetchMessages.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            state.loading = false;
            state.messages = action.payload.messages || [];
        });
        builder.addCase(fetchMessages.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to load messages";
        });

        /* ---------------------- SEND MESSAGE ---------------------- */
        builder.addCase(sendMessage.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(sendMessage.fulfilled, (state) => {
            state.loading = false;
            // Message will be added via socket listener
        });
        builder.addCase(sendMessage.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to send message";
        });
    },
});

export const { addMessage, updateMessageRead, clearChat } = chatSlice.actions;

export default chatSlice.reducer;
