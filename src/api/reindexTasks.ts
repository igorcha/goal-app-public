
export const reindexTasks = async (goalId: string, token: string): Promise<void> => {
    try {
        const res = await fetch(`https://8ngxqqzrpc.execute-api.us-east-2.amazonaws.com/dev/reindexTasks?goalId=${goalId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (!res.ok) throw new Error("Failed to reindex tasks");

    } catch (err) {
        console.error(err);
        throw err;
    }
};