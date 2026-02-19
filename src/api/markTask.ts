import { Task } from "./tasks";

export const markTask = async (goalId: string, task: Partial<Task>, token: string) => {
    const res = await fetch(`https://8ngxqqzrpc.execute-api.us-east-2.amazonaws.com/dev/markTask?goalId=${goalId}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...task }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || 'Failed to mark task');
    }

    return await res.json();
};
