import { useEffect, useRef } from "react";
import { clearChatbotCache } from "@/apiHelpers";
import { useSidebar } from "@/components/ui/sidebar";

const DEFAULT_DELAY_MS = 3000;

export interface UseChatCacheClearOptions {
  delayMs?: number;
}

/**
 * Schedules a clear-cache API call when the chat is closed. If the user reopens
 * the chat before the delay expires, the request is cancelled.
 */
export function useChatCacheClear(
  productId: string,
  isChatOpen: boolean,
  options: UseChatCacheClearOptions = {}
): void {
  const { delayMs = DEFAULT_DELAY_MS } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOpenRef = useRef<boolean>(isChatOpen);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = isChatOpen;

    if (wasOpen && !isChatOpen) {
      // Chat just closed: schedule clear-cache after delay
      if (!productId) return;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const token = localStorage.getItem("access_token") || "";
        if (token) {
          clearChatbotCache(productId, token);
        }
      }, delayMs);
    } else if (isChatOpen && timerRef.current !== null) {
      // Chat reopened: cancel scheduled clear
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [productId, isChatOpen, delayMs]);
}

interface ChatCacheClearTriggerProps {
  productId: string;
  isMobileChatOpen: boolean;
  delayMs?: number;
}

/**
 * Renders nothing. Must be used inside SidebarProvider. Calls clear-cache
 * (debounced) when the user closes the chat (sidebar or mobile overlay).
 */
export function ChatCacheClearTrigger({
  productId,
  isMobileChatOpen,
  delayMs = DEFAULT_DELAY_MS,
}: ChatCacheClearTriggerProps): null {
  const { open: sidebarOpen } = useSidebar();
  const isChatOpen = sidebarOpen || isMobileChatOpen;
  useChatCacheClear(productId, isChatOpen, { delayMs });
  return null;
}
