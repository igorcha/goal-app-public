

export interface Goal {
    goalId: string;
    goalText: string;
    createdAt: string;
}

export const fetchGoals = async (token: string): Promise<Goal[]> => {


    try {
        const res = await fetch("https://8ngxqqzrpc.execute-api.us-east-2.amazonaws.com/dev/goals", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Failed to fetch goals");

        const data = await res.json();
        return data.goals
    } catch (err) {
        console.error(err);

        throw err;
    };

};