import React, { useState, useEffect } from 'react';
import { Task } from '../api/tasks';

interface TaskModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedTask: Partial<Task>) => void;
    onDelete?: (taskId: string) => void;
    onMarkComplete?: (task: Task) => void;
}

export default function TaskModal({ task, isOpen, onClose, onSave, onDelete, onMarkComplete }: TaskModalProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editValues, setEditValues] = useState<Partial<Task>>({
        taskText: task?.taskText || '',
        deadline: '',
        timeSpent: 0
    });

    useEffect(() => {
        if (task) {
            setEditValues({
                taskText: task.taskText,
                deadline: task.deadline || '',
                timeSpent: task.timeSpent || 0
            });
        }
    }, [task?.taskId]);

    useEffect(() => {
        let interval: number;
        if (isRunning) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        setIsRunning(true);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleStop = () => {
        setIsRunning(false);
        const newTimeSpent = (task?.timeSpent || 0) + time;
        onSave({ taskId: task?.taskId, timeSpent: newTimeSpent });
        setEditValues(prev => ({ ...prev, timeSpent: newTimeSpent }));
        setTime(0);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        //compare changes first 
        const changes: Partial<Task> = {};
        (Object.keys(editValues) as (keyof Task)[]).forEach(key => {
            if (editValues[key] !== task?.[key]) {
                (changes as any)[key] = editValues[key];
            }
        });
        if (Object.keys(changes).length === 0) {
            return;
        }
        onSave({
            taskId: task?.taskId,
            ...changes
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (task) {
            setEditValues({
                taskText: task.taskText,
                deadline: task.deadline || '',
                timeSpent: task.timeSpent || 0
            });
        }
        setIsEditing(false);
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (onDelete && task) {
            onDelete(task.taskId);
        }
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            if (isEditing) {
                handleCancel();
            }
            if (isRunning) {
                handleStop();
            }
            onClose();
        }
    };

    if (!isOpen || !task) return null;

    return (
        <div
            className="fixed inset-0 bg-black/10 backdrop-blur-xs backdrop-saturate-150 flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-[#FAF8FF] rounded-2xl shadow-xl p-4 sm:p-8 max-w-2xl w-full my-4 sm:my-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => task && onMarkComplete && onMarkComplete(task)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 font-semibold ${task.completed ? 'bg-gray-500 text-white hover:bg-gray-600' : 'bg-[#8A2BE2] text-white hover:bg-[#7B1FA2]'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {task.completed ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l-3 3m0 0l3 3m-3-3h11a4 4 0 100-8h-1" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            )}
                        </svg>
                        {task.completed ? 'Restore' : 'Mark Complete'}
                    </button>
                    <div className="flex gap-2">
                        {onDelete && !isEditing && !showDeleteConfirm && (
                            <button
                                onClick={handleDeleteClick}
                                className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all duration-200 font-medium text-xs"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        )}
                        {showDeleteConfirm && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-3 py-1 bg-gray-500 text-white rounded-lg text-xs font-medium hover:bg-gray-600 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors duration-200"
                                >
                                    Confirm
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                if (isEditing) {
                                    handleCancel();
                                }
                                onClose();
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Task Fields Section */}
                <div className="border-2 border-[#8A2BE2] rounded-xl p-6 mb-8 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">Task Information</h3>
                        {!isEditing ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center gap-2 px-4 py-2 text-[#8A2BE2] hover:bg-[#F8F4FF] rounded-lg transition-all duration-200 font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-all duration-200 font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#8A2BE2] text-white hover:bg-[#7B1FA2] rounded-lg transition-all duration-200 font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Task Description
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={editValues.taskText}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, taskText: e.target.value }))}
                                    className="w-full p-4 border-2 border-[#8A2BE2] rounded-xl focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20 outline-none transition-colors duration-200 text-gray-800 resize-none"
                                    rows={4}
                                    placeholder="Enter task description..."
                                />
                            ) : (
                                <div className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 min-h-[120px] flex items-start">
                                    {editValues.taskText}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Deadline
                                </label>
                                {isEditing ? (
                                    <input
                                        type="datetime-local"
                                        value={editValues.deadline}
                                        onChange={(e) => setEditValues(prev => ({ ...prev, deadline: e.target.value }))}
                                        className="w-full p-4 border-2 border-[#8A2BE2] rounded-xl focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20 outline-none transition-colors duration-200 h-[60px]"
                                    />
                                ) : (
                                    <div className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 h-[60px] flex items-center">
                                        {editValues.deadline ? new Date(editValues.deadline).toLocaleString() : 'No deadline set'}
                                    </div>
                                )}
                            </div>

                            <div>
                                {isEditing ? (
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Time Spent (seconds)
                                    </label>) : (
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Time Spent
                                    </label>
                                )}
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={editValues.timeSpent}
                                        onChange={(e) => setEditValues(prev => ({ ...prev, timeSpent: parseInt(e.target.value) || 0 }))}
                                        min="0"
                                        className="w-full p-4 border-2 border-[#8A2BE2] rounded-xl focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-20 outline-none transition-colors duration-200 h-[60px]"
                                        placeholder="0"
                                    />
                                ) : (
                                    <div className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 h-[60px] flex items-center">
                                        {formatTime(editValues.timeSpent || 0)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timer Section */}
                <div className="border-2 border-[#8A2BE2] rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Timer</h3>
                    <div className="bg-[#F8F4FF] rounded-xl p-8 text-center">
                        <div className="text-5xl font-mono font-bold text-[#8A2BE2] mb-8">
                            {formatTime(time)}
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleStop}
                                className="px-8 py-4 bg-red-500 text-white rounded-xl font-semibold transition-all duration-300 hover:bg-red-600 hover:shadow-lg text-lg"
                            >
                                Stop
                            </button>
                            {!isRunning ? (
                                <button
                                    onClick={handleStart}
                                    className="px-8 py-4 bg-green-500 text-white rounded-xl font-semibold transition-all duration-300 hover:bg-green-600 hover:shadow-lg text-lg"
                                >
                                    Start
                                </button>
                            ) : (
                                <button
                                    onClick={handlePause}
                                    className="px-8 py-4 bg-yellow-500 text-white rounded-xl font-semibold transition-all duration-300 hover:bg-yellow-600 hover:shadow-lg text-lg"
                                >
                                    Pause
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 