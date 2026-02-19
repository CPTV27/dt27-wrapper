import React from 'react';
import { motion } from 'motion/react';
import { Check, Shield, Database, Cloud, Key } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { themes, ThemeId } from '../lib/themes';
import { cn } from '../lib/utils';

export function Settings() {
  const { currentTheme, setTheme } = useTheme();
  const spreadsheetId = import.meta.env.VITE_SCOUT_SPREADSHEET_ID;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading font-medium">Settings</h2>
          <p className="text-theme-muted mt-2">System configuration and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-secondary/20 border border-theme-border rounded-3xl p-8"
        >
          <h3 className="text-xl font-heading mb-6">Active Territory</h3>
          <div className="space-y-4">
            {Object.values(themes).map((theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                  currentTheme === theme.id 
                    ? "bg-theme-primary/10 border-theme-primary" 
                    : "bg-theme-bg border-theme-border hover:border-theme-muted"
                )}
              >
                <div>
                  <div className="font-bold font-heading">{theme.name}</div>
                  <div className="text-xs text-theme-muted font-mono mt-1">{theme.territory}</div>
                </div>
                {currentTheme === theme.id && (
                  <div className="w-6 h-6 bg-theme-primary rounded-full flex items-center justify-center text-theme-bg">
                    <Check size={14} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-theme-secondary/20 border border-theme-border rounded-3xl p-8"
        >
          <h3 className="text-xl font-heading mb-6">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-theme-bg/50 border border-theme-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                  <Database size={18} />
                </div>
                <div>
                  <div className="font-medium text-sm">Google Sheets</div>
                  <div className="text-xs text-theme-muted font-mono">
                    {spreadsheetId ? 'Connected' : 'Not Configured'}
                  </div>
                </div>
              </div>
              <div className={cn("w-2 h-2 rounded-full", spreadsheetId ? "bg-green-500" : "bg-red-500")} />
            </div>

            <div className="flex items-center justify-between p-4 bg-theme-bg/50 border border-theme-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                  <Cloud size={18} />
                </div>
                <div>
                  <div className="font-medium text-sm">Google Drive</div>
                  <div className="text-xs text-theme-muted font-mono">OAuth Active</div>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-theme-bg/50 border border-theme-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                  <Key size={18} />
                </div>
                <div>
                  <div className="font-medium text-sm">Gemini API</div>
                  <div className="text-xs text-theme-muted font-mono">v2.0 Flash Exp</div>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
