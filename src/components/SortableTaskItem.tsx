import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../api/tasks';


interface Props {
    task: Task;
    onClick?: (task: Task) => void;
}

const SortableTaskItem = React.memo(({ task, onClick }: Props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.taskId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isOverdue = task.deadline && !task.completed && new Date(task.deadline) < new Date();

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(task)}
            className={`
                p-6 bg-white rounded-xl border border-gray-200
                hover:border-violet-200 hover:ring-1 hover:ring-violet-300 hover:shadow-md
                transition-all duration-300 hover:-translate-y-0.5
                cursor-pointer touch-manipulation transform-gpu
                ${isDragging ? 'shadow-xl z-50' : 'z-0'}
            `}
        >
            <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-gray-800 mb-2">
                        {task.taskText}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            {formatDate(task.createdAt)}
                        </span>
                        {task.deadline && (
                            <span className={`inline-flex items-center gap-1.5 ${isOverdue ? 'text-red-500' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Due {formatDate(task.deadline)}
                            </span>
                        )}
                        {task.timeSpent != null && task.timeSpent > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                                {Math.floor(task.timeSpent / 60)}m logged
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SortableTaskItem;