import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '../api/tasks'
import { useAuth } from 'react-oidc-context';
import { editTask } from '../api/editTask';

export const useEditTaskMutation = (goalId: string) => {
    const queryClient = useQueryClient();
    const auth = useAuth();
    const token = auth.user?.access_token;

    return useMutation({
        mutationFn: (input: Partial<Task>) => editTask(goalId, input, token!),

        onSuccess: (_, input: Partial<Task>) => {
            queryClient.setQueryData<Task[]>(['tasks', goalId], (old) =>
                old?.map(task => task.taskId === input.taskId ? { ...task, ...input } : task)
            );
        },

        onError: (error) => {
            console.error(error);
        },
    });
};
