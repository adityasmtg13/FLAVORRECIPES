import express from 'express';

const router = express.Router();

import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

//Protected routes
router.use(authMiddleware); // Apply auth middleware to all routes in this router

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/preferences', userController.updatePreferences);
router.put('/change-password', userController.changePassword);
router.delete('/delete', userController.deleteAccount);

export default router;