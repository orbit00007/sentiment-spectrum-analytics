import { useSidebar } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/ChatSidebar";

interface ChatSidebarWhenOpenProps {
  productId: string;
}

/**
 * Renders ChatSidebar only when the sidebar is open. Must be used inside SidebarProvider.
 * This way chat history is fetched only when the user opens the chat, not on page load.
 */
export function ChatSidebarWhenOpen({ productId }: ChatSidebarWhenOpenProps) {
  const { open } = useSidebar();
  if (!open) return null;
  return <ChatSidebar productId={productId} />;
}
