import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Profile state
    const [profile, setProfile] = useState({
        name: '',
        email: ''
    });

    // Preferences state
    const [preferences, setPreferences] = useState({
        dietary_restrictions: [],
        allergies: [],
        preferred_cuisines: [],
        default_servings: 4,
        measurement_unit: 'metric'
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/api/users/profile');
            const { user, preferences: userPrefs } = response.data.data;

            setProfile({
                name: user.name,
                email: user.email
            });

            if (userPrefs) {
                setPreferences({
                    dietary_restrictions: userPrefs.dietary_restrictions || [],
                    allergies: userPrefs.allergies || [],
                    preferred_cuisines: userPrefs.preferred_cuisines || [],
                    default_servings: userPrefs.default_servings || 4,
                    measurement_unit: userPrefs.measurement_unit || 'metric'
                });
            }
        } catch (error) {
            toast.error('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/api/users/profile', profile);
            toast.success('Profile updated successfully');

            // Update local storage
            const updatedUser = { ...user, ...profile };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
        
    };

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/api/users/preferences', preferences);
            toast.success('Preferences updated successfully');

        } catch (error) {
            toast.error('Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setSaving(true);

        try {
            await api.put('/api/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        const confirmation = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmation !== 'DELETE') {
            toast.error('Account deletion cancelled');
            return;
        }

        try {
            await api.delete('/api/users/account');
            toast.success('Account deleted successfully');
            logout();
            navigate('/login');
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    const toggleDietary = (option) => {
        setPreferences(prev => ({
            ...prev,
            dietary_restrictions: prev.dietary_restrictions.includes(option)
                ? prev.dietary_restrictions.filter(d => d !== option)
                : [...prev.dietary_restrictions, option]
        }));
    };

    const toggleCuisine = (cuisine) => {
        setPreferences(prev => ({
            ...prev,
            preferred_cuisines: prev.preferred_cuisines.includes(cuisine)
                ? prev.preferred_cuisines.filter(c => c !== cuisine)
                : [...prev.preferred_cuisines, cuisine]
        }));
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FDFBD4' }}>
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: '#38240D' }}>Settings</h1>
                    <p className="mt-1" style={{ color: '#713600' }}>Manage your account and preferences</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#C05800' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF9F0' }}>
                                <User className="w-5 h-5" style={{ color: '#713600' }} />
                            </div>
                            <h2 className="text-xl font-semibold" style={{ color: '#38240D' }}>Profile Information</h2>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                    style={{ borderColor: '#C05800' }}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                    style={{ borderColor: '#C05800' }}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                style={{ backgroundColor: '#713600' }}
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    </div>


                    {/* Change Password Section */}
                    <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#C05800' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E3F2FD' }}>
                                <Lock className="w-5 h-5" style={{ color: '#1976D2' }} />
                            </div>
                            <h2 className="text-xl font-semibold" style={{ color: '#38240D' }}>Change Password</h2>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                    style={{ borderColor: '#C05800' }}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                    style={{ borderColor: '#C05800' }}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                    style={{ borderColor: '#C05800' }}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                style={{ backgroundColor: '#1976D2' }}
                            >
                                <Lock className="w-4 h-4" />
                                {saving ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>

                    {/* Preferences Section */}
                    <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#C05800' }}>
                        <h2 className="text-xl font-semibold mb-6" style={{ color: '#38240D' }}>Dietary Preferences</h2>

                        <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                            {/* Dietary Restrictions */}
                            <div>
                                <label className="block text-sm font-medium mb-3" style={{ color: '#38240D' }}>Dietary Restrictions</label>
                                <div className="flex flex-wrap gap-2">
                                    {DIETARY_OPTIONS.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => toggleDietary(option)}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                            style={preferences.dietary_restrictions.includes(option)
                                                ? { backgroundColor: '#713600', color: 'white' }
                                                : { backgroundColor: '#F0F0F0', color: '#38240D' }
                                            }
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Allergies */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Allergies (comma-separated)</label>
                                <input
                                    type="text"
                                    value={preferences.allergies.join(', ')}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                                    })}
                                    placeholder="e.g., peanuts, shellfish, soy"
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2"
                                    style={{ borderColor: '#C05800' }}
                                />
                            </div>

                            {/* Preferred Cuisines */}
                            <div>
                                <label className="block text-sm font-medium mb-3" style={{ color: '#38240D' }}>Preferred Cuisines</label>
                                <div className="flex flex-wrap gap-2">
                                    {CUISINES.map(cuisine => (
                                        <button
                                            key={cuisine}
                                            type="button"
                                            onClick={() => toggleCuisine(cuisine)}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                            style={preferences.preferred_cuisines.includes(cuisine)
                                                ? { backgroundColor: '#713600', color: '#fff' }
                                                : { backgroundColor: '#FDFBD4', color: '#38240D' }
                                            }
                                        >
                                            {cuisine}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Default Servings */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>
                                    Default Servings: {preferences.default_servings}
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={preferences.default_servings}
                                    onChange={(e) => setPreferences({ ...preferences, default_servings: parseInt(e.target.value) })}
                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                    style={{ backgroundColor: '#E0E0E0', accentColor: '#713600' }}
                                />
                                <div className="flex justify-between text-xs mt-1" style={{ color: '#999999' }}>
                                    <span>1</span>
                                    <span>12</span>
                                </div>
                            </div>

                            {/* Measurement Unit */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Measurement Unit</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPreferences({ ...preferences, measurement_unit: 'metric' })}
                                        className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                                        style={preferences.measurement_unit === 'metric'
                                            ? { backgroundColor: '#713600', color: '#fff' }
                                            : { backgroundColor: '#FDFBD4', color: '#38240D' }
                                        }
                                    >
                                        Metric (kg, L)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreferences({ ...preferences, measurement_unit: 'imperial' })}
                                        className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                                        style={preferences.measurement_unit === 'imperial'
                                            ? { backgroundColor: '#713600', color: '#fff' }
                                            : { backgroundColor: '#FDFBD4', color: '#38240D' }
                                        }
                                    >
                                        Imperial (lb, gal)
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 hover:opacity-90"
                                style={{ backgroundColor: '#713600' }}
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </form>
                    </div>


                    {/* Danger Zone */}
                    <div className="bg-white rounded-xl border border-red-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold" style={{ color: '#38240D' }}>Danger Zone</h2>
                        </div>

                        <p className="mb-4" style={{ color: '#713600' }}>
                            Once you delete your account, there is no going back. All your recipes, meal plans, and data will be permanently deleted.
                        </p>

                        <button
                            onClick={handleDeleteAccount}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
