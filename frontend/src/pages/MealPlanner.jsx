import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, X, ChefHat } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { format, startOfWeek, addDays } from 'date-fns';
import api from '../services/api'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MealPlanner = () => {
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
    const [mealPlan, setMealPlan] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMealPlan();
        fetchRecipes();
    }, [weekStart]);

    const fetchMealPlan = async () => {
        try {
            const startDate = format(weekStart, 'yyyy-MM-dd');
            const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');

            const response = await api.get(`/api/meal-plans/weekly?start_date=${startDate}&end_date=${endDate}`);
            const meals = response.data.data.mealPlans;

            // Organize meals by date and meal type
            const organized = {};
            meals.forEach(meal => {
                const dateKey = meal.meal_date;
                if (!organized[dateKey]) {
                    organized[dateKey] = {};
                }
                organized[dateKey][meal.meal_type] = meal;
            });

            setMealPlan(organized);
        } catch (error) {
            toast.error('Failed to load meal plan');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipes = async () => {
        try {
            const response = await api.get('/api/recipes');
            setRecipes(response.data.data.recipes);
        } catch (error) {
            console.error('Failed to load recipes');
        }
    };

    const handleAddMeal = (date, mealType) => {
        setSelectedSlot({ date, mealType });
        setShowAddModal(true);
    };

    const handleRemoveMeal = async (mealId) => {
        if (!confirm('Remove this meal from your plan?')) return;

        try {
            await api.delete(`/api/meal-plans/${mealId}`);
            await fetchMealPlan();
            toast.success('Meal removed');
        } catch (error) {
            toast.error('Failed to remove meal');
        }
    };

    const getDayMeals = (dayIndex) => {
        const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
        return mealPlan[date] || {};
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FDFBD4' }}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: '#38240D' }}>Meal Planner</h1>
                        <p className="mt-1" style={{ color: '#713600' }}>Plan your weekly meals</p>
                    </div>

                    {/* Week Navigation */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setWeekStart(addDays(weekStart, -7))}
                            className="px-4 py-2 border rounded-lg font-medium transition-colors"
                            style={{ borderColor: '#C05800', color: '#38240D' }}
                        >
                            Previous Week
                        </button>
                        <button
                            onClick={() => setWeekStart(startOfWeek(new Date()))}
                            className="px-4 py-2 text-white rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: '#713600' }}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setWeekStart(addDays(weekStart, 7))}
                            className="px-4 py-2 border rounded-lg font-medium transition-colors"
                            style={{ borderColor: '#C05800', color: '#38240D' }}
                        >
                            Next Week
                        </button>
                    </div>
                </div>

                {/* Week Display */}
                <div className="bg-white rounded-lg border p-4 mb-6" style={{ borderColor: '#C05800' }}>
                    <div className="text-center">
                        <p className="text-sm" style={{ color: '#713600' }}>Week of</p>
                        <p className="text-lg font-semibold" style={{ color: '#38240D' }}>
                            {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#C05800' }}>
                    {/* Header Row */}
                    <div className="grid grid-cols-8 border-b" style={{ borderColor: '#C05800', backgroundColor: '#FDFBD4' }}>
                        <div className="p-4 font-semibold border-r" style={{ borderColor: '#C05800', color: '#38240D' }}>
                            Meal
                        </div>
                        {DAYS_OF_WEEK.map((day, index) => (
                            <div key={day} className="p-4 text-center border-r last:border-r-0" style={{ borderColor: '#C05800' }}>
                                <div className="font-semibold" style={{ color: '#38240D' }}>{day}</div>
                                <div className="text-sm" style={{ color: '#713600' }}>
                                    {format(addDays(weekStart, index), 'MMM d')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Meal Rows */}
                    {MEAL_TYPES.map(mealType => (
                        <div key={mealType} className="grid grid-cols-8 border-b last:border-b-0" style={{ borderColor: '#C05800' }}>
                            <div className="p-4 font-medium capitalize border-r" style={{ borderColor: '#C05800', backgroundColor: '#FDFBD4', color: '#38240D' }}>
                                {mealType}
                            </div>
                            {DAYS_OF_WEEK.map((_, dayIndex) => {
                                const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
                                const dayMeals = getDayMeals(dayIndex);
                                const meal = dayMeals[mealType];

                                return (
                                    <div
                                        key={dayIndex}
                                        className="p-3 border-r last:border-r-0 min-h-[100px] transition-colors"
                                        style={{ borderColor: '#C05800' }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#FFF9F0'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        {meal ? (
                                            <div className="relative group">
                                                <div className="rounded-lg p-3" style={{ backgroundColor: '#FFF9F0', borderColor: '#713600', border: '1px solid #713600' }}>
                                                    <p className="text-sm font-medium line-clamp-2" style={{ color: '#713600' }}>
                                                        {meal.recipe_name}
                                                    </p>
                                                    <button
                                                        onClick={() => handleRemoveMeal(meal.id)}
                                                        className="absolute top-1 right-1 p-1 rounded transition-all opacity-0 group-hover:opacity-100"
                                                        style={{ backgroundColor: 'white', color: '#C0C0C0' }}
                                                        onMouseEnter={(e) => e.target.style.color = '#FF6B6B'}
                                                        onMouseLeave={(e) => e.target.style.color = '#C0C0C0'}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAddMeal(date, mealType)}
                                                className="w-full h-full flex items-center justify-center rounded-lg transition-colors group"
                                                style={{ color: '#C0C0C0' }}
                                                onMouseEnter={(e) => { e.target.style.color = '#713600'; e.target.style.backgroundColor = '#FFF9F0'; }}
                                                onMouseLeave={(e) => { e.target.style.color = '#C0C0C0'; e.target.style.backgroundColor = 'transparent'; }}
                                            >
                                                <Plus className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#C05800' }}>
                        <p className="text-sm" style={{ color: '#713600' }}>Meals Planned</p>
                        <p className="text-2xl font-bold" style={{ color: '#38240D' }}>
                            {Object.values(mealPlan).reduce((acc, day) => acc + Object.keys(day).length, 0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#C05800' }}>
                        <p className="text-sm" style={{ color: '#713600' }}>Total Recipes</p>
                        <p className="text-2xl font-bold" style={{ color: '#38240D' }}>{recipes.length}</p>
                    </div>
                    <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#C05800' }}>
                        <p className="text-sm" style={{ color: '#713600' }}>This Week</p>
                        <p className="text-2xl font-bold" style={{ color: '#38240D' }}>
                            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Meal Modal */}
            {showAddModal && selectedSlot && (
                <AddMealModal
                    date={selectedSlot.date}
                    mealType={selectedSlot.mealType}
                    recipes={recipes}
                    onClose={() => {
                        setShowAddModal(false);
                        setSelectedSlot(null);
                    }}
                    onSuccess={(newMeal) => {
                        // Add to local state
                        const updatedPlan = { ...mealPlan };
                        const date = selectedSlot.date;
                        if (!updatedPlan[date]) {
                            updatedPlan[date] = {};
                        }
                        updatedPlan[date][selectedSlot.mealType] = newMeal;
                        setMealPlan(updatedPlan);
                        setShowAddModal(false);
                        setSelectedSlot(null);
                    }}
                />
            )}
        </div>
    );
};

const AddMealModal = ({ date, mealType, recipes, onClose, onSuccess }) => {
    const [selectedRecipe, setSelectedRecipe] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRecipe) {
            toast.error('Please select a recipe');
            return;
        }

        setLoading(true);

        try {
            await api.post('/api/meal-plans', {
                recipe_id: selectedRecipe,
                planned_date: date,
                meal_type: mealType
            });

            toast.success('Meal added to plan');
            onSuccess();
        } catch (error) {
            toast.error('Failed to add meal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: '#38240D' }}>Add Meal</h2>
                        <p className="text-sm capitalize" style={{ color: '#713600' }}>
                            {format(new Date(date), 'EEEE, MMM d')} - {mealType}
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="transition-colors" 
                        style={{ color: '#C0C0C0' }}
                        onMouseEnter={(e) => e.target.style.color = '#666'}
                        onMouseLeave={(e) => e.target.style.color = '#C0C0C0'}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Search */}
                    <div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search recipes..."
                            className="w-full px-3 py-2 border rounded-lg outline-none"
                            style={{ borderColor: '#C05800' }}
                        />
                    </div>

                    {/* Recipe List */}
                    <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                        {filteredRecipes.length > 0 ? (
                            filteredRecipes.map(recipe => (
                                <label
                                    key={recipe.id}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors`}
                                    style={selectedRecipe === recipe.id ? { borderColor: '#713600', backgroundColor: '#FFF9F0' } : { borderColor: '#C05800' }}
                                >
                                    <input
                                        type="radio"
                                        name="recipe"
                                        value={recipe.id}
                                        checked={selectedRecipe === recipe.id}
                                        onChange={(e) => setSelectedRecipe(e.target.value)}
                                        className="w-4 h-4 border rounded"
                                        style={{ borderColor: '#C05800', accentColor: '#713600' }}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium" style={{ color: '#38240D' }}>{recipe.name}</p>
                                        {recipe.cuisine_type && (
                                            <p className="text-xs" style={{ color: '#999999' }}>{recipe.cuisine_type}</p>
                                        )}
                                    </div>
                                </label>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <ChefHat className="w-12 h-12 mx-auto mb-2" style={{ color: '#C0C0C0' }} />
                                <p style={{ color: '#999999' }}>No recipes found</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border rounded-lg font-medium transition-colors"
                            style={{ borderColor: '#C05800', color: '#38240D' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedRecipe}
                            className="flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            style={{ backgroundColor: '#713600' }}
                        >
                            {loading ? 'Adding...' : 'Add Meal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MealPlanner;
