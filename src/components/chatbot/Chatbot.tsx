
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  X,
  Send,
  Plus,
  MessageCircle,
  GraduationCap,
  BookOpen,
  Search,
  Sparkles,
  ExternalLink,
} from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
};

const suggestions = [
  {
    icon: GraduationCap,
    title: "Admissions",
    description: "Explore admission information",
    prompt: "How can I apply for admission to the University of Swat?",
  },
  {
    icon: BookOpen,
    title: "Programs",
    description: "Find degree programs",
    prompt: "What degree programs does the University of Swat offer?",
  },
  {
    icon: Search,
    title: "Departments",
    description: "Explore faculties and departments",
    prompt: "Show me the faculties and departments of the university.",
  },
];

const getTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageId = useRef(0);

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Send message to Gemini through our Next.js backend

const sendMessage = async (text = input) => {
  const trimmedText = text.trim();

  if (!trimmedText || isTyping) return;

  const userMessage: Message = {
    id: ++messageId.current,
    role: "user",
    content: trimmedText,
    time: getTime(),
  };

  const assistantId = ++messageId.current;

  const assistantMessage: Message = {
    id: assistantId,
    role: "assistant",
    content: "",
    time: getTime(),
  };

  setMessages((previous) => [
    ...previous,
    userMessage,
    assistantMessage,
  ]);

  setInput("");
  setIsTyping(true);

  let receivedText = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/x-ndjson",
      },
      body: JSON.stringify({
        message: trimmedText,
        history: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      }),
    });
    if (!response.ok) {
      const data = await response.json();

      throw new Error(
        typeof data.error === "string"
          ? data.error
          : `Server error: ${response.status}`
      );
    }

    if (!response.body) {
      throw new Error("Streaming is not supported.");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    const processLine = (line: string) => {
      if (!line.trim()) return;

      const event = JSON.parse(line);

      if (event.error) {
        throw new Error(event.error);
      }

      if (typeof event.text === "string" && event.text.length > 0) {
        receivedText += event.text;

        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantId
              ? { ...message, content: receivedText }
              : message
          )
        );
      }
    };

    // Read the incoming stream.
    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex;

      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex);

        buffer = buffer.slice(newlineIndex + 1);

        processLine(line);
      }
    }

    // Flush the decoder exactly once.
    buffer += decoder.decode();

    if (buffer.trim()) {
      processLine(buffer);
    }

    if (!receivedText.trim()) {
      throw new Error("Gemini returned an empty response.");
    }

  } catch (error) {

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to connect to the AI assistant.";

    setMessages((previous) =>
      previous.map((message) =>
        message.id === assistantId
          ? {
              ...message,
              content: receivedText
                ? `${receivedText}\n\n${errorMessage}`
                : `Sorry, I couldn't process your message.\n\n${errorMessage}`,
            }
          : message
      )
    );

  } finally {
    setIsTyping(false);
  }
};

  // Start a new conversation
  const startNewChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open University of Swat Assistant"
          className="
            fixed bottom-5 right-4 z-50
            flex h-14 w-14 items-center justify-center
            rounded-full bg-neutral-900 text-white
            shadow-xl transition
            hover:scale-105 hover:bg-neutral-800
            focus:outline-none focus:ring-4 focus:ring-neutral-300
            sm:bottom-6 sm:right-6 sm:h-16 sm:w-16
          "
        >
          <MessageCircle size={27} strokeWidth={1.8} />

          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <section
          aria-label="University of Swat Assistant chat"
          className="
            fixed z-50
            bottom-4 right-3
            flex flex-col overflow-hidden
            h-[min(620px,calc(100dvh-100px))]
            w-[calc(100vw-24px)]
            max-w-[420px]
            rounded-2xl
            border border-neutral-200
            bg-white shadow-2xl
            sm:bottom-5 sm:right-5
            sm:h-[min(680px,calc(100dvh-100px))]
            sm:w-[min(420px,calc(100vw-40px))]
          "
        >
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-3 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white">
                <GraduationCap size={24} strokeWidth={1.7} />
              </div>

              <div>
                <h2 className="text-xs font-semibold text-neutral-900 sm:text-sm">
                  University of Swat
                </h2>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />

                  <p className="text-xs text-neutral-500">
                    AI Assistant
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={startNewChat}
                aria-label="Start a new chat"
                title="New chat"
                className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                <Plus size={19} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                title="Close"
                className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-neutral-50 px-4 py-5">
            {messages.length === 0 ? (
              <div className="flex min-h-full flex-col">
                {/* Welcome Section */}
                <div className="mb-6 mt-5 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-sm">
                    <Sparkles size={27} strokeWidth={1.6} />
                  </div>

                  <h3 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
                    How can I help you?
                  </h3>

                  <p className="mx-auto mt-2 max-w-[280px] text-xs leading-5 text-neutral-500 sm:text-sm sm:leading-6">
                    Ask me about admissions, academic programs,
                    departments, university services, and more.
                  </p>
                </div>

                {/* Suggested Questions */}
                <div className="mt-auto space-y-2">
                  <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Suggested questions
                  </p>

                  {suggestions.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.title}
                        onClick={() => sendMessage(item.prompt)}
                        disabled={isTyping}
                        className="
                          group flex w-full items-center gap-3
                          rounded-xl border border-neutral-200
                          bg-white p-3 text-left transition
                          hover:border-neutral-400 hover:shadow-sm
                          disabled:cursor-not-allowed
                        "
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 transition group-hover:bg-neutral-900 group-hover:text-white">
                          <Icon size={19} strokeWidth={1.7} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-800">
                            {item.title}
                          </p>

                          <p className="mt-0.5 text-xs text-neutral-500">
                            {item.description}
                          </p>
                        </div>

                        <ExternalLink
                          size={15}
                          className="shrink-0 text-neutral-400 transition group-hover:text-neutral-700"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Conversation Messages */}
                {messages
                    .filter(
                      (message) =>
                        !(message.role === "assistant" && !message.content && isTyping)
                    )
                    .map((message) =>  (
                  <div
                    key={message.id}
                    className={`flex gap-2.5 ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
                        <Bot size={17} />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] ${
                        message.role === "user" ? "order-1" : ""
                      }`}
                    >
                      <div
                        className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-3 text-sm leading-6 ${
                          message.role === "user"
                            ? "rounded-br-md bg-neutral-900 text-white"
                            : "rounded-bl-md border border-neutral-200 bg-white text-neutral-700"
                        }`}
                      >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ ...props }) => (
                                <a
                                  {...props}
                                  className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              ),
                              strong: ({ ...props }) => (
                                <strong {...props} className="font-semibold text-inherit" />
                              ),
                            }}
                          >
                            {message.content}
  </ReactMarkdown>
                      </div>

                      <p
                        className={`mt-1 px-1 text-[10px] text-neutral-400 ${
                          message.role === "user"
                            ? "text-right"
                            : ""
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Animation */}
                {isTyping &&
                  messages[messages.length - 1]?.role === "assistant" &&
                  !messages[messages.length - 1]?.content &&  (
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
                      <Bot size={17} />
                    </div>

                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="shrink-0 border-t border-neutral-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="
                flex items-center gap-2
                rounded-xl border border-neutral-300
                bg-white p-1.5 transition
                focus-within:border-neutral-500
                focus-within:ring-2 focus-within:ring-neutral-100
              "
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask me anything..."
                disabled={isTyping}
                className="
                  min-w-0 flex-1 bg-transparent
                  px-2 py-2 text-sm text-neutral-800
                  outline-none placeholder:text-neutral-400
                  disabled:opacity-60
                "
              />

              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="
                  flex h-9 w-9 shrink-0 items-center justify-center
                  rounded-lg bg-neutral-900 text-white
                  transition hover:bg-neutral-700
                  disabled:cursor-not-allowed disabled:bg-neutral-300
                "
              >
                <Send size={16} />
              </button>
            </form>

            <p className="mt-2 text-center text-[10px] text-neutral-400">
              University of Swat Assistant · Powered by Gemini
            </p>
          </div>
        </section>
      )}
    </>
  );
}
