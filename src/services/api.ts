import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse, Group, Member, Overview,
  Task, ChecklistItem, Dashboard, CreateTaskPayload, TaskStatus,
} from '../types';

// Ganti dengan IP backend saat development:
// - Android emulator : http://10.0.2.2:3001/api
// - iOS simulator   : http://localhost:3001/api
// - HP fisik (Expo) : http://192.168.x.x:3001/api  ← cek IP lokal kamu
const BASE_URL = 'http://10.0.2.2:3001/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', { name, email, password });
  return res.data;
};

// GROUPS
export const getMyGroups = async (): Promise<Group[]> => {
  const res = await api.get('/groups');
  return res.data;
};

export const getGroupDetail = async (id: string): Promise<Group> => {
  const res = await api.get(`/groups/${id}`);
  return res.data;
};

export const createGroup = async (data: { name: string; description: string; deadline?: string | null }): Promise<Group> => {
  const res = await api.post('/groups', data);
  return res.data;
};

export const deleteGroup = async (id: string): Promise<void> => {
  await api.delete(`/groups/${id}`);
};

// MEMBERS
export const getMembers = async (groupId: string): Promise<Member[]> => {
  const res = await api.get(`/groups/${groupId}/members`);
  return res.data;
};

// OVERVIEW
export const getOverview = async (groupId: string): Promise<Overview | null> => {
  const res = await api.get(`/groups/${groupId}/overview`);
  return res.data;
};

export const updateOverview = async (groupId: string, content: string): Promise<Overview> => {
  const res = await api.post(`/groups/${groupId}/overview`, { content });
  return res.data;
};

// TASKS
export const getTasks = async (groupId: string): Promise<Task[]> => {
  const res = await api.get(`/groups/${groupId}/tasks`);
  return res.data;
};

export const createTask = async (groupId: string, data: CreateTaskPayload): Promise<Task> => {
  const res = await api.post(`/groups/${groupId}/tasks`, data);
  return res.data;
};

export const updateTask = async (taskId: string, data: Partial<Task>): Promise<Task> => {
  const res = await api.patch(`/tasks/${taskId}`, data);
  return res.data;
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Task> => {
  const res = await api.patch(`/tasks/${taskId}/status`, { status });
  return res.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};

// CHECKLISTS
export const getChecklists = async (taskId: string): Promise<ChecklistItem[]> => {
  const res = await api.get(`/tasks/${taskId}/checklist`);
  return res.data;
};

export const addChecklist = async (taskId: string, item: string): Promise<ChecklistItem> => {
  const res = await api.post(`/tasks/${taskId}/checklist`, { item });
  return res.data;
};

export const toggleChecklist = async (checklistId: string, completed: boolean): Promise<ChecklistItem> => {
  const res = await api.patch(`/checklists/${checklistId}`, { completed });
  return res.data;
};

export const deleteChecklist = async (checklistId: string): Promise<void> => {
  await api.delete(`/checklists/${checklistId}`);
};

// DASHBOARD
export const getDashboard = async (): Promise<Dashboard> => {
  const res = await api.get('/dashboard');
  return res.data;
}
