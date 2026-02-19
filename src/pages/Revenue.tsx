import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../lib/themes';
import { fetchRevenue } from '../services/data';
import { revenueData as mockRevenue } from '../lib/mockData';

export function Revenue() {
  const { currentTheme } = useTheme();
  const theme = themes[currentTheme];
  const [revenue, setRevenue] = useState(mockRevenue);

  useEffect(() => {
    async function loadData() {
      const spreadsheetId = import.meta.env.VITE_SCOUT_SPREADSHEET_ID;
      if (spreadsheetId) {
        try {
          const fetched = await fetchRevenue(spreadsheetId);
          if (fetched.length > 0) setRevenue(fetched);
        } catch (e) {
          console.error("Failed to load revenue", e);
        }
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading font-medium">Revenue Model</h2>
          <p className="text-theme-muted mt-2">Financial projections and actuals.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-theme-primary text-theme-bg rounded-lg font-medium text-sm">Export Report</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue (YTD)', value: '$482,000', change: '+12%', trend: 'up' },
          { label: 'Projected (Q3)', value: '$150,000', change: '+5%', trend: 'up' },
          { label: 'Expenses (YTD)', value: '$124,000', change: '-2%', trend: 'down' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-theme-secondary/30 backdrop-blur-sm border border-theme-border p-6 rounded-2xl"
          >
            <div className="text-sm text-theme-muted mb-2">{stat.label}</div>
            <div className="text-3xl font-heading font-medium mb-2">{stat.value}</div>
            <div className={`flex items-center text-xs font-mono ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {stat.trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {stat.change} vs last year
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-theme-secondary/20 border border-theme-border rounded-3xl p-8 h-[400px] flex flex-col"
        >
          <h3 className="text-xl font-heading mb-6">Monthly Revenue</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <Tooltip 
                  contentStyle={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.foreground }}
                  cursor={{ fill: theme.colors.secondary, opacity: 0.2 }}
                />
                <XAxis dataKey="month" stroke={theme.colors.muted} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme.colors.muted} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {revenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={theme.colors.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-theme-secondary/20 border border-theme-border rounded-3xl p-8 h-[400px] flex flex-col"
        >
          <h3 className="text-xl font-heading mb-6">Growth Trajectory</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue}>
                <Tooltip 
                  contentStyle={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.foreground }}
                />
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
                <XAxis dataKey="month" stroke={theme.colors.muted} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme.colors.muted} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Line type="monotone" dataKey="revenue" stroke={theme.colors.accent} strokeWidth={3} dot={{ r: 4, fill: theme.colors.accent }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
