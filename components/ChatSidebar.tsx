"use client";

import { useState, useRef, useEffect } from "react";
import { useChatContext } from "@/contexts/ChatContext";

export default function ChatSidebar() {
  const { messages, isLoading, isOpen, sendMessage, clearMessages } =
    useChatContext();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  return (
    <div
      className={`h-full bg-bone border-l border-sand shadow-lg z-10 flex flex-col transition-all duration-300 overflow-hidden ${
        isOpen ? "w-80" : "w-0"
      }`}
    >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sand bg-cream flex-shrink-0">
          <h2 className="font-serif text-lg font-semibold text-charcoal">
            Chat Assistant
          </h2>
          <button
            onClick={clearMessages}
            className="p-1 rounded hover:bg-sand transition-colors disabled:opacity-50"
            aria-label="Refresh chat"
            disabled={messages.length === 0}
            title="Clear messages"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-clay py-8">
              <p className="font-serif text-lg">Hello!</p>
              <p className="text-sm mt-1">How can I help you today?</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  message.role === "user"
                    ? "bg-terracotta text-cream"
                    : "bg-sand text-charcoal"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="bg-sand text-charcoal rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-clay rounded-full animate-pulse-dot" />
                  <span
                    className="w-2 h-2 bg-clay rounded-full animate-pulse-dot"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="w-2 h-2 bg-clay rounded-full animate-pulse-dot"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-sand bg-cream flex-shrink-0"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-lg border border-sand bg-bone text-charcoal placeholder-clay focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-terracotta text-cream rounded-lg hover:bg-rust disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </form>
    </div>
  );
}
