
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  CreditCard,
  ArrowUp,
  Plus,
  Sparkles,
  User,
} from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
};

const suggestions = [
  {
    icon: ShieldCheck,
    title: "Admission Process",
    description: "Admissions and eligibility",
    prompt: "How can I apply for admission to the University of Swat?",
  },
  {
    icon: BookOpen,
    title: "Departments and Programs",
    description: "Explore academic programs",
    prompt: "What departments and degree programs does the University of Swat offer?",
  },
  {
    icon: CreditCard,
    title: "Fee Structure",
    description: "Fees and financial information",
    prompt: "Tell me about the fee structure of the University of Swat.",
  },
];

const getTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageId = useRef(0);

  const hasMessages = messages.length > 0;
  const focusInput = () => {
  requestAnimationFrame(() => {
    inputRef.current?.focus();
  });
  };

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  // Focus input when the conversation starts
  useEffect(() => {
    if (hasMessages) {
      inputRef.current?.focus();
    }
  }, [hasMessages]);

  // Send a message to Gemini through the existing API
  const sendMessage = async (text = input) => {
    const trimmedText = text.trim();

    if (!trimmedText || isTyping) {
          focusInput();
          return;
    }

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
    focusInput();

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

      // Read the stream
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

      // Flush decoder
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
      focusInput();
    }
  };

  // Start a new conversation
  const startNewChat = () => {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex h-dvh min-h-dvh w-full flex-col overflow-hidden bg-white mb-0">
      

      {/* Header */}
      <header className="relative z-10 flex h-[54px] shrink-0 items-center justify-between border-b border-neutral-100 bg-white/90 px-5 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          {/* University Icon */}
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src="/images/university-of-swat-logo.jpg"
              alt="University of Swat logo"
              fill
              sizes="40px"
              priority
              className="object-contain"
            />
          </div>

          <div>
            <h1 className="text-sm font-semibold tracking-tight text-[#14252e] sm:text-base">
              University of Swat
            </h1>

            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-neutral-500">
                AI Assistant
              </span>
            </div>
          </div>
        </div>

        {/* New Chat */}
        <button
          onClick={startNewChat}
          title="Start a new conversation"
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <Plus size={17} />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </header>

      {/* Main Area */}
      <main className="relative flex min-h-0 flex-1 flex-col">

        {/* Landing Screen */}
        {!hasMessages && (
          <div className="flex flex-1 min-h-0 flex-col items-center overflow-y-auto px-4 py-0">
            <div className="w-full max-w-5xl py-2 sm:py-4">

              {/* Hero */}
              <div className="text-center">

                {/* Logo Placeholder */}
                  <div className="relative mx-auto mb-3 mt-0 h-[62px] w-[62px] sm:h-[68px] sm:w-[68px] pt-0 mt-0">
                    <Image
                      src="/images/university-of-swat-logo.jpg"
                      alt="University of Swat logo"
                      fill
                      priority
                      sizes="68px"
                      className="relative mx-auto mt-0 h-[clamp(42px,8vh,68px)] w-[clamp(42px,8vh,68px)]"
                    />
                  </div>

                {/* Heading */}
                <h2 className="text-[clamp(1rem,3.5vw,3rem)] font-bold leading-tight tracking-tight">
                  University of Swat{" \t"}
                  <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 bg-clip-text text-transparent">
                    AI - Assistant
                  </span>
                </h2>

                <p className="mx-auto max-w-2xl text-[clamp(0.6rem,1vw,0.8rem)] leading-relaxed text-neutral-500">
                  Your intelligent guide to university information,
                  admissions, academics, and student services.
                </p>

                {/* Student Profile */}
                <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 shadow-sm mt-[clamp(0.5rem,2vh,1.25rem)]">
                  <GraduationCap
                    size={19}
                    className="shrink-0 text-emerald-600"
                  />

                  <span className="truncate text-sm font-medium text-neutral-800">
                    Sayyed Hassan Bacha
                  </span>

                  <span className="hidden text-neutral-300 sm:inline">•</span>

                  <span className="hidden truncate text-sm text-neutral-500 sm:inline">
                    BS Information Technology
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-2 sm:mt-4">
                <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
                  Explore university information
                </p>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                  {suggestions.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.title}
                        onClick={() => sendMessage(item.prompt)}
                        disabled={isTyping}
                        className="group flex min-h-[78px] items-center gap-3 rounded-xl border border-neutral-200 bg-white p-2 text-left transition-all duration-200 hover:border-emerald-200 hover:shadow-md active:translate-y-0 sm:min-h-[88px] sm:p-3.5"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors duration-200 group-hover:bg-emerald-600 group-hover:text-white">
                          <Icon size={22} strokeWidth={1.7} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium leading-5 text-neutral-800 sm:text-base">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm">
                            {item.description}
                          </p>
                        </div>

                        <ArrowUp
                          size={17}
                          className="rotate-45 shrink-0 text-neutral-300 transition group-hover:text-emerald-600"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Landing Input */}
              <div className="mx-auto mt-5 w-full max-w-3xl sm:mt-6">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage();
                  }}
                  className="group flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-2 pl-4 shadow-sm transition focus-within:border-emerald-300 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] hover:border-neutral-300 sm:p-2.5 sm:pl-5"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask anything about the University of Swat..."
                    disabled={isTyping}
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 sm:text-base"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    aria-label="Send message"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                  >
                    <ArrowUp size={20} strokeWidth={2} />
                  </button>
                </form>

                {/* Disclaimer */}
                <p className="mt-4 text-center text-xs text-neutral-400">
                  AI can make mistakes. Verify critical information at{" "}
                  <a
                    href="https://uswat.edu.pk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-600 underline underline-offset-2 transition hover:text-emerald-700"
                  >
                    uswat.edu.pk
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Screen */}
        {hasMessages && (
          <div className="flex min-h-0 flex-1 flex-col">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">

                {messages
                  .filter(
                    (message) =>
                      !(message.role === "assistant" && !message.content && isTyping)
                  )
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {/* Assistant Avatar */}
                      {message.role === "assistant" && (
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Sparkles size={18} />
                        </div>
                      )}

                      <div
                        className={`min-w-0 max-w-[88%] sm:max-w-[80%] ${
                          message.role === "user" ? "order-first" : ""
                        }`}
                      >
                        {/* Message */}
                        <div
                          className={`rounded-2xl px-4 py-3.5 text-sm leading-7 sm:px-5 sm:py-4 sm:text-[15px] ${
                            message.role === "user"
                              ? "rounded-br-md bg-emerald-600 text-white"
                              : "rounded-bl-md bg-neutral-50 text-neutral-800"
                          }`}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ ...props }) => (
                                <a
                                  {...props}
                                  className="break-all text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              ),
                              strong: ({ ...props }) => (
                                <strong
                                  {...props}
                                  className="font-semibold text-inherit"
                                />
                              ),
                              p: ({ ...props }) => (
                                <p
                                  {...props}
                                  className="mb-3 last:mb-0"
                                />
                              ),
                              ul: ({ ...props }) => (
                                <ul
                                  {...props}
                                  className="mb-3 list-disc space-y-1 pl-5 last:mb-0"
                                />
                              ),
                              ol: ({ ...props }) => (
                                <ol
                                  {...props}
                                  className="mb-3 list-decimal space-y-1 pl-5 last:mb-0"
                                />
                              ),
                              h1: ({ ...props }) => (
                                <h1
                                  {...props}
                                  className="mb-2 mt-4 text-lg font-semibold"
                                />
                              ),
                              h2: ({ ...props }) => (
                                <h2
                                  {...props}
                                  className="mb-2 mt-4 text-base font-semibold"
                                />
                              ),
                              h3: ({ ...props }) => (
                                <h3
                                  {...props}
                                  className="mb-2 mt-3 text-sm font-semibold"
                                />
                              ),
                              blockquote: ({ ...props }) => (
                                <blockquote
                                  {...props}
                                  className="my-3 border-l-2 border-emerald-300 pl-3 text-neutral-600"
                                />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>

                        {/* Time */}
                        <p
                          className={`mt-1.5 px-1 text-[10px] text-neutral-400 ${
                            message.role === "user" ? "text-right" : ""
                          }`}
                        >
                          {message.time}
                        </p>
                      </div>

                      {/* User Avatar */}
                      {message.role === "user" && (
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                          <User size={17} />
                        </div>
                      )}
                    </div>
                  ))}

                {/* Typing indicator */}
                {isTyping &&
                  messages[messages.length - 1]?.role === "assistant" &&
                  !messages[messages.length - 1]?.content && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Sparkles size={18} />
                      </div>

                      <div className="flex items-center gap-1 rounded-xl bg-neutral-50 px-4 py-3">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
                      </div>
                    </div>
                  )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Conversation Input */}
            <div className="shrink-0 border-t border-neutral-100 bg-white px-4 pb-3 pt-4 sm:px-6 sm:pb-4">
              <div className="mx-auto w-full max-w-3xl">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-2 pl-4 shadow-sm transition focus-within:border-emerald-300 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.06)]"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={() => focusInput()}
                    placeholder="Ask me anything..."
                    disabled={isTyping}
                    className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 sm:text-base"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    aria-label="Send message"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                  >
                    <ArrowUp size={19} />
                  </button>
                </form>

                <p className="mt-2.5 text-center text-[10px] text-neutral-400 sm:text-xs">
                  University of Swat AI Assistant can make mistakes. Verify critical information.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
