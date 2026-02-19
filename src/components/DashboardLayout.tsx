import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { LayoutDashboard, Map, BarChart3, Users, Settings, LogOut, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { ChatWidget } from './ChatWidget';

export function DashboardLayout() {
  const { currentTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Game Board', path: '/dashboard' },
    { icon: Map, label: 'Ecosystem', path: '/dashboard/ecosystem' },
    { icon: BarChart3, label: 'Revenue', path: '/dashboard/revenue' },
    { icon: Users, label: 'Team', path: '/dashboard/team' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-theme-bg text-theme-fg font-sans transition-colors duration-500 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-20 lg:w-64 border-r border-theme-border flex flex-col fixed h-full bg-theme-bg/80 backdrop-blur-md z-50"
      >
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-theme-border">
          <div className="w-10 h-10 bg-theme-primary rounded-full flex items-center justify-center text-theme-bg font-bold text-xl font-heading">
            S
          </div>
          <span className="hidden lg:block ml-3 font-heading font-bold text-xl tracking-wider">The Studio</span>
        </div>

        <nav className="flex-1 py-8 space-y-2 px-2 lg:px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center p-3 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-theme-primary text-theme-bg shadow-lg shadow-theme-primary/20" 
                    : "hover:bg-theme-secondary text-theme-muted hover:text-theme-fg"
                )}
              >
                <Icon size={24} className={cn("min-w-[24px]", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                <span className={cn("hidden lg:block ml-3 font-medium", isActive ? "font-bold" : "")}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-theme-accent rounded-r-full lg:hidden"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-theme-border">
          <button className="flex items-center justify-center lg:justify-start w-full p-3 text-theme-muted hover:text-theme-accent transition-colors rounded-lg hover:bg-theme-secondary/50">
            <LogOut size={20} />
            <span className="hidden lg:block ml-3 font-mono text-xs uppercase tracking-wider">Disconnect</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-sm font-mono text-theme-muted uppercase tracking-widest">Client</h2>
            <h1 className="text-3xl font-heading font-medium">Big Muddy Blues Hotels</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <div className="flex items-center gap-2 text-xs font-mono text-theme-muted bg-theme-secondary/50 px-2 py-1 rounded">
                <Sparkles size={12} className="text-theme-primary" />
                <span>Gemini 2.5 Pro</span>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold">Chase Pierson</div>
              <div className="text-xs text-theme-muted">Administrator</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-theme-secondary border border-theme-border overflow-hidden">
              <img src="https://picsum.photos/seed/chase/200" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <Outlet />
      </main>

      <ChatWidget />
    </div>
  );
}
