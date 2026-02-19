import React, { createContext, useContext, useState } from 'react';

export interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: 'Pending' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  completeTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', title: 'Review architectural renderings', assignee: 'Chase', dueDate: '2026-02-25', status: 'Pending', priority: 'High' },
    { id: 't2', title: 'Approve Q3 Content Calendar', assignee: 'Ari', dueDate: '2026-02-28', status: 'Pending', priority: 'Medium' },
  ]);

  const addTask = (task: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      status: 'Pending',
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const completeTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'Completed' } : t));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, completeTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
