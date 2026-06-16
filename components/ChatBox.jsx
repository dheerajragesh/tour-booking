"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import toast from "react-hot-toast";

import { publishNotification } from "@/utils/notificationBus";
import api from "@/services/api";
import { normalizeCollection } from "@/utils/apiHelpers";
import { FiMessageSquare, FiSend } from "react-icons/fi";

function getEntityId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || value.uuid || "";
}

function isSameId(left, right) {
  return String(left || "") === String(right || "");
}

function getSenderId(message) {
  return (
    message?.senderId ||
    getEntityId(message?.sender) ||
    getEntityId(message?.from) ||
    ""
  );
}

function getRecipientId(message) {
  return (
    message?.receiverId ||
    message?.recipientId ||
    getEntityId(message?.recipient) ||
    getEntityId(message?.to) ||
    ""
  );
}

function getMessageText(message) {
  return message?.message || message?.content || message?.text || "";
}

function getMessageId(message) {
  return message?._id || message?.id || message?.clientId || "";
}

function normalizeMessage(message, currentUserId) {
  const senderId = getSenderId(message);
  const receiverId = getRecipientId(message);

  return {
    ...message,
    senderId,
    receiverId,
    message: getMessageText(message),
    mine:
      typeof message?.mine === "boolean"
        ? message.mine
        : isSameId(senderId, currentUserId),
  };
}

function getUserIdFromAuthPayload(payload) {
  const user = payload?.user || payload?.data || payload;
  return getEntityId(user);
}

