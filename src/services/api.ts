import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://localhost:8000";

const api = axios.create({ baseURL: API_URL });

// Auto-attach token ke semua request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

// Groups
export const getMyGroups = () => api.get('/groups');
export const getGroupDetail = (id: string) => api.get(`/groups/${id}`);
export const createGroup = (data: string) => api.post('/groups', data);
export const getGroupMembers = (id: string) => api.get(`/groups/${id}/members`);
export const joinGroup = (id: string) => api.post(`/groups/${id}/members`);
export const leaveGroup = (id: string) => api.delete(`/groups/${id}/members/me`);

// Task Overview
export const getOverview = (groupId: string) => api.get(`/groups/${groupId}/overview`);
export const updateOverview = (groupId: string, content: string) =>
  api.post(`/groups/${groupId}/overview`, { content });

// Tasks
export const getTasks = (groupId: string) => api.get(`/groups/${groupId}/tasks`);
export const createTask = (groupId: string, data: string) => api.post(`/groups/${groupId}/tasks`, data);
export const updateTask = (taskId: string, data: string) => api.patch(`/tasks/${taskId}`, data);
export const updateTaskStatus = (taskId: string, status: string) =>
  api.patch(`/tasks/${taskId}/status`, { status });
export const deleteTask = (taskId: string) => api.delete(`/tasks/${taskId}`);

// Checklists
export const addChecklist = (taskId: string, item: string) =>
  api.post(`/tasks/${taskId}/checklist`, { item });
export const toggleChecklist = (checklistId: string, completed: string) =>
  api.patch(`/checklists/${checklistId}`, { completed });

// Dashboard
export const getDashboard = () => api.get('/dashboard');

export default api;
