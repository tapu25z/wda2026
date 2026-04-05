"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Camera,
  X,
  Leaf,
  User,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Zap,
  Sparkles,
  ImagePlus,
  Sprout,
  CloudSun,
} from "lucide-react";
import { default as ReactWebcam } from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn, scanApi } from "@agri-scan/shared";
import type { IChatSession, IScanStatusResponse } from "@agri-scan/shared";

interface Message {
  id: string;
  text?: string;
  image?: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const SUGGESTIONS = [
  {
    icon: <ImagePlus size={18} className="text-emerald-500" />,
    text: "Chẩn đoán bệnh từ ảnh lá cây",
  },
  {
    icon: <Sprout size={18} className="text-emerald-500" />,
    text: "Cách bón phân NPK cho lúa",
  },
  {
    icon: <CloudSun size={18} className="text-emerald-500" />,
    text: "Lịch thời vụ trồng sầu riêng",
  },
  {
    icon: <Sparkles size={18} className="text-emerald-500" />,
    text: "Mẹo phòng trừ sâu bệnh tự nhiên",
  },
];

const getDateGroup = (date: string | Date): string => {
  const d = new Date(date);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (todayStart.getTime() -
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays <= 7) return "7 ngày trước";
  return "30 ngày trước";
};

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-xs font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

function BotMessageContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      nodes.push(<div key={i} className="my-4 border-t border-gray-200/70" />);
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push(
        <h2
          key={i}
          className="text-base font-bold text-gray-900 mt-4 mb-2 first:mt-0 flex items-center gap-2"
        >
          <span className="w-1 h-5 rounded-full bg-emerald-500 shrink-0 inline-block" />
          {renderInline(line.slice(2))}
        </h2>,
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <div key={i} className="mt-4 mb-2 first:mt-0">
          <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
            {renderInline(line.slice(3))}
          </span>
        </div>,
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <h4
          key={i}
          className="flex items-center gap-2 text-sm font-semibold text-gray-800 mt-3 mb-1.5 first:mt-0"
        >
          <span className="w-2 h-4 rounded-sm bg-emerald-400 shrink-0" />
          {renderInline(line.slice(4))}
        </h4>,
      );
      i++;
      continue;
    }

    if (/^[-*•]\s/.test(line)) {
      const items: React.ReactNode[] = [];

      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(
          <li key={i} className="flex gap-3 items-start">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="leading-relaxed text-gray-700">
              {renderInline(lines[i].replace(/^[-*•]\s/, ""))}
            </span>
          </li>,
        );
        i++;
      }

      nodes.push(
        <ul key={`ul-${i}`} className="my-2 space-y-2 text-sm pl-0.5">
          {items}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      let num = 1;

      while (i < lines.length) {
        const currentLine = lines[i];

        if (currentLine.trim() === "") {
          const nextNonBlank = lines.slice(i + 1).find((l) => l.trim() !== "");
          if (nextNonBlank && /^\d+\.\s/.test(nextNonBlank)) {
            i++;
            continue;
          }
          break;
        }

        if (!/^\d+\.\s/.test(currentLine)) break;

        items.push(
          <li key={i} className="flex gap-3 items-start">
            <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
              {num}
            </span>
            <span className="leading-relaxed text-gray-700">
              {renderInline(currentLine.replace(/^\d+\.\s/, ""))}
            </span>
          </li>,
        );

        i++;
        num++;
      }

      nodes.push(
        <ol key={`ol-${i}`} className="my-2 space-y-2 text-sm pl-0.5">
          {items}
        </ol>,
      );
      continue;
    }

    nodes.push(
      <p key={i} className="text-sm leading-relaxed text-gray-700">
        {renderInline(line)}
      </p>,
    );
    i++;
  }

  return <div className="space-y-2">{nodes}</div>;
}

function formatScanResultMessage(result: IScanStatusResponse): string {
  const disease = result.topDisease as
    | {
        name?: string;
        symptoms?: string[];
        treatments?: {
          biological?: string[];
          chemical?: string[];
          preventive?: string[];
        };
      }
    | undefined;

  const predictions = result.predictions || [];
  const diseaseName = disease?.name || "Không xác định";
  const confidence = predictions[0]?.confidence
    ? Math.round(predictions[0].confidence * 100)
    : 0;

  const lines: string[] = [];
  lines.push("## Kết quả chẩn đoán");
  lines.push(`**Bệnh phát hiện:** ${diseaseName.replace(/_/g, " ")}`);
  lines.push(`**Độ tin cậy:** ${confidence}%`);

  if (disease?.symptoms?.length) {
    lines.push("---");
    lines.push("## Triệu chứng");
    disease.symptoms.forEach((s) => lines.push(`- ${s}`));
  }

  const treatments = disease?.treatments;
  if (
    treatments?.biological?.length ||
    treatments?.chemical?.length ||
    treatments?.preventive?.length
  ) {
    lines.push("---");
    lines.push("## Phương pháp xử lý");

    if (treatments?.biological?.length) {
      lines.push("### Sinh học");
      treatments.biological.forEach((t) => lines.push(`- ${t}`));
    }

    if (treatments?.chemical?.length) {
      lines.push("### Hóa học");
      treatments.chemical.forEach((t) => lines.push(`- ${t}`));
    }

    if (treatments?.preventive?.length) {
      lines.push("### Phòng ngừa");
      treatments.preventive.forEach((t) => lines.push(`- ${t}`));
    }
  }

  return lines.join("\n");
}

export function Scanner() {
  const router = useRouter();
  const [history, setHistory] = useState<IChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [currentScanLabel, setCurrentScanLabel] = useState<string | undefined>(
    undefined,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<ReactWebcam>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(260);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      if (!inputText) {
        textareaRef.current.style.height = "40px";
      } else {
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          120,
        )}px`;
      }
    }
  }, [inputText]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStartX.current;
      const newWidth = Math.min(
        480,
        Math.max(180, dragStartWidth.current + delta),
      );
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    scanApi
      .getChatHistory()
      .then(setHistory)
      .catch(() => {});
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSelectedImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      e.target.value = "";
    },
    [],
  );

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setSelectedImage(imageSrc);
    setSelectedImageFile(null);
    setIsCameraOpen(false);
  }, []);

  const handleSend = useCallback(
    async (overrideText?: string) => {
      const textToSend = overrideText !== undefined ? overrideText : inputText;

      if (!textToSend.trim() && !selectedImage) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        text: textToSend.trim() || undefined,
        image: selectedImage || undefined,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      const questionText = textToSend.trim();
      const capturedImage = selectedImage;
      const capturedFile = selectedImageFile;

      const tempSessionId = `temp-${Date.now()}`;

      if (!currentSessionId && !capturedImage && questionText) {
        setHistory((prev) => [
          {
            sessionId: tempSessionId,
            title: questionText.slice(0, 60),
            updatedAt: new Date().toISOString(),
          } as IChatSession,
          ...prev,
        ]);
      }

      if (!overrideText) setInputText("");
      setSelectedImage(null);
      setSelectedImageFile(null);
      setIsBotTyping(true);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        if (capturedImage) {
          let fileToUpload: File;

          if (capturedFile) {
            fileToUpload = capturedFile;
          } else {
            const fetchRes = await fetch(capturedImage);
            const blob = await fetchRes.blob();
            fileToUpload = new File([blob], "captured-image.jpg", {
              type: blob.type || "image/jpeg",
            });
          }

          const statusResult = await scanApi.scanImageAndWait(fileToUpload);

          if (statusResult.status === "COMPLETED") {
            const diseaseName = statusResult.topDisease?.name || "Không xác định";
            setCurrentScanLabel(diseaseName);

            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                text: formatScanResultMessage(statusResult),
                sender: "bot",
                timestamp: new Date(),
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                text:
                  statusResult.message ||
                  "⚠️ Không thể hoàn tất phân tích ảnh. Vui lòng thử lại.",
                sender: "bot",
                timestamp: new Date(),
              },
            ]);
          }

          return;
        }

        const response = await scanApi.chatAndWait(
          questionText,
          currentScanLabel,
          currentSessionId || undefined,
        );

        const isNewSession =
          !!response.sessionId && response.sessionId !== currentSessionId;

        if (response.sessionId && response.sessionId !== currentSessionId) {
          setCurrentSessionId(response.sessionId);

          setHistory((prev) =>
            prev.map((h) =>
              h.sessionId === tempSessionId
                ? { ...h, sessionId: response.sessionId as string }
                : h,
            ),
          );
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: response.answer || "Trợ lý chưa có phản hồi.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);

        setTimeout(() => {
          scanApi
            .getChatHistory()
            .then(setHistory)
            .catch(() => {});
        }, isNewSession ? 800 : 0);
      } catch (error: unknown) {
        setHistory((prev) => prev.filter((h) => h.sessionId !== tempSessionId));

        const status = (error as { response?: { status?: number } })?.response
          ?.status;

        const errorText =
          status === 401
            ? "Bạn cần đăng nhập để sử dụng tính năng quét ảnh."
            : "Có lỗi xảy ra. Vui lòng thử lại.";

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: errorText,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsBotTyping(false);
      }
    },
    [
      inputText,
      selectedImage,
      selectedImageFile,
      currentSessionId,
      currentScanLabel,
    ],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const loadSession = useCallback(async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsBotTyping(true);

    if (window.innerWidth < 1024) setIsSidebarOpen(false);

    try {
      const detail = await scanApi.getSessionMessages(sessionId);

      const loadedMessages: Message[] = detail.messages.map((msg, i) => ({
        id: `${sessionId}-${i}`,
        text: typeof msg.content === "string" ? msg.content : "",
        sender: msg.role === "user" ? "user" : "bot",
        timestamp: new Date(msg.timestamp),
      }));

      setMessages(loadedMessages);
    } catch {
      setMessages([]);
    } finally {
      setIsBotTyping(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setInputText("");
    setSelectedImage(null);
    setSelectedImageFile(null);
    setCurrentSessionId(null);
    setCurrentScanLabel(undefined);

    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, []);

  const handleSuggestion = useCallback(
    (text: string) => {
      handleSend(text);
    },
    [handleSend],
  );

  return (
    <div className="fixed top-16 left-0 w-full h-[calc(100vh-4rem)] flex bg-white overflow-hidden font-sans text-gray-800">
      <motion.div
        initial={false}
        animate={{
          width: isSidebarOpen ? sidebarWidth : 0,
          opacity: isSidebarOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="bg-[#1B5E20] text-green-50 shrink-0 flex flex-col overflow-hidden border-r border-green-800 relative z-20"
      >
        <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-green-700/50 hover:bg-green-800/50 transition-colors text-sm text-left mb-4 bg-green-800/20 text-white"
          >
            <Plus size={16} />
            <span className="truncate">Cuộc trò chuyện mới</span>
          </button>

          {["Hôm nay", "Hôm qua", "7 ngày trước", "30 ngày trước"].map(
            (group) => {
              const groupSessions = history.filter(
                (h) => getDateGroup(h.updatedAt) === group,
              );

              if (groupSessions.length === 0) return null;

              return (
                <div key={group}>
                  <div className="mt-4 mb-2 px-3 text-xs font-medium text-green-200/70">
                    {group}
                  </div>

                  {groupSessions.map((h) => (
                    <button
                      key={h.sessionId}
                      onClick={() => loadSession(h.sessionId)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-800/50 transition-colors text-sm text-left group truncate text-green-50",
                        currentSessionId === h.sessionId && "bg-green-800/50",
                      )}
                    >
                      <MessageSquare size={16} className="text-green-300" />
                      <span className="truncate flex-1">{h.title}</span>
                    </button>
                  ))}
                </div>
              );
            },
          )}
        </div>

        <div className="p-3 border-t border-green-800/30 bg-green-900/20">
          <button
            onClick={() => router.push("/upgrade")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-green-800/50 transition-colors text-sm text-left text-green-100 group"
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Zap size={16} className="fill-white" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium truncate">Nâng cấp gói</span>
              <span className="text-xs text-green-300/70 truncate">
                Mở khóa tính năng cao cấp
              </span>
            </div>
          </button>
        </div>

        {isSidebarOpen && (
          <div
            onMouseDown={(e) => {
              isDragging.current = true;
              dragStartX.current = e.clientX;
              dragStartWidth.current = sidebarWidth;
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-green-400/40 transition-colors z-30"
          />
        )}
      </motion.div>

      <div className="flex-1 flex flex-col h-full relative bg-white">
        <div className="absolute top-0 left-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            {isSidebarOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeft size={20} />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8 text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 shadow-sm border border-emerald-100"
              >
                <Leaf size={40} strokeWidth={1.5} />
              </motion.div>

              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-3xl font-bold text-gray-900 mb-3"
              >
                Xin chào, tôi có thể giúp gì cho bạn?
              </motion.h2>

              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-gray-500 mb-10 max-w-md text-lg"
              >
                Hỏi tôi về bệnh cây trồng, cách chăm sóc hoặc gửi ảnh để chẩn
                đoán chính xác.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl"
              >
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestion(suggestion.text)}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-emerald-200 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {suggestion.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">
                      {suggestion.text}
                    </span>
                  </button>
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col pb-32 pt-10">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full py-2 px-4"
                >
                  <div
                    className={cn(
                      "max-w-3xl mx-auto flex gap-3",
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
                        msg.sender === "user"
                          ? "bg-gray-200 text-gray-600"
                          : "bg-emerald-600 text-white",
                      )}
                    >
                      {msg.sender === "user" ? (
                        <User size={16} />
                      ) : (
                        <Leaf size={16} />
                      )}
                    </div>

                    <div
                      className={cn(
                        "flex flex-col",
                        msg.sender === "user"
                          ? "items-end max-w-[75%]"
                          : "items-start max-w-[88%]",
                      )}
                    >
                      <div className="text-xs text-gray-400 mb-1 px-1 flex items-center gap-1.5">
                        <span className="font-medium text-gray-500">
                          {msg.sender === "user" ? "Bạn" : "Agri-Scan AI"}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span>
                          {msg.timestamp.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div
                        className={cn(
                          "rounded-2xl px-5 py-3.5 overflow-hidden text-sm md:text-base",
                          msg.sender === "user"
                            ? "bg-linear-to-br from-emerald-500 to-emerald-700 text-white rounded-tr-sm shadow-lg shadow-emerald-200/50"
                            : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-md shadow-gray-100/60",
                        )}
                      >
                        {msg.image && (
                          <div className="mb-3 rounded-xl overflow-hidden border-2 border-white/30 shadow-md">
                            <img
                              src={msg.image}
                              alt="User upload"
                              className="w-full h-auto max-h-64 object-cover block"
                            />
                          </div>
                        )}

                        {msg.text &&
                          (msg.sender === "bot" ? (
                            <BotMessageContent text={msg.text} />
                          ) : (
                            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words text-white">
                              {msg.text}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isBotTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full py-2 px-4"
                >
                  <div className="max-w-3xl mx-auto flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Leaf size={16} />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="text-xs text-gray-400 mb-1 px-1">
                        Agri-Scan AI
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-white via-white to-transparent pt-10 pb-6 px-4">
          <div className="max-w-3xl mx-auto relative">
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mb-3 inline-block relative"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-200 shadow-md">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-red-400 transition-colors shadow-sm"
                  >
                    <X size={11} strokeWidth={3} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end w-full p-2 bg-white border border-gray-200 shadow-lg shadow-gray-200/50 rounded-3xl transition-all focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors shrink-0 mb-0.5"
                title="Tải ảnh lên"
              >
                <Plus size={22} />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi Agri-Scan AI bất cứ điều gì..."
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none outline-none pt-1 pb-3 px-2 text-gray-900 placeholder-gray-400 resize-none max-h-37.5 text-base leading-relaxed overflow-hidden"
                rows={1}
              />

              <div className="flex items-center gap-1 shrink-0 mb-0.5 pr-1">
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                  title="Chụp ảnh"
                >
                  <Camera size={22} />
                </button>

                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() && !selectedImage}
                  className={cn(
                    "p-2.5 rounded-full transition-all flex items-center justify-center",
                    inputText.trim() || selectedImage
                      ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:scale-105"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed",
                  )}
                >
                  <Send
                    size={18}
                    className={
                      inputText.trim() || selectedImage ? "ml-0.5" : ""
                    }
                  />
                </button>
              </div>
            </div>

            <div className="text-center mt-3">
              <p className="text-xs text-gray-400">
                Agri-Scan AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan
                trọng.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg aspect-3/4 bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              {/* @ts-ignore */}
              <ReactWebcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />

              <button
                onClick={() => setIsCameraOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <X size={24} />
              </button>

              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <button
                  onClick={capture}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-95 transition-transform"
                >
                  <div className="w-12 h-12 bg-white rounded-full"></div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}