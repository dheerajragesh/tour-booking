"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, []);

  const sendMessage = () => {
    socket.emit("send_message", message);

    setMessages((prev) => [...prev, message]);

    setMessage("");
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="h-80 overflow-y-auto border rounded-lg p-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border p-3 rounded"
          placeholder="Type message"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-6 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}