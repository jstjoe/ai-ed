import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, Status, AppSettings, DEFAULT_STATUSES } from './types';

interface AppState {
  tasks: Task[];
  settings: AppSettings;
}

type Action =
  | { type: 'ADD_TASK'; task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_TASK'; id: string; updates: Partial<Task> }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'MOVE_TASK'; taskId: string; statusId: string; index: number }
  | { type: 'REORDER_TASKS'; statusId: string; startIndex: number; endIndex: number }
  | { type: 'UPDATE_STATUSES'; statuses: Status[] }
  | { type: 'ADD_STATUS'; status: Omit<Status, 'id'> }
  | { type: 'UPDATE_STATUS'; id: string; updates: Partial<Status> }
  | { type: 'DELETE_STATUS'; id: string }
  | { type: 'LOAD_STATE'; state: AppState };

const STORAGE_KEY = 'task-tracker-v1';

const defaultState: AppState = {
  tasks: [],
  settings: { statuses: DEFAULT_STATUSES },
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as AppState;
    // merge in any new default statuses if they don't exist
    return parsed;
  } catch {
    return defaultState;
  }
}

function reducer(state: AppState, action: Action): AppState {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.task,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case 'UPDATE_TASK': {
      const updatedTasks = state.tasks.map(t =>
        t.id === action.id ? { ...t, ...action.updates, updatedAt: now } : t
      );
      return { ...state, tasks: updatedTasks };
    }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };

    case 'MOVE_TASK': {
      const task = state.tasks.find(t => t.id === action.taskId);
      if (!task) return state;
      const withoutTask = state.tasks.filter(t => t.id !== action.taskId);
      const status = state.settings.statuses.find(s => s.id === action.statusId);
      const completedAt = status?.isTerminal ? now : task.completedAt;
      const updatedTask: Task = { ...task, statusId: action.statusId, updatedAt: now, completedAt };
      // insert at index among same-status tasks
      const sameStatus = withoutTask.filter(t => t.statusId === action.statusId);
      const otherStatus = withoutTask.filter(t => t.statusId !== action.statusId);
      sameStatus.splice(action.index, 0, updatedTask);
      return { ...state, tasks: [...otherStatus, ...sameStatus] };
    }

    case 'REORDER_TASKS': {
      const columnTasks = state.tasks.filter(t => t.statusId === action.statusId);
      const otherTasks = state.tasks.filter(t => t.statusId !== action.statusId);
      const [removed] = columnTasks.splice(action.startIndex, 1);
      columnTasks.splice(action.endIndex, 0, removed);
      return { ...state, tasks: [...otherTasks, ...columnTasks] };
    }

    case 'UPDATE_STATUSES':
      return { ...state, settings: { ...state.settings, statuses: action.statuses } };

    case 'ADD_STATUS': {
      const newStatus: Status = { ...action.status, id: uuidv4() };
      return {
        ...state,
        settings: {
          ...state.settings,
          statuses: [...state.settings.statuses, newStatus].sort((a, b) => a.order - b.order),
        },
      };
    }

    case 'UPDATE_STATUS': {
      const updatedStatuses = state.settings.statuses.map(s =>
        s.id === action.id ? { ...s, ...action.updates } : s
      );
      return { ...state, settings: { ...state.settings, statuses: updatedStatuses } };
    }

    case 'DELETE_STATUS': {
      const fallback = state.settings.statuses.find(s => s.id !== action.id);
      const updatedTasks = fallback
        ? state.tasks.map(t => t.statusId === action.id ? { ...t, statusId: fallback.id } : t)
        : state.tasks;
      return {
        ...state,
        tasks: updatedTasks,
        settings: {
          ...state.settings,
          statuses: state.settings.statuses.filter(s => s.id !== action.id),
        },
      };
    }

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, statusId: string, index: number) => void;
  reorderTasks: (statusId: string, startIndex: number, endIndex: number) => void;
  updateStatuses: (statuses: Status[]) => void;
  addStatus: (status: Omit<Status, 'id'>) => void;
  updateStatus: (id: string, updates: Partial<Status>) => void;
  deleteStatus: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState, () => loadState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) =>
    dispatch({ type: 'ADD_TASK', task }), []);
  const updateTask = useCallback((id: string, updates: Partial<Task>) =>
    dispatch({ type: 'UPDATE_TASK', id, updates }), []);
  const deleteTask = useCallback((id: string) =>
    dispatch({ type: 'DELETE_TASK', id }), []);
  const moveTask = useCallback((taskId: string, statusId: string, index: number) =>
    dispatch({ type: 'MOVE_TASK', taskId, statusId, index }), []);
  const reorderTasks = useCallback((statusId: string, startIndex: number, endIndex: number) =>
    dispatch({ type: 'REORDER_TASKS', statusId, startIndex, endIndex }), []);
  const updateStatuses = useCallback((statuses: Status[]) =>
    dispatch({ type: 'UPDATE_STATUSES', statuses }), []);
  const addStatus = useCallback((status: Omit<Status, 'id'>) =>
    dispatch({ type: 'ADD_STATUS', status }), []);
  const updateStatus = useCallback((id: string, updates: Partial<Status>) =>
    dispatch({ type: 'UPDATE_STATUS', id, updates }), []);
  const deleteStatus = useCallback((id: string) =>
    dispatch({ type: 'DELETE_STATUS', id }), []);

  return (
    <StoreContext.Provider value={{
      state, dispatch,
      addTask, updateTask, deleteTask,
      moveTask, reorderTasks,
      updateStatuses, addStatus, updateStatus, deleteStatus,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
