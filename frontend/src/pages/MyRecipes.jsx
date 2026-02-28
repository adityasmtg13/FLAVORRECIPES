import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ChefHat, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const MyRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [loading, setLoading] = useState(true);

    const cuisines = ['All', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
    const difficulties = ['All', 'easy', 'medium', 'hard'];

    useEffect(() => {
        fetchRecipes();
    }, []);

    useEffect(() => {
        const refresh = () => fetchRecipes();
        window.addEventListener('recipeSaved', refresh);
        return () => window.removeEventListener('recipeSaved', refresh);
    }, []);

    useEffect(() => {
        filterRecipes();
    }, [recipes, searchQuery, selectedCuisine, selectedDifficulty]);

    const fetchRecipes = async () => {
        try {
            const response = await api.get('/api/recipes');
            setRecipes(response.data.data.recipes);
        } catch (error) {
            toast.error('Failed to load recipes');
        } finally {
            setLoading(false);
        }
    };

    const filterRecipes = () => {
        let filtered = recipes;

        if (searchQuery) {
            filtered = filtered.filter(recipe =>
                recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCuisine !== 'All') {
            filtered = filtered.filter(recipe => recipe.cuisine_type === selectedCuisine);
        }

        if (selectedDifficulty !== 'All') {
            filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
        }

        setFilteredRecipes(filtered);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;

        try {
            await api.delete(`/api/recipes/${id}`);
            setRecipes(recipes.filter(recipe => recipe.id !== id));
            toast.success('Recipe deleted');
        } catch (error) {
            toast.error('Failed to delete recipe');
        }
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

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FDFBD4' }}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold" style={{ color: '#38240D' }}>My Recipes</h1>
                    <p className="mt-1" style={{ color: '#713600' }}>Your collection of saved recipes</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg border p-4 mb-6" style={{ borderColor: '#C05800' }}>
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#C0C0C0' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search recipes..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none"
                                style={{ borderColor: '#C05800' }}
                            />
                        </div>

                        {/* Cuisine Filter */}
                        <select
                            value={selectedCuisine}
                            onChange={(e) => setSelectedCuisine(e.target.value)}
                            className="px-4 py-2 border rounded-lg outline-none"
                            style={{ borderColor: '#C05800' }}
                        >
                            {cuisines.map(cuisine => (
                                <option key={cuisine} value={cuisine}>
                                    {cuisine === 'All' ? 'All Cuisines' : cuisine}
                                </option>
                            ))}
                        </select>

                        {/* Difficulty Filter */}
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="px-4 py-2 border rounded-lg outline-none"
                            style={{ borderColor: '#C05800' }}
                        >
                            {difficulties.map(diff => (
                                <option key={diff} value={diff}>
                                    {diff === 'All' ? 'All Difficulties' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Recipe Count */}
                <div className="mb-4">
                    <p className="text-sm" style={{ color: '#713600' }}>
                        Showing {filteredRecipes.length} of {recipes.length} recipes
                    </p>
                </div>

                {/* Recipes Grid */}
                {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRecipes.map(recipe => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border p-12 text-center" style={{ borderColor: '#C05800' }}>
                        <ChefHat className="w-16 h-16 mx-auto mb-4" style={{ color: '#C0C0C0' }} />
                        <p className="mb-4" style={{ color: '#999999' }}>
                            {recipes.length === 0 ? 'No recipes yet' : 'No recipes match your filters'}
                        </p>
                        {recipes.length === 0 && (
                            <Link
                                to="/generate"
                                className="inline-block text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                                style={{ backgroundColor: '#713600' }}
                            >
                                Generate Your First Recipe
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const RecipeCard = ({ recipe, onDelete }) => {
    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

    return (
        <div className="rounded-xl border overflow-hidden hover:shadow-lg transition-all group" style={{ backgroundColor: '#fff', borderColor: '#C05800' }}>
            {/* Recipe Image Placeholder */}
            <div className="h-48 flex items-center justify-center" style={{ backgroundColor: '#FDFBD4' }}>
                <ChefHat className="w-16 h-16" style={{ color: '#713600' }} />
            </div>

            {/* Recipe Content */}
            <div className="p-5">
                <Link to={`/recipes/${recipe.id}`} className="block mb-3">
                    <h3 className="font-semibold text-lg transition-colors line-clamp-2" style={{ color: '#38240D' }}>
                        {recipe.name}
                    </h3>
                    {recipe.description && (
                        <p className="text-sm mt-1 line-clamp-2" style={{ color: '#713600' }}>{recipe.description}</p>
                    )}
                </Link>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.cuisine_type && (
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#FDFBD4', color: '#38240D' }}>
                            {recipe.cuisine_type}
                        </span>
                    )}
                    {recipe.difficulty && (
                        <span className="px-2 py-1 rounded text-xs font-medium capitalize" style={{
                            backgroundColor: recipe.difficulty === 'easy' ? '#FDFBD4' : recipe.difficulty === 'medium' ? '#FDFBD4' : '#fff',
                            color: recipe.difficulty === 'easy' ? '#713600' : recipe.difficulty === 'medium' ? '#C05800' : '#38240D'
                        }}>
                            {recipe.difficulty}
                        </span>
                    )}
                    {recipe.dietary_tags && recipe.dietary_tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#FDFBD4', color: '#38240D' }}>
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm mb-4" style={{ color: '#713600' }}>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{totalTime} mins</span>
                    </div>
                    {recipe.calories && (
                        <span>{recipe.calories} cal</span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t" style={{ borderColor: '#C05800' }}>
                    <Link
                        to={`/recipes/${recipe.id}`}
                        className="flex-1 text-white text-center py-2 rounded-lg font-medium transition-colors text-sm hover:opacity-90"
                        style={{ backgroundColor: '#713600' }}
                    >
                        View Recipe
                    </Link>
                    <button
                        onClick={() => onDelete(recipe.id)}
                        className="px-3 py-2 border rounded-lg transition-colors hover:opacity-80"
                        style={{ borderColor: '#C05800', color: '#38240D', backgroundColor: '#fff' }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyRecipes;
