import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { getSocket } from "../../../libs/socket";
import { useSelector, useDispatch } from "react-redux";
import {
    fetchChat,
    fetchMessages,
    sendMessage,
} from "../../store/slices/bookingThunks";

const ChatModal = ({ isOpen, onClose, bookingId, mechanic }) => {
    const dispatch = useDispatch();
    const [newMessage, setNewMessage] = useState("");
    const socket = getSocket();
    const messagesEndRef = useRef(null);

    const { user } = useSelector((state) => state.auth);
    const { chatId, messages, loading } = useSelector(
        (state) => state.chat
    );
    console.log("ChatModal render:", { isOpen, bookingId, chatId, messages });

    // Auto scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    /* -------------------- 1️⃣ FETCH CHAT USING BOOKING ID -------------------- */
    useEffect(() => {
        if (isOpen && bookingId) {
            dispatch(fetchChat(bookingId));
        }
    }, [isOpen, bookingId]);

    /* -------------------- 2️⃣ FETCH MESSAGES USING CHAT ID -------------------- */
    useEffect(() => {
        if (isOpen && chatId) {
            dispatch(fetchMessages(chatId));
            setupSocketListeners();
        }

        return () => {
            if (socket) {
                socket.off("new-message");
                socket.off("message-read");
            }
        };
    }, [isOpen, chatId]);

    /* -------------------- SOCKET SETUP -------------------- */
    const setupSocketListeners = () => {
        if (!socket || !chatId) return;

        socket.off("new-message");
        socket.off("message-read");

        socket.on("new-message", (data) => {
            if (data.chatId === chatId) {
                dispatch({
                    type: "booking/addMessage",
                    payload: data.message,
                });
            }
        });

        socket.on("message-read", (data) => {
            if (data.chatId === chatId) {
                dispatch({
                    type: "booking/updateMessageRead",
                    payload: { messageId: data.messageId },
                });
            }
        });
    };

    /* -------------------- 3️⃣ SEND MESSAGE -------------------- */
    const handleSendMessage = async () => {
        console.log("clicked SEND");
        if (!newMessage.trim()) return;
        if (!chatId) {
            return console.log("❌ ChatId missing");
        }

        try {
            console.log("Sending to:", chatId, "message:", newMessage);
            await dispatch(
                sendMessage({ chatId, message: newMessage })
            ).unwrap();

            setNewMessage("");
        } catch (err) {
            console.error("Send message error:", err);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (ts) =>
        new Date(ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* FIX: Ensure clicks pass through with pointer-events-auto */}
            <DialogContent
                className="max-w-2xl h-[600px] flex flex-col pointer-events-auto"
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback>
                                {mechanic?.name?.charAt(0) || "M"}
                            </AvatarFallback>
                        </Avatar>
                        Chat with {mechanic?.name || "Mechanic"}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={msg._id || i}
                                className={`flex ${msg.sender === user._id
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === user._id
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-800"
                                        }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <p
                                        className={`text-xs mt-1 ${msg.sender === user._id
                                            ? "text-blue-100"
                                            : "text-gray-500"
                                            }`}
                                    >
                                        {formatTime(msg.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* FIX: BUTTON CLICKS NOT FIRING */}
                <div className="flex gap-2 p-4 border-t pointer-events-auto">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress} // FIX: onKeyPress deprecated
                        placeholder="Type your message..."
                        disabled={loading}
                        className="flex-1"
                    />

                    <Button
                        onClick={handleSendMessage}
                        size="icon"
                        className="cursor-pointer pointer-events-auto"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatModal;
