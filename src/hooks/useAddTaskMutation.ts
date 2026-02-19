import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '../api/tasks'
import { useAuth } from 'react-oidc-context';
import { addTask } from '../api/addTask';

export const useAddTaskMutation = (goalId: string) => {
    const queryClient = useQueryClient();
    const auth = useAuth();
    const token = auth.user?.access_token;

    return useMutation({
        mutationFn: (input: Partial<Task>) => addTask(goalId, input, token!),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', goalId] });
        },

        onError: (error) => {
            console.error(error);
        },
    });
};
