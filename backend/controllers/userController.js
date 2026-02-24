import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';

//Get user profile
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }
        const preferences = await UserPreference.findByUserId(req.user.id);
        res.json({success: true, data: {user, preferences}});
    }
    catch (err) {
        next(err);
    }
};

//Update user profile
export const updateProfile = async (req, res, next) => {
    try {
        const {name, email} = req.body;
        const user = await User.update(req.user.id, {name, email});
        res.json({success: true, message: 'Profile updated successfully', data: {user}});
    }
    catch (err) {
        next(err);
    }
};

//Update user preferences
export const updatePreferences = async (req, res, next) => {
    try {
        const preferences = await preference.upsert(req.user.id, req.body);

        res.json({success: true, message: 'Preferences updated successfully', data: {preferences}});
    }
    catch (err) {
        next(err);
    }
};

//Change user password
export const changePassword = async (req, res, next) => {
    try {
        const {currentPassword, newPassword} = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({success: false, message: 'Current and new password are required'});
        }

        //Find user and verify current password
        const user = await User.findByEmail(req.user.email);
        const isValid = await User.verifyPassword(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(401).json({success: false, message: 'Invalid current password'});
        }

        //Update password
        await User.updatePassword(req.user.id, newPassword);
        res.json({success: true, message: 'Password changed successfully'});
    }
    catch (err) {
        next(err);
    }
};

//Delete user account
export const deleteAccount = async (req, res, next) => {
    try {
        await User.delete(req.user.id);
        res.json({success: true, message: 'Account deleted successfully'});
    }
    catch (err) {
        next(err);
    }
};