import { motion } from 'motion/react';
import { themes, ThemeId } from '../lib/themes';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export function BrandSelector() {
  const { currentTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-theme-bg text-theme-fg transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-heading font-medium tracking-tight">
            Select Your Territory
          </h1>
          <p className="text-xl text-theme-muted max-w-2xl mx-auto font-light">
            Each world defines a distinct operational reality. Choose the atmosphere that matches your client's ambition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.values(themes) as any[]).map((theme) => (
            <motion.button
              key={theme.id}
              onClick={() => setTheme(theme.id as ThemeId)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative group flex flex-col h-full text-left rounded-xl overflow-hidden border-2 transition-all duration-300",
                currentTheme === theme.id 
                  ? "border-theme-primary shadow-xl shadow-theme-primary/20" 
                  : "border-theme-border hover:border-theme-muted"
              )}
            >
              {/* Preview Header */}
              <div 
                className="h-32 p-6 flex flex-col justify-between transition-colors duration-500"
                style={{ 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.foreground,
                  fontFamily: theme.typography.heading
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl font-bold">{theme.name}</span>
                  {currentTheme === theme.id && (
                    <div className="bg-theme-primary text-theme-bg rounded-full p-1">
                      <Check size={16} />
                    </div>
                  )}
                </div>
                <div className="text-xs uppercase tracking-widest opacity-70 font-sans">
                  {theme.territory}
                </div>
              </div>

              {/* Description Body */}
              <div className="flex-1 p-6 bg-theme-secondary/50 backdrop-blur-sm space-y-4">
                <p className="text-sm text-theme-fg/80 leading-relaxed">
                  {theme.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-xs text-theme-muted uppercase tracking-wider font-mono">Vibe</div>
                  <div className="text-sm font-medium">{theme.vibe}</div>
                </div>

                {/* Color Swatches */}
                <div className="flex gap-2 pt-4">
                  {[theme.colors.primary, theme.colors.accent, theme.colors.background].map((color, i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full border border-white/10 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <motion.button
            onClick={handleEnter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-theme-primary text-theme-bg font-bold text-lg rounded-full shadow-lg shadow-theme-primary/20 hover:shadow-theme-primary/40 transition-all cursor-pointer"
          >
            Enter The Studio
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
