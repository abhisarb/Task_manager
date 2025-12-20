import React from 'react';
import type { Task } from '../types';
import { Priority, Status } from '../types';
import { format } from 'date-fns';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: Status) => void;
}

const priorityClasses: Record<string, string> = {
    [Priority.LOW]: 'badge-low',
    [Priority.MEDIUM]: 'badge-medium',
    [Priority.HIGH]: 'badge-high',
    [Priority.URGENT]: 'badge-urgent',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== Status.COMPLETED;

    return (
        <div className={`glass-card p-6 hover:shadow-xl transition-all duration-200 animate-fade-in ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800 flex-1">{task.title}</h3>
                <div className="flex gap-2">
                    <span className={priorityClasses[task.priority]}>{task.priority}</span>
                </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Due:</span>
                    <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                    </span>
                </div>
                {task.assignedTo && (
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Assigned to:</span>
                        <span>{task.assignedTo.name}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
                    className="text-sm px-3 py-1 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                >
                    <option value={Status.TODO}>To Do</option>
                    <option value={Status.IN_PROGRESS}>In Progress</option>
                    <option value={Status.REVIEW}>Review</option>
                    <option value={Status.COMPLETED}>Completed</option>
                </select>

                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(task)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
