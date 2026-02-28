import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            toast.success('Welcome back!');
            navigate('/dashboard');
        } else {
            toast.error(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="FLAVORRECIPES" className="h-16 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold" style={{ color: '#38240D' }}>Welcome Back</h1>
                    <p className="mt-2" style={{ color: '#713600' }}>Sign in to FLAVORRECIPES</p>
                </div>

                {/* Login Form */}
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
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#C05800' }} />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2"
                                    style={{ borderColor: '#C05800', color: '#38240D', backgroundColor: '#fff', '--tw-ring-color': '#713600' }}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex items-center justify-end">
                            <Link to="/reset-password" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#713600' }}>
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                            style={{ backgroundColor: '#713600' }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm mt-6" style={{ color: '#713600' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium hover:opacity-80 transition-opacity" style={{ color: '#C05800' }}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
