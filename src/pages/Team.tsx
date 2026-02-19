import React from 'react';
import { motion } from 'motion/react';
import { Users, Mail, Phone, Shield, CheckSquare } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const teamMembers = [
  { id: '1', name: 'Chase Pierson', role: 'Administrator', email: 'chase@bigmuddy.com', avatar: 'https://picsum.photos/seed/chase/200' },
  { id: '2', name: 'Ari Aslin', role: 'Creative Director', email: 'ari@bigmuddy.com', avatar: 'https://picsum.photos/seed/ari/200' },
  { id: '3', name: 'Delta Dawn', role: 'AI Operator', email: 'dawn@studio.ai', avatar: 'https://picsum.photos/seed/dawn/200', isAi: true },
];

export function Team() {
  const { tasks } = useTasks();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading font-medium">Team</h2>
          <p className="text-theme-muted mt-2">Manage access and assignments.</p>
        </div>
        <button className="px-4 py-2 bg-theme-primary text-theme-bg rounded-lg font-medium text-sm flex items-center gap-2">
          <Users size={16} />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, i) => {
          const memberTasks = tasks.filter(t => t.assignee.includes(member.name.split(' ')[0]));
          
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-theme-secondary/20 border border-theme-border rounded-3xl p-6 group hover:border-theme-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-theme-border group-hover:border-theme-primary transition-colors">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                </div>
                {member.isAi && (
                  <span className="px-2 py-1 bg-theme-accent/20 text-theme-accent text-[10px] font-mono uppercase rounded-full border border-theme-accent/50">
                    AI Agent
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-heading font-medium">{member.name}</h3>
              <p className="text-theme-muted text-sm mb-4">{member.role}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-theme-muted">
                  <Mail size={14} />
                  <span>{member.email}</span>
                </div>
                {!member.isAi && (
                  <div className="flex items-center gap-2 text-sm text-theme-muted">
                    <Shield size={14} />
                    <span>Admin Access</span>
                  </div>
                )}
              </div>

              <div className="border-t border-theme-border pt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">Active Tasks</span>
                  <span className="bg-theme-secondary px-2 py-0.5 rounded-full text-xs">{memberTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {memberTasks.slice(0, 2).map(task => (
                    <div key={task.id} className="flex items-center gap-2 text-xs text-theme-muted truncate">
                      <CheckSquare size={12} />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                  {memberTasks.length === 0 && <div className="text-xs text-theme-muted italic">No active tasks</div>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
