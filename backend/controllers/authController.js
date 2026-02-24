import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';
import jwt from 'jsonwebtoken';

//Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, {expiresIn: '30d'});
};

//Register new user
export const register = async (req, res) => {
    try {
        const {email, password, name} = req.body;
        //Basic validation
        if (!email || !password || !name) {
            return res.status(400).json({success: false, message: 'Email, password and name are required'});
        }
        //Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({success: false, message: 'Email already in use'});
        }

        //Create new user
        const user = await User.create(email, password, name);
        
        //Create default user preferences
        await UserPreference.upsert(user.id, {
            dietary_restrictions: [],
            allergies: [],
            preferred_cuisines: [],
            default_servings: 4,
            measurement_unit: 'metric'
        });

        const token = generateToken(newUser);
        res.status(201).json({success: true, message: 'User registered successfully', data: {user: {id: user.id, email: user.email, name: user.name}, token}});
        
    }
    catch (err) {
        next(err);
    }
};

//Login user
export const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({success: false, message: 'Email and password are required'});
        }

        //Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({success: false, message: 'Invalid email or password'});
        }

        //Verify password
        const isPasswordValid = await User.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({success: false, message: 'Invalid email or password'});
        }
        
        //Generate JWT token
        const token = generateToken(user);
        res.json({success: true, message: 'Login successful', data: {user: {id: user.id, email: user.email, name: user.name}, token}});
    }
    catch (err) {
        next(err);
    }
};

//Get current user details
export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }
        res.json({success: true, data: {user}});
    }
    catch (err) {
        next(err);
    }
};


//Request password reset (for simplicity, we will just return a success message. In a real application, you would send an email with a reset link)
export const requestPasswordReset = async (req, res, next) => {
    try {
        const {email} = req.body;

        if (!email) {
            return res.status(400).json({success: false, message: 'Email is required'});
        }
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }
        //In a real application, generate a reset token and send an email with the reset link
        res.json({success: true, message: 'Password reset requested. Please check your email for further instructions.'});
    }
    catch (err) {
        next(err);
    }
}

//Logout user (for JWT, this is handled client-side by deleting the token)
export const logout = async (req, res) => {
    res.json({success: true, message: 'Logout successful. Please delete the token on client side.'});
};