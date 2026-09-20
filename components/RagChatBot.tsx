import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, BookOpen, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { ChatMessage, RAGCitation } from '../types/legal.js';

interface RagChatBotProps {
  documentId: string;
  documentText: string;
  highContrast: boolean;
}

const QUICK_SUGGESTIONS = [
  'What are my termination and cancellation rights?',
  'Is there an auto-renewal penalty or trap?',
  'Am I liable for unlimited damages or legal fees?',
  'Who owns the intellectual property and code created?',
  'What happens if I dispute an invoice or miss a deadline?',
];

export function RagChatBot({ documentId, documentText, highContrast }: RagChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content:
        'Hello! I am your document-grounded legal assistant. Ask me anything about this contract, such as cancellation notice windows, liability caps, or payment terms. All my answers are grounded strictly in the text of your uploaded document.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          documentText,
          query: textToSend.trim(),
          chatHistory: messages.slice(-4).map(m => ({ sender: m.sender, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to query RAG assistant.');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: 'msg_' + Date.now() + 1,
        sender: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing query';
      setError(msg);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          content: `I encountered an issue analyzing the document: ${msg}. Please ensure your document text is uploaded.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div
      id="rag-chatbot-container"
      role="region"
      aria-label="Grounded Document Q&A Chatbot"
      className={`rounded-2xl border flex flex-col h-full min-h-[480px] max-h-[640px] transition-all overflow-hidden backdrop-blur-md shadow-lg ${
        highContrast
          ? 'bg-neutral-900/90 border-neutral-700/80 text-white'
          : 'bg-slate-900/80 border-cyan-500/30 text-white'
      }`}
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs">
            <Bot className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
              RAG Contract Q&A Assistant
            </h3>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              In-Memory Vector Search Active &middot; Zero-Cost Serverless
            </span>
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() =>
            setMessages([
              {
                id: 'init-fresh',
                sender: 'assistant',
                content: 'Chat cleared. Ask any question about your contract!',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          aria-label="Clear chat conversation"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white p-2 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold mt-1 shadow-2xs">
                  <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : highContrast
                    ? 'bg-neutral-800/90 border border-neutral-700 text-white rounded-tl-none'
                    : 'bg-neutral-100/90 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/70 dark:border-neutral-700 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Grounded Source Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-neutral-300/40 dark:border-neutral-700 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Retrieved Document Citations ({msg.citations.length})</span>
                    </span>

                    <div className="space-y-1.5">
                      {msg.citations.map((citation, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-white/90 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-700 text-[11px] text-neutral-700 dark:text-neutral-300 space-y-0.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-neutral-900 dark:text-neutral-100">
                            <span>{citation.clauseTitle}</span>
                            {citation.score && (
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                                Match: {citation.score}%
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-400 italic line-clamp-2">
                            &ldquo;{citation.snippet}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span className="block text-[10px] text-right mt-1.5 opacity-70 font-medium">
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 text-xs font-bold mt-1 shadow-2xs">
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              )}
            </motion.div>
          );
        })}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
              <Bot className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-neutral-100/90 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs flex items-center gap-2.5 shadow-2xs">
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span>Searching in-memory vector store & generating grounded explanation...</span>
            </div>
          </motion.div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2.5 border-t border-cyan-500/20 bg-slate-950/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-semibold text-cyan-300/80 whitespace-nowrap">
          Suggested:
        </span>
        {QUICK_SUGGESTIONS.map((suggestion, idx) => (
          <motion.button
            key={idx}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            disabled={isLoading}
            onClick={() => handleSendMessage(suggestion)}
            className="px-3 py-1 rounded-full text-[11px] bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 text-slate-200 whitespace-nowrap transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-2xs"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 border-t border-cyan-500/20 bg-slate-950/90 flex items-center gap-2.5"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question about this contract (e.g. 'Can I terminate early?')..."
          aria-label="Ask a question about the document"
          disabled={isLoading}
          className="flex-1 py-2.5 px-4 rounded-xl border border-cyan-500/30 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-slate-900 text-white placeholder-slate-400 transition-all"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.04, boxShadow: '0 0 15px rgba(56, 189, 248, 0.5)' }}
          whileTap={{ scale: 0.96 }}
          disabled={isLoading || !input.trim()}
          aria-label="Send question"
          className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-md"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
        </motion.button>
      </form>
    </div>
  );
}

