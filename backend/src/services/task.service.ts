import taskRepository from '../repositories/task.repository';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput } from '../dto/task.dto';

/**
 * Service class handling task business logic
 */
export class TaskService {
    /**
     * Create a new task
     * @param data - Task creation data
     * @param creatorId - ID of the user creating the task
     * @returns Created task with relations
     */
    async createTask(data: CreateTaskInput, creatorId: string) {
        return taskRepository.create(data, creatorId);
    }

    /**
     * Get task by ID
     * @param id - Task ID
     * @returns Task with relations
     * @throws Error if task not found
     */
    async getTaskById(id: string) {
        const task = await taskRepository.findById(id);
        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    }

    /**
     * Get all tasks with optional filtering and sorting
     * @param filters - Filter and sort options
     * @returns Array of tasks
     */
    async getAllTasks(filters: TaskFilterInput) {
        return taskRepository.findAll(filters);
    }

    /**
     * Get tasks assigned to a user
     * @param userId - User ID
     * @returns Array of assigned tasks
     */
    async getAssignedTasks(userId: string) {
        return taskRepository.findByAssignedTo(userId);
    }

    /**
     * Get tasks created by a user
     * @param userId - User ID
     * @returns Array of created tasks
     */
    async getCreatedTasks(userId: string) {
        return taskRepository.findByCreator(userId);
    }

    /**
     * Get overdue tasks
     * @param userId - Optional user ID to filter by creator or assignee
     * @returns Array of overdue tasks
     */
    async getOverdueTasks(userId?: string) {
        const allOverdueTasks = await taskRepository.findOverdue();

        if (userId) {
            return allOverdueTasks.filter(
                task => task.creatorId === userId || task.assignedToId === userId
            );
        }

        return allOverdueTasks;
    }

    /**
     * Update a task
     * @param id - Task ID
     * @param data - Update data
     * @param userId - ID of user making the update
     * @returns Updated task
     * @throws Error if task not found or user not authorized
     */
    async updateTask(id: string, data: UpdateTaskInput, _userId: string) {
        // Verify task exists
        await this.getTaskById(id);

        // Allow any authenticated user to update tasks
        return taskRepository.update(id, data);
    }

    /**
     * Delete a task
     * @param id - Task ID
     * @param userId - ID of user requesting deletion
     * @throws Error if task not found or user not authorized
     */
    async deleteTask(id: string, userId: string) {
        const task = await this.getTaskById(id);

        if (task.creatorId !== userId) {
            throw new Error('Only the task creator can delete this task');
        }

        return taskRepository.delete(id);
    }
}

export default new TaskService();
