import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Loader2, Mic, Volume2, BrainCircuit, Radio, Zap } from 'lucide-react';
import { sendMessageToGemini, generateSpeech } from '../services/gemini';
import { sendMessageToOperator } from '../services/operator';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  toolsUsed?: string[];
  source?: 'operator' | 'gemini';
}

type ChatMode = 'operator' | 'creative';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "I'm Delta Dawn, Chief of Staff. I have access to every department — bookings, venues, artists, finance, fleet, compliance, and the full C-Suite. I can also generate images, video, and voice through AI Studio. What do you need?",
      timestamp: new Date(),
      source: 'operator',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('operator');
  const [useReasoning, setUseReasoning] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationId] = useState(`studio-${Date.now()}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();
  const { addTask } = useTasks();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (chatMode === 'operator') {
        // Route through velvet-grit operator — Dawn with full C-Suite access
        const history = messages
          .filter(m => m.id !== 'welcome')
          .map(m => ({
            role: m.role === 'model' ? 'assistant' as const : 'user' as const,
            content: m.text,
          }));

        const response = await sendMessageToOperator(input, history, conversationId);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response.message,
          timestamp: new Date(),
          toolsUsed: response.toolsUsed,
          source: 'operator',
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        // Creative mode — use AI Studio Gemini SDK directly for media capabilities
        const history = messages.map(m => ({
          role: m.role,
          text: m.text,
        }));

        const responseText = await sendMessageToGemini(
          history,
          userMessage.text,
          currentTheme,
          { useReasoning, useSearch, useMaps: true },
          (toolName, args) => {
            if (toolName === 'createTask') {
              addTask({
                title: args.title,
                assignee: args.assignee,
                priority: args.priority,
                dueDate: args.dueDate || new Date().toISOString().split('T')[0],
              });
            }
          }
        );

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText || "Done.",
          timestamp: new Date(),
          source: 'gemini',
        };

        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `⚠️ ${error instanceof Error ? error.message : 'Connection failed. Is the operator online?'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = async () => {
    if (!isRecording) {
      setIsRecording(true);
      alert("Microphone access would start here. For prototype, please type.");
      setIsRecording(false);
    }
  };

  const handleTTS = async (text: string) => {
    try {
      const audioUrl = await generateSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (e) {
      console.error("TTS failed", e);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-theme-primary text-theme-bg rounded-full shadow-xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] max-h-[80vh] bg-theme-bg border border-theme-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-theme-border bg-theme-secondary/30 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-theme-primary" />
                <span className="font-heading font-bold">
                  {chatMode === 'operator' ? 'Delta Dawn' : 'Creative Studio'}
                </span>
              </div>
              <div className="flex gap-1">
                {/* Mode Toggle */}
                <button
                  onClick={() => setChatMode(chatMode === 'operator' ? 'creative' : 'operator')}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors",
                    chatMode === 'operator'
                      ? "bg-theme-primary/20 text-theme-primary border border-theme-primary/30"
                      : "bg-theme-accent/20 text-theme-accent border border-theme-accent/30"
                  )}
                  title={chatMode === 'operator' ? 'Switch to Creative mode (images, video, TTS)' : 'Switch to Operator mode (business data, C-Suite)'}
                >
                  {chatMode === 'operator' ? '⚡ Operator' : '🎨 Creative'}
                </button>
                {chatMode === 'creative' && (
                  <button
                    onClick={() => setUseReasoning(!useReasoning)}
                    className={cn("p-1 rounded", useReasoning ? "bg-theme-primary text-theme-bg" : "text-theme-muted hover:text-theme-fg")}
                    title="Thinking Mode (Gemini 3 Pro)"
                  >
                    <BrainCircuit size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[85%] p-3 rounded-xl text-sm leading-relaxed relative group",
                    msg.role === 'user'
                      ? "ml-auto bg-theme-primary text-theme-bg rounded-tr-none"
                      : "mr-auto bg-theme-secondary text-theme-fg rounded-tl-none border border-theme-border"
                  )}
                >
                  {msg.text}
                  {/* Tool badges */}
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-theme-border/50">
                      {msg.toolsUsed.map((tool, i) => (
                        <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-theme-bg/50 text-theme-muted">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                  {msg.role === 'model' && (
                    <button
                      onClick={() => handleTTS(msg.text)}
                      className="absolute -right-6 top-2 opacity-0 group-hover:opacity-100 text-theme-muted hover:text-theme-primary transition-opacity"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="mr-auto bg-theme-secondary text-theme-fg rounded-xl rounded-tl-none p-3 border border-theme-border flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs text-theme-muted font-mono">
                    {chatMode === 'operator' ? 'Consulting the network...' : 'Creating...'}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-theme-border bg-theme-bg">
              <div className="flex gap-2">
                <button
                  onClick={handleMicClick}
                  className={cn("p-2 rounded-lg transition-colors", isRecording ? "bg-red-500 text-white" : "bg-theme-secondary text-theme-muted hover:text-theme-fg")}
                >
                  <Mic size={18} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={chatMode === 'operator' ? "Ask Dawn anything..." : "Generate images, video, audio..."}
                  className="flex-1 bg-theme-secondary/50 border border-theme-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-theme-primary transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-theme-primary text-theme-bg rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-theme-muted font-mono">
                <span>
                  {chatMode === 'operator'
                    ? '⚡ Operator → 20 tools + C-Suite delegation'
                    : useReasoning ? 'Gemini 3 Pro (Thinking)' : 'Gemini 3 Flash'}
                </span>
                {chatMode === 'creative' && (
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} />
                    <span>Search</span>
                  </label>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
