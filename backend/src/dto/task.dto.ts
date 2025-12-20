import { z } from 'zod';
import { Priority, Status } from '@prisma/client';

export const CreateTaskDto = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
    description: z.string().min(1, 'Description is required'),
    dueDate: z.string().datetime('Invalid date format'),
    priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
    status: z.nativeEnum(Status).default(Status.TODO),
    assignedToId: z.string().uuid().optional().nullable(),
});

export const UpdateTaskDto = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().min(1).optional(),
    dueDate: z.string().datetime().optional(),
    priority: z.nativeEnum(Priority).optional(),
    status: z.nativeEnum(Status).optional(),
    assignedToId: z.string().uuid().optional().nullable(),
});

export const TaskFilterDto = z.object({
    status: z.nativeEnum(Status).optional(),
    priority: z.nativeEnum(Priority).optional(),
    sortBy: z.enum(['dueDate', 'createdAt', 'priority']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type CreateTaskInput = z.infer<typeof CreateTaskDto>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskDto>;
export type TaskFilterInput = z.infer<typeof TaskFilterDto>;
