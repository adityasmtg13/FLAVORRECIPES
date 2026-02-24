import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});