"use client";

/**
 * @file ChatWidget.tsx
 * @description Widget de chat guidé flottant avec arbre de décisions depuis la base de données
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  RotateCcw,
  ChevronRight,
  GraduationCap,
  Wallet,
  FilePen,
  Phone,
  Shield,
  Baby,
  HeartPulse,
  ArrowLeft,
  CreditCard,
  Building2,
  Search,
  Banknote,
  Eye,
  RefreshCw,
  FileText,
  ExternalLink,
  HelpCircle,
  Info,
  Mail,
  PhoneCall,
  Tag,
  Calendar,
  Users,
  Home,
  ClipboardList,
  Building,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChatMessageSkeleton, ChatOptionsSkeleton } from "./ChatMessageSkeleton";
import type { LucideIcon } from "lucide-react";

const MotionButton = motion.button;
const MotionDiv = motion.div;

const iconMap: Record<string, LucideIcon> = {
  "graduation-cap": GraduationCap,
  wallet: Wallet,
  "file-pen": FilePen,
  phone: Phone,
  shield: Shield,
  baby: Baby,
  "heart-pulse": HeartPulse,
  "arrow-left": ArrowLeft,
  "credit-card": CreditCard,
  "building-2": Building2,
  building: Building,
  search: Search,
  banknote: Banknote,
  eye: Eye,
  "refresh-cw": RefreshCw,
  "file-text": FileText,
  "external-link": ExternalLink,
  "help-circle": HelpCircle,
  info: Info,
  mail: Mail,
  "phone-call": PhoneCall,
  tag: Tag,
  "message-circle": MessageCircle,
  calendar: Calendar,
  users: Users,
  home: Home,
  "clipboard-list": ClipboardList,
  "chevron-right": ChevronRight,
};

interface ChatOption {
  id: string;
  label: string;
  icon?: string;
  next_node_id?: string;
  action_type?: string;
  action_value?: string;
}

interface ChatNode {
  id: string;
  message: string;
  is_end?: boolean;
  options: ChatOption[];
}

interface ChatMessage {
  id: string;
  type: "bot" | "user";
  content: string;
  options?: ChatOption[];
}

const OptionIcon = ({ iconName }: { iconName?: string }) => {
  if (!iconName) return null;
  const IconComponent = iconMap[iconName];
  if (!IconComponent) return null;
  return <IconComponent className="w-4 h-4 shrink-0" />;
};

OptionIcon.displayName = "OptionIcon";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nodes, setNodes] = useState<Record<string, ChatNode>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNodes = useCallback(async () => {
    if (hasFetched) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: nodesData, error: nodesError } = await supabase
        .from("chat_nodes")
        .select("*")
        .order("display_order");
      if (nodesError) throw nodesError;

      const { data: optionsData, error: optionsError } = await supabase
        .from("chat_options")
        .select("*")
        .order("display_order");
      if (optionsError) throw optionsError;

      const nodesMap: Record<string, ChatNode> = {};
      nodesData?.forEach((node: { id: string; message: string; is_end?: boolean }) => {
        nodesMap[node.id] = {
          ...node,
          options: optionsData?.filter((opt: { node_id: string }) => opt.node_id === node.id) || [],
        };
      });

      setNodes(nodesMap);
      setHasFetched(true);

      if (nodesMap.welcome) {
        setMessages([
          {
            id: "welcome",
            type: "bot",
            content: nodesMap.welcome.message,
            options: nodesMap.welcome.options,
          },
        ]);
        trackAnalytics("welcome");
      }
    } catch {
      // Silently fail if chat_nodes table doesn't exist yet
    } finally {
      setIsLoading(false);
    }
  }, [hasFetched]);

  useEffect(() => {
    if (isOpen && !hasFetched) {
      fetchNodes();
    }
  }, [isOpen, hasFetched, fetchNodes]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const trackAnalytics = useCallback(
    async (nodeId: string, optionId?: string) => {
      try {
        await fetch(
          "https://sxadbvezilpcldmncjrk.supabase.co/functions/v1/track-chat-analytics",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              node_id: nodeId,
              option_id: optionId || null,
            }),
          }
        );
      } catch (error) {
        console.error("Error tracking analytics:", error);
      }
    },
    [sessionId]
  );

  const handleOptionClick = useCallback(
    (option: ChatOption) => {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: "user",
        content: option.label,
      };
      setMessages((prev) => [...prev, userMessage]);
      trackAnalytics(option.next_node_id || "action", option.id);

      if (option.action_type === "link" && option.action_value) {
        setTimeout(() => {
          if (option.action_value?.startsWith("http")) {
            window.open(option.action_value, "_blank");
          } else {
            router.push(option.action_value!);
            setIsOpen(false);
          }
        }, 300);
        return;
      }

      if (option.action_type === "contact" && option.action_value) {
        window.location.href = option.action_value;
        return;
      }

      if (option.next_node_id && nodes[option.next_node_id]) {
        const nextNode = nodes[option.next_node_id];
        setTimeout(() => {
          const botMessage: ChatMessage = {
            id: `bot-${Date.now()}`,
            type: "bot",
            content: nextNode.message,
            options: nextNode.options,
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
      }
    },
    [router, nodes, trackAnalytics]
  );

  const handleReset = useCallback(() => {
    if (!nodes.welcome) return;
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        type: "bot",
        content: nodes.welcome.message,
        options: nodes.welcome.options,
      },
    ]);
    trackAnalytics("welcome");
  }, [nodes, trackAnalytics]);

  if (!mounted) return null;

  return (
    <>
      {/* Floating button */}
      <MotionButton
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-lg transition-all ${isOpen ? "hidden" : ""}`}
        style={{ backgroundColor: "#1F628E", color: "#fff" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        aria-label="Ouvrir le chat"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#1F628E]" />
      </MotionButton>

      {/* Chat window */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <MotionDiv
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[90] flex flex-col overflow-hidden"
            style={{
              backgroundColor: "#1a2332",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              bottom: "16px",
              right: "16px",
              width: "calc(100vw - 32px)",
              maxWidth: "380px",
              height: "calc(100dvh - 100px)",
              maxHeight: "520px",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ backgroundColor: "#1F628E" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Assistant C&Co</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                      En ligne
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                  onClick={handleReset}
                  title="Recommencer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4"
              aria-live="polite"
              role="log"
            >
              <div ref={scrollRef} className="space-y-4" aria-label="Messages du chat">
                {isLoading ? (
                  <>
                    <ChatMessageSkeleton />
                    <ChatOptionsSkeleton />
                  </>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <MotionDiv
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className="max-w-[85%] rounded-2xl px-4 py-2.5"
                          style={
                            message.type === "user"
                              ? {
                                  backgroundColor: "#1F628E",
                                  color: "#fff",
                                  borderBottomRightRadius: "6px",
                                }
                              : {
                                  backgroundColor: "rgba(255,255,255,0.06)",
                                  color: "rgba(255,255,255,0.85)",
                                  borderBottomLeftRadius: "6px",
                                }
                          }
                        >
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                        </div>
                      </MotionDiv>
                    ))}

                    {/* Options for last bot message */}
                    {messages.length > 0 && messages[messages.length - 1].type === "bot" && (
                      <MotionDiv
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2 pt-2"
                      >
                        {messages[messages.length - 1].options?.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleOptionClick(option)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left rounded-xl transition-all group min-w-0"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              color: "rgba(255,255,255,0.8)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(31,98,142,0.15)";
                              e.currentTarget.style.borderColor = "rgba(31,98,142,0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                            }}
                          >
                            <div className="shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
                              <OptionIcon iconName={option.icon} />
                            </div>
                            <span className="flex-1 min-w-0 truncate">{option.label}</span>
                            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                          </button>
                        ))}
                      </MotionDiv>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-4 py-3 shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                Cliquez sur une option pour continuer
              </p>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
}
