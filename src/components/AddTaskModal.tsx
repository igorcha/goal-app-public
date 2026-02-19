import React from 'react';

type AddTaskModalProps = {
    isOpen: boolean;
    taskText: string;
    deadline: string;
    onChangeTaskText: (value: string) => void;
    onChangeDeadline: (value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
};

export default function AddTaskModal({
    isOpen,
    taskText,
    deadline,
    onChangeTaskText,
    onChangeDeadline,
    onSubmit,
    onCancel,
}: AddTaskModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/10 backdrop-blur-xs backdrop-saturate-150 flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto"
            onClick={onCancel}
        >
            <div
                className="bg-[#FAF8FF] rounded-2xl shadow-xl p-4 sm:p-8 max-w-2xl w-full my-4 sm:my-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Add Task</h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Task Description</label>
                        <textarea
                            value={taskText}
                            onChange={(e) => onChangeTaskText(e.target.value)}
                            placeholder="Enter task description..."
                            className="w-full p-4 text-lg border-2 border-[rgba(138,43,226,0.2)] rounded-xl focus:border-[#8A2BE2] focus:ring-2 focus:ring-[rgba(138,43,226,0.1)] outline-none transition-colors duration-300 resize-none bg-white"
                            rows={3}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (Optional)</label>
                        <input
                            type="datetime-local"
                            value={deadline}
                            onChange={(e) => onChangeDeadline(e.target.value)}
                            className="w-full p-4 text-lg border-2 border-[rgba(138,43,226,0.2)] rounded-xl focus:border-[#8A2BE2] focus:ring-2 focus:ring-[rgba(138,43,226,0.1)] outline-none transition-colors duration-300 bg-white"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold transition-all duration-300 hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={!taskText.trim()}
                            className="flex-1 px-6 py-3 bg-[#8A2BE2] text-white rounded-xl font-semibold transition-all duration-300 hover:bg-[#7B1FA2] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


