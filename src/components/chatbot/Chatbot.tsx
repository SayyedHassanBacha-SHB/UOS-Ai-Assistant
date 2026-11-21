"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  Copy,
  CreditCard,
  GraduationCap,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  User,
} from "lucide-react";

/* ───────────────────────── Types & constants ───────────────────────── */

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
  isError?: boolean;
};

const LOGO = "/images/university-of-swat-logo.jpg";
const MAX_HISTORY = 12; // route.ts accepts up to 20
const MAX_LENGTH = 4000; // matches route.ts

const suggestions = [
  {
    icon: ShieldCheck,
    title: "Admission process",
    description: "How to apply and who is eligible",
    prompt: "How can I apply for admission to the University of Swat?",
  },
  {
    icon: BookOpen,
    title: "Departments and programs",
    description: "Degrees offered by each department",
    prompt: "What departments and degree programs does the University of Swat offer?",
  },
  {
    icon: CreditCard,
    title: "Fee structure",
    description: "Tuition, fees and payment details",
    prompt: "Tell me about the fee structure of the University of Swat.",
  },
];

const getTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ───────────────────────── Markdown styling ───────────────────────── */

// react-markdown passes a `node` prop that must not reach the DOM element.
function omitNode<T extends { node?: unknown }>(props: T) {
  const { node, ...rest } = props;
  void node;
  return rest;
}

// Defined once, outside the component, so it isn't rebuilt on every streamed chunk.
const markdownComponents: Components = {
  a: (props) => (
    <a
      {...omitNode(props)}
      target="_blank"
      rel="noopener noreferrer"
      className="break-words font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
    />
  ),
  p: (props) => <p {...omitNode(props)} className="mb-3 last:mb-0" />,
  strong: (props) => <strong {...omitNode(props)} className="font-semibold" />,
  ul: (props) => (
    <ul {...omitNode(props)} className="mb-3 list-disc space-y-1.5 pl-5 last:mb-0 marker:text-emerald-600" />
  ),
  ol: (props) => (
    <ol {...omitNode(props)} className="mb-3 list-decimal space-y-1.5 pl-5 last:mb-0 marker:font-medium marker:text-emerald-700" />
  ),
  h1: (props) => <h3 {...omitNode(props)} className="mb-2 mt-4 text-base font-semibold first:mt-0" />,
  h2: (props) => <h3 {...omitNode(props)} className="mb-2 mt-4 text-base font-semibold first:mt-0" />,
  h3: (props) => <h4 {...omitNode(props)} className="mb-2 mt-3 text-sm font-semibold first:mt-0" />,
  blockquote: (props) => (
    <blockquote {...omitNode(props)} className="my-3 border-l-2 border-emerald-300 pl-3 text-neutral-600" />
  ),
  hr: (props) => <hr {...omitNode(props)} className="my-4 border-neutral-200" />,
  // Wide tables scroll sideways inside their own box instead of breaking the page on phones
  table: (props) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table {...omitNode(props)} className="w-full min-w-[420px] text-left text-sm" />
    </div>
  ),
  th: (props) => <th {...omitNode(props)} className="bg-neutral-100 px-3 py-2 font-semibold" />,
  td: (props) => <td {...omitNode(props)} className="border-t border-neutral-200 px-3 py-2 align-top" />,
  pre: (props) => (
    <pre
      {...omitNode(props)}
      className="my-3 overflow-x-auto rounded-lg bg-neutral-900 p-3 text-[13px] leading-6 text-neutral-100"
    />
  ),
  code: (props) => {
    const { className, ...rest } = omitNode(props);
    // Fenced blocks arrive with a language class and inherit the <pre> look
    if (className?.includes("language-")) {
      return <code {...rest} className={className} />;
    }
    return (
      <code
        {...rest}
        className="rounded bg-neutral-200/70 px-1 py-0.5 font-mono text-[0.88em]"
      />
    );
  },
};

