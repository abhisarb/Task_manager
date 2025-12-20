import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TaskService } from '../src/services/task.service';

// Mock the task repository
jest.mock('../src/repositories/task.repository', () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findByAssignedTo: jest.fn(),
        findByCreator: jest.fn(),
        findOverdue: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

import taskRepository from '../src/repositories/task.repository';

describe('TaskService', () => {
    let taskService: TaskService;

    beforeEach(() => {
        taskService = new TaskService();
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        it('should create a task with valid data', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                dueDate: new Date().toISOString(),
                priority: 'HIGH' as const,
                status: 'TODO' as const,
                assignedToId: 'user-123',
            };

            const expectedTask = {
                id: 'task-123',
                ...taskData,
                dueDate: new Date(taskData.dueDate),
                createdAt: new Date(),
                updatedAt: new Date(),
                creatorId: 'creator-123',
            };

            // @ts-expect-error - Jest mock typing

            (taskRepository.create as jest.Mock).mockResolvedValue(expectedTask);

            const result = await taskService.createTask(taskData, 'creator-123');

            expect(taskRepository.create).toHaveBeenCalledWith(taskData, 'creator-123');
            expect(result).toEqual(expectedTask);
        });

        it('should create a task without assignee when assignedToId is null', async () => {
            const taskData = {
                title: 'Unassigned Task',
                description: 'Test Description',
                dueDate: new Date().toISOString(),
                priority: 'MEDIUM' as const,
                status: 'TODO' as const,
                assignedToId: null,
            };

            const expectedTask = {
                id: 'task-456',
                ...taskData,
                dueDate: new Date(taskData.dueDate),
                createdAt: new Date(),
                updatedAt: new Date(),
                creatorId: 'creator-123',
            };

            // @ts-expect-error - Jest mock typing

            (taskRepository.create as jest.Mock).mockResolvedValue(expectedTask);

            const result = await taskService.createTask(taskData, 'creator-123');

            expect(result.assignedToId).toBeNull();
        });

        it('should reject task with title longer than 100 characters', async () => {
            const taskData = {
                title: 'A'.repeat(101), // 101 characters
                description: 'Test Description',
                dueDate: new Date().toISOString(),
                priority: 'HIGH' as const,
                status: 'TODO' as const,
                assignedToId: null,
            };

            // @ts-expect-error - Jest mock typing

            (taskRepository.create as jest.Mock).mockRejectedValue(new Error('Validation error: Title too long'));

            await expect(taskService.createTask(taskData, 'creator-123')).rejects.toThrow();
        });
    });

    describe('updateTask', () => {
        it('should update task status successfully', async () => {
            const taskId = 'task-123';
            const updateData = { status: 'COMPLETED' as const };

            const existingTask = {
                id: taskId,
                title: 'Test Task',
                status: 'IN_PROGRESS',
                creatorId: 'creator-123',
                assignedToId: null,
            };

            const updatedTask = {
                ...existingTask,
                status: 'COMPLETED',
                updatedAt: new Date(),
            };

            // @ts-expect-error - Jest mock typing

            (taskRepository.findById as jest.Mock).mockResolvedValue(existingTask);
            // @ts-expect-error - Jest mock typing
            (taskRepository.update as jest.Mock).mockResolvedValue(updatedTask);

            const result = await taskService.updateTask(taskId, updateData, 'creator-123');

            expect(taskRepository.update).toHaveBeenCalledWith(taskId, updateData);
            expect(result.status).toBe('COMPLETED');
        });

        it('should update task assignee successfully', async () => {
            const taskId = 'task-123';
            const newAssigneeId = 'user-456';
            const updateData = { assignedToId: newAssigneeId };

            const existingTask = {
                id: taskId,
                title: 'Test Task',
                assignedToId: 'user-123',
                creatorId: 'creator-123',
            };

            const updatedTask = {
                ...existingTask,
                assignedToId: newAssigneeId,
                updatedAt: new Date(),
            };

            // @ts-expect-error - Jest mock typing

            (taskRepository.findById as jest.Mock).mockResolvedValue(existingTask);
            // @ts-expect-error - Jest mock typing
            (taskRepository.update as jest.Mock).mockResolvedValue(updatedTask);

            const result = await taskService.updateTask(taskId, updateData, 'creator-123');

            expect(result.assignedToId).toBe(newAssigneeId);
        });

        it('should throw error when updating non-existent task', async () => {
            const taskId = 'non-existent';
            const updateData = { status: 'COMPLETED' as const };

            // @ts-expect-error - Jest mock typing

            (taskRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(taskService.updateTask(taskId, updateData, 'user-123')).rejects.toThrow('Task not found');
        });

        it('should throw error when user is not authorized to update', async () => {
            const taskId = 'task-123';
            const updateData = { status: 'COMPLETED' as const };

            const existingTask = {
                id: taskId,
                title: 'Test Task',
                creatorId: 'creator-123',
                assignedToId: 'user-456',
            };

            // @ts-expect-error - Jest mock typing

            (taskRepository.findById as jest.Mock).mockResolvedValue(existingTask);

            await expect(taskService.updateTask(taskId, updateData, 'unauthorized-user')).rejects.toThrow('User not authorized to update this task');
        });
    });

    describe('deleteTask', () => {
        it('should delete task successfully', async () => {
            const taskId = 'task-123';

            const existingTask = {
                id: taskId,
                title: 'Test Task',
                creatorId: 'creator-123',
            };

            // @ts-expect-error - Jest mock typing

            (taskRepository.findById as jest.Mock).mockResolvedValue(existingTask);
            // @ts-expect-error - Jest mock typing
            (taskRepository.delete as jest.Mock).mockResolvedValue(existingTask);

            await taskService.deleteTask(taskId, 'creator-123');

            expect(taskRepository.delete).toHaveBeenCalledWith(taskId);
        });

        it('should throw error when deleting non-existent task', async () => {
            const taskId = 'non-existent';

            // @ts-expect-error - Jest mock typing

            (taskRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(taskService.deleteTask(taskId, 'user-123')).rejects.toThrow('Task not found');
        });

        it('should throw error when non-creator tries to delete', async () => {
            const taskId = 'task-123';

            const existingTask = {
                id: taskId,
                title: 'Test Task',
                creatorId: 'creator-123',
            };

            // @ts-expect-error - Jest mock typing

            (taskRepository.findById as jest.Mock).mockResolvedValue(existingTask);

            await expect(taskService.deleteTask(taskId, 'other-user')).rejects.toThrow('Only the task creator can delete this task');
        });
    });

    describe('getOverdueTasks', () => {
        it('should return only overdue incomplete tasks for a specific user', async () => {
            const userId = 'user-123';
            const now = new Date();
            const yesterday = new Date(now.getTime() - 86400000);

            const allOverdueTasks = [
                {
                    id: 'task-1',
                    title: 'Overdue Task 1',
                    dueDate: yesterday,
                    status: 'TODO',
                    creatorId: userId,
                    assignedToId: null,
                },
                {
                    id: 'task-2',
                    title: 'Overdue Task 2',
                    dueDate: yesterday,
                    status: 'IN_PROGRESS',
                    creatorId: 'other-user',
                    assignedToId: userId,
                },
                {
                    id: 'task-3',
                    title: 'Overdue Task 3',
                    dueDate: yesterday,
                    status: 'TODO',
                    creatorId: 'other-user',
                    assignedToId: 'another-user',
                },
            ];

            // @ts-expect-error - Jest mock typing

            (taskRepository.findOverdue as jest.Mock).mockResolvedValue(allOverdueTasks);

            const result = await taskService.getOverdueTasks(userId);

            expect(taskRepository.findOverdue).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('task-1');
            expect(result[1].id).toBe('task-2');
        });

        it('should return all overdue tasks when no userId is provided', async () => {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 86400000);

            const allOverdueTasks = [
                {
                    id: 'task-1',
                    title: 'Overdue Task 1',
                    dueDate: yesterday,
                    status: 'TODO',
                    creatorId: 'user-1',
                    assignedToId: null,
                },
                {
                    id: 'task-2',
                    title: 'Overdue Task 2',
                    dueDate: yesterday,
                    status: 'IN_PROGRESS',
                    creatorId: 'user-2',
                    assignedToId: 'user-3',
                },
            ];

            // @ts-expect-error - Jest mock typing

            (taskRepository.findOverdue as jest.Mock).mockResolvedValue(allOverdueTasks);

            const result = await taskService.getOverdueTasks();

            expect(taskRepository.findOverdue).toHaveBeenCalled();
            expect(result).toHaveLength(2);
        });
    });

    describe('getTaskById', () => {
        it('should return task when found', async () => {
            const taskId = 'task-123';
            const expectedTask = {
                id: taskId,
                title: 'Test Task',
                creatorId: 'creator-123',
            };

            // @ts-expect-error - Jest mock typing

            (taskRepository.findById as jest.Mock).mockResolvedValue(expectedTask);

            const result = await taskService.getTaskById(taskId);

            expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
            expect(result).toEqual(expectedTask);
        });

        it('should throw error when task not found', async () => {
            const taskId = 'non-existent';

            // @ts-expect-error - Jest mock typing

            (taskRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(taskService.getTaskById(taskId)).rejects.toThrow('Task not found');
        });
    });
});

