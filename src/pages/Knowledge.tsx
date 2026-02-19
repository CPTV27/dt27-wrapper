import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FileText, Upload, Sparkles, Play, Pause, BookOpen, Search, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { sendMessageToGemini, generateSpeech } from '../services/gemini';
import { cn } from '../lib/utils';

interface Document {
  id: string;
  name: string;
  type: string;
  content: string; // In a real app, this would be a URL or blob
  summary?: string;
}

// Mock documents for prototype
const initialDocs: Document[] = [
  { id: '1', name: 'Big Muddy Brand Guidelines.pdf', type: 'PDF', content: 'Brand guidelines content...' },
  { id: '2', name: 'Historical Archives - Natchez.txt', type: 'TXT', content: 'Historical data...' },
  { id: '3', name: 'Q3 Financial Report.pdf', type: 'PDF', content: 'Financial data...' },
];

export function Knowledge() {
  const { currentTheme } = useTheme();
  const [documents, setDocuments] = useState<Document[]>(initialDocs);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleUpload = () => {
    // Simulate upload
    const newDoc = {
      id: Date.now().toString(),
      name: `New Upload ${documents.length + 1}.txt`,
      type: 'TXT',
      content: 'New content...'
    };
    setDocuments([...documents, newDoc]);
  };

  const handleAsk = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user' as const, text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsProcessing(true);

    try {
      // Contextualize with documents
      const context = `Context from Knowledge Base:\n${documents.map(d => `${d.name}: ${d.content.substring(0, 100)}...`).join('\n')}`;
      const prompt = `${context}\n\nUser Question: ${chatInput}`;
      
      const response = await sendMessageToGemini(
        chatHistory, 
        prompt, 
        currentTheme,
        { useReasoning: true } // Use Pro for deep analysis
      );

      setChatHistory(prev => [...prev, { role: 'model', text: response || "I couldn't find an answer in the documents." }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAudioOverview = async () => {
    if (isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate generating a podcast script from docs
      const script = "Welcome to the Big Muddy Deep Dive. Today we're looking at the brand guidelines and historical archives. The key takeaway is the fusion of Art Deco luxury with raw Delta blues heritage...";
      
      const audioUrl = await generateSpeech(script);
      if (audioUrl) {
        if (!audioRef.current) audioRef.current = new Audio(audioUrl);
        else audioRef.current.src = audioUrl;
        
        audioRef.current.play();
        setIsPlayingAudio(true);
        audioRef.current.onended = () => setIsPlayingAudio(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading font-medium">Knowledge Base</h2>
          <p className="text-theme-muted mt-2">Deep analysis of your documents (NotebookLM style).</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={generateAudioOverview}
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors",
              isPlayingAudio ? "bg-red-500 text-white" : "bg-theme-secondary text-theme-fg hover:bg-theme-secondary/80"
            )}
          >
            {isPlayingAudio ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlayingAudio ? "Stop Overview" : "Audio Overview"}</span>
          </button>
          <button 
            onClick={handleUpload}
            className="px-4 py-2 bg-theme-primary text-theme-bg rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Upload size={16} />
            <span>Add Source</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Source List */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-theme-secondary/20 border border-theme-border rounded-3xl p-6 flex flex-col overflow-hidden"
        >
          <h3 className="text-lg font-heading mb-4 flex items-center gap-2">
            <BookOpen size={18} />
            Sources ({documents.length})
          </h3>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all group",
                  selectedDoc?.id === doc.id 
                    ? "bg-theme-primary/10 border-theme-primary" 
                    : "bg-theme-bg/50 border-theme-border hover:border-theme-muted"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-theme-secondary rounded-lg text-theme-muted group-hover:text-theme-primary transition-colors">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{doc.name}</div>
                    <div className="text-xs text-theme-muted mt-1">{doc.type} • Added today</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chat / Analysis Area */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-theme-secondary/20 border border-theme-border rounded-3xl p-6 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-theme-muted opacity-50">
                <Sparkles size={48} className="mb-4" />
                <p className="text-lg font-medium">Ask anything about your sources</p>
                <p className="text-sm">"Summarize the brand guidelines"</p>
                <p className="text-sm">"What are the key financial risks?"</p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "ml-auto bg-theme-primary text-theme-bg rounded-tr-none" 
                      : "mr-auto bg-theme-secondary text-theme-fg rounded-tl-none border border-theme-border"
                  )}
                >
                  {msg.text}
                </div>
              ))
            )}
            {isProcessing && (
              <div className="mr-auto bg-theme-secondary text-theme-fg rounded-2xl rounded-tl-none p-4 border border-theme-border w-16 flex items-center justify-center">
                <div className="w-2 h-2 bg-theme-muted rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-theme-muted rounded-full animate-bounce [animation-delay:-0.15s] mx-1" />
                <div className="w-2 h-2 bg-theme-muted rounded-full animate-bounce" />
              </div>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask a question about your sources..."
              className="w-full bg-theme-bg border border-theme-border rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:border-theme-primary transition-colors"
            />
            <button 
              onClick={handleAsk}
              disabled={!chatInput.trim() || isProcessing}
              className="absolute right-2 top-2 p-2 bg-theme-primary text-theme-bg rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Search size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
