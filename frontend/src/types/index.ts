export const Priority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

export const Status = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    REVIEW: 'REVIEW',
    COMPLETED: 'COMPLETED',
} as const;

export type Status = typeof Status[keyof typeof Status];

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    status: Status;
    createdAt: string;
    updatedAt: string;
    creator: User;
    assignedTo?: User | null;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface CreateTaskData {
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    status: Status;
    assignedToId?: string | null;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: Priority;
    status?: Status;
    assignedToId?: string | null;
}
