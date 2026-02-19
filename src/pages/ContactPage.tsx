import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { contact } from '../api/contact';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactPage() {
    const auth = useAuth();
    const userEmail = auth.user?.profile?.email || '';

    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [replyTo, setReplyTo] = useState(userEmail);
    const [status, setStatus] = useState<Status>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Update replyTo if userEmail loads late (e.g. on refresh)
    useEffect(() => {
        if (userEmail && !replyTo) {
            setReplyTo(userEmail);
        }
    }, [userEmail, replyTo]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        // Validation
        if (!replyTo.trim() || !subject.trim() || !body.trim()) {
            setErrorMessage('All fields must be filled out.');
            setStatus('error');
            return;
        }

        setStatus('sending');

        try {
            await contact({
                email: replyTo.trim(),
                subject: subject.trim(),
                message: body.trim(),
            }, auth.user?.access_token!);
            setStatus('success');
            // Clear form on success
            setSubject('');
            setBody('');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMessage(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F0FF] pt-20 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200 rounded-2xl p-8">
                    <h1 className="text-3xl font-bold text-violet-700 mb-6">
                        Contact Us
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Have questions or feedback? Send us a message and we'll get back to you as soon as possible.
                    </p>

                    {/* Success Message */}
                    {status === 'success' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                            <div className="bg-green-100 text-green-600 p-1.5 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-green-700 font-medium">Message sent successfully! We'll get back to you soon.</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {status === 'error' && errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                            <div className="bg-red-100 text-red-600 p-1.5 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-red-700 font-medium">{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="space-y-6">
                        <div>
                            <label htmlFor="replyTo" className="block text-sm font-medium text-gray-700 mb-2">
                                Your Email
                            </label>
                            <input
                                type="email"
                                id="replyTo"
                                value={replyTo}
                                onChange={(e) => setReplyTo(e.target.value)}
                                required
                                maxLength={50}
                                disabled={status === 'sending'}
                                className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="you@example.com"
                            />
                            <div className="text-right text-xs text-gray-400 mt-1">
                                {replyTo.length}/50
                            </div>
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                maxLength={100}
                                disabled={status === 'sending'}
                                className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="What is this regarding?"
                            />
                            <div className="text-right text-xs text-gray-400 mt-1">
                                {subject.length}/100
                            </div>
                        </div>

                        <div>
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                                Message
                            </label>
                            <textarea
                                id="body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                required
                                maxLength={3000}
                                rows={6}
                                disabled={status === 'sending'}
                                className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Tell us more..."
                            />
                            <div className="text-right text-xs text-gray-400 mt-1">
                                {body.length}/3000
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-300 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2"
                        >
                            {status === 'sending' ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                'Send Email'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
