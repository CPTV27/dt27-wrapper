import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Loader2, Mic, Volume2, BrainCircuit, Radio } from 'lucide-react';
import { sendMessageToGemini, transcribeAudio, generateSpeech } from '../services/gemini';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "I am the Studio AI. I've analyzed the Big Muddy ecosystem. How can I assist with operations today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useReasoning, setUseReasoning] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
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
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Convert messages to history format for Gemini
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const responseText = await sendMessageToGemini(
        history, 
        userMessage.text,
        currentTheme,
        { useReasoning, useSearch, useMaps: true }, // Enable Maps by default for context
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
        text: responseText || "Task created.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = async () => {
    if (!isRecording) {
      setIsRecording(true);
      // In a real app, we'd capture audio here. 
      // For prototype, we'll simulate a short delay then "transcribe" a mock audio or prompt for text
      // To truly implement, we need MediaRecorder API + Blob -> Base64
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
                <span className="font-heading font-bold">Studio AI</span>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={() => setUseReasoning(!useReasoning)}
                   className={cn("p-1 rounded", useReasoning ? "bg-theme-primary text-theme-bg" : "text-theme-muted hover:text-theme-fg")}
                   title="Thinking Mode (Gemini 3 Pro)"
                 >
                   <BrainCircuit size={16} />
                 </button>
                 <button 
                   className="p-1 text-theme-muted hover:text-theme-fg"
                   title="Live Mode (Coming Soon)"
                 >
                   <Radio size={16} />
                 </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[80%] p-3 rounded-xl text-sm leading-relaxed relative group",
                    msg.role === 'user'
                      ? "ml-auto bg-theme-primary text-theme-bg rounded-tr-none"
                      : "mr-auto bg-theme-secondary text-theme-fg rounded-tl-none border border-theme-border"
                  )}
                >
                  {msg.text}
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
                <div className="mr-auto bg-theme-secondary text-theme-fg rounded-xl rounded-tl-none p-3 border border-theme-border">
                  <Loader2 size={16} className="animate-spin" />
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
                  placeholder={useReasoning ? "Ask complex questions..." : "Ask about the ecosystem..."}
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
                <span>{useReasoning ? "Gemini 3 Pro (Thinking)" : "Gemini 3 Flash"}</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} />
                  <span>Search Grounding</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
