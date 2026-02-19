import { useQuery } from '@tanstack/react-query';
import { fetchGoals } from '../api/goals';
import { useAuth } from 'react-oidc-context';

export const useGoalsQuery = () => {
    const auth = useAuth();
    const token = auth.user?.access_token;

    return useQuery({
        queryKey: ['goals'],
        queryFn: () => fetchGoals(token!),
        enabled: !!token,
        staleTime: 1000 * 60, // 1 min freshness
    });
};