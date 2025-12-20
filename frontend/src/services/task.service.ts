import api from './api';
import type { Task, CreateTaskData, UpdateTaskData } from '../types';

export const taskService = {
    getTasks: async (filters?: {
        status?: string;
        priority?: string;
        sortBy?: string;
        sortOrder?: string;
    }): Promise<Task[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

        const response = await api.get(`/tasks?${params.toString()}`);
        return response.data;
    },

    getTaskById: async (id: string): Promise<Task> => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },

    createTask: async (data: CreateTaskData): Promise<Task> => {
        const response = await api.post('/tasks', data);
        return response.data;
    },

    updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
        const response = await api.patch(`/tasks/${id}`, data);
        return response.data;
    },

    deleteTask: async (id: string): Promise<void> => {
        await api.delete(`/tasks/${id}`);
    },

    getAssignedTasks: async (): Promise<Task[]> => {
        const response = await api.get('/tasks/dashboard/assigned');
        return response.data;
    },

    getCreatedTasks: async (): Promise<Task[]> => {
        const response = await api.get('/tasks/dashboard/created');
        return response.data;
    },

    getOverdueTasks: async (): Promise<Task[]> => {
        const response = await api.get('/tasks/dashboard/overdue');
        return response.data;
    },
};
