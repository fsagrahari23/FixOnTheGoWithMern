import React, { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Info, X } from "lucide-react";
import { getSocket } from "../../../libs/socket";
import { useSelector, useDispatch } from "react-redux";
import {
    fetchChat,
    fetchMessages,
    sendMessage,
} from "../../store/slices/bookingThunks";
import { addMessage } from "../../store/slices/chatSlice";

const ChatModal = ({ isOpen, onClose, bookingId, mechanic, customer }) => {
    const dispatch = useDispatch();
    const socket = useMemo(() => getSocket(), []);
    const [msgInput, setMsgInput] = useState("");
    const [isOtherTyping, setIsOtherTyping] = useState(false);

    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const { user } = useSelector((state) => state.auth);
    const { chatId, messages = [], loading } = useSelector((state) => state.chat);

    const otherPerson =
        user?.role === "mechanic"
            ? customer || { name: "Customer" }
            : mechanic || { name: "Mechanic" };

    const scrollToBottom = (behavior = "smooth") => {
        requestAnimationFrame(() => {
            scrollRef.current?.scrollIntoView({ behavior });
        });
    };

    const formatTime = (ts) => {
        if (!ts) return "";
        const d = new Date(ts);
        if (Number.isNaN(d.getTime())) return "";
        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(d);
    };

    const formatDate = (ts) => {
        const date = new Date(ts);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const isMe = (msg) => {
        const senderId =
            typeof msg?.sender === "string" ? msg.sender : msg?.sender?._id;
        return String(senderId) === String(user?._id);
    };

    const groupedMessages = useMemo(() => {
        return (messages || []).reduce((groups, message) => {
            const dateKey = new Date(
                message.timestamp || message.createdAt
            ).toDateString();

            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(message);
            return groups;
        }, {});
    }, [messages]);

    useEffect(() => {
        if (isOpen && bookingId) {
            dispatch(fetchChat(bookingId));
        }
    }, [isOpen, bookingId, dispatch]);

    useEffect(() => {
        if (isOpen && (messages.length > 0 || isOtherTyping)) {
            scrollToBottom("smooth");
        }
    }, [messages, isOpen, isOtherTyping]);

    useEffect(() => {
        if (!isOpen || !chatId || !socket) return;

        const joinAndLoad = () => {
            socket.emit("join-chat", chatId);
            dispatch(fetchMessages(chatId));
        };

        const handleNewMessage = (data) => {
            if (String(data.chatId) === String(chatId)) {
                dispatch(addMessage(data.message));
                setIsOtherTyping(false);
            }
        };

        const handleTypingStatus = (data) => {
            if (
                String(data.chatId) === String(chatId) &&
                String(data.userId) !== String(user?._id)
            ) {
                setIsOtherTyping(data.isTyping);
            }
        };

        joinAndLoad();

        socket.on("new-message", handleNewMessage);
        socket.on("typing-status", handleTypingStatus);
        socket.on("connect", joinAndLoad);

        return () => {
            socket.off("new-message", handleNewMessage);
            socket.off("typing-status", handleTypingStatus);
            socket.off("connect", joinAndLoad);
            socket.emit("stop-typing", { chatId });
        };
    }, [chatId, isOpen, socket, user?._id, dispatch]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setMsgInput(val);

        if (!chatId) return;

        socket.emit("typing", { chatId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop-typing", { chatId });
        }, 3000);
    };

    const onSend = async () => {
        const text = msgInput.trim();
        if (!text || !chatId) return;

        try {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            socket.emit("stop-typing", { chatId });

            await dispatch(sendMessage({ chatId, message: text })).unwrap();
            setMsgInput("");
            requestAnimationFrame(() => scrollToBottom("smooth"));
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="
          p-0 overflow-hidden border-none shadow-2xl bg-slate-50 dark:bg-slate-900
          rounded-none sm:rounded-3xl
          w-[100vw] h-[100dvh]
          sm:w-[min(92vw,760px)] sm:h-[min(88vh,840px)]
          max-w-none sm:max-w-[760px]
          flex flex-col
        "
            >
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b bg-white/90 dark:bg-slate-800/90 backdrop-blur-md">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                            <Avatar className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-primary/20">
                                <AvatarImage src={otherPerson?.profileImage} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {otherPerson?.name?.charAt(0)?.toUpperCase() || "?"}
                                </AvatarFallback>
                            </Avatar>

                            <div
                                className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-slate-800 rounded-full ${isOtherTyping ? "bg-blue-500 animate-pulse" : "bg-green-500"
                                    }`}
                            />
                        </div>

                        <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-800 dark:text-slate-100 leading-none">
                                {otherPerson?.name || "Chat"}
                            </h3>
                            <span
                                className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${isOtherTyping ? "text-blue-500" : "text-green-600"
                                    }`}
                            >
                                {isOtherTyping ? "Typing..." : "Online"}
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X className="w-4 h-4 text-slate-500" />
                    </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                        <div className="px-3 sm:px-4 py-4 bg-white/30 dark:bg-slate-900/30">
                            <div className="mx-auto flex w-full max-w-4xl flex-col">
                                {Object.keys(groupedMessages).length === 0 ? (
                                    <div className="flex min-h-[40vh] items-center justify-center text-center px-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                No messages yet
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Start the conversation below.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(groupedMessages).map(([date, msgs]) => (
                                            <div key={date} className="space-y-4">
                                                <div className="flex justify-center">
                                                    <span className="bg-slate-200/60 dark:bg-slate-800/60 px-3 py-1 rounded-full text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                                        {formatDate(msgs[0].timestamp || msgs[0].createdAt)}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    {msgs.map((msg, i) => {
                                                        const mine = isMe(msg);
                                                        return (
                                                            <div
                                                                key={msg._id || i}
                                                                className={`flex ${mine ? "justify-end" : "justify-start"
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`group flex flex-col ${mine ? "items-end" : "items-start"
                                                                        } max-w-[88%] sm:max-w-[75%] md:max-w-[70%]`}
                                                                >
                                                                    <div
                                                                        className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words whitespace-pre-wrap leading-relaxed ${mine
                                                                            ? "bg-blue-600 text-white rounded-tr-md"
                                                                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-md border border-slate-100 dark:border-slate-700"
                                                                            }`}
                                                                    >
                                                                        {msg.content}
                                                                    </div>

                                                                    <div className="flex items-center gap-1.5 mt-1 px-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                                            {formatTime(msg.timestamp || msg.createdAt)}
                                                                        </span>
                                                                        {mine && (
                                                                            <span
                                                                                className={`w-1.5 h-1.5 rounded-full ${msg.read ? "bg-blue-400" : "bg-slate-300"
                                                                                    }`}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isOtherTyping && (
                                    <div className="mt-4 flex justify-start">
                                        <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={scrollRef} className="h-2" />
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Input */}
                <div className="shrink-0 border-t bg-white dark:bg-slate-800 px-3 sm:px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="mx-auto flex w-full max-w-4xl items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-900 px-3 sm:px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <Input
                            placeholder="Type a message..."
                            value={msgInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-800 dark:text-slate-100"
                        />
                        <Button
                            size="icon"
                            disabled={!msgInput.trim() || loading}
                            onClick={onSend}
                            className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </Button>
                    </div>

                    {/* <p className="text-[10px] text-center mt-3 text-slate-400 dark:text-slate-500 flex justify-center items-center gap-1 font-medium">
                        <Info className="w-3 h-3" />
                        End-to-end encrypted
                    </p> */}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatModal;