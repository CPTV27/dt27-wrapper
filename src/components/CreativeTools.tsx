import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image, Video, FileText, Sparkles, Loader2, Wand2, MonitorPlay } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { generateProImage, generateVideo, editImage } from '../services/gemini';

export function CreativeTools() {
  const { currentTheme } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'edit'>('image');
  const [prompt, setPrompt] = useState('');
  
  // Pro Image Settings
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      if (activeTab === 'image') {
        const url = await generateProImage(prompt, currentTheme, imageSize, aspectRatio);
        setGeneratedContent(url);
      } else if (activeTab === 'video') {
        const url = await generateVideo(prompt, aspectRatio === '9:16' ? '9:16' : '16:9');
        setGeneratedContent(url);
      } else if (activeTab === 'edit') {
        // For edit, we'd need an input image. For prototype, we'll assume editing the last generated one or a placeholder
        if (generatedContent) {
           const url = await editImage(generatedContent, prompt);
           setGeneratedContent(url);
        } else {
           alert("Generate an image first to edit it.");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Generation failed. See console.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-theme-secondary/20 border border-theme-border rounded-3xl p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading">Creative Studio</h3>
        <div className="flex gap-2">
          {[
            { id: 'image', icon: Image, label: 'Pro Image' },
            { id: 'video', icon: Video, label: 'Veo Video' },
            { id: 'edit', icon: Wand2, label: 'Edit' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => { setActiveTab(tool.id as any); setGeneratedContent(null); }}
              className={`p-2 rounded-lg transition-colors ${activeTab === tool.id ? 'bg-theme-primary text-theme-bg' : 'bg-theme-secondary text-theme-muted hover:text-theme-fg'}`}
              title={tool.label}
            >
              <tool.icon size={18} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Controls */}
        <div className="flex gap-2 mb-2">
          {activeTab !== 'edit' && (
             <select 
               value={aspectRatio} 
               onChange={(e) => setAspectRatio(e.target.value)}
               className="bg-theme-bg border border-theme-border rounded px-2 py-1 text-xs"
             >
               <option value="1:1">1:1</option>
               <option value="16:9">16:9</option>
               <option value="9:16">9:16</option>
               <option value="4:3">4:3</option>
               <option value="3:4">3:4</option>
             </select>
          )}
          {activeTab === 'image' && (
             <select 
               value={imageSize} 
               onChange={(e) => setImageSize(e.target.value as any)}
               className="bg-theme-bg border border-theme-border rounded px-2 py-1 text-xs"
             >
               <option value="1K">1K</option>
               <option value="2K">2K</option>
               <option value="4K">4K</option>
             </select>
          )}
        </div>

        <div className="relative aspect-video bg-theme-bg/50 rounded-xl border border-theme-border flex items-center justify-center overflow-hidden group">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-2 text-theme-primary">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-xs font-mono uppercase tracking-wider">Generating...</span>
            </div>
          ) : generatedContent ? (
            activeTab === 'video' ? (
              <video src={generatedContent} controls className="w-full h-full object-cover" />
            ) : (
              <img src={generatedContent} alt="Generated" className="w-full h-full object-cover" />
            )
          ) : (
            <div className="text-center p-8 text-theme-muted">
              <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a tool and generate content</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={activeTab === 'edit' ? "Describe changes..." : "Describe your vision..."}
            className="flex-1 bg-theme-bg border border-theme-border rounded-xl px-4 py-3 focus:outline-none focus:border-theme-primary"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="px-6 bg-theme-primary text-theme-bg font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          </button>
        </div>
        
        <div className="text-center">
           <span className="text-[10px] font-mono text-theme-muted uppercase tracking-widest">
             Model: {activeTab === 'image' ? 'Gemini 3 Pro Image' : activeTab === 'video' ? 'Veo 3.1' : 'Gemini 2.5 Flash Image'}
           </span>
        </div>
      </div>
    </motion.div>
  );
}
