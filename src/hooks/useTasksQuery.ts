import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../api/tasks';
import { useAuth } from 'react-oidc-context';

export const useTasksQuery = (goalId: string) => {
    const auth = useAuth();
    const token = auth.user?.access_token;

    return useQuery({
        queryKey: ['tasks', goalId],
        queryFn: ({ queryKey }) => fetchTasks({ queryKey }, token!),
        enabled: !!goalId && !!token,
        staleTime: 1000 * 60, // 1 min freshness
    });
};