
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Todo, ToDoTrackerInitialData } from "../types";

interface UseTodoTrackerProps {
  initialData?: ToDoTrackerInitialData;
  onSave?: (data: ToDoTrackerInitialData) => void;
}

export const useTodoTracker = ({ initialData, onSave }: UseTodoTrackerProps) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterOwner, setFilterOwner] = useState("all");

  useEffect(() => {
    if (initialData?.todos) {
      setTimeout(() => {
        setTodos(initialData.todos || []);
      }, 0);
    }
  }, [initialData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) {
        onSave({ todos });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [todos, onSave]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [todos]);

  const uniqueOwners = useMemo(() => {
    const owners = todos.map(t => t.owner);
    return [...new Set(owners)].sort();
  }, [todos]);

  const filteredTodos = useMemo(() => {
    if (filterOwner === "all") return todos;
    return todos.filter(t => t.owner === filterOwner);
  }, [todos, filterOwner]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !newOwner.trim() || !newDueDate) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      task: newTask,
      owner: newOwner,
      dueDate: newDueDate,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTodos(prev => [newTodo, ...prev]);
    setNewTask("");
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return {
    todos, setTodos, 
    newTask, setNewTask,
    newOwner, setNewOwner,
    newDueDate, setNewDueDate,
    filterOwner, setFilterOwner,
    stats,
    uniqueOwners,
    filteredTodos,
    addTodo,
    toggleTodo,
    deleteTodo
  };
}
