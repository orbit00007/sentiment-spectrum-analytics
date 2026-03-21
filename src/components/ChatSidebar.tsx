import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Send,
  Copy,
  Check,
  Search,
  Sparkles,
  X,
  Gauge
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  getChatHistory,
  sendChatMessage,
  ChatMessage,
  ChatUsage
} from '@/apiHelpers';
import { getSecureAccessToken } from '@/lib/secureStorage';
import {
  getUsageStatus,
  getUsageProgress,
  formatResetsAt,
  USAGE_COPY,
  USAGE_PROGRESS_COPY,
  type UsageStatus
} from '@/components/chat/usageUtils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ChatSidebarProps {
  productId: string;
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

const quickActions = [
  "How is my brand performing in AI search?",
  "Who are my top competitors?",
  "What's my AI visibility score?",
  "Which keywords need improvement?",
  "Show me competitor analysis",
  "What content should I focus on?",
  "How can I improve my rankings?",
  "What are my brand's weaknesses?",
  "How have I trended over my last few runs?",
  "What's changed in my visibility lately?",
  "Compare my recent runs",
  "How do I compare to industry leaders?"
];

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ productId, className, isMobile = false, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [usage, setUsage] = useState<ChatUsage | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const accessToken = getSecureAccessToken();

  const status: UsageStatus = getUsageStatus(usage);
  const isLocked = status === 'locked';
  const resetText = usage?.resets_at ? formatResetsAt(usage.resets_at) : '';
  const usageProgress = getUsageProgress(usage);
  const progressCopy = USAGE_PROGRESS_COPY[status];

  // Load chat history and suggested questions on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!accessToken || !productId) return;

      try {
        const { messages: historyMessages, usage: historyUsage } = await getChatHistory(productId, accessToken, 100);

        if (historyUsage) {
          setUsage(historyUsage);
        }

        // If no chat history exists, add a welcome message (local only, not sent to API)
        if (historyMessages.length === 0) {
          const welcomeMessage: ChatMessage = {
            id: 'welcome-message',
            content: "👋 **Welcome to Geo AI.**\n\n&nbsp;\n\nI help you understand how your brand appears across AI search. **I also use your past runs**—so you can ask about trends, changes, or how you're doing over time.\n\n&nbsp;\n\n🔍 Ask me to **check your visibility**, **audit citations**, or **compare competitors**.",
            role: 'assistant',
            timestamp: new Date().toISOString()
          };
          setMessages([welcomeMessage]);
        } else {
          setMessages(historyMessages);
        }

        // Load suggested questions from localStorage as fallback
        const storedSuggestions = localStorage.getItem('geo_ai_latest_suggestions');
        if (storedSuggestions) {
          try {
            const parsed = JSON.parse(storedSuggestions);
            // Only use if it's for the same product
            if (parsed.productId === productId && parsed.suggestions) {
              setSuggestedQuestions(parsed.suggestions);
            } else {
              // Different product or invalid, use defaults
              setSuggestedQuestions(quickActions);
            }
          } catch {
            setSuggestedQuestions(quickActions);
          }
        } else {
          // No stored suggestions, use defaults
          setSuggestedQuestions(quickActions);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        // Use default suggestions on error
        setSuggestedQuestions(quickActions);
      }
    };

    loadChatHistory();
  }, [accessToken, productId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || isLocked || !productId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setSuggestedQuestions([]); // Clear previous suggestions

    const result = await sendChatMessage(messageText, productId, accessToken);

    if (result.ok) {
      const response = result.data;
      // Add assistant answer
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        role: 'assistant',
        timestamp: response.timestamp || new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update usage from 200 response
      if (response.usage) {
        setUsage(response.usage);
      }

      // Update suggested questions and save to localStorage
      if (response.suggested_questions && response.suggested_questions.length > 0) {
        setSuggestedQuestions(response.suggested_questions);

        localStorage.setItem('geo_ai_latest_suggestions', JSON.stringify({
          productId: productId,
          suggestions: response.suggested_questions,
          timestamp: new Date().toISOString()
        }));
      }
    } else if ('status' in result && result.status === 429) {
      // Limit hit: remove optimistic user message, set usage, add limit message
      const usage429 = (result as { ok: false; status: 429; usage: ChatUsage }).usage;
      setUsage(usage429);
      setMessages(prev => prev.slice(0, -1));

      const limitMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `You've reached today's chat limit. Chat will be available again ${formatResetsAt(usage429.resets_at)}.`,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, limitMessage]);
    } else {
      // Other error: fallback response
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  const handleCopyMessage = async (content: string, messageId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const usagePopover = (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <Gauge className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium">Usage</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        {usage ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Today</p>
              <p className="text-sm font-semibold text-gray-900">{progressCopy.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{progressCopy.detail}</p>
            </div>

            <div
              className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(usageProgress)}
              aria-label="Chat usage progress"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  status === 'healthy'
                    ? 'bg-emerald-500'
                    : status === 'warning'
                      ? 'bg-amber-400'
                      : status === 'critical'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                }`}
                style={{ width: `${usageProgress}%` }}
              />
            </div>

            {resetText && (
              <p className="text-xs text-gray-500">
                Resets {resetText}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Today</p>
            <p className="text-sm font-semibold text-gray-900">Usage not available yet</p>
            <p className="text-xs text-gray-600">
              We will show your chat progress here once usage data is available.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );

  return (
    <div className={`flex flex-col h-full bg-gray-50/50 ${className}`}>
      {/* Header */}
      <div className={`flex items-center ${isMobile ? 'h-12 px-3' : 'h-16 px-6'} border-b bg-white shadow-sm z-10 relative justify-between gap-2`}>
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className={`${isMobile ? 'w-7 h-7' : 'w-9 h-9'} rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md ring-2 ring-white`}>
            <Sparkles className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white fill-white/20`} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'} leading-tight truncate`}>Geo AI</span>
            {!isMobile && (
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider truncate">Assistant</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Close Button - Only on Mobile */}
          {isMobile && onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-5" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start items-start gap-3'}`}
              >
                {message.role !== 'user' && (
                  <Avatar className="h-8 w-8 border border-gray-200 shadow-sm mt-1">
                    <AvatarImage src="/geo-ai-avatar.png" alt="Geo AI" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <Search className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                  ? 'bg-gray-800 text-white ml-8'
                  : 'bg-white text-gray-900 shadow-sm'
                  }`}>
                  {message.role === 'user' ? (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="relative group">
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-gray-900 prose-strong:font-semibold">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      <Button
                        onClick={() => handleCopyMessage(message.content, message.id)}
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm mr-8">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-5 bg-gray-100">
        {/* Usage nudge banner */}
        {status !== 'healthy' && (
          <div
            className={`mb-3 px-3 py-2 rounded-xl text-sm ${
              status === 'locked'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : status === 'critical'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-amber-50/80 text-amber-700 border border-amber-100'
            }`}
          >
            <p className="font-medium">{USAGE_COPY[status].nudge}</p>
            {status === 'locked' && resetText && (
              <p className="text-xs mt-0.5 opacity-90">
                {USAGE_COPY.locked.subtext(resetText)}
              </p>
            )}
          </div>
        )}

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && (messages.length === 0 || suggestedQuestions.length > 0) ? (
          <div className="mb-3">
            <div className="flex items-center justify-between gap-2 mb-2 ml-1">
              <div className="flex items-center gap-2 min-w-0">
                {messages.length > 0 && (
                  <>
                    <p className="text-xs text-gray-600">Suggested questions:</p>
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      {suggestedQuestions.length}
                    </span>
                  </>
                )}
              </div>
              <div className="shrink-0">
                {usagePopover}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide scroll-smooth -mx-1 px-1">
              {suggestedQuestions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  disabled={isLocked}
                  className="h-auto py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm rounded-2xl whitespace-nowrap flex-shrink-0 transition-colors disabled:opacity-60 disabled:pointer-events-none"
                  onClick={() => handleQuickAction(action)}
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {suggestedQuestions.length === 0 && (
          <div className="mb-3 flex justify-end">
            {usagePopover}
          </div>
        )}

        {/* Input + send */}
        <div className="bg-white rounded-3xl shadow-sm p-4 mb-3">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={USAGE_COPY[status].placeholder}
            className="w-full text-base placeholder:text-gray-400 focus:outline-none mb-4"
            disabled={isLoading || isLocked}
          />

          <div className="flex items-center justify-end">
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading || isLocked}
              size="icon"
              className="h-10 w-10 rounded-xl bg-gray-900 hover:bg-gray-800 shrink-0 disabled:opacity-60"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          AI can make mistakes. Please double-check responses.
        </p>
      </div>
    </div>
  );
};
