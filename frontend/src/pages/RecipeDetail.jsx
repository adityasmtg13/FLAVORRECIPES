import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, ChefHat, ArrowLeft, Trash2, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api'

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [servings, setServings] = useState(4);
    const [checkedIngredients, setCheckedIngredients] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecipe();
    }, [id]);

    const fetchRecipe = async () => {
        try {
            const response = await api.get(`/api/recipes/${id}`);
            const recipeData = response.data.data.recipe;
            setRecipe(recipeData);
            setServings(recipeData.servings || 4);
        } catch (error) {
            toast.error('Failed to load recipe');
            navigate('/recipes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;

        try {
            await api.delete(`/api/recipes/${id}`);
            toast.success('Recipe deleted');
            navigate('/recipes');
        } catch (error) {
            toast.error('Failed to delete recipe');
        }
    };

    const toggleIngredient = (index) => {
        const newChecked = new Set(checkedIngredients);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedIngredients(newChecked);
    };

    const adjustQuantity = (originalQty, originalServings) => {
        return ((originalQty * servings) / originalServings).toFixed(2);
    };

    if(loading){
        return(
            <div className="min-h-screen" style={{ backgroundColor: '#FDFBD4' }}>
                <Navbar/>
                <div className="flex items-center justify-center h-96">
                    <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#713600' }}></div>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return null;
    }

    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const originalServings = recipe.servings || 4;

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FDFBD4' }}>
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link
                    to="/recipes"
                    className="inline-flex items-center gap-2 mb-6 transition-colors"
                    style={{ color: '#713600' }}
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Recipes
                </Link>

                {/* Recipe Header */}
                <div className="rounded-xl border p-8 mb-6" style={{ backgroundColor: '#fff', borderColor: '#C05800' }}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2" style={{ color: '#38240D' }}>{recipe.name}</h1>
                            {recipe.description && (
                                <p className="text-lg" style={{ color: '#713600' }}>{recipe.description}</p>
                            )}
                        </div>
                        <button
                            onClick={handleDelete}
                            className="p-2 rounded-lg transition-colors hover:opacity-80"
                            style={{ color: '#C05800' }}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {recipe.cuisine_type && (
                            <span className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: '#FDFBD4', color: '#38240D' }}>
                                {recipe.cuisine_type}
                            </span>
                        )}
                        {recipe.difficulty && (
                            <span className="px-3 py-1.5 rounded-full text-sm font-medium capitalize" style={{
                                backgroundColor: recipe.difficulty === 'easy' ? '#FDFBD4' : recipe.difficulty === 'medium' ? '#FDFBD4' : '#fff',
                                color: recipe.difficulty === 'easy' ? '#713600' : recipe.difficulty === 'medium' ? '#C05800' : '#38240D'
                            }}>
                                {recipe.difficulty}
                            </span>
                        )}
                        {recipe.dietary_tags && recipe.dietary_tags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: '#FDFBD4', color: '#38240D' }}>
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-6" style={{ color: '#713600' }}>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">{totalTime} minutes</span>
                        </div>
                        {recipe.prep_time && (
                            <div className="text-sm">
                                Prep: {recipe.prep_time} min
                            </div>
                        )}
                        {recipe.cook_time && (
                            <div className="text-sm">
                                Cook: {recipe.cook_time} min
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ingredients Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border p-6 sticky top-24" style={{ borderColor: '#C05800' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold" style={{ color: '#38240D' }}>Ingredients</h2>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" style={{ color: '#999999' }} />
                                    <span className="text-sm" style={{ color: '#713600' }}>Servings:</span>
                                </div>
                            </div>

                            {/* Servings Adjuster */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setServings(Math.max(1, servings - 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg font-medium transition-colors"
                                        style={{ backgroundColor: '#F0F0F0', color: '#38240D' }}
                                    >
                                        −
                                    </button>
                                    <span className="text-lg font-semibold w-12 text-center" style={{ color: '#38240D' }}>
                                        {servings}
                                    </span>
                                    <button
                                        onClick={() => setServings(servings + 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg font-medium transition-colors"
                                        style={{ backgroundColor: '#F0F0F0', color: '#38240D' }}
                                    >
                                        +
                                    </button>
                                    {servings !== originalServings && (
                                        <button
                                            onClick={() => setServings(originalServings)}
                                            className="text-sm font-medium"
                                            style={{ color: '#713600' }}
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Ingredients List */}
                            <div className="space-y-3">
                                {recipe.ingredients && recipe.ingredients.map((ingredient, index) => {
                                    const adjustedQty = adjustQuantity(ingredient.quantity, originalServings);
                                    const isChecked = checkedIngredients.has(index);

                                    return (
                                        <label
                                            key={index}
                                            className="flex items-start gap-3 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleIngredient(index)}
                                                className="mt-1 w-4 h-4 border rounded"
                                                style={{ borderColor: '#C05800', accentColor: '#713600' }}
                                            />
                                            <span className={isChecked ? 'line-through' : ''} style={{ color: isChecked ? '#C0C0C0' : '#38240D' }}>
                                                <span className="font-medium">{adjustedQty}</span> {ingredient.unit} {ingredient.name}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#C05800' }}>
                            <h2 className="text-xl font-semibold mb-4" style={{ color: '#38240D' }}>Instructions</h2>
                            <ol className="space-y-4">
                                {recipe.instructions && recipe.instructions.map((step, index) => (
                                    <li key={index} className="flex gap-4">
                                        <span className="shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#713600' }}>
                                            {index + 1}
                                        </span>
                                        <p className="pt-1 flex-1" style={{ color: '#38240D' }}>{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Nutrition Info */}
                        {recipe.nutrition && (
                            <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#C05800' }}>
                                <h2 className="text-xl font-semibold mb-4" style={{ color: '#38240D' }}>Nutrition (per serving)</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    <NutritionCard label="Calories" value={recipe.nutrition.calories} unit="kcal" />
                                    <NutritionCard label="Protein" value={recipe.nutrition.protein} unit="g" />
                                    <NutritionCard label="Carbs" value={recipe.nutrition.carbs} unit="g" />
                                    <NutritionCard label="Fats" value={recipe.nutrition.fats} unit="g" />
                                    <NutritionCard label="Fiber" value={recipe.nutrition.fiber} unit="g" />
                                </div>
                            </div>
                        )}

                        {/* User Notes */}
                        {recipe.user_notes && (
                            <div className="rounded-xl border p-6" style={{ backgroundColor: '#FFF9F0', borderColor: '#713600' }}>
                                <h3 className="font-semibold mb-2" style={{ color: '#713600' }}>📝 Notes</h3>
                                <p style={{ color: '#713600' }}>{recipe.user_notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NutritionCard = ({ label, value, unit }) => (
    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FDFBD4' }}>
        <div className="text-2xl font-bold" style={{ color: '#38240D' }}>{value}{unit}</div>
        <div className="text-sm mt-1" style={{ color: '#713600' }}>{label}</div>
    </div>
);

export default RecipeDetail;
