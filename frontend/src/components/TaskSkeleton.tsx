import React from 'react';

export const TaskSkeleton: React.FC = () => {
    return (
        <div className="glass-card p-6 animate-pulse">
            {/* Header with title and priority badge */}
            <div className="flex justify-between items-start mb-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>

            {/* Due date and assignee */}
            <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="flex gap-2">
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                </div>
            </div>

            {/* Shimmer overlay effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
    );
};
