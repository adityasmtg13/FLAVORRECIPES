import { parse } from "node:path";
import MealPlan from "../models/MealPlan.js";

//Add meal plan for user
export const addToMealPlan = async (req, res, next) => {
    try {
        const mealPlan = await MealPlan.create(req.user.id, req.body);
        res.status(201).json({success: true, message: 'Meal plan added successfully', data: {mealPlan}});
    }
    catch (err) {
        next(err);
    }   
};

//Get weekly meal plan for user
export const getWeeklyMealPlan = async (req, res, next) => {
    try {
        const {start_date, weekStartDate} = req.query;
        const startDate = start_date || weekStartDate;

        if(!startDate) {
            return res.status(400).json({success: false, message: 'Start date is required'});
        }

        const mealPlans = await MealPlan.getWeeklyPlan(req.user.id, startDate);
        res.json({success: true, data: {mealPlans}});
    }
    catch (err) {
        next(err);
    }
};

//Get upcoming meals for user
export const getUpcomingMeals = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 5;
        const meals = await MealPlan.getUpcoming(req.user.id, limit);
        res.json({success: true, data: {meals}});
    }
    catch (err) {
        console.error('getUpcomingMeals error:', err);
        const message = err.message || 'Failed to fetch upcoming meals';
        res.status(500).json({success: false, message});
    }
};

//Delete meal plan entry
export const deleteMealPlan = async (req, res, next) => {
    try {
        const {id} = req.params;
        const mealPlan = await MealPlan.delete(id, req.user.id);
        if (!mealPlan) {
            return res.status(404).json({success: false, message: 'Meal plan entry not found'});
        }
        res.json({success: true, message: 'Meal plan entry deleted successfully', data: {mealPlan}});
    }
    catch (err) {
        next(err);
    }
};

//Get meal plan stats
export const getMealPlanStats = async (req, res, next) => {
    try {
        const stats = await MealPlan.getStats(req.user.id);
        res.json({success: true, data: {stats}});
    }
    catch (err) {
        next(err);
    }
};