import { useAuth } from 'react-oidc-context';
import { Link, useNavigate } from "react-router-dom";
import { useGoalsQuery } from '../hooks/useGoalsQuery';
import { Goal } from '../api/goals';
import { useState } from 'react';
import { useDeleteGoalMutation } from '../hooks/useDeleteGoalMutation';
import { useAddGoalMutation } from '../hooks/useAddGoalMutation';
import { useQueries } from '@tanstack/react-query';
import { fetchTasks, Task } from '../api/tasks';


export default function Dashboard() {
    const auth = useAuth();
    const navigate = useNavigate();
    const user = auth.user?.profile;
    const { data: goals = [], isLoading, error } = useGoalsQuery();
    const [addGoalClicked, setAddGoalClicked] = useState(false);
    const [goal, setGoal] = useState('');
    const { mutate: addGoal, isPending: isAddingGoal, error: addGoalError } = useAddGoalMutation();
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const { mutate: deleteGoal, isPending: isDeletingGoal } = useDeleteGoalMutation();

    const token = auth.user?.access_token;
    const taskQueries = useQueries({
        queries: goals.map((g) => ({
            queryKey: ['tasks', g.goalId],
            queryFn: ({ queryKey }: { queryKey: string[] }) => fetchTasks({ queryKey }, token!),
            enabled: !!token && goals.length > 0,
            staleTime: 1000 * 60,
        })),
    });

    const allTasks: Task[] = taskQueries.flatMap((q) => q.data ?? []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const now = new Date();
    const goalsThisMonth = goals.filter((g) => {
        const d = new Date(g.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const statsLoading = taskQueries.some((q) => q.isLoading);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0F0FF] pt-20">
                <div className="text-xl text-[#8A2BE2] animate-pulse">Loading goals...</div>
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



    const handleGoalClick = (goal: Goal) => {
        navigate(`/goals/${goal.goalId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleAddGoalClick = () => {
        setAddGoalClicked(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!goal) return;

        addGoal(goal, {
            onSuccess: () => {
                setAddGoalClicked(false);
                setGoal('');
            },
        });



    };

    // Delete controls handlers
    const handleDeleteIconClick = (e: React.MouseEvent, goalId: string) => {
        e.stopPropagation();
        setConfirmDeleteId(goalId);
    };

    const handleCancelDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDeleteId(null);
    };

    const handleConfirmDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteGoal(confirmDeleteId || '', { onSuccess: () => setConfirmDeleteId(null) });
    };

    const todayLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-[#F0F0FF] pt-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200 rounded-2xl p-8">
                    {/* Welcome Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-violet-700">
                                Welcome back, {(user as any)?.['given_name'] || (user as any)?.['cognito:username'] || 'User'}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Here's an overview of your goals and progress.</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            {todayLabel}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-500">Total Goals</span>
                                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-50 text-violet-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                    </svg>
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-500">Tasks Completed</span>
                                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                            </div>
                            {statsLoading ? (
                                <p className="text-2xl font-bold text-gray-300 animate-pulse">--</p>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">{completedTasks} <span className="text-sm font-normal text-gray-400">/ {totalTasks}</span></p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-500">Completion Rate</span>
                                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-fuchsia-50 text-fuchsia-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                                    </svg>
                                </span>
                            </div>
                            {statsLoading ? (
                                <p className="text-2xl font-bold text-gray-300 animate-pulse">--</p>
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                                    <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
                                            style={{ width: `${completionRate}%` }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-500">New This Month</span>
                                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 text-amber-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                    </svg>
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{goalsThisMonth} <span className="text-sm font-normal text-gray-400">goals</span></p>
                        </div>
                    </div>

                    {/* Goals List */}
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-600">Loading goals...</div>
                    ) : goals.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 text-violet-400 mx-auto mb-5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No goals yet</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto">Add a goal below and AI will break it down into actionable tasks for you.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {goals.map((goal, idx) => {
                                const goalTasks = taskQueries[idx]?.data ?? [];
                                const goalTasksLoading = taskQueries[idx]?.isLoading;
                                const goalTotal = goalTasks.length;
                                const goalCompleted = goalTasks.filter((t) => t.completed).length;
                                const goalRate = goalTotal > 0 ? Math.round((goalCompleted / goalTotal) * 100) : 0;
                                const goalStatus = goalTotal === 0 ? 'empty' : goalRate === 100 ? 'done' : goalCompleted > 0 ? 'active' : 'pending';
                                const statusConfig = {
                                    empty: { label: 'No Tasks', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
                                    pending: { label: 'Not Started', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
                                    active: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
                                    done: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
                                };
                                const status = statusConfig[goalStatus];

                                return (
                                    <div
                                        key={goal.goalId}
                                        onClick={() => handleGoalClick(goal)}
                                        className="relative group bg-white rounded-xl p-6 border border-gray-200 hover:border-violet-200 hover:ring-1 hover:ring-violet-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 mr-8">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <p className="text-lg text-gray-800 font-medium">
                                                        {goal.goalText}
                                                    </p>
                                                    {!goalTasksLoading && (
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                            {status.label}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                        </svg>
                                                        {formatDate(goal.createdAt)}
                                                    </span>
                                                    {!goalTasksLoading && goalTotal > 0 && (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {goalCompleted} / {goalTotal} tasks
                                                        </span>
                                                    )}
                                                </div>
                                                {!goalTasksLoading && goalTotal > 0 && (
                                                    <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${goalRate === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}
                                                            style={{ width: `${goalRate}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {confirmDeleteId === goal.goalId ? (
                                            <div
                                                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={handleCancelDeleteClick}
                                                    className="px-3 py-1 bg-gray-500 text-white rounded-md text-xs font-medium hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isDeletingGoal}
                                                    onClick={handleConfirmDeleteClick}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-md text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                                                >
                                                    {isDeletingGoal ? 'Deleting...' : 'Confirm'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                aria-label="Delete goal"
                                                onClick={(e) => handleDeleteIconClick(e, goal.goalId)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-md border border-red-200 text-red-600 bg-white hover:bg-red-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                    <path fillRule="evenodd" d="M16.5 4.478V5.25h3.25a.75.75 0 010 1.5h-.546l-1.018 12.214A2.25 2.25 0 0115.943 21H8.057a2.25 2.25 0 01-2.243-2.036L4.796 6.75H4.25a.75.75 0 010-1.5H7.5v-.772A2.25 2.25 0 019.75 1.75h4.5a2.25 2.25 0 012.25 2.728zM9.75 3.25a.75.75 0 00-.75.75v1.25h6V4a.75.75 0 00-.75-.75h-4.5zM9.62 8.72a.75.75 0 10-1.5.06l.375 9a.75.75 0 001.5-.06l-.375-9zm6.26.06a.75.75 0 10-1.5-.06l-.375 9a.75.75 0 101.5.06l.375-9z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                        </div>
                    )}
                    {addGoalClicked ? (
                        <div className="flex items-center gap-3 w-full">
                            <form
                                onSubmit={handleSubmit}
                                className="flex-1 p-4 bg-white rounded-xl border border-gray-200 focus-within:border-violet-300 focus-within:ring-1 focus-within:ring-violet-200"
                            >
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        placeholder="Your Goal..."
                                        className="w-full p-4 pr-16 text-lg rounded-xl outline-none transition-colors duration-300 bg-white text-gray-800 placeholder-gray-500"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-4 p-2 text-violet-700 cursor-pointer transition-all duration-300 hover:text-violet-800 hover:-translate-x-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 rounded"
                                        disabled={isAddingGoal}
                                    >
                                        {isAddingGoal ? (
                                            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : (
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {addGoalError && (
                                    <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-lg">
                                        Error: {(addGoalError as Error).message}
                                    </div>
                                )}
                            </form>
                            <button
                                type="button"
                                onClick={() => setAddGoalClicked(false)}
                                className="px-4 py-3 bg-gray-500 text-white rounded-xl font-semibold transition-all duration-300 hover:bg-gray-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAddGoalClick}
                            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-violet-50/60 border border-dashed border-violet-300 rounded-xl font-semibold text-violet-700 transition-all duration-300 hover:bg-violet-600 hover:text-white hover:border-solid hover:shadow-lg group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add New Goal
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
