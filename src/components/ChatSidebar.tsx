import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Paperclip,
  Globe,
  Lightbulb,
  MoreHorizontal,
  Send,
  MessageSquare,
  Copy,
  Check,
  Search,
  Sparkles,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  getChatHistory,
  sendChatMessage,
  ChatMessage,
  ChatbotResponse
} from '@/apiHelpers';

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
  "Explain my sentiment analysis",
  "Which sources are most influential?",
  "What's my brand tier ranking?",
  "How do I compare to industry leaders?"
];

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ productId, className, isMobile = false, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const accessToken = localStorage.getItem("access_token") || "";

  // Load chat history and suggested questions on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!accessToken || !productId) return;

      try {
        const historyMessages = await getChatHistory(productId, accessToken, 100);

        // If no chat history exists, add a welcome message (local only, not sent to API)
        if (historyMessages.length === 0) {
          const welcomeMessage: ChatMessage = {
            id: 'welcome-message',
            content: "👋 **Welcome to Geo AI.**\n\n&nbsp;\n\nI help you understand how your brand appears across AI search.\n\n&nbsp;\n\n🔍 Ask me to **check your visibility**, **audit citations**, or **compare competitors**.",
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
    if (!messageText.trim() || isLoading || !productId) return;

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

    try {
      const response: ChatbotResponse | null = await sendChatMessage(messageText, productId, accessToken);

      if (response) {
        // Add assistant answer
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.answer,
          role: 'assistant',
          timestamp: response.timestamp || new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Update suggested questions and save to localStorage
        if (response.suggested_questions && response.suggested_questions.length > 0) {
          setSuggestedQuestions(response.suggested_questions);

          // Save to localStorage (overwrite existing)
          localStorage.setItem('geo_ai_latest_suggestions', JSON.stringify({
            productId: productId,
            suggestions: response.suggested_questions,
            timestamp: new Date().toISOString()
          }));
        }
      } else {
        // Fallback response
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Fallback response
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className={`flex flex-col h-full bg-gray-50/50 ${className}`}>
      {/* Header */}
      <div className={`flex items-center ${isMobile ? 'h-12 px-3' : 'h-16 px-6'} border-b bg-white shadow-sm z-10 relative`}>
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
          <div className={`${isMobile ? 'w-7 h-7' : 'w-9 h-9'} rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md ring-2 ring-white`}>
            <Sparkles className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white fill-white/20`} />
          </div>
          <div className="flex flex-col">
            <span className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'} leading-tight`}>Geo AI</span>
            {!isMobile && (
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Assistant</span>
            )}
          </div>
        </div>
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
        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && (messages.length === 0 || suggestedQuestions.length > 0) ? (
          <div className="mb-3">
            {messages.length > 0 && (
              <div className="flex items-center gap-2 mb-2 ml-1">
                <p className="text-xs text-gray-600">Suggested questions:</p>
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  {suggestedQuestions.length}
                </span>
              </div>
            )}
            <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide scroll-smooth -mx-1 px-1">
              {suggestedQuestions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm rounded-2xl whitespace-nowrap flex-shrink-0 transition-colors"
                  onClick={() => handleQuickAction(action)}
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Input Field with Icons */}
        <div className="bg-white rounded-3xl shadow-sm p-4 mb-3">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything"
            className="w-full text-base placeholder:text-gray-400 focus:outline-none mb-4"
            disabled={isLoading}
          />

          {/* Icons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100">
                <Paperclip className="w-5 h-5 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100">
                <Globe className="w-5 h-5 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100">
                <Lightbulb className="w-5 h-5 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100">
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-xl bg-gray-900 hover:bg-gray-800 shrink-0"
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
