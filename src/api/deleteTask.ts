
export const deleteTask = async (goalId: string, taskId: string, token: string) => {
    const res = await fetch(`https://8ngxqqzrpc.execute-api.us-east-2.amazonaws.com/dev/deleteTask?goalId=${goalId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || 'Failed to delete task');
    }

    return await res.json();
};