/* ───────────────────────── Small components ───────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (insecure context / permissions). Fail quietly.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-200/60 hover:text-neutral-900"
    >
      {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

const MessageItem = memo(function MessageItem({
  message,
  canRetry,
  streaming,
  onRetry,
}: {
  message: Message;
  canRetry: boolean;
  streaming: boolean;
  onRetry: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <article
      aria-label={isUser ? "Your message" : "Assistant message"}
      className={`message-in flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div
          className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 sm:flex"
          aria-hidden
        >
          <Sparkles size={18} />
        </div>
      )}

      <div className={`min-w-0 max-w-[92%] sm:max-w-[82%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-7 sm:px-5 sm:py-3.5 sm:text-base sm:leading-7 ${
            isUser
              ? "rounded-br-md bg-emerald-700 text-white shadow-xs"
              : message.isError
                ? "rounded-bl-md border border-red-200 bg-red-50 text-red-900"
                : "rounded-bl-md border border-neutral-200 bg-white text-neutral-900 shadow-xs"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        <div
          className={`mt-1 flex items-center gap-1 px-1 text-[11px] text-neutral-600 ${
            isUser ? "justify-end" : ""
          }`}
        >
          <span>
            {isUser ? "You" : "Assistant"} · {message.time}
          </span>
          {!isUser && !streaming && message.content && !message.isError && (
            <CopyButton text={message.content} />
          )}
          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-red-800 transition hover:bg-red-100"
            >
              <RotateCcw size={14} aria-hidden />
              Try again
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div
          className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-neutral-700 sm:flex"
          aria-hidden
        >
          <User size={17} />
        </div>
      )}
    </article>
  );
});

/* ───────────────────────── Main component ───────────────────────── */

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showJump, setShowJump] = useState(false);
  const [srStatus, setSrStatus] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const stickToBottom = useRef(true);

  const hasMessages = messages.length > 0;

  /* Auto-scroll, but only while the reader is already at the bottom.
     If they scrolled up to re-read, we leave them alone. */

  useEffect(() => {
  const el = scrollRef.current;
  // Never scroll on the landing screen
  if (!el || !hasMessages || !stickToBottom.current) return;
  el.scrollTo({ top: el.scrollHeight, behavior: isTyping ? "auto" : "smooth" });
}, [messages, isTyping, hasMessages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = distance < 80;
    setShowJump(distance > 240);
  };

  const jumpToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const sendMessage = async (text: string, base: Message[] = messages) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = {
      id: ++messageId.current,
      role: "user",
      content: trimmed,
      time: getTime(),
    };
    const assistantId = ++messageId.current;

    // Only real answers go back to the model: no empty placeholders, no error text
    const history = base
      .filter((m) => m.content && !m.isError)
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }));

    setMessages([
      ...base,
      userMessage,
      { id: assistantId, role: "assistant", content: "", time: getTime() },
    ]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);
    setSrStatus("Assistant is responding.");
    stickToBottom.current = true;

    const controller = new AbortController();
    abortRef.current = controller;
    let receivedText = "";
    let failed = false;

    const updateAssistant = (content: string, isError = false) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content, isError } : m))
      );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/x-ndjson",
        },
        body: JSON.stringify({ message: trimmed, history }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          typeof data?.error === "string" ? data.error : `Server error: ${response.status}`
        );
      }
      if (!response.body) throw new Error("Streaming is not supported in this browser.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processLine = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.error) throw new Error(event.error);
        if (typeof event.text === "string" && event.text) {
          receivedText += event.text;
          updateAssistant(receivedText);
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newline;
        while ((newline = buffer.indexOf("\n")) !== -1) {
          processLine(buffer.slice(0, newline));
          buffer = buffer.slice(newline + 1);
        }
      }
      buffer += decoder.decode();
      if (buffer.trim()) processLine(buffer);

      if (!receivedText.trim()) throw new Error("The assistant returned an empty response.");
    } catch (error) {
      // Stop button or New chat: keep any partial answer, or remove the empty placeholder
      if (error instanceof DOMException && error.name === "AbortError") {
        if (!receivedText) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        }
        setSrStatus("Response stopped.");
        return;
      }
      failed = true;
      const reason =
        error instanceof Error ? error.message : "Unable to connect to the AI assistant.";
      updateAssistant(
        receivedText
          ? `${receivedText}\n\n_${reason}_`
          : `Sorry, I couldn't process your message. ${reason}`,
        true
      );
    } finally {
      setIsTyping(false);
      abortRef.current = null;
      if (!failed && receivedText) setSrStatus("Response ready.");
      if (failed) setSrStatus("The response failed. You can try again.");
      textareaRef.current?.focus();
    }
  };

  const stopGenerating = () => abortRef.current?.abort();

  const startNewChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setIsTyping(false);
    setSrStatus("Started a new conversation.");
    stickToBottom.current = true;
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    textareaRef.current?.focus();
  };

  // Resend the last question after an error
  const retryLast = () => {
    let lastUser = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUser = i;
        break;
      }
    }
    if (lastUser === -1 || isTyping) return;
    sendMessage(messages[lastUser].content, messages.slice(0, lastUser));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds a line. Ignore Enter while an IME is composing.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage(input);
    }
    if (e.key === "Escape" && isTyping) stopGenerating();
  };

  const visibleMessages = messages.filter(
    (m) => !(m.role === "assistant" && !m.content && isTyping)
  );
  const lastMessage = messages[messages.length - 1];
  const showTypingDots = isTyping && lastMessage?.role === "assistant" && !lastMessage.content;
  const nearLimit = input.length > MAX_LENGTH * 0.8;

  return (
    <div className="flex h-dvh w-full flex-col bg-white text-neutral-800">
      {/* Keyboard users can jump past the header */}
      <a
        href="#chat-input"
        className="sr-only z-50 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        Skip to message box
      </a>

      {/* Announces progress to screen readers without reading every streamed word */}
      <div role="status" aria-live="polite" className="sr-only">
        {srStatus}
      </div>

      {/* ───────── Header ───────── */}
      <header
        className="shrink-0 border-b border-neutral-200 bg-white/90 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src={LOGO}
              alt="University of Swat logo"
              width={44}
              height={44}
              priority
              className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-[#14252e] sm:text-base">
                University of Swat
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                AI Assistant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startNewChat}
            aria-label="Start a new conversation"
            className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Plus size={18} aria-hidden />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>
      </header>

      {/* ───────── Scrollable content ───────── */}
      <main
        id="main"
        className="relative min-h-0 flex-1 overflow-hidden"
      >
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className={`h-full overflow-y-auto overscroll-contain ${
            hasMessages ? "bg-slate-50" : "hero-bg"
          }`}
        >
          {!hasMessages ? (
            /* ── Landing ── the page's only <h1> */
            <section
              aria-labelledby="page-title"
              className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center px-4 py-5 text-center sm:px-6 sm:py-8"
            >
              <div className="my-auto flex w-full flex-col items-center">
                <div className="mb-3 rounded-2xl bg-white p-2 shadow-md ring-1 ring-emerald-100 [@media(max-height:520px)]:hidden sm:mb-4">
                  <Image
                    src={LOGO}
                    alt=""
                    width={80}
                    height={80}
                    priority
                    className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                  />
                </div>

                <h1
                  id="page-title"
                  className="text-balance text-[clamp(1.625rem,5vw,2.5rem)] font-bold leading-[1.15] tracking-tight text-[#14252e]"
                >
                  University of Swat (UOS) -{" "}
                  <span className="bg-linear-to-r from-emerald-700 via-emerald-600 to-green-500 bg-clip-text text-transparent">
                    AI Assistant
                  </span>
                </h1>

                <p className="mt-2.5 max-w-xl text-pretty text-base leading-relaxed text-neutral-600">
                  UoS AI Assistant is your guide to University of Swat admissions, academics and student services.
                </p>

                {/* Creator: stays in the middle of the landing page */}
                <div className="mt-4 inline-flex max-w-full items-center gap-2.5 rounded-full border border-neutral-200 bg-white py-2 pl-2.5 pr-4 shadow-xs">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <GraduationCap size={18} aria-hidden />
                  </span>
                  <span className="min-w-0 truncate text-sm font-semibold text-neutral-900">
                    Sayyed Hassan Bacha
                  </span>
                  <span className="hidden text-neutral-400 sm:inline" aria-hidden>
                    •
                  </span>
                  <span className="hidden truncate text-sm text-neutral-600 sm:inline">
                    BS Information Technology
                  </span>
                </div>

                <h2 className="mb-2.5 mt-5 text-sm font-light text-neutral-700 sm:mt-6">
                  Explore University of Swat information
                </h2>

                <ul className="grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-3">
                  {suggestions.map(({ icon: Icon, title, description, prompt }) => (
                    <li key={title}>
                      <button
                        type="button"
                        onClick={() => sendMessage(prompt)}
                        disabled={isTyping}
                        className="group flex h-full w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:translate-y-0 disabled:opacity-60 motion-reduce:hover:translate-y-0 sm:flex-col sm:items-start sm:gap-3 sm:p-3.5"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                          <Icon size={23} strokeWidth={1.7} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-semibold leading-5 text-neutral-900 sm:text-base">
                            {title}
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-neutral-600">
                            {description}
                          </span>
                        </span>
                        <ArrowUp
                          size={17}
                          aria-hidden
                          className="shrink-0 rotate-45 text-neutral-400 transition group-hover:text-emerald-600 sm:hidden"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : (
            /* ── Conversation ──
               aria-live is off here on purpose: streaming would make a screen reader
               read every chunk. The hidden status region above announces progress. */
            <div
              role="log"
              aria-label="Conversation"
              aria-live="off"
              aria-busy={isTyping}
              className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8"
            >
              {visibleMessages.map((message, index) => {
                const isLast = index === visibleMessages.length - 1;
                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    streaming={isTyping && isLast && message.role === "assistant"}
                    canRetry={
                      isLast && !isTyping && message.role === "assistant" && !!message.isError
                    }
                    onRetry={retryLast}
                  />
                );
              })}

              {showTypingDots && (
                <div className="flex items-center gap-3" role="status" aria-label="Assistant is typing">
                  <div
                    className="hidden h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 sm:flex"
                    aria-hidden
                  >
                    <Sparkles size={18} />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-4 py-3.5 shadow-xs">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Jump-to-latest button, shown after scrolling up */}
        {hasMessages && showJump && (
          <button
            type="button"
            onClick={jumpToBottom}
            aria-label="Scroll to latest message"
            className="absolute bottom-4 left-1/2 flex h-10 -translate-x-1/2 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 shadow-lg transition hover:bg-neutral-50"
          >
            <ArrowDown size={16} aria-hidden />
            Latest
          </button>
        )}
      </main>

      {/* ───────── Composer (one input for both screens) ───────── */}
      <footer
        className="shrink-0 bg-white px-4 pt-3 sm:px-6"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto w-full max-w-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-end gap-2 rounded-2xl border border-neutral-300 bg-white p-2 pl-4 shadow-xs transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/15 hover:border-neutral-400 focus-within:hover:border-emerald-500"
          >
            <label htmlFor="chat-input" className="sr-only">
              Ask a question about the University of Swat
            </label>
            {/* 16px text stops iOS Safari from zooming the page when the input is focused */}
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                resizeTextarea();
              }}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={MAX_LENGTH}
              enterKeyHint="send"
              autoComplete="off"
              placeholder={hasMessages ? "Ask a follow-up…" : "Ask anything about the University of Swat…"}
              className="max-h-40 min-w-0 flex-1 resize-none bg-transparent py-2.5 text-base leading-6 text-neutral-900 outline-none placeholder:text-neutral-500"
              style={{ outline: "none" }}
            />

            {isTyping ? (
              <button
                type="button"
                onClick={stopGenerating}
                aria-label="Stop generating"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-white transition hover:bg-neutral-900"
              >
                <Square size={15} fill="currentColor" aria-hidden />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
              >
                <ArrowUp size={20} strokeWidth={2.2} aria-hidden />
              </button>
            )}
          </form>

          <div className="mt-2 text-center text-xs leading-5 text-neutral-600">
            {nearLimit && (
              <p
                className={`mb-0.5 text-right tabular-nums ${
                  input.length >= MAX_LENGTH ? "font-semibold text-red-700" : ""
                }`}
              >
                {input.length}/{MAX_LENGTH}
              </p>
            )}
            <p className="text-pretty">
              Student project. AI can make mistakes, so verify important details at{" "}
              <a
                href="https://uswat.edu.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
              >
                uswat.edu.pk
              </a>
              .
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
