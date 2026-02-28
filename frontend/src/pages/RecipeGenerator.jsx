import { useState, useEffect } from 'react';
import { ChefHat, Sparkles, Plus, X, Clock, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api'

const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const COOKING_TIMES = [
    { value: 'quick', label: 'Quick (<30 min)' },
    { value: 'medium', label: 'Medium (30-60 min)' },
    { value: 'long', label: 'Long (>60 min)' }
];

const RecipeGenerator = () => {
    const [ingredients, setIngredients] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [usePantry, setUsePantry] = useState(false);
    const [cuisineType, setCuisineType] = useState('Any');
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [servings, setServings] = useState(4);
    const [cookingTime, setCookingTime] = useState('medium');
    const [generating, setGenerating] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState(null);
    const [saving, setSaving] = useState(false);
    const [preferencesLoaded, setPreferencesLoaded] = useState(false);
    // pantry items pulled from backend when user toggles the checkbox
    const [pantryIngredients, setPantryIngredients] = useState([]);

    // Load user preferences on component mount
    useEffect(() => {
        const fetchUserPreferences = async () => {
            try {
                const response = await api.get('/api/users/profile');
                const preferences = response.data.data.preferences;

                if (preferences) {
                    // Auto-fill dietary restrictions
                    if (preferences.dietary_restrictions && preferences.dietary_restrictions.length > 0) {
                        setDietaryRestrictions(preferences.dietary_restrictions);
                    }

                    // Auto-fill preferred cuisine (use first one if multiple)
                    if (preferences.preferred_cuisines && preferences.preferred_cuisines.length > 0) {
                        setCuisineType(preferences.preferred_cuisines[0]);
                    }

                    // Auto-fill default servings
                    if (preferences.default_servings) {
                        setServings(preferences.default_servings);
                    }

                    setPreferencesLoaded(true);
                }
            } catch (error) {
                console.error('Failed to load user preferences:', error);
                setPreferencesLoaded(true);
            }
        };
        fetchUserPreferences();

    }, []);

    const addIngredient = () => {
        if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
            setIngredients([...ingredients, inputValue.trim()]);
            setInputValue('');
        }
    };

    // when user toggles usePantry we need to fetch the items once
    useEffect(() => {
        const fetchPantry = async () => {
            try {
                console.log('fetching pantry ingredients');
                const res = await api.get('/api/pantry');
                // support new response shape or old
                const items = res.data.pantryItems || res.data.data?.items || [];
                const names = items.map(i => i.name.toLowerCase());
                setPantryIngredients(names);
                console.log('pantry fetched', names);
            } catch (err) {
                console.error('failed to load pantry', err);
                setPantryIngredients([]);
            }
        };

        if (usePantry) {
            fetchPantry();
        } else {
            setPantryIngredients([]);
        }
    }, [usePantry]);

    const removeIngredient = (ingredient) => {
        setIngredients(ingredients.filter(i => i !== ingredient));
    };

    const toggleDietary = (option) => {
        if (dietaryRestrictions.includes(option)) {
            setDietaryRestrictions(dietaryRestrictions.filter(d => d !== option));
        } else {
            setDietaryRestrictions([...dietaryRestrictions, option]);
        }
    };

    const handleGenerate = async () => {
        // ensure at least one source of ingredients
        if (!usePantry && ingredients.length === 0) {
            toast.error('Please add at least one ingredient or use pantry items');
            return;
        }

        setGenerating(true);
        setGeneratedRecipe(null);

        // merge manual and pantry ingredients on client side for clarity/logging
        const allIngredients = usePantry
            ? [...new Set([...(ingredients || []), ...(pantryIngredients || [])])]
            : ingredients;

        console.log('using pantry?', usePantry);
        console.log('manual ingredients', ingredients);
        console.log('pantry ingredients', pantryIngredients);
        console.log('final payload ingredients', allIngredients);

        try {
            const response = await api.post('/api/recipes/generate', {
                ingredients: allIngredients,
                use_pantry: usePantry,
                dietary_restrictions: dietaryRestrictions,
                cuisine_type: cuisineType === 'Any' ? 'any' : cuisineType.toLowerCase(),
                servings,
                cooking_time: cookingTime
            });

            setGeneratedRecipe(response.data.data.recipe);
            toast.success('Recipe generated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate recipe');
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveRecipe = async () => {
        if (!generatedRecipe) return;

        setSaving(true);
        try {
            await api.post('/api/recipes', {
                name: generatedRecipe.name,
                description: generatedRecipe.description,
                cuisine_type: generatedRecipe.cuisineType,
                difficulty: generatedRecipe.difficulty,
                prep_time: generatedRecipe.prepTime,
                cook_time: generatedRecipe.cookTime,
                servings: generatedRecipe.servings,
                instructions: generatedRecipe.instructions,
                dietary_tags: generatedRecipe.dietaryTags || [],
                ingredients: generatedRecipe.ingredients,
                nutrition: generatedRecipe.nutrition
            });

            toast.success('Recipe saved to your collection!');
            // notify other pages to refresh recents/list
            window.dispatchEvent(new Event('recipeSaved'));
        } catch (error) {
            toast.error('Failed to save recipe');
        } finally {
            setSaving(false);
        } 
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FDFBD4' }}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#713600' }}>
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: '#38240D' }}>AI Recipe Generator</h1>
                    <p className="mt-2" style={{ color: '#713600' }}>Let AI create delicious recipes based on your ingredients</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#C05800' }}>
                            <h2 className="text-lg font-semibold mb-4" style={{ color: '#38240D' }}>Ingredients</h2>

                            {/* Use Pantry Toggle */}
                            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9F0' }}>
                                <input
                                    type="checkbox"
                                    id="use-pantry"
                                    checked={usePantry}
                                    onChange={(e) => setUsePantry(e.target.checked)}
                                    className="w-4 h-4 border rounded"
                                    style={{ borderColor: '#C05800', accentColor: '#713600' }}
                                />
                                <label htmlFor="use-pantry" className="text-sm font-medium" style={{ color: '#713600' }}>
                                    Use ingredients from my pantry
                                </label>
                            </div>

                            {/* Manual Ingredient Input */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                                    placeholder="Add ingredient (e.g., tomatoes)"
                                    className="flex-1 px-3 py-2 border rounded-lg outline-none"
                                    style={{ borderColor: '#C05800' }}
                                />
                                <button
                                    onClick={addIngredient}
                                    className="px-4 py-2 text-white rounded-lg transition-colors"
                                    style={{ backgroundColor: '#713600' }}
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Ingredient Tags */}
                            {ingredients.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {ingredients.map((ingredient, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
                                            style={{ backgroundColor: '#F0F0F0', color: '#38240D' }}
                                        >
                                            {ingredient}
                                            <button
                                                onClick={() => removeIngredient(ingredient)}
                                                className="hover:text-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Preferences */}
                        <div className="bg-white rounded-xl border p-6 space-y-5" style={{ borderColor: '#C05800' }}>
                            <h2 className="text-lg font-semibold" style={{ color: '#38240D' }}>Preferences</h2>

                            {/* Cuisine Type */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Cuisine Type</label>
                                <select
                                    value={cuisineType}
                                    onChange={(e) => setCuisineType(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                    style={{ borderColor: '#C05800' }}
                                >
                                    {CUISINES.map(cuisine => (
                                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dietary Restrictions */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Dietary Restrictions</label>
                                <div className="flex flex-wrap gap-2">
                                    {DIETARY_OPTIONS.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => toggleDietary(option)}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                            style={dietaryRestrictions.includes(option)
                                                ? { backgroundColor: '#713600', color: '#fff' }
                                                : { backgroundColor: '#FDFBD4', color: '#38240D' }
                                            }
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Servings */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>
                                    Servings: {servings}
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={servings}
                                    onChange={(e) => setServings(parseInt(e.target.value))}
                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                    style={{ backgroundColor: '#E0E0E0', accentColor: '#713600' }}
                                />
                                <div className="flex justify-between text-xs mt-1" style={{ color: '#999999' }}>
                                    <span>1</span>
                                    <span>12</span>
                                </div>
                            </div>

                            {/* Cooking Time */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Cooking Time</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {COOKING_TIMES.map(time => (
                                        <button
                                            key={time.value}
                                            onClick={() => setCookingTime(time.value)}
                                            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                            style={cookingTime === time.value
                                                ? { backgroundColor: '#713600', color: '#fff' }
                                                : { backgroundColor: '#FDFBD4', color: '#38240D' }
                                            }
                                        >
                                            {time.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="w-full text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#713600' }}
                        >
                            {generating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating Recipe...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Recipe
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results Section */}
                    <div>
                        {generatedRecipe ? (
                            <div className="bg-white rounded-xl border p-6 space-y-6" style={{ borderColor: '#C05800' }}>
                                {/* Recipe Header */}
                                <div>
                                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#38240D' }}>{generatedRecipe.name}</h2>
                                    <p style={{ color: '#713600' }}>{generatedRecipe.description}</p>

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#FFF9F0', color: '#713600' }}>
                                            {generatedRecipe.cuisineType}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-sm font-medium capitalize" style={{ backgroundColor: '#F0F0F0', color: '#38240D' }}>
                                            {generatedRecipe.difficulty}
                                        </span>
                                        {generatedRecipe.dietaryTags?.map(tag => (
                                            <span key={tag} className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#FFF0E6', color: '#C05800' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-6 mt-4 text-sm" style={{ color: '#713600' }}>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {/* compute total time with fallbacks */}
                                            {(() => {
                                                const prep = generatedRecipe.prepTime ?? generatedRecipe.prep_time ?? 0;
                                                const cook = generatedRecipe.cookTime ?? generatedRecipe.cook_time ?? 0;
                                                const total = typeof prep === 'number' && typeof cook === 'number' ? prep + cook : null;
                                                return <span>{total ? `${total} mins` : 'N/A'}</span>;
                                            })()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>{generatedRecipe.servings} servings</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ingredients */}
                                <div>
                                    <h3 className="font-semibold mb-3" style={{ color: '#38240D' }}>Ingredients</h3>
                                    <ul className="space-y-2">
                                        {generatedRecipe.ingredients?.map((ing, index) => (
                                            <li key={index} className="flex items-center gap-2" style={{ color: '#38240D' }}>
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#713600' }}></span>
                                                {ing.quantity} {ing.unit} {ing.name}
                                                {ing.required && (
                                                    <span className="text-red-500 text-xs italic ml-1">
                                                        (required)
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Instructions */}
                                <div>
                                    <h3 className="font-semibold mb-3" style={{ color: '#38240D' }}>Instructions</h3>
                                    <ol className="space-y-3">
                                        {generatedRecipe.instructions?.map((step, index) => (
                                            <li key={index} className="flex gap-3">
                                                <span className="shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: '#713600' }}>
                                                    {index + 1}
                                                </span>
                                                <span className="pt-0.5" style={{ color: '#38240D' }}>{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Nutrition */}
                                {generatedRecipe.nutrition && (
                                    <div>
                                        <h3 className="font-semibold mb-3" style={{ color: '#38240D' }}>Nutrition (per serving)</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                            <NutritionBadge label="Calories" value={generatedRecipe.nutrition.calories} unit="kcal" />
                                            <NutritionBadge label="Protein" value={generatedRecipe.nutrition.protein} unit="g" />
                                            <NutritionBadge label="Carbs" value={generatedRecipe.nutrition.carbs} unit="g" />
                                            <NutritionBadge label="Fats" value={generatedRecipe.nutrition.fats} unit="g" />
                                            <NutritionBadge label="Fiber" value={generatedRecipe.nutrition.fiber} unit="g" />
                                        </div>
                                    </div>
                                )}

                                {/* Cooking Tips */}
                                {generatedRecipe.cookingTips && generatedRecipe.cookingTips.length > 0 && (
                                    <div className="rounded-lg p-4" style={{ backgroundColor: '#FFF9F0' }}>
                                        <h3 className="font-semibold mb-2" style={{ color: '#713600' }}>💡 Cooking Tips</h3>
                                        <ul className="space-y-1">
                                            {generatedRecipe.cookingTips.map((tip, index) => (
                                                <li key={index} className="text-sm" style={{ color: '#713600' }}>• {tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#C05800' }}>
                                    <button
                                        onClick={handleSaveRecipe}
                                        disabled={saving}
                                        className="flex-1 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                                        style={{ backgroundColor: '#713600' }}
                                    >
                                        {saving ? 'Saving...' : 'Save Recipe'}
                                    </button>
                                    <button
                                        onClick={() => setGeneratedRecipe(null)}
                                        className="px-6 py-2.5 border rounded-lg font-medium transition-colors"
                                        style={{ borderColor: '#C05800', color: '#38240D' }}
                                    >
                                        New Recipe
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border p-12 text-center h-full flex flex-col items-center justify-center" style={{ borderColor: '#C05800' }}>
                                <ChefHat className="w-16 h-16 mb-4" style={{ color: '#C0C0C0' }} />
                                <p style={{ color: '#999999' }}>Your generated recipe will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NutritionBadge = ({ label, value, unit }) => (
    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#FDFBD4' }}>
        <div className="text-lg font-bold" style={{ color: '#38240D' }}>{value}{unit}</div>
        <div className="text-xs" style={{ color: '#713600' }}>{label}</div>
    </div>
);

export default RecipeGenerator;
