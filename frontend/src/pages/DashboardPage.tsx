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
import { CalendarView } from '../components/CalendarView';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'created' | 'overdue'>('all');
    const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');
    // Removed statusFilter as the board is split by status columns
    const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const toast = useToast();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Fetch tasks based on activeTab
    const { data: allTasks, isLoading: loadingAll } = useQuery({
        queryKey: ['tasks', priorityFilter], // Removed statusFilter dependency
        queryFn: () => taskService.getTasks({
            // status: statusFilter || undefined, // No longer filtering by status in query
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

    // Unified Tasks List
    const tasks = activeTab === 'all' ? allTasks :
        activeTab === 'assigned' ? assignedTasks :
            activeTab === 'created' ? createdTasks :
                overdueTasks;

    const isLoading = loadingAll || loadingAssigned || loadingCreated || loadingOverdue;

    // Mutation for updating tasks
    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => taskService.updateTask(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] });
            const previousTasks = queryClient.getQueryData(['tasks', priorityFilter]);

            queryClient.setQueryData(
                ['tasks', priorityFilter],
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
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    ['tasks', priorityFilter],
                    context.previousTasks
                );
            }
            toast.error('Failed to update task');
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id: string) => taskService.deleteTask(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] });
            const previousTasks = queryClient.getQueryData(['tasks', priorityFilter]);

            queryClient.setQueryData(
                ['tasks', priorityFilter],
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
        onError: (_error, _variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    ['tasks', priorityFilter],
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
            socketService.on('task:created', () => queryClient.invalidateQueries({ queryKey: ['tasks'] }));
            socketService.on('task:updated', () => queryClient.invalidateQueries({ queryKey: ['tasks'] }));
            socketService.on('task:deleted', () => queryClient.invalidateQueries({ queryKey: ['tasks'] }));
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

    const handleEdit = (task: Task) => setEditingTask(task);
    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTaskMutation.mutate(id);
        }
    };

    // Columns Configuration
    const columns = [
        { id: Status.TODO, title: 'To Do' },
        { id: Status.IN_PROGRESS, title: 'In Progress' },
        { id: Status.REVIEW, title: 'Review' },
        { id: Status.COMPLETED, title: 'Completed' },
    ];

    return (
        <div className="flex flex-col h-screen bg-[#1d2125] overflow-hidden relative">
            {/* Unified Background */}
            <div className="absolute inset-0 z-0 bg-grid-pattern overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-indigo-500/20 rounded-full blur-[100px] animate-blob-bounce animation-delay-4000"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Navbar */}
                <nav className="border-b border-[#ffffff]/5 p-3 bg-[#1d2125]/60 backdrop-blur-md sticky top-0 z-20 flex-shrink-0 shadow-sm">
                    <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-6">
                            <h1 className="text-lg font-bold text-[#b6c2cf] flex items-center gap-2">
                                <span className="bg-[#579dff] text-[#1d2125] p-1 rounded">TM</span> Task Manager
                            </h1>
                            <div className="hidden md:flex items-center gap-1">
                                <button onClick={() => setActiveTab('all')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-[#579dff] text-[#1d2125]' : 'text-[#9fadbc] hover:bg-[#A6C5E229]'}`}>Board</button>
                                <button onClick={() => setActiveTab('assigned')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'assigned' ? 'bg-[#579dff] text-[#1d2125]' : 'text-[#9fadbc] hover:bg-[#A6C5E229]'}`}>Assigned to Me</button>
                                <button onClick={() => setActiveTab('created')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'created' ? 'bg-[#579dff] text-[#1d2125]' : 'text-[#9fadbc] hover:bg-[#A6C5E229]'}`}>Created by Me</button>
                                <button onClick={() => setActiveTab('overdue')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'overdue' ? 'bg-[#ae2e24] text-white' : 'text-[#9fadbc] hover:bg-[#A6C5E229]'}`}>Overdue</button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value as Priority | '')}
                                    className="bg-[#A6C5E229] border-none text-[#9fadbc] text-sm rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#85b8ff]"
                                >
                                    <option value="">Filter by Priority</option>
                                    <option value={Priority.LOW}>Low</option>
                                    <option value={Priority.MEDIUM}>Medium</option>
                                    <option value={Priority.HIGH}>High</option>
                                    <option value={Priority.URGENT}>Urgent</option>
                                </select>
                            </div>
                            <div className="bg-[#A6C5E229] p-1 rounded flex items-center gap-1 mr-2">
                                <button
                                    onClick={() => setViewMode('board')}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'board' ? 'bg-[#579dff] text-[#1d2125]' : 'text-[#9fadbc] hover:text-[#b6c2cf]'}`}
                                >
                                    Board
                                </button>
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'calendar' ? 'bg-[#579dff] text-[#1d2125]' : 'text-[#9fadbc] hover:text-[#b6c2cf]'}`}
                                >
                                    Calendar
                                </button>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#579dff] to-[#ae2e24] flex items-center justify-center text-xs font-bold text-white border-2 border-[#1d2125]" title={user?.name}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] text-sm font-medium px-3 py-1.5 rounded transition-colors"
                            >
                                Create
                            </button>
                            <button onClick={handleLogout} className="text-[#9fadbc] hover:text-[#ae2e24] text-sm font-medium px-3 py-1.5">
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden relative">
                    {viewMode === 'board' ? (
                        <div className="h-full overflow-x-auto overflow-y-hidden">
                            <div className="h-full p-4 flex gap-4 min-w-max">
                                {/* Columns */}
                                {columns.map(column => (
                                    <div key={column.id} className="kanban-column bg-[#101204]/80 backdrop-blur-sm border border-[#ffffff]/5 shadow-lg">
                                        {/* Column Header */}
                                        <div className="flex justify-between items-center mb-3 px-1">
                                            <h2 className="font-semibold text-[#b6c2cf] text-sm">{column.title}</h2>
                                            <span className="text-xs text-[#9fadbc] bg-[#22272b] px-2 py-0.5 rounded-full">
                                                {tasks?.filter((t: Task) => t.status === column.id).length || 0}
                                            </span>
                                        </div>

                                        {/* Tasks Container */}
                                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                            {isLoading ? (
                                                <div className="space-y-3">
                                                    <TaskSkeleton />
                                                    <TaskSkeleton />
                                                </div>
                                            ) : (
                                                tasks?.filter((task: Task) => task.status === column.id).map((task: Task) => (
                                                    <div key={task.id} className="mb-2">
                                                        <TaskCard
                                                            task={task}
                                                            onEdit={handleEdit}
                                                            onDelete={handleDelete}
                                                            onStatusChange={handleStatusChange}
                                                        />
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* 'Add a card' placeholder at bottom of column */}
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="mt-2 flex items-center gap-1 text-[#9fadbc] hover:bg-[#ffffff]/10 p-2 rounded text-sm w-full text-left transition-colors"
                                        >
                                            <span>+</span> Add a card
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <CalendarView tasks={tasks || []} onEventClick={handleEdit} />
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
        </div>
    );
};
