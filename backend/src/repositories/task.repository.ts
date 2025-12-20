import prisma from '../utils/prisma';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput } from '../dto/task.dto';
import { Priority, Status } from '@prisma/client';

/**
 * Repository layer for Task data access
 * Handles all database operations for tasks
 */
export class TaskRepository {
    /**
     * Create a new task
     */
    async create(data: CreateTaskInput, creatorId: string) {
        return prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                dueDate: new Date(data.dueDate),
                priority: data.priority || Priority.MEDIUM,
                status: data.status || Status.TODO,
                creatorId,
                assignedToId: data.assignedToId || null,
            },
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
                assignedTo: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    /**
     * Find task by ID
     */
    async findById(id: string) {
        return prisma.task.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
                assignedTo: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    /**
     * Find all tasks with optional filtering and sorting
     */
    async findAll(filters: TaskFilterInput) {
        const where: any = {};

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.priority) {
            where.priority = filters.priority;
        }

        const orderBy: any = {};
        if (filters.sortBy) {
            orderBy[filters.sortBy] = filters.sortOrder || 'asc';
        } else {
            orderBy.createdAt = 'desc';
        }

        return prisma.task.findMany({
            where,
            orderBy,
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
                assignedTo: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    /**
     * Find tasks assigned to a specific user
     */
    async findByAssignedTo(userId: string) {
        return prisma.task.findMany({
            where: { assignedToId: userId },
            orderBy: { dueDate: 'asc' },
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
                assignedTo: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    /**
     * Find tasks created by a specific user
     */
    async findByCreator(userId: string) {
        return prisma.task.findMany({
            where: { creatorId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
                assignedTo: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    /**
     * Find overdue tasks
     */
    async findOverdue() {
        return prisma.task.findMany({
            where: {
                dueDate: {
                    lt: new Date(),
                },
                status: {
                    not: Status.COMPLETED,
                },
            },
            orderBy: { dueDate: 'asc' },
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
                assignedTo: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    /**
     * Update a task
     */
    async update(id: string, data: UpdateTaskInput) {
        const updateData: any = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
        if (data.priority !== undefined) updateData.priority = data.priority;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;

        return prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
                assignedTo: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    /**
     * Delete a task
     */
    async delete(id: string) {
        return prisma.task.delete({
            where: { id },
        });
    }
}

export default new TaskRepository();
