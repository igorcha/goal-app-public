import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const auth = useAuth();
    const navigate = useNavigate();

    const handlePrimaryCta = () => {
        if (auth.isAuthenticated) {
            navigate('/dashboard');
            return;
        }
        auth.signinRedirect();
    };

    return (
        <div className="min-h-screen w-screen bg-gradient-to-b from-violet-50 to-violet-50/70">
            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-5">
                            From idea to action in seconds
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8">
                            Enter any goal and let AI generate a step-by-step plan. Track your progress, stay focused, and actually finish what you start.
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <button
                                onClick={handlePrimaryCta}
                                disabled={auth.isLoading}
                                className="px-7 py-3 rounded-xl bg-violet-600 text-white font-semibold shadow-sm transition-all duration-300 hover:bg-violet-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {auth.isAuthenticated ? 'Go to Dashboard' : 'Get Started — it\'s free'}
                            </button>
                            <span className="text-sm text-gray-400">No credit card required</span>
                        </div>

                        {/* How it works */}
                        <div className="mt-10 pt-8 border-t border-gray-200">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">How it works</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
                                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-50 text-violet-600 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                                        </svg>
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Describe your goal</p>
                                        <p className="text-xs text-gray-500">Type what you want to achieve in one sentence.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
                                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-fuchsia-50 text-fuchsia-600 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                                        </svg>
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">AI builds your plan</p>
                                        <p className="text-xs text-gray-500">Get a structured list of tasks you can start right away.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
                                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 text-green-600 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Track and finish</p>
                                        <p className="text-xs text-gray-500">Check off tasks, log time, and watch your progress grow.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative hidden lg:block">
                        <div className="absolute -inset-4 bg-violet-600/[0.08] blur-2xl rounded-3xl"></div>
                        <div className="relative bg-white/80 backdrop-blur border border-gray-200 rounded-2xl p-5 shadow-lg" aria-hidden="true">
                            {/* Mock header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Welcome back, Alex</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">Here's an overview of your goals and progress.</div>
                                </div>
                                <div className="text-[10px] text-gray-400">Fri, Feb 14</div>
                            </div>

                            {/* Mock stats row */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-white rounded-lg border border-gray-200 p-3">
                                    <div className="text-[10px] text-gray-400 mb-1">Total Goals</div>
                                    <div className="text-base font-bold text-gray-900">5</div>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 p-3">
                                    <div className="text-[10px] text-gray-400 mb-1">Tasks Done</div>
                                    <div className="text-base font-bold text-gray-900">18 <span className="text-[10px] font-normal text-gray-400">/ 24</span></div>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 p-3">
                                    <div className="text-[10px] text-gray-400 mb-1">Completion</div>
                                    <div className="text-base font-bold text-gray-900">75%</div>
                                    <div className="mt-1 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Mock goal card 1 */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-2">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="text-sm font-medium text-gray-800">Launch portfolio website</div>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-blue-50 text-blue-700">
                                        <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                                        In Progress
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2">
                                    <span>Jan 20, 2026</span>
                                    <span>4 / 6 tasks</span>
                                </div>
                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"></div>
                                </div>
                            </div>

                            {/* Mock goal card 2 */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-2">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="text-sm font-medium text-gray-800">Learn TypeScript</div>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-green-50 text-green-700">
                                        <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                        Completed
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2">
                                    <span>Dec 3, 2025</span>
                                    <span>8 / 8 tasks</span>
                                </div>
                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-green-500 rounded-full"></div>
                                </div>
                            </div>

                            {/* Mock goal card 3 */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-2">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="text-sm font-medium text-gray-800">Read 12 books this year</div>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-50 text-amber-700">
                                        <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                                        Not Started
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                    <span>Feb 10, 2026</span>
                                    <span>0 / 3 tasks</span>
                                </div>
                            </div>

                            {/* Mock goal card 4 */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="text-sm font-medium text-gray-800">Build a morning routine</div>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-blue-50 text-blue-700">
                                        <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                                        In Progress
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2">
                                    <span>Feb 1, 2026</span>
                                    <span>2 / 5 tasks</span>
                                </div>
                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full w-2/5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"></div>
                                </div>
                            </div>

                            {/* Mock add goal button */}
                            <div className="flex items-center justify-center gap-2 p-3 border border-dashed border-violet-300 rounded-xl text-violet-600 text-xs font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Add New Goal
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 pb-16">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Everything you need to stay on track</h2>
                    <p className="text-gray-500 max-w-lg mx-auto">Built-in tools to organize, prioritize, and finish your goals.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-violet-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-50 text-violet-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Drag-and-drop ordering</h3>
                        <p className="text-gray-600">Reorder tasks by priority with a simple drag. Your workflow, your way.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-violet-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 text-amber-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Built-in time tracking</h3>
                        <p className="text-gray-600">Start a timer on any task and log exactly how long you spend on each step.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-violet-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Deadlines and alerts</h3>
                        <p className="text-gray-600">Set due dates on tasks so nothing slips through the cracks.</p>
                    </div>
                </div>
            </section>

            {/* Secondary CTA */}
            <section className="max-w-7xl mx-auto px-6 pb-24">
                <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-8 md:p-12 text-center shadow-lg">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Your next goal is one sentence away</h2>
                    <p className="text-violet-100 mb-8 max-w-lg mx-auto">Describe what you want to achieve. AI breaks it down. You get to work.</p>
                    <button
                        onClick={handlePrimaryCta}
                        disabled={auth.isLoading}
                        className="px-7 py-3 rounded-xl bg-white text-violet-700 font-semibold shadow-sm transition-all duration-300 hover:bg-violet-50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {auth.isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                    </button>
                </div>
            </section>
        </div>
    );
}
