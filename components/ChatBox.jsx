"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { FiMessageSquare, FiSend } from "react-icons/fi";

export default function ChatBox({
  currentUserId,
  operatorId,
  operatorName = "Operator",
}) {
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [operatorTyping, setOperatorTyping] =
    useState(false);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      "http://localhost:5000";

    const socket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(
        "Socket Connected:",
        socket.id
      );

      setConnected(true);

      if (currentUserId) {
        socket.emit("join", currentUserId);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket Disconnected");
      setConnected(false);
    });

    socket.on(
      "receive_private_message",
      (data) => {
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            mine: false,
          },
        ]);
      }
    );

    socket.on("typing", (data) => {
      if (
        data.senderId === operatorId
      ) {
        setOperatorTyping(true);

        setTimeout(() => {
          setOperatorTyping(false);
        }, 2000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId, operatorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    const text = message.trim();

    if (!text) return;

    if (!connected) {
      toast.error(
        "Chat server not connected"
      );
      return;
    }

    const payload = {
      senderId: currentUserId,
      receiverId: operatorId,
      message: text,
      createdAt: new Date(),
    };

    socketRef.current.emit(
      "private_message",
      payload
    );

    setMessages((prev) => [
      ...prev,
      {
        ...payload,
        mine: true,
      },
    ]);

    setMessage("");
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (
      socketRef.current &&
      connected &&
      !typing
    ) {
      setTyping(true);

      socketRef.current.emit(
        "typing",
        {
          senderId: currentUserId,
          receiverId: operatorId,
        }
      );

      setTimeout(() => {
        setTyping(false);
      }, 1000);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <FiMessageSquare />
            Chat with {operatorName}
          </h2>

          <p className="text-sm text-slate-500">
            {connected
              ? "Online"
              : "Offline"}
          </p>
        </div>

        <div
          className={`h-3 w-3 rounded-full ${
            connected
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        />
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto bg-slate-50 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-slate-500">
            Start a conversation...
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 flex ${
                msg.mine
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  msg.mine
                    ? "bg-teal-700 text-white"
                    : "bg-white text-slate-700 shadow"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))
        )}

        {operatorTyping && (
          <div className="mb-3 flex justify-start">
            <div className="rounded-2xl bg-white px-4 py-2 text-sm text-slate-500 shadow">
              Typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-700"
          />

          <button
            onClick={sendMessage}
            className="flex items-center justify-center rounded-lg bg-teal-700 px-5 text-white transition hover:bg-teal-800"
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
}