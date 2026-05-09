import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse, Group, Member, Overview,
  Task, ChecklistItem, Dashboard, CreateTaskPayload, TaskStatus, ApiResponse,
} from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://10.0.2.2:8000/api';

console.log('API BASE_URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
    hasToken: !!token,
    data: config.data,
  });
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`[API Error] ${error.response?.status || 'Network Error'} ${error.config?.url}`, error.response?.data);
    if (error.response?.status === 401) {
      console.log('Unauthorized detected, clearing session...');
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

// AUTH
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  return res.data.data;
};

export const register = async (name: string, email: string, password: string, passwordConfirmation: string): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
  return res.data.data;
};

// GROUPS
export const getMyGroups = async (): Promise<Group[]> => {
  const res = await api.get<ApiResponse<Group[]>>('/groups');
  return res.data.data;
};

export const getGroupDetail = async (id: string): Promise<Group> => {
  const res = await api.get<ApiResponse<Group>>(`/groups/${id}`);
  return res.data.data;
};

export const createGroup = async (data: { name: string; description: string; deadline?: string | null }): Promise<Group> => {
  const res = await api.post<ApiResponse<Group>>('/groups', data);
  return res.data.data;
};

export const deleteGroup = async (id: string): Promise<void> => {
  await api.delete(`/groups/${id}`);
};

export const joinGroup = async (code: string): Promise<Group> => {
  const res = await api.post<ApiResponse<Group>>('/groups/join', { code });
  return res.data.data;
};

// MEMBERS
export const getMembers = async (groupId: string): Promise<Member[]> => {
  const res = await api.get<Member[]>(`/groups/${groupId}/members`);
  return res.data;
};

// OVERVIEW
export const getOverview = async (groupId: string): Promise<Overview | null> => {
  const res = await api.get<Overview | null>(`/groups/${groupId}/overview`);
  return res.data;
};

export const updateOverview = async (groupId: string, content: string): Promise<Overview> => {
  const res = await api.post<Overview>(`/groups/${groupId}/overview`, { content });
  return res.data;
};

// TASKS
export const getTasks = async (groupId: string): Promise<Task[]> => {
  const res = await api.get<ApiResponse<Task[]>>(`/groups/${groupId}/tasks`);
  return res.data.data;
};

export const createTask = async (groupId: string, data: CreateTaskPayload): Promise<Task> => {
  const res = await api.post<ApiResponse<Task>>(`/groups/${groupId}/tasks`, data);
  return res.data.data;
};

export const getTaskDetail = async (taskId: string): Promise<Task> => {
  const res = await api.get<ApiResponse<Task>>(`/tasks/${taskId}`);
  return res.data.data;
};

export const updateTask = async (taskId: string, data: Partial<Task>): Promise<Task> => {
  const res = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}`, data);
  return res.data.data;
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Task> => {
  const res = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, { status });
  return res.data.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};

// CHECKLISTS
export const getChecklists = async (taskId: string): Promise<ChecklistItem[]> => {
  const res = await api.get<ChecklistItem[]>(`/tasks/${taskId}/checklist`);
  return res.data;
};

export const addChecklist = async (taskId: string, item: string): Promise<ChecklistItem> => {
  const res = await api.post<ApiResponse<ChecklistItem>>(`/tasks/${taskId}/checklist`, { item });
  return res.data.data;
};

export const toggleChecklist = async (checklistId: string, completed: boolean): Promise<ChecklistItem> => {
  const res = await api.patch<ApiResponse<ChecklistItem>>(`/checklists/${checklistId}`, { completed });
  return res.data.data;
};

export const deleteChecklist = async (checklistId: string): Promise<void> => {
  await api.delete(`/checklists/${checklistId}`);
};

// DASHBOARD
export const getDashboard = async (): Promise<Dashboard> => {
  const res = await api.get<Dashboard>('/dashboard');
  return res.data;
}