export default function ChatBox({
  currentUserId,
  operatorId,
  operatorName = "Operator",
  title,
  emptyText = "Start a conversation...",
  className = "",
  onMessageSent,
}) {
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [resolvedCurrentUserId, setResolvedCurrentUserId] = useState("");
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [operatorTyping, setOperatorTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const peerId = useMemo(() => getEntityId(operatorId), [operatorId]);
  const activeUserId = currentUserId || resolvedCurrentUserId;
  const heading = title || `Chat with ${operatorName}`;

  useEffect(() => {
    if (currentUserId) return;

    let active = true;

    const loadCurrentUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (active) setResolvedCurrentUserId(getUserIdFromAuthPayload(data));
      } catch {
        if (active) setResolvedCurrentUserId("");
      }
    };

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, [currentUserId]);

  const appendIncomingMessage = useCallback(
    (incoming) => {
      const normalized = normalizeMessage(incoming, activeUserId);
      const nextId = getMessageId(normalized);

      setMessages((current) => {
        if (
          nextId &&
          current.some((existing) => getMessageId(existing) === nextId)
        ) {
          return current;
        }

        return [...current, normalized];
      });
    },
    [activeUserId]
  );

  useEffect(() => {
    if (!activeUserId || !peerId) {
      const timer = window.setTimeout(() => setMessages([]), 0);
      return () => window.clearTimeout(timer);
    }

    let active = true;

    const loadMessages = async () => {
      setLoadingMessages(true);

      try {
        const { data } = await api.get("/chat/conversations");
        const conversations = normalizeCollection(data, ["conversations"]);
        const conversation = conversations.find((item) => {
          const userA = getEntityId(item.userA);
          const userB = getEntityId(item.userB);

          return (
            (isSameId(userA, activeUserId) && isSameId(userB, peerId)) ||
            (isSameId(userA, peerId) && isSameId(userB, activeUserId))
          );
        });

        if (!active) return;

        if (!conversation) {
          setMessages([]);
          return;
        }

        const conversationId = getEntityId(conversation);
        const response = await api.get(
          `/chat/conversations/${conversationId}/messages`
        );
        const loadedMessages = normalizeCollection(response.data, ["messages"]);

        if (!active) return;

        setMessages(
          loadedMessages.map((item) => normalizeMessage(item, activeUserId))
        );
      } catch {
        if (active) setMessages([]);
      } finally {
        if (active) setLoadingMessages(false);
      }
    };

    loadMessages();

    return () => {
      active = false;
    };
  }, [activeUserId, peerId]);

  useEffect(() => {
    if (!activeUserId) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      "http://localhost:5000";

    const socket = require("socket.io-client").io(socketUrl, {
      transports: ["websocket"],

      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", activeUserId);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    const messageEventNames = [
      "receive_private_message",
      "private_message",
      "new_private_message",
      "receive_message",
      "message",
    ];

    const handleMessage = (data) => {
      const normalized = normalizeMessage(data, activeUserId);

      if (isSameId(normalized.senderId, activeUserId)) return;

      const belongsToThisConversation =
        isSameId(normalized.senderId, peerId) &&
        (!normalized.receiverId || isSameId(normalized.receiverId, activeUserId));

      if (belongsToThisConversation) {
        appendIncomingMessage(normalized);
      }
    };

    messageEventNames.forEach((eventName) => {
      socket.on(eventName, (data) => {
        const normalized = normalizeMessage(data, activeUserId);

        // If this is an incoming message for the currently opened conversation,
        // keep existing behavior (append to UI).
        if (!isSameId(normalized.senderId, activeUserId)) {
          const belongsToThisConversation =
            isSameId(normalized.senderId, peerId) &&
            (!normalized.receiverId || isSameId(normalized.receiverId, activeUserId));

          if (belongsToThisConversation) {
            appendIncomingMessage(normalized);
          }

          // Always show a notification for messages from others.
          publishNotification({
            type: "message",
            message: normalized.message || "New message received",
            createdAt: new Date().toISOString(),
          });
        }
      });
    });

    const typingEventNames = ["typing", "user_typing"];
    const handlePeerTyping = (data) => {
      if (isSameId(getSenderId(data), peerId)) {
        setOperatorTyping(true);
        window.setTimeout(() => {
          setOperatorTyping(false);
        }, 2000);
      }
    };

    typingEventNames.forEach((eventName) => {
      socket.on(eventName, handlePeerTyping);
    });

    return () => {
      socket.disconnect();
    };
  }, [activeUserId, appendIncomingMessage, peerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    const text = message.trim();

    if (!text) return;

    if (!activeUserId) {
      toast.error("Please login to send messages.");
      return;
    }

    if (!peerId) {
      toast.error("This conversation is missing a recipient.");
      return;
    }

    const clientId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const optimisticMessage = {
      clientId,
      senderId: activeUserId,
      receiverId: peerId,
      message: text,
      content: text,
      createdAt: new Date().toISOString(),
      mine: true,
    };

    appendIncomingMessage(optimisticMessage);
    setMessage("");
    setSending(true);

    try {
      const { data } = await api.post("/chat/messages", {
        receiverId: peerId,
        content: text,
      });
      const savedMessage =
        data?.message && typeof data.message === "object"
          ? data.message
          : data?.data || data;

      setMessages((current) =>
        current.map((item) =>
          item.clientId === clientId
            ? normalizeMessage(savedMessage, activeUserId)
            : item
        )
      );
      onMessageSent?.(savedMessage);
    } catch (error) {
      setMessages((current) =>
        current.map((item) =>
          item.clientId === clientId ? { ...item, failed: true } : item
        )
      );
      toast.error(
        error?.response?.data?.message ||
          "Unable to send message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (event) => {
    setMessage(event.target.value);

    if (socketRef.current && connected && !typing && activeUserId && peerId) {
      setTyping(true);

      socketRef.current.emit("typing", {
        senderId: activeUserId,
        receiverId: peerId,
      });

      window.setTimeout(() => {
        setTyping(false);
      }, 1000);
    }
  };

  return (
    <div
      className={`rounded-[8px] border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <FiMessageSquare />
            {heading}
          </h2>

          <p className="text-sm text-slate-500">
            {connected ? "Live updates online" : "Live updates offline"}
          </p>
        </div>

        <div
          className={`h-3 w-3 rounded-full ${
            connected ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>

      <div className="h-[400px] overflow-y-auto bg-slate-50 p-4">
        {loadingMessages ? (
          <div className="text-center text-sm text-slate-500">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-slate-500">{emptyText}</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={getMessageId(msg) || index}
              className={`mb-3 flex ${msg.mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  msg.mine
                    ? "bg-teal-700 text-white"
                    : "bg-white text-slate-700 shadow"
                }`}
              >
                <p>{msg.message}</p>
                {msg.failed ? (
                  <p className="mt-1 text-[11px] font-semibold text-rose-100">
                    Not sent
                  </p>
                ) : null}
              </div>
            </div>
          ))
        )}

        {operatorTyping ? (
          <div className="mb-3 flex justify-start">
            <div className="rounded-2xl bg-white px-4 py-2 text-sm text-slate-500 shadow">
              Typing...
            </div>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
              }
            }}
            disabled={!activeUserId || !peerId || sending}
            placeholder={
              activeUserId && peerId ? "Type a message..." : "Login to message"
            }
            className="flex-1 rounded-[8px] border border-slate-300 px-4 py-3 outline-none focus:border-teal-700 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={!activeUserId || !peerId || sending}
            aria-label="Send message"
            className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-teal-700 text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
}
