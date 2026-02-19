import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { deleteGoal } from '../api/deleteGoal';

export const useDeleteGoalMutation = () => {
    const queryClient = useQueryClient();
    const auth = useAuth();
    const token = auth.user?.access_token;

    return useMutation({
        mutationFn: (input: string) => deleteGoal(input, token!),

        onSuccess: () => {
            // Invalidate and refetch to ensure we have the latest data
            queryClient.invalidateQueries({ queryKey: ['goals'] });
        },

        onError: (error) => {
            console.error('Delete goal failed:', error);
            throw error;
        },
    });
};
