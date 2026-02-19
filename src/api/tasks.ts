export interface Task {
    taskId: string;
    taskText: string;
    createdAt: string;
    order: number;
    completed: boolean;
    deadline?: string;
    timeSpent?: number;
}

export const fetchTasks = async ({ queryKey }: { queryKey: string[] }, token: string): Promise<Task[]> => {
    const [, goalId] = queryKey;
    try {
        const res = await fetch(`https://8ngxqqzrpc.execute-api.us-east-2.amazonaws.com/dev/tasks?goalId=${goalId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (!res.ok) throw new Error("Failed to fetch tasks");

        const data = await res.json();
        return data.tasks
    } catch (err) {
        console.error(err);
        throw err;
    }
};