import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/task.service';
import { userService } from '../services/user.service';
import { Status, Priority } from '../types';

const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().min(1, 'Description is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    priority: z.nativeEnum(Priority, 'Invalid priority'),
    status: z.nativeEnum(Status, 'Invalid status'),
    assignedToId: z.string().optional().nullable(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => userService.getUsers(),
        enabled: isOpen,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateTaskFormData>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            priority: Priority.MEDIUM,
            status: Status.TODO,
        },
    });

    const createTaskMutation = useMutation({
        mutationFn: (data: CreateTaskFormData) => taskService.createTask({
            ...data,
            assignedToId: data.assignedToId || null,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            reset();
            onClose();
        },
    });

    const onSubmit = (data: CreateTaskFormData) => {
        // Convert datetime-local to ISO datetime string
        const dueDateISO = new Date(data.dueDate).toISOString();
        createTaskMutation.mutate({
            ...data,
            dueDate: dueDateISO,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#323940] rounded-xl shadow-2xl border border-[#738496]/20 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in text-[#b6c2cf]">
                <h2 className="text-xl font-bold mb-6 text-[#b6c2cf]">
                    Create New Task
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#b6c2cf] mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('title')}
                            className="input-field"
                            placeholder="Enter task title"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#b6c2cf] mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('description')}
                            className="input-field min-h-[100px]"
                            placeholder="Enter task description"
                            rows={4}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#b6c2cf] mb-2">
                            Due Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            {...register('dueDate')}
                            className="input-field"
                        />
                        {errors.dueDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#b6c2cf] mb-2">
                                Priority <span className="text-red-500">*</span>
                            </label>
                            <select {...register('priority')} className="input-field">
                                <option value={Priority.LOW}>Low</option>
                                <option value={Priority.MEDIUM}>Medium</option>
                                <option value={Priority.HIGH}>High</option>
                                <option value={Priority.URGENT}>Urgent</option>
                            </select>
                            {errors.priority && (
                                <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#b6c2cf] mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select {...register('status')} className="input-field">
                                <option value={Status.TODO}>To Do</option>
                                <option value={Status.IN_PROGRESS}>In Progress</option>
                                <option value={Status.REVIEW}>Review</option>
                                <option value={Status.COMPLETED}>Completed</option>
                            </select>
                            {errors.status && (
                                <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#b6c2cf] mb-2">
                            Assign To
                        </label>
                        <select {...register('assignedToId')} className="input-field">
                            <option value="">Unassigned</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {createTaskMutation.error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {(createTaskMutation.error as any).response?.data?.error || 'Failed to create task'}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={createTaskMutation.isPending}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                onClose();
                            }}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
