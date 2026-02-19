import { useAuth } from 'react-oidc-context';
import { Link, useLocation } from 'react-router-dom';

export default function MenuBar() {
    const auth = useAuth();
    const { pathname } = useLocation();

    const isActive = (to: string) => pathname.startsWith(to);

    const signOutRedirect = () => {
        const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
        const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI;
        const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
        auth.removeUser();
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    const userInitial = (auth.user?.profile?.given_name || auth.user?.profile?.['cognito:username'] || auth.user?.profile?.email || 'U')
        .slice(0, 1)
        .toUpperCase();

    return (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
                <Link to="/" className="text-xl font-semibold text-gray-800 hover:opacity-90 transition">
                    <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                        Goal Planner
                    </span>
                </Link>
                {auth.isAuthenticated && (
                    <div className="flex items-center gap-2">
                        <Link
                            to="/dashboard"
                            className={[
                                'px-3 py-2 text-sm rounded-full font-medium transition-all',
                                'hover:bg-violet-50 text-violet-700',
                                isActive('/dashboard') ? 'bg-violet-100 ring-1 ring-violet-200' : '',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400',
                            ].join(' ')}
                            aria-current={isActive('/dashboard') ? 'page' : undefined}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/contact"
                            className={[
                                'px-3 py-2 text-sm rounded-full font-medium transition-all',
                                'hover:bg-violet-50 text-violet-700',
                                isActive('/contact') ? 'bg-violet-100 ring-1 ring-violet-200' : '',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400',
                            ].join(' ')}
                            aria-current={isActive('/contact') ? 'page' : undefined}
                        >
                            Contact
                        </Link>
                        <button
                            onClick={() => signOutRedirect()}
                            className="px-3 py-2 text-sm rounded-full font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 cursor-pointer"
                            aria-label="Sign out"
                        >
                            Sign Out
                        </button>
                        <Link
                            to="/profile"
                            className="ml-1 h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white grid place-items-center text-sm font-semibold shadow-sm hover:opacity-90 hover:shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ring-offset-2"
                            title={auth.user?.profile?.name || auth.user?.profile?.email}
                        >
                            {userInitial}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
} 