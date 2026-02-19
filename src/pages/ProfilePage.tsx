import { useAuth } from 'react-oidc-context';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
    const auth = useAuth();
    const user = auth.user?.profile;

    // Format user data for display - explicit string casting/fallback
    const rawName = user?.given_name || user?.['cognito:username'];
    const displayName = typeof rawName === 'string' ? rawName : 'User';

    const rawEmail = user?.email;
    const displayEmail = typeof rawEmail === 'string' ? rawEmail : 'No email available';

    const rawUsername = user?.['cognito:username'];
    const displayUsername = typeof rawUsername === 'string' ? rawUsername : '';

    const userInitial = (displayName || displayEmail || 'U').slice(0, 1).toUpperCase();

    // Check for Google identity in Cognito claims
    let isGoogleLogin = false;
    if (user?.identities) {
        try {
            const identities = typeof user.identities === 'string'
                ? JSON.parse(user.identities)
                : user.identities;

            if (Array.isArray(identities) && identities.some((id: any) => id.providerName === 'Google')) {
                isGoogleLogin = true;
            }
        } catch (e) {
            console.error('Failed to parse user identities', e);
        }
    }

    return (
        <div className="min-h-screen bg-[#F0F0FF] pt-20 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200 rounded-2xl p-8 relative overflow-hidden">
                    <h1 className="text-3xl font-bold text-violet-700 mb-8">
                        My Profile
                    </h1>

                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white grid place-items-center text-4xl font-bold shadow-md shrink-0">
                            {userInitial}
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">{displayName}</h2>
                            <div className="flex items-center gap-2 text-gray-500 mt-1">
                                {displayEmail}
                                {isGoogleLogin && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Google Account
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                            <input
                                type="text"
                                value={displayUsername || 'N/A'}
                                disabled
                                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 font-medium cursor-not-allowed select-none focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                            <input
                                type="text"
                                value={displayEmail}
                                disabled
                                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 font-medium cursor-not-allowed select-none focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8 bg-violet-50 rounded-xl p-4 border border-violet-100 flex items-start gap-3">
                        <div className="bg-white p-1.5 rounded-full shadow-sm text-violet-600 shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5zm15.844-5.44a.75.75 0 011.06 0 5.748 5.748 0 010 9.18.75.75 0 11-1.06-1.06 4.248 4.248 0 000-7.06.75.75 0 010-1.06z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-violet-900">More profile settings coming soon</h3>
                            <p className="text-sm text-violet-700 mt-1">
                                We're working on features to let you update your profile picture, change display name, and manage notification preferences.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 mb-2">
                            Need to delete your account?
                        </p>
                        <Link
                            to="/contact"
                            className="text-sm font-medium text-violet-600 hover:text-violet-800 hover:underline transition-colors"
                        >
                            Contact us for account deletion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
