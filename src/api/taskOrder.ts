export type TaskOrderInput = {
    goalId: string;
    taskId: string;
    newOrder: number;
};

export const taskOrder = async ({ goalId, taskId, newOrder }: TaskOrderInput, token: string) => {
    const res = await fetch(`https://8ngxqqzrpc.execute-api.us-east-2.amazonaws.com/dev/updateTaskOrder?goalId=${goalId}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goalId, taskId, newOrder }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || 'Failed to reorder task');
    }

    return await res.json();
};
