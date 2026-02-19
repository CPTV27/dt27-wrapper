import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { AlertTriangle, CheckCircle2, TrendingUp, Layers, CheckSquare, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../lib/themes';
import { useTasks } from '../context/TaskContext';
import { CreativeTools } from '../components/CreativeTools';
import { fetchEntities, fetchRevenue } from '../services/data';
import { Entity } from '../lib/mockData';

// Fallback data if API fails or is not configured
import { entities as mockEntities, gaps as mockGaps, revenueData as mockRevenue } from '../lib/mockData';

export function Dashboard() {
  const { currentTheme } = useTheme();
  const theme = themes[currentTheme];
  const { tasks } = useTasks();
  
  const [entities, setEntities] = useState<Entity[]>(mockEntities);
  const [revenue, setRevenue] = useState(mockRevenue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // In a real app, we'd get the ID from context or env based on territory
      // For Big Muddy
      const spreadsheetId = import.meta.env.VITE_SCOUT_SPREADSHEET_ID;
      
      // Only attempt fetch if we have a way to get the ID, otherwise fall back to mock
      if (spreadsheetId) {
        try {
          const fetchedEntities = await fetchEntities(spreadsheetId);
          if (fetchedEntities.length > 0) setEntities(fetchedEntities);
          
          const fetchedRevenue = await fetchRevenue(spreadsheetId);
          if (fetchedRevenue.length > 0) setRevenue(fetchedRevenue);
        } catch (e) {
          console.error("Data load failed, using mock", e);
        }
      } else {
        console.log("No spreadsheet ID configured, using mock data");
      }
      setIsLoading(false);
    }
    
    loadData();
  }, [currentTheme]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-theme-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Entities', value: entities.length, icon: Layers, change: '+2' },
          { label: 'Active Gaps', value: mockGaps.filter(g => g.status === 'Open').length, icon: AlertTriangle, change: '-1', alert: true },
          { label: 'Revenue (MTD)', value: '$82,000', icon: TrendingUp, change: '+12%' },
          { label: 'Pending Tasks', value: tasks.filter(t => t.status === 'Pending').length, icon: CheckSquare, change: 'Active' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-theme-secondary/30 backdrop-blur-sm border border-theme-border p-6 rounded-2xl hover:border-theme-primary/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl bg-theme-bg border border-theme-border", stat.alert ? "text-theme-accent" : "text-theme-primary")}>
                <stat.icon size={20} />
              </div>
              <span className={cn("text-xs font-mono px-2 py-1 rounded-full bg-theme-bg border border-theme-border", stat.alert ? "text-red-500" : "text-green-500")}>
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-heading font-medium mb-1">{stat.value}</div>
            <div className="text-sm text-theme-muted font-sans">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Entity Status - 2 Cols */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-theme-secondary/20 border border-theme-border rounded-3xl p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-heading">Entity Ecosystem</h3>
            <button className="text-xs font-mono uppercase tracking-wider text-theme-primary hover:text-theme-accent">View Full Map</button>
          </div>
          
          <div className="space-y-4">
            {entities.slice(0, 5).map((entity, i) => (
              <div key={entity.id} className="group flex items-center justify-between p-4 bg-theme-bg/50 border border-theme-border rounded-xl hover:border-theme-primary transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-2 h-12 rounded-full",
                    entity.status === 'Active' ? "bg-green-500" : 
                    entity.status === 'Gap' ? "bg-red-500" : "bg-yellow-500"
                  )} />
                  <div>
                    <div className="font-bold text-lg">{entity.name}</div>
                    <div className="text-xs text-theme-muted font-mono uppercase">{entity.type} • {entity.layer}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono">{entity.buildStatus}% Built</div>
                  <div className="w-24 h-1 bg-theme-secondary rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-theme-primary transition-all duration-1000" 
                      style={{ width: `${entity.buildStatus}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Creative Tools - 1 Col */}
        <CreativeTools />
      </div>

      {/* Bottom Row: Revenue & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-theme-secondary/20 border border-theme-border rounded-3xl p-8 flex flex-col"
        >
          <h3 className="text-xl font-heading mb-6">Revenue Projection</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <Tooltip 
                  contentStyle={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.foreground }}
                  cursor={{ fill: theme.colors.secondary, opacity: 0.2 }}
                />
                <XAxis 
                  dataKey="month" 
                  stroke={theme.colors.muted} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {revenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === revenue.length - 1 ? theme.colors.accent : theme.colors.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Task List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-theme-secondary/20 border border-theme-border rounded-3xl p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-heading">Active Tasks</h3>
            <span className="text-xs font-mono text-theme-muted">Synced with Google Tasks</span>
          </div>
          <div className="space-y-4">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 bg-theme-bg/80 border border-theme-border rounded-xl">
                <div className={cn(
                  "w-4 h-4 rounded-full border-2",
                  task.status === 'Completed' ? "bg-theme-primary border-theme-primary" : "border-theme-muted"
                )} />
                <div className="flex-1">
                  <div className={cn("font-medium", task.status === 'Completed' && "line-through text-theme-muted")}>{task.title}</div>
                  <div className="flex gap-4 text-xs text-theme-muted mt-1">
                    <span>Due: {task.dueDate}</span>
                    <span>Assignee: {task.assignee}</span>
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-xs font-mono uppercase",
                  task.priority === 'High' ? "bg-red-500/20 text-red-500" : "bg-theme-secondary text-theme-muted"
                )}>
                  {task.priority}
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-theme-muted py-8">
                No active tasks. Ask the AI to create one.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
