import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/task.service';
import { TaskCard } from '../components/TaskCard';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { TaskSkeleton } from '../components/TaskSkeleton';
import type { Task } from '../types';
import { Status, Priority } from '../types';
import socketService from '../services/socket.service';
import useToast from '../hooks/useToast';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'created' | 'overdue'>('all');
    const [statusFilter, setStatusFilter] = useState<Status | ''>('');
    const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const toast = useToast();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const { data: allTasks, isLoading: loadingAll } = useQuery({
        queryKey: ['tasks', statusFilter, priorityFilter],
        queryFn: () => taskService.getTasks({
            status: statusFilter || undefined,
            priority: priorityFilter || undefined,
            sortBy: 'dueDate',
            sortOrder: 'asc',
        }),
        enabled: activeTab === 'all',
    });

    const { data: assignedTasks, isLoading: loadingAssigned } = useQuery({
        queryKey: ['tasks', 'assigned'],
        queryFn: () => taskService.getAssignedTasks(),
        enabled: activeTab === 'assigned',
    });

    const { data: createdTasks, isLoading: loadingCreated } = useQuery({
        queryKey: ['tasks', 'created'],
        queryFn: () => taskService.getCreatedTasks(),
        enabled: activeTab === 'created',
    });

    const { data: overdueTasks, isLoading: loadingOverdue } = useQuery({
        queryKey: ['tasks', 'overdue'],
        queryFn: () => taskService.getOverdueTasks(),
        enabled: activeTab === 'overdue',
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => taskService.updateTask(id, data),
        onMutate: async ({ id, data }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ['tasks'] });

            // Snapshot previous values
            const previousTasks = queryClient.getQueryData(['tasks', statusFilter, priorityFilter]);

            // Optimistically update
            queryClient.setQueryData(
                ['tasks', statusFilter, priorityFilter],
                (old: Task[] | undefined) => {
                    if (!old) return old;
                    return old.map((task) =>
                        task.id === id ? { ...task, ...data } : task
                    );
                }
            );

            return { previousTasks };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task updated successfully');
        },
        onError: (_error, _variables, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    ['tasks', statusFilter, priorityFilter],
                    context.previousTasks
                );
            }
            toast.error('Failed to update task');
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id: string) => taskService.deleteTask(id),
        onMutate: async (id) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ['tasks'] });

            // Snapshot previous values
            const previousTasks = queryClient.getQueryData(['tasks', statusFilter, priorityFilter]);

            // Optimistically remove task
            queryClient.setQueryData(
                ['tasks', statusFilter, priorityFilter],
                (old: Task[] | undefined) => {
                    if (!old) return old;
                    return old.filter((task) => task.id !== id);
                }
            );

            return { previousTasks };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task deleted successfully');
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    ['tasks', statusFilter, priorityFilter],
                    context.previousTasks
                );
            }
            toast.error('Failed to delete task');
        },
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            socketService.connect(token);

            socketService.on('task:created', () => {
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            });

            socketService.on('task:updated', () => {
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            });

            socketService.on('task:deleted', () => {
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            });

            socketService.on('task:assigned', (data: any) => {
                alert(`New task assigned: ${data.task.title}`);
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            });
        }

        return () => {
            socketService.off('task:created');
            socketService.off('task:updated');
            socketService.off('task:deleted');
            socketService.off('task:assigned');
        };
    }, [queryClient]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        socketService.disconnect();
        navigate('/login');
    };

    const handleStatusChange = (id: string, status: Status) => {
        updateTaskMutation.mutate({ id, data: { status } });
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTaskMutation.mutate(id);
        }
    };

    const tasks = activeTab === 'all' ? allTasks :
        activeTab === 'assigned' ? assignedTasks :
            activeTab === 'created' ? createdTasks :
                overdueTasks;

    const isLoading = loadingAll || loadingAssigned || loadingCreated || loadingOverdue;

    return (
        <div className="min-h-screen">
            <nav className="glass-card mb-8 p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        Task Manager
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">Welcome, {user.name}</span>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="btn-primary text-sm"
                        >
                            + Create Task
                        </button>
                        <button onClick={handleLogout} className="btn-secondary text-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'all' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        All Tasks
                    </button>
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'assigned' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Assigned to Me
                    </button>
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'created' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Created by Me
                    </button>
                    <button
                        onClick={() => setActiveTab('overdue')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'overdue' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Overdue
                    </button>
                </div>

                {activeTab === 'all' && (
                    <div className="flex gap-4 mb-6">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as Status | '')}
                            className="input-field"
                        >
                            <option value="">All Statuses</option>
                            <option value={Status.TODO}>To Do</option>
                            <option value={Status.IN_PROGRESS}>In Progress</option>
                            <option value={Status.REVIEW}>Review</option>
                            <option value={Status.COMPLETED}>Completed</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value as Priority | '')}
                            className="input-field"
                        >
                            <option value="">All Priorities</option>
                            <option value={Priority.LOW}>Low</option>
                            <option value={Priority.MEDIUM}>Medium</option>
                            <option value={Priority.HIGH}>High</option>
                            <option value={Priority.URGENT}>Urgent</option>
                        </select>
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <TaskSkeleton key={i} />
                        ))}
                    </div>
                ) : tasks && tasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks?.map((task: Task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </div>
                ) : null}

                {!isLoading && tasks?.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No tasks found</p>
                    </div>
                )}
            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditTaskModal
                isOpen={!!editingTask}
                task={editingTask}
                onClose={() => setEditingTask(null)}
            />
        </div>
    );
};
