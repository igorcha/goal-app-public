import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '../api/tasks'
import { useAuth } from 'react-oidc-context';
import { deleteTask } from '../api/deleteTask';

export const useDeleteTaskMutation = (goalId: string) => {
    const queryClient = useQueryClient();
    const auth = useAuth();
    const token = auth.user?.access_token;

    return useMutation({
        mutationFn: (input: string) => deleteTask(goalId, input, token!),

        onMutate: async (taskId: string) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['tasks', goalId] });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks', goalId]);

            // Optimistically update to the new value
            queryClient.setQueryData<Task[]>(['tasks', goalId], (old) => {
                if (!old) return old;
                return old.filter(task => task.taskId !== taskId);
            });

            // Return a context object with the snapshotted value
            return { previousTasks };
        },

        onSuccess: (_, taskId: string) => {
            // Invalidate and refetch to ensure we have the latest data
            queryClient.invalidateQueries({ queryKey: ['tasks', goalId] });
        },

        onError: (error, taskId: string, context) => {
            console.error('Delete task failed:', error);

            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks', goalId], context.previousTasks);
            }
        },
    });
};
