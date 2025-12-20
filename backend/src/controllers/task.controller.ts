import { Request, Response } from 'express';
import taskService from '../services/task.service';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput } from '../dto/task.dto';

/**
 * Controller handling task endpoints
 */
export class TaskController {
    /**
     * Create a new task
     * POST /api/v1/tasks
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).userId;
            const data: CreateTaskInput = req.body;
            const task = await taskService.createTask(data, userId);
            res.status(201).json(task);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all tasks with optional filters
     * GET /api/v1/tasks
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filters: TaskFilterInput = {
                status: req.query.status as any,
                priority: req.query.priority as any,
                sortBy: req.query.sortBy as any,
                sortOrder: req.query.sortOrder as any,
            };
            const tasks = await taskService.getAllTasks(filters);
            res.status(200).json(tasks);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get single task by ID
     * GET /api/v1/tasks/:id
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const task = await taskService.getTaskById(id);
            res.status(200).json(task);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update a task
     * PATCH /api/v1/tasks/:id
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = (req as any).userId;
            const data: UpdateTaskInput = req.body;
            const task = await taskService.updateTask(id, data, userId);
            res.status(200).json(task);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a task
     * DELETE /api/v1/tasks/:id
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = (req as any).userId;
            await taskService.deleteTask(id, userId);
            res.status(204).send();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get tasks assigned to current user
     * GET /api/v1/tasks/dashboard/assigned
     */
    async getAssigned(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).userId;
            const tasks = await taskService.getAssignedTasks(userId);
            res.status(200).json(tasks);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get tasks created by current user
     * GET /api/v1/tasks/dashboard/created
     */
    async getCreated(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).userId;
            const tasks = await taskService.getCreatedTasks(userId);
            res.status(200).json(tasks);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get overdue tasks
     * GET /api/v1/tasks/dashboard/overdue
     */
    async getOverdue(_req: Request, res: Response): Promise<void> {
        try {
            const tasks = await taskService.getOverdueTasks();
            res.status(200).json(tasks);
        } catch (error) {
            throw error;
        }
    }
}

export default new TaskController();
