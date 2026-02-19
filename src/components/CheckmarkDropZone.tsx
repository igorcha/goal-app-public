import { useDroppable } from '@dnd-kit/core';

export const COMPLETE_DROPZONE_ID = 'complete-dropzone';

type CheckmarkDropZoneProps = {
    completedCount: number;
    totalCount: number;
};

export default function CheckmarkDropZone({ completedCount, totalCount }: CheckmarkDropZoneProps) {
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const { isOver, setNodeRef } = useDroppable({ id: COMPLETE_DROPZONE_ID });

    return (
        <div
            ref={setNodeRef}
            className={`relative w-32 self-stretch flex flex-col rounded-2xl overflow-hidden border transition-colors duration-200 ${isOver
                ? 'bg-violet-50 border-violet-400 ring-2 ring-violet-200'
                : 'bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-gray-200'
                }`}
        >
            {/* Fill from bottom to top */}
            <div
                className={`absolute left-0 right-0 bottom-0 bg-violet-500 transition-[height,opacity] duration-300 ease-out ${isOver ? 'opacity-20' : 'opacity-10'
                    }`}
                style={{ height: `${percent}%` }}
            />

            {/* Content overlay */}
            <div className="relative z-10 flex-1 p-4 flex flex-col items-center justify-center text-center">
                <div className={`p-3 rounded-full mb-3 transition-colors ${isOver ? 'bg-violet-200 text-violet-800' : 'bg-violet-100 text-violet-600'}`}>
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">Drop to complete</p>
                <div className="text-xs text-gray-500 font-medium">
                    <span className="text-violet-700 font-bold text-sm">{percent}%</span>
                    <span className="ml-1">({completedCount}/{totalCount})</span>
                </div>
            </div>
        </div>
    );
}
