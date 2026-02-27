import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import pantryRoutes from './routes/pantry.js';
import mealPlansRoutes from './routes/mealPlans.js';
import shoppingListRoutes from './routes/shoppingList.js';
import recipeRoutes from './routes/recipes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'AI Recipe Generator API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/meal-plans', mealPlansRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/recipes', recipeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});