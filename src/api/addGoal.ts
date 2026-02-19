
export const addGoal = async (goal: string, token: string) => {
    try {
        const res = await fetch('https://8ngxqqzrpc.execute-api.us-east-2.amazonaws.com/dev/goal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ goal }),
        });

        if (!res.ok) throw new Error('Failed to add goal');

    } catch (err) {
        console.error(err);

        throw err;
    };

}; 