import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { addGoal } from '../api/addGoal';

export const useAddGoalMutation = () => {
    const queryClient = useQueryClient();
    const auth = useAuth();
    const token = auth.user?.access_token;

    return useMutation({
        mutationFn: (input: string) => addGoal(input, token!),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] });
        },

        onError: (error) => {
            throw error;
        },
    });
};
