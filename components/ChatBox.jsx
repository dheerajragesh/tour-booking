"use client";

import { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";

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

export default function ChatBox() {
  const socketRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl = normalizeSocketUrl(process.env.NEXT_PUBLIC_SOCKET_URL);
    if (!socketUrl) return undefined;

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.addEventListener("open", () => setConnected(true));
    socket.addEventListener("close", () => setConnected(false));
    socket.addEventListener("error", () => setConnected(false));
    socket.addEventListener("message", (event) => {
      setMessages((current) => [...current, event.data]);
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(trimmedMessage);
    }

    setMessages((current) => [...current, trimmedMessage]);
    setMessage("");
  };

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-950">Trip chat</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
            connected
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {connected ? "Live" : "Offline"}
        </span>
      </div>

      <div className="mt-4 h-80 overflow-y-auto rounded-[8px] border border-slate-200 bg-slate-50 p-4">
        {messages.length ? (
          messages.map((msg, index) => (
            <div
              key={`${msg}-${index}`}
              className="mb-2 rounded-[8px] bg-white px-4 py-2 text-sm text-slate-700 shadow-sm"
            >
              {msg}
            </div>
          ))
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
          placeholder="Type message"
        />

        <button
          type="button"
          onClick={sendMessage}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          aria-label="Send message"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}
