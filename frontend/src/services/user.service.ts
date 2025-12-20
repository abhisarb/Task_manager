import api from './api';
import type { User } from '../types';

export const userService = {
    getUsers: async (): Promise<User[]> => {
        const response = await api.get('/users');
        return response.data;
    },
};
