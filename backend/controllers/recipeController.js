import Recipe from "../models/Recipe.js";
import PantryItem from "../models/PantryItem.js";
import { generateRecipe as generateRecipeAI, generatePantrySuggestions as generatePantrySuggestionsAI} from "../utils/gemini.js";
import { parse } from "node:path";

//Generate recipe using AI
export const generateRecipe = async (req, res, next) => {
    try {
        // log incoming request body for debugging
        console.log('generateRecipe called with body:', req.body);

        const {
            ingredients = [],
            use_pantry = false,
            dietary_restrictions = [],
            cuisine_type = 'any',
            servings = 4,
            cooking_time = 'medium'
        } = req.body;

        let finalIngredients = [...ingredients];
        if (use_pantry) {
            const pantryItems = await PantryItem.findByUserId(req.user.id);
            const pantryIngredientNames = pantryItems.map(item => item.name);
            finalIngredients = [...new Set([...finalIngredients, ...pantryIngredientNames])];
        }

        if (finalIngredients.length === 0) {
            return res.status(400).json({success: false, message: 'At least one ingredient is required to generate a recipe'});
        }

        // build payload for AI helper using expected parameter names
        const aiPayload = {
            ingredients: finalIngredients,
            dietary_restrictions,
            cuisine_type,
            servings,
            cooking_time
        };
        console.log('AI payload:', aiPayload);

        const recipe = await generateRecipeAI(aiPayload);
        // helper to convert snake_case to camelCase and flag extra ingredients
        const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        const normalizeRecipe = (raw, userList = []) => {
            const userLower = userList.map(i => i.toLowerCase());
            const out = {};
            for (const key in raw) {
                const camel = toCamel(key);
                out[camel] = raw[key];
            }
            if (Array.isArray(out.ingredients)) {
                out.ingredients = out.ingredients.map(ing => {
                    const name = (ing.name || '').toString();
                    const required = !userLower.includes(name.toLowerCase());
                    return {...ing, required};
                });
            }
            return out;
        };
        const normalized = normalizeRecipe(recipe, finalIngredients);
        res.json({success: true, message: 'Recipe generated successfully', data: {recipe: normalized}});
    }
    catch (err) {
        console.error('generateRecipe error:', err);
        // if the AI helper throws our own error, forward message
        const message = err.message || 'Failed to generate recipe';
        return res.status(500).json({success: false, message});
    }
};

//Get smart pantry suggestions
export const getPantrySuggestions = async (req, res, next) => {
    try {
        const pantryItems = await PantryItem.findByUserId(req.user.id);
        const expiringItems = await PantryItem.getExpiringSoon(req.user.id, 7);

        const expiringNames = expiringItems.map(item => item.name); 
        const suggestions = await generatePantrySuggestionsAI(pantryItems, expiringNames);
        res.json({success: true, data: {suggestions}});
    }
    catch (err) {
        next(err);
    }
};

//Save generated recipe to user's collection
export const saveRecipe = async (req, res, next) => {
    try {
        console.log('saveRecipe called with body:', req.body);
        const recipe = await Recipe.create(req.user.id, req.body);
        res.status(201).json({success: true, message: 'Recipe saved successfully', data: {recipe}});
    }
    catch (err) {
        console.error('saveRecipe error:', err);
        // return JSON error so front-end can show message
        const message = err.message || 'Failed to save recipe';
        res.status(500).json({success: false, message});
    }
};

//Get all recipes for user with optional filters
export const getRecipes = async (req, res, next) => {
    try {
        const {search, cuisine_type, difficulty, dietary_tag, max_cook_time, sort_by, sort_order, limit, offset} = req.query;
        
        const recipes = await Recipe.findByUserId(req.user.id, {
            search,
            cuisine_type,
            difficulty,
            dietary_tag,
            max_cook_time : max_cook_time ? parseInt(max_cook_time) : undefined,
            sort_by,
            sort_order,
            limit : limit ? parseInt(limit) : undefined,
            offset : offset ? parseInt(offset) : undefined
        });
        res.json({success: true, data: {recipes}});
    }
    catch (err) {
        next(err);
    }
};

//Get recently added recipes
export const getRecentRecipes = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 5;
        // method name corrected to match model implementation
        const recipes = await Recipe.findRecentByUserId(req.user.id, limit);
        res.json({success: true, data: {recipes}});
    }   
    catch (err) {
        console.error('getRecentRecipes error:', err);
        const message = err.message || 'Failed to fetch recent recipes';
        res.status(500).json({success: false, message});
    }
};

//Get recipe details by ID
export const getRecipeById = async (req, res, next) => {
    try {
        const {id} = req.params;
        const recipe = await Recipe.findById(id, req.user.id);

        if (!recipe) {
            return res.status(404).json({success: false, message: 'Recipe not found'});
        }
        res.json({success: true, data: {recipe}});
    }
    catch (err) {
        next(err); 
    }
};

//Update recipe by ID
export const updateRecipe = async (req, res, next) => {
    try {        
        const {id} = req.params;
        const recipe = await Recipe.update(id, req.user.id, req.body);
        if (!recipe) {
            return res.status(404).json({success: false, message: 'Recipe not found or not owned by user'});
        }
        res.json({success: true, message: 'Recipe updated successfully', data: {recipe}});
    }
    catch (err) {
        next(err);
    }
};

//Delete recipe by ID
export const deleteRecipe = async (req, res, next) => {
    try {
        const {id} = req.params;
        const recipe = await Recipe.delete(id, req.user.id);
        if (!recipe) {
            return res.status(404).json({success: false, message: 'Recipe not found or not owned by user'});
        }
        res.json({success: true, message: 'Recipe deleted successfully', data: {recipe}});
    }
    catch (err) {
        next(err);
    }
};

//Get recipe statistics (e.g. most cooked cuisine, average cook time, etc.)
export const getRecipeStats = async (req, res, next) => {
    try {
        const stats = await Recipe.getStats(req.user.id);
        res.json({success: true, data: {stats}});
    }
    catch (err) {
        next(err);
    }
};
