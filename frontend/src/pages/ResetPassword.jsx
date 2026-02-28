import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !newPassword || !confirmPassword) {
            toast.error('All fields are required');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/api/auth/reset-password', {
                email,
                newPassword
            });

            toast.success(response.data.message);
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="FLAVORRECIPES" className="h-16 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold" style={{ color: '#38240D' }}>Reset Password</h1>
                    <p className="mt-2" style={{ color: '#713600' }}>Reset your FLAVORRECIPES password</p>
                </div>

                {/* Reset Form */}
                <div className="rounded-2xl shadow-sm border p-8" style={{ backgroundColor: '#FDFBD4', borderColor: '#C05800' }}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#C05800' }} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2"
                                    style={{ borderColor: '#C05800', color: '#38240D', backgroundColor: '#fff', '--tw-ring-color': '#713600' }}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#C05800' }} />
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2"
                                    style={{ borderColor: '#C05800', color: '#38240D', backgroundColor: '#fff', '--tw-ring-color': '#713600' }}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#C05800' }} />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2"
                                    style={{ borderColor: '#C05800', color: '#38240D', backgroundColor: '#fff', '--tw-ring-color': '#713600' }}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                            style={{ backgroundColor: '#713600' }}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    {/* Back to Login Link */}
                    <p className="text-center text-sm mt-6" style={{ color: '#713600' }}>
                        Remember your password?{' '}
                        <Link to="/login" className="font-medium hover:opacity-80 transition-opacity" style={{ color: '#C05800' }}>
                            Sign in instead
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
