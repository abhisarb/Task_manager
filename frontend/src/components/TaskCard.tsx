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
        <div className={`kanban-card group animate-fade-in ${isOverdue ? 'border-l-4 border-[#ae2e24]' : ''}`}>
            {/* Cover image or Header color strip could go here if we had one */}

            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                    <span className={priorityClasses[task.priority]}>{task.priority}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                        className="text-[#9fadbc] hover:text-[#b6c2cf] p-1 rounded hover:bg-[#A6C5E229]"
                    >
                        <span className="sr-only">Edit</span>
                        ✎
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                        className="text-[#9fadbc] hover:text-[#ae2e24] p-1 rounded hover:bg-[#A6C5E229]"
                    >
                        <span className="sr-only">Delete</span>
                        ×
                    </button>
                </div>
            </div>

            <h3 className="text-[#b6c2cf] text-sm font-medium mb-2 leading-tight">{task.title}</h3>

            <div className="flex items-center justify-between text-xs text-[#9fadbc] mt-3">
                <div className="flex items-center gap-3">
                    {/* Due Date */}
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-[#ae2e24] bg-[#ae2e24]/10 px-1 rounded' : ''}`}>
                        <span>🕒</span>
                        <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                    </div>
                </div>

                {/* Assignee Avatar (Placeholder) */}
                {task.assignedTo && (
                    <div className="w-6 h-6 rounded-full bg-[#1d2125] border border-[#738496] flex items-center justify-center text-[10px] text-[#b6c2cf]" title={task.assignedTo.name}>
                        {task.assignedTo.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Hidden Status Select - kept for functionality via parent but hidden visually as column defines status */}
            <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
                className="hidden"
            >
                <option value={Status.TODO}>To Do</option>
                <option value={Status.IN_PROGRESS}>In Progress</option>
                <option value={Status.REVIEW}>Review</option>
                <option value={Status.COMPLETED}>Completed</option>
            </select>
        </div>
    );
};
