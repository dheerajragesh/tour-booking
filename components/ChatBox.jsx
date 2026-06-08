"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  getApiMessage,
  normalizeCollection,
  normalizeRecord,
  requestWithFallback,
} from "@/utils/apiHelpers";
import { FiMessageSquare, FiSend } from "react-icons/fi";

function normalizeSocketUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    if (url.protocol === "http:") url.protocol = "ws:";
    if (url.protocol === "https:") url.protocol = "wss:";
    return url.toString();
  } catch {
    return "";
  }
}

function getMessageText(message) {
  if (typeof message === "string") return message;
  return message?.message || message?.text || message?.body || "";
}

function getMessageKey(message, index) {
  return message?._id || message?.id || `${getMessageText(message)}-${index}`;
}

function getUserId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value?._id || value?.id || "";
}

export default function ChatBox({
  tourId,
  bookingId,
  operatorId,
  operatorName = "operator",
}) {
  const socketRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const socketUrl = normalizeSocketUrl(process.env.NEXT_PUBLIC_SOCKET_URL);
    if (!socketUrl) return undefined;

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.addEventListener("open", () => setConnected(true));
    socket.addEventListener("close", () => setConnected(false));
    socket.addEventListener("error", () => setConnected(false));
    socket.addEventListener("message", (event) => {
      setMessages((current) => [
        ...current,
        { message: event.data, fromOperator: true },
      ]);
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!tourId && !bookingId) return undefined;

    let active = true;

    const fetchMessages = async () => {
      try {
        // Backend contract:
        // - GET /chat/conversations
        // - GET /chat/conversations/:conversationId/messages
        const { data: convData } = await requestWithFallback("get", [
          "/chat/conversations",
          "/conversations",
        ]);

        const conversations = normalizeCollection(convData, [
          "conversations",
          "items",
          "results",
        ]);

        const findConversationId = () => {
          const bid = bookingId ? String(bookingId) : "";
          const tid = tourId ? String(tourId) : "";

          const match = conversations.find((c) => {
          const cb = c?.bookingId || c?.booking || c?.booking_id;
          const ct = c?.tourId || c?.tour || c?.tour_id;
          const userA = getUserId(c?.userA);
          const userB = getUserId(c?.userB);
          return (
              (bid && String(cb) === bid) ||
              (tid && String(ct) === tid) ||
              (operatorId && [userA, userB].includes(String(operatorId)))
          );
        });

          return match?.conversationId || match?._id || match?.id || "";
        };

        const conversationId = findConversationId();
        if (!conversationId) {
          if (active) setMessages([]);
          return;
        }

        const { data: msgData } = await requestWithFallback("get", [
          `/chat/conversations/${conversationId}/messages`,
          `/conversations/${conversationId}/messages`,
        ]);

        const list = normalizeCollection(msgData, [
          "messages",
          "conversation",
        ]);

        if (active) setMessages(list);
      } catch {
        if (active) setMessages([]);
      }
    };

    fetchMessages();

    return () => {
      active = false;
    };
  }, [bookingId, operatorId, tourId]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sending) return;

    setSending(true);

    const payload = {
      tourId,
      tour: tourId,
      bookingId,
      booking: bookingId,
      receiverId: operatorId,
      message: trimmedMessage,
      text: trimmedMessage,
      content: trimmedMessage,
    };

    try {
      if (!operatorId) {
        throw new Error("Operator messaging is not available for this tour.");
      }

      // Backend contract: POST /chat/messages
      const { data } = await requestWithFallback(
        "post",
        ["/chat/messages", "/messages"],
        payload
      );
      const savedMessage = normalizeRecord(data, ["message"]);

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(payload));
      }

      setMessages((current) => [
        ...current,
        {
          ...payload,
          ...savedMessage,
          mine: true,
          _id: savedMessage?._id || savedMessage?.id || `local-${Date.now()}`,
        },
      ]);
      setMessage("");
    } catch (error) {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(trimmedMessage);
      } else {
        toast.error(
          getApiMessage(error, "Messaging backend is not available yet.")
        );
      }

      setMessages((current) => [
        ...current,
        {
          ...payload,
          mine: true,
          pending: true,
          _id: `pending-${Date.now()}`,
        },
      ]);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="inline-flex items-center gap-2 text-xl font-bold text-slate-950">
            <FiMessageSquare className="text-teal-700" />
            Message {operatorName}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ask questions before requesting a custom trip.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
            connected
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {connected ? "Live" : "Async"}
        </span>
      </div>

      <div className="mt-4 h-72 overflow-y-auto rounded-[8px] border border-slate-200 bg-slate-50 p-4">
        {messages.length ? (
          messages.map((msg, index) => {
            const text = getMessageText(msg);
            const mine = msg?.mine || msg?.sender === "user";

            return (
              <div
                key={getMessageKey(msg, index)}
                className={`mb-2 max-w-[85%] rounded-[8px] px-4 py-2 text-sm shadow-sm ${
                  mine
                    ? "ml-auto bg-teal-700 text-white"
                    : "bg-white text-slate-700"
                }`}
              >
                <p>{text}</p>
                {msg?.pending ? (
                  <p className="mt-1 text-xs opacity-75">Pending sync</p>
                ) : null}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">No messages yet.</p>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
          className="min-w-0 flex-1 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
          placeholder="Ask about pickup, timing, or customizations"
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={sending}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Send message"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}
