import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Box, Zap, Briefcase, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { fetchEntities } from '../services/data';
import { Entity, entities as mockEntities } from '../lib/mockData';

const layerConfig = {
  'Foundation': { icon: Box, color: 'bg-blue-500' },
  'Network': { icon: Layers, color: 'bg-purple-500' },
  'Machine': { icon: Zap, color: 'bg-amber-500' },
  'Business': { icon: Briefcase, color: 'bg-green-500' },
};

export function Ecosystem() {
  const { currentTheme } = useTheme();
  const [entities, setEntities] = useState<Entity[]>(mockEntities);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const spreadsheetId = import.meta.env.VITE_SCOUT_SPREADSHEET_ID;
      if (spreadsheetId) {
        try {
          const fetched = await fetchEntities(spreadsheetId);
          if (fetched.length > 0) setEntities(fetched);
        } catch (e) {
          console.error("Failed to load ecosystem", e);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const groupedEntities = entities.reduce((acc, entity) => {
    const layer = entity.layer || 'Foundation';
    if (!acc[layer]) acc[layer] = [];
    acc[layer].push(entity);
    return acc;
  }, {} as Record<string, Entity[]>);

  const layers = ['Foundation', 'Network', 'Machine', 'Business'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading font-medium">Ecosystem Map</h2>
          <p className="text-theme-muted mt-2">Operational layers and entity status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)] overflow-x-auto">
        {layers.map((layer, i) => (
          <motion.div
            key={layer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-theme-secondary/20 border border-theme-border rounded-3xl p-6 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("p-2 rounded-lg text-white", layerConfig[layer as keyof typeof layerConfig]?.color || 'bg-gray-500')}>
                {React.createElement(layerConfig[layer as keyof typeof layerConfig]?.icon || Box, { size: 20 })}
              </div>
              <h3 className="font-heading text-lg">{layer}</h3>
              <span className="ml-auto text-xs font-mono text-theme-muted bg-theme-bg px-2 py-1 rounded-full">
                {groupedEntities[layer]?.length || 0}
              </span>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              {groupedEntities[layer]?.map((entity) => (
                <div key={entity.id} className="bg-theme-bg/80 border border-theme-border p-4 rounded-xl hover:border-theme-primary transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm">{entity.name}</span>
                    {entity.status === 'Gap' && <AlertTriangle size={14} className="text-red-500" />}
                  </div>
                  <div className="text-xs text-theme-muted font-mono mb-3">{entity.type}</div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-theme-muted">
                      <span>Build</span>
                      <span>{entity.buildStatus}%</span>
                    </div>
                    <div className="h-1 bg-theme-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", entity.status === 'Gap' ? "bg-red-500" : "bg-theme-primary")} 
                        style={{ width: `${entity.buildStatus}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!groupedEntities[layer] || groupedEntities[layer].length === 0) && (
                <div className="text-center text-theme-muted text-sm py-8 border-2 border-dashed border-theme-border rounded-xl">
                  No entities
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
