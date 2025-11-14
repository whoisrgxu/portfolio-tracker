import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Loader2, X } from 'lucide-react';

import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { cn } from './ui/utils';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:8000';

const SYSTEM_PROMPT =
  'You are Gemini Flash Lite embedded in a personal portfolio tracker. ' +
  'Provide concise, actionable answers about stocks, ETFs, and investing. ' +
  'If data is unavailable, say so clearly.';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi there! Ask me about stock performance, market news, or investing tips.',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) {
      return;
    }

    const question = inputValue.trim();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.detail ?? 'Failed to get a response from Gemini.');
      }

      const data: { answer: string } = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer.trim() || "I couldn't find an answer to that.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setError(err instanceof Error ? err.message : 'Unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    event,
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] lg:w-[420px] rounded-2xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Gemini Stock Assistant
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-[320px] px-4 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn('flex w-full', {
                    'justify-end': message.role === 'user',
                    'justify-start': message.role === 'assistant',
                  })}
                >
                  <div
                    className={cn(
                      'rounded-2xl border px-4 py-3 text-sm shadow-sm',
                      message.role === 'user'
                        ? 'max-w-[80%] bg-blue-600 text-blue-50'
                        : 'max-w-[85%] bg-muted text-muted-foreground',
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-border px-4 py-3">
            {error && (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}
            <Textarea
              placeholder="Ask about stocks, sectors, or trends..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              disabled={isLoading}
            />
            <div className="mt-3 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    Send
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        size="lg"
        onClick={handleToggle}
        className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-6 text-white shadow-lg hover:bg-blue-700"
      >
        <MessageCircle className="h-5 w-5" />
        {isOpen ? 'Close assistant' : 'Ask about stocks'}
      </Button>
    </div>
  );
}

