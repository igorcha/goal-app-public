import { useTasksQuery } from '../hooks/useTasksQuery';
import { useTaskOrderMutation } from '../hooks/useTaskOrderMutation';
import { reindexTasks } from '../api/reindexTasks';
import { useParams } from 'react-router-dom';
import {
    DndContext,
    pointerWithin,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    defaultDropAnimation
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import SortableTaskItem from '../components/SortableTaskItem';
import TaskModal from '../components/TaskModal';
import AddTaskModal from '../components/AddTaskModal';
import CheckmarkDropZone, { COMPLETE_DROPZONE_ID } from '../components/CheckmarkDropZone';
import { useState, useMemo, useEffect } from 'react';
import { Task } from '../api/tasks';
import { useAuth } from 'react-oidc-context';
import { useQueryClient } from '@tanstack/react-query';
import { useEditTaskMutation } from '../hooks/useEditTaskMutation';
import { useDeleteTaskMutation } from '../hooks/useDeleteTaskMutation';
import { useAddTaskMutation } from '../hooks/useAddTaskMutation';
import { useMarkTaskMutation } from '../hooks/useMarkTaskMutation';

function computeFractionalOrder(before?: number, after?: number): number {
    if (before !== undefined && after !== undefined) return (before + after) / 2;
    if (before !== undefined) return before + 1000;
    if (after !== undefined) return after / 2;
    return 1000;
}

export default function GoalDetail() {
    const queryClient = useQueryClient();
    const auth = useAuth();
    const token = auth.user?.access_token;
    const { goalId } = useParams();
    const { data: tasks = [], isLoading, error } = useTasksQuery(goalId!);
    const { mutate: taskOrder } = useTaskOrderMutation(goalId!);
    const { mutate: editTask } = useEditTaskMutation(goalId!);
    const { mutate: deleteTask } = useDeleteTaskMutation(goalId!);
    const { mutate: addTask } = useAddTaskMutation(goalId!);
    const { mutate: markTask } = useMarkTaskMutation(goalId!);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [localTasks, setLocalTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDeadline, setNewTaskDeadline] = useState('');

    const sortedTasks = useMemo(() => {
        const tasksToSort = localTasks.length > 0 ? localTasks : tasks;
        return [...tasksToSort].sort((a, b) => a.order - b.order)
    }, [tasks, localTasks]);

    // Only show tasks that are not completed
    const visibleTasks = useMemo(() => {
        return sortedTasks.filter(task => !task.completed);
    }, [sortedTasks]);

    const completedTasks = useMemo(() => {
        return sortedTasks.filter(task => task.completed).sort((a, b) => a.order - b.order);
    }, [sortedTasks]);

    const completedCount = completedTasks.length;

    const totalCount = useMemo(() => sortedTasks.length, [sortedTasks]);

    // Update local tasks when server data changes
    useEffect(() => {
        if (tasks.length > 0) {
            setLocalTasks([]);
        }
    }, [tasks]);

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const handleTaskSave = (updatedTask: Partial<Task>) => {
        editTask(updatedTask);
    };

    const handleMarkComplete = (task: Task) => {
        const flag = !task.completed;
        markTask({ taskId: task.taskId, completed: flag });
        handleModalClose();
    };

    const handleTaskDelete = (taskId: string) => {
        // TODO: Implement delete functionality
        deleteTask(taskId);
        console.log('Deleting task:', taskId);
        handleModalClose();
    };

    const [showCompleted, setShowCompleted] = useState(false);

    // Note: restore is handled by toggling in modal or via future actions

    const handleAddTaskClick = () => {
        setIsAddingTask(true);
        setNewTaskText('');
        setNewTaskDeadline('');
    };

    const handleAddTaskCancel = () => {
        setIsAddingTask(false);
        setNewTaskText('');
        setNewTaskDeadline('');
    };

    const handleAddTaskSubmit = () => {
        // TODO: Implement API call to add task
        console.log('Adding task:', { taskText: newTaskText, deadline: newTaskDeadline });
        const order = sortedTasks.length > 0 ? sortedTasks[sortedTasks.length - 1].order + 1000.0 : 1000.0;
        addTask({
            taskText: newTaskText,
            deadline: newTaskDeadline,
            order: order,
        });
        setIsAddingTask(false);
        setNewTaskText('');
        setNewTaskDeadline('');
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragEndEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        // Dropped over the completion zone -> mark as complete
        if (over && over.id === COMPLETE_DROPZONE_ID) {
            const droppedTask = sortedTasks.find(t => t.taskId === (active.id as string));
            if (droppedTask) {
                markTask({ taskId: droppedTask.taskId, completed: true });
                // Optimistically update local state so it disappears from the visible list instantly
                setLocalTasks(sortedTasks.map(task =>
                    task.taskId === droppedTask.taskId ? { ...task, completed: true } : task
                ));
            }
            setActiveId(null);
            return;
        }

        if (over && active.id !== over.id) {
            // Reorder within the currently visible (incomplete) tasks only
            const oldIndex = visibleTasks.findIndex(task => task.taskId === active.id);
            const newIndex = visibleTasks.findIndex(task => task.taskId === over.id);
            const newSortedVisibleTasks = arrayMove(visibleTasks, oldIndex, newIndex);

            const before = newSortedVisibleTasks[newIndex - 1];
            const after = newSortedVisibleTasks[newIndex + 1];

            const newOrder = computeFractionalOrder(before?.order, after?.order);

            // Update the full local list immediately (preserve completed tasks)
            setLocalTasks(sortedTasks.map(task =>
                task.taskId === active.id ? { ...task, order: newOrder } : task
            ));

            if (goalId) {
                taskOrder({ goalId, taskId: active.id as string, newOrder },
                    {
                        onSuccess: () => {
                            if (newOrder % 1 > 0 && newOrder % 1 < 0.0001) {
                                reindexTasks(goalId, token!).then(() => {
                                    queryClient.invalidateQueries({ queryKey: ['tasks', goalId] });
                                }).catch((e) => {
                                    console.error('Reindexing failed:', e.message);
                                });
                            }
                        }
                    }
                );
            }
        }

        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const dropAnimation = {
        ...defaultDropAnimation,
        duration: 300,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0F0FF] pt-20">
                <div className="text-xl text-[#8A2BE2] animate-pulse">Loading tasks...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0F0FF] pt-20">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="text-2xl text-red-600 font-bold mb-2">Something went wrong</div>
                    <div className="text-gray-600 mb-4">{error.message}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-[#8A2BE2] text-white rounded-xl font-semibold transition-all duration-300 hover:bg-[#7B1FA2] hover:shadow-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F0FF] pt-20 px-4">
            <div className="max-w-6xl mx-auto">
                <DndContext
                    sensors={sensors}
                    collisionDetection={pointerWithin}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <div className="flex gap-6 items-stretch">
                        <div className="flex-1 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200 rounded-2xl p-8">
                            <h1 className="text-3xl font-bold text-violet-700 mb-2">
                                Tasks
                            </h1>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-violet-50 text-violet-700 border border-violet-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14H8a1 1 0 110-2h5a1 1 0 110 2zm3-4H8a1 1 0 010-2h8a1 1 0 110 2z" /></svg>
                                    {visibleTasks.length} active
                                </span>
                                {completedCount > 0 && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-50 text-gray-700 border border-violet-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                        {completedCount} completed
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-400 mb-4">Drag tasks to reorder or drop on the checkmark to complete. Click a task for details.</p>

                            <SortableContext
                                items={visibleTasks.map(task => task.taskId)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {visibleTasks.map((task) => (
                                        <SortableTaskItem
                                            key={task.taskId}
                                            task={task}
                                            onClick={handleTaskClick}
                                        />
                                    ))}

                                    {/* Add Task Row (non-draggable) */}
                                    {!isAddingTask && (
                                        <button
                                            onClick={handleAddTaskClick}
                                            className="w-full text-left p-6 bg-violet-50/60 border border-dashed border-violet-300 rounded-xl font-semibold text-violet-700 transition-all duration-300 hover:bg-violet-600 hover:text-white hover:border-solid hover:shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                <span className="font-semibold">Add New Task</span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </SortableContext>
                        </div>

                        <CheckmarkDropZone completedCount={completedCount} totalCount={totalCount} />
                    </div>

                    <DragOverlay
                        dropAnimation={dropAnimation}
                    >
                        {activeId ? (
                            <SortableTaskItem
                                task={visibleTasks.find(task => task.taskId === activeId)!}
                                onClick={handleTaskClick}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {/* Completed Tasks at bottom - collapsible */}
                {completedCount > 0 && (
                    <div className="mt-8">
                        <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200 rounded-2xl p-8">
                            <button
                                onClick={() => setShowCompleted(prev => !prev)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-violet-50/60 border border-violet-300 rounded-xl text-violet-700 font-semibold transition-colors duration-200 hover:bg-violet-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                            >
                                <span>Completed ({completedCount})</span>
                                <svg className={`w-5 h-5 transition-transform duration-200 ${showCompleted ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showCompleted && (
                                <div className="space-y-2 mt-3">
                                    {completedTasks.map((task) => (
                                        <div
                                            key={task.taskId}
                                            onClick={() => handleTaskClick(task)}
                                            className="p-6 bg-white rounded-xl cursor-pointer touch-manipulation transform-gpu border border-gray-200 hover:border-violet-200 hover:ring-1 hover:ring-violet-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2.5 mb-2">
                                                        <p className="text-lg font-medium text-gray-800 line-through decoration-gray-300">
                                                            {task.taskText}
                                                        </p>
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                            Done
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                            </svg>
                                                            {new Date(task.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
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
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Add Task Modal */}
                <AddTaskModal
                    isOpen={isAddingTask}
                    taskText={newTaskText}
                    deadline={newTaskDeadline}
                    onChangeTaskText={setNewTaskText}
                    onChangeDeadline={setNewTaskDeadline}
                    onSubmit={handleAddTaskSubmit}
                    onCancel={handleAddTaskCancel}
                />
            </div>

            <TaskModal
                task={selectedTask}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSave={handleTaskSave}
                onDelete={handleTaskDelete}
                onMarkComplete={handleMarkComplete}
            />
        </div>
    );
}
