import express from 'express';  
const router = express.Router();

import * as recipeController from '../controllers/recipeController.js';
import authMiddleware from '../middleware/auth.js';

//Protected routes
router.use(authMiddleware); // Apply auth middleware to all routes in this router

//AI Recipe Generation
router.post('/generate', recipeController.generateRecipe);
router.post('/suggestions', recipeController.getPantrySuggestions);

//CRUD Operations for user-generated recipes
router.get('/', recipeController.getRecipes);
router.get('/recent', recipeController.getRecentRecipes);
router.get('/stats', recipeController.getRecipeStats);
router.get('/:id', recipeController.getRecipeById);
router.post('/', recipeController.saveRecipe);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

export default router;