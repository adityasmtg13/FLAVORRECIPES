import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChefHat, UtensilsCrossed, Calendar, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRecipes: 0,
        pantryItems: 0,
        mealsThisWeek: 0
    });
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [upcomingMeals, setUpcomingMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    // whenever dashboard becomes active or pantry changes elsewhere we reload data
    const [dashVersion, setDashVersion] = useState(0);

    useEffect(() => {
        fetchDashboardData();
    }, [dashVersion]);

    useEffect(() => {
        const handleChange = () => {
            setDashVersion(v => v + 1);
        };
        window.addEventListener('pantryChanged', handleChange);
        window.addEventListener('recipeSaved', handleChange);
        window.addEventListener('focus', handleChange);
        return () => {
            window.removeEventListener('pantryChanged', handleChange);
            window.removeEventListener('recipeSaved', handleChange);
            window.removeEventListener('focus', handleChange);
        };
    }, []);


    const fetchDashboardData = async () => {
        try{
            // get stats about recipes and meal plans but fetch pantry items list directly
            const [recipesRes, pantryRes, mealPlanRes, recentRes, upcomingRes] = await Promise.all([
                api.get('/api/recipes/stats'),
                api.get('/api/pantry'),
                api.get('/api/meal-plans/stats'),
                api.get('/api/recipes/recent?limit=5'),
                api.get('/api/meal-plans/upcoming?limit=5')
            ]);

            const pantryItems =
                pantryRes.data.pantryItems ||
                pantryRes.data.data?.items ||
                [];

            setStats({
                totalRecipes: recipesRes.data.data.stats.total_recipes || 0,
                pantryItems: pantryItems.length,
                mealsThisWeek: mealPlanRes.data.data.stats.this_week_count || 0
            });

            setRecentRecipes(recentRes.data.data.recipes || []);
            setUpcomingMeals(upcomingRes.data.data.meals || []);
        } catch(error){
            console.error('Error fetching dashboard data:', error);
        } finally{
            setLoading(false);
        }
    };

    if(loading){
        return(
            <div className="min-h-screen" style={{ backgroundColor: '#FDFBD4' }}>
                <Navbar/>
                <div className="flex items-center justify-center h-96">
                    <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C05800', borderTopColor: 'transparent' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FDFBD4' }}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: '#38240D' }}>Dashboard</h1>
                    <p className="mt-1" style={{ color: '#713600' }}>Welcome back! Here's your cooking overview</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={<ChefHat className="w-6 h-6" />}
                        label="Total Recipes"
                        value={stats.totalRecipes}
                        color="brown"
                    />
                    <StatCard
                        icon={<UtensilsCrossed className="w-6 h-6" />}
                        label="Pantry Items"
                        value={stats.pantryItems}
                        color="orange"
                    />
                    <StatCard
                        icon={<Calendar className="w-6 h-6" />}
                        label="Meals This Week"
                        value={stats.mealsThisWeek}
                        color="dark"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link
                        to="/generate"
                        className="p-6 rounded-xl shadow-sm hover:shadow-md transition-all group"
                        style={{ backgroundColor: '#fff' }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#FDFBD4', color: '#713600' }}>
                                <ChefHat className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg" style={{ color: '#38240D' }}>Generate Recipe</h3>
                                <p className="text-sm" style={{ color: '#713600' }}>Create AI-powered recipes</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/pantry"
                        className="p-6 rounded-xl shadow-sm hover:shadow-md transition-all group border"
                        style={{ backgroundColor: '#fff', borderColor: '#C05800' }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#FDFBD4', color: '#713600' }}>
                                <UtensilsCrossed className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg" style={{ color: '#38240D' }}>Manage Pantry</h3>
                                <p className="text-sm" style={{ color: '#713600' }}>Add and track ingredients</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Recipes & Upcoming Meals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Recipes */}
                    <div className="rounded-xl border p-6" style={{ backgroundColor: '#fff', borderColor: '#C05800' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold" style={{ color: '#38240D' }}>Recent Recipes</h2>
                            <Link to="/recipes" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#713600' }}>
                                View all
                            </Link>
                        </div>

                        {recentRecipes.length > 0 ? (
                            <div className="space-y-3">
                                {recentRecipes.map((recipe) => (
                                    <Link
                                        key={recipe.id}
                                        to={`/recipes/${recipe.id}`}
                                        className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                                        style={{ backgroundColor: '#FDFBD4' }}
                                    >
                                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fff', color: '#713600', border: '1px solid #C05800' }}>
                                            <ChefHat className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate" style={{ color: '#38240D' }}>{recipe.name}</h3>
                                            <p className="text-sm flex items-center gap-1" style={{ color: '#C05800' }}>
                                                <Clock className="w-3 h-3" />
                                                {recipe.cook_time} mins
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-8" style={{ color: '#713600' }}>No recipes yet. Generate your first one!</p>
                        )}
                    </div>

                    {/* Upcoming Meals */}
                    <div className="rounded-xl border p-6" style={{ backgroundColor: '#fff', borderColor: '#C05800' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold" style={{ color: '#38240D' }}>Upcoming Meals</h2>
                            <Link to="/meal-plan" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#713600' }}>
                                View calendar
                            </Link>
                        </div>

                        {upcomingMeals.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingMeals.map((meal) => (
                                    <div
                                        key={meal.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border"
                                        style={{ borderColor: '#C05800' }}
                                    >
                                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FDFBD4', color: '#713600' }}>
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate" style={{ color: '#38240D' }}>{meal.recipe_name}</h3>
                                            <p className="text-sm capitalize" style={{ color: '#713600' }}>{meal.meal_type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-8" style={{ color: '#713600' }}>No meals planned yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        brown: { bg: '#FDFBD4', color: '#713600' },
        orange: { bg: '#fff', color: '#C05800' },
        dark: { bg: '#fff', color: '#38240D' }
    };

    const styles = colorClasses[color] || colorClasses.brown;

    return (
        <div className="rounded-xl border p-6" style={{ backgroundColor: '#fff', borderColor: '#C05800' }}>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: styles.bg, color: styles.color }}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm" style={{ color: '#713600' }}>{label}</p>
                    <p className="text-2xl font-bold" style={{ color: '#38240D' }}>{value}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
