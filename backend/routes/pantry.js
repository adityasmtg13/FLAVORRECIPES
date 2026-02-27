import express from 'express';

const router = express.Router();

import * as pantryController from '../controllers/pantryController.js';
import authMiddleware from '../middleware/auth.js';

//Protected routes
router.use(authMiddleware); // Apply auth middleware to all routes in this router

router.get('/', pantryController.getPantryItems);
router.get('/stats', pantryController.getPantryStats);
router.get('/expiring-soon', pantryController.getExpiringSoon);    
router.post('/', pantryController.addPantryItem);
router.put('/:id', pantryController.updatePantryItem);
router.delete('/:id', pantryController.deletePantryItem);

export default router;