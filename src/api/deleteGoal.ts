
export const deleteGoal = async (goalId: string, token: string) => {
    const res = await fetch(`https://8ngxqqzrpc.execute-api.us-east-2.amazonaws.com/dev/deleteGoal?goalId=${goalId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || 'Failed to delete goal');
    }

    return await res.json();
};
