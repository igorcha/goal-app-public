import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskOrder, TaskOrderInput } from '../api/taskOrder';
import { useAuth } from 'react-oidc-context';

export const useTaskOrderMutation = (goalId: string) => {
    const queryClient = useQueryClient();
    const auth = useAuth();
    const token = auth.user?.access_token;

    return useMutation({
        mutationFn: (input: TaskOrderInput) => taskOrder(input, token!),

        onMutate: async ({ taskId, newOrder }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks', goalId] });

            const previousTasks = queryClient.getQueryData<any[]>(['tasks', goalId]);

            queryClient.setQueryData<any[]>(['tasks', goalId], old =>
                old?.map(task =>
                    task.taskId === taskId ? { ...task, order: newOrder } : task
                )
            );

            return { previousTasks };
        },

        onError: (_err, _vars, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks', goalId], context.previousTasks);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', goalId] });
        },
    });
};
