import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Home, UtensilsCrossed, Calendar, ShoppingCart, Settings, LogOut } from 'lucide-react';
import {useState, useEffect, useRef} from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false);
    };

    //Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)){
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="border-b sticky top-0 z-50" style={{ backgroundColor: '#fff', borderColor: '#C05800' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2" style={{ color: '#38240D' }}>
                        <img src="/logo.png" alt="FLAVORRECIPES" className="h-10" />
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink to="/dashboard" icon={<Home className="w-4 h-4" />} label="Dashboard" />
                        <NavLink to="/pantry" icon={<UtensilsCrossed className="w-4 h-4" />} label="Pantry" />
                        <NavLink to="/generate" icon={<ChefHat className="w-4 h-4" />} label="Generate" />
                        <NavLink to="/recipes" icon={<UtensilsCrossed className="w-4 h-4" />} label="Recipes" />
                        <NavLink to="/meal-plan" icon={<Calendar className="w-4 h-4" />} label="Meal Plan" />
                        <NavLink to="/shopping-list" icon={<ShoppingCart className="w-4 h-4" />} label="Shopping" />
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/settings"
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#713600' }}
                        >
                            <Settings className="w-5 h-5" />
                        </Link>
                        

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                            style={{ color: '#38240D' }}
                            >
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#713600' }}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>

                            <span className="hidden sm:inline font-medium">
                                {user?.name || "User"}
                            </span>
                            </button>

                            {/* Dropdown */}
                            {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 border rounded-lg shadow-lg z-50" style={{ backgroundColor: '#FDFBD4', borderColor: '#C05800' }}>

                                {/* User Info */}
                                <div className="px-4 py-3 border-b min-w-0" style={{ borderColor: '#C05800', color: '#38240D' }}>
                                <p className="text-sm font-semibold">
                                    {user?.name || "User"}
                                </p>
                                <p className="text-xs truncate" style={{ color: '#713600' }}>
                                    {user?.email || "user@example.com"}
                                </p>
                                </div>

                                {/* Logout */}
                                <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                                style={{ color: '#C05800' }}
                                >
                                <LogOut className="w-4 h-4" />
                                Logout
                                </button>

                            </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label }) => {
    return (
        <Link
            to={to}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ color: '#38240D' }}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

export default Navbar;
