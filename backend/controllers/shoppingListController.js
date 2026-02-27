import { start } from "node:repl";
import ShoppingList from "../models/ShoppingList.js";

//Generate shopping list based on meal plan
export const generateShoppingList = async (req, res, next) => {
    try {
        const {startDate, endDate} = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({success: false, message: 'Start date and end date are required'});
        }

        const items = await ShoppingList.generateFromMealPlan(req.user.id, startDate, endDate);

        res.json({success: true, message: 'Shopping list generated successfully', data: {items}});
    }
    catch (err) {
        console.error('generateShoppingList error:', err);
        const message = err.message || 'Failed to generate shopping list';
        res.status(500).json({success: false, message});
    }
};

//Get shopping list
export const getShoppingList = async (req, res, next) => {
    try {
        const grouped = req.query.grouped === 'true';
        const items = grouped ? await ShoppingList.getGroupedByCategory(req.user.id) : await ShoppingList.findByUserId(req.user.id);
        res.json({success: true, data: {items}});
        
    }
    catch (err) {
        console.error('getShoppingList error:', err);
        const message = err.message || 'Failed to retrieve shopping list';
        res.status(500).json({success: false, message});
    }
};

//Add item to shopping list
export const addItem = async (req, res, next) => {
    try {
        const item = await ShoppingList.create(req.user.id, req.body);
        res.status(201).json({success: true, message: 'Item added to shopping list successfully', data: {item}});
    }
    catch (err) {
        console.error('addItem error:', err);
        const message = err.message || 'Failed to add shopping list item';
        res.status(500).json({success: false, message});
    }
};

//Update shopping list item
export const updateItem = async (req, res, next) => {
    try {
        const {id} = req.params;
        const item = await ShoppingList.update(id, req.user.id, req.body);
        if (!item) {
            return res.status(404).json({success: false, message: 'Shopping list item not found'});
        }
        res.json({success: true, message: 'Shopping list item updated successfully', data: {item}});
    }
    catch (err) {
        console.error('updateItem error:', err);
        const message = err.message || 'Failed to update shopping list item';
        res.status(500).json({success: false, message});
    }
};

//Toggle item checked status
export const toggleChecked = async (req, res, next) => {
    try {
        const {id} = req.params;
        const item = await ShoppingList.toggleChecked(id, req.user.id);
        if (!item) {
            return res.status(404).json({success: false, message: 'Shopping list item not found'});
        }
        res.json({success: true, data: {item}});
    }
    catch (err) {
        console.error('toggleChecked error:', err);
        const message = err.message || 'Failed to update shopping list item';
        res.status(500).json({success: false, message});
    }
};

//Delete shopping list item
export const deleteItem = async (req, res, next) => {
    try {
        const {id} = req.params;
        const item = await ShoppingList.delete(id, req.user.id);
        if (!item) {
            return res.status(404).json({success: false, message: 'Shopping list item not found'});
        }
        res.json({success: true, message: 'Shopping list item deleted successfully', data: {item}});
    }
    catch (err) {
        console.error('deleteItem error:', err);
        const message = err.message || 'Failed to delete shopping list item';
        res.status(500).json({success: false, message});
    }
};

//Clear Checked Items
export const clearChecked = async (req, res, next) => {
    try {
        const items = await ShoppingList.clearChecked(req.user.id);
        res.json({success: true, message: `${items.length} checked items cleared from shopping list`, data: {items}});
    }
    catch (err) {
        console.error('clearChecked error:', err);
        const message = err.message || 'Failed to clear checked items';
        res.status(500).json({success: false, message});
    }
};

//Clear entire shopping list
export const clearAll = async (req, res, next) => {
    try {
        const items = await ShoppingList.clearAll(req.user.id);
        res.json({success: true, message: 'Shopping list cleared successfully', data: {items}});
    }
    catch (err) {
        console.error('clearAll error:', err);
        const message = err.message || 'Failed to clear shopping list';
        res.status(500).json({success: false, message});
    }
};

//Add Checked Items to Pantry
export const addCheckedToPantry = async (req, res, next) => {
    try {
        const items = await ShoppingList.addCheckedToPantry(req.user.id);
        res.json({success: true, message: `${items.length} checked items added to pantry`, data: {items}});
    }
    catch (err) {
        console.error('addCheckedToPantry error:', err);
        const message = err.message || 'Failed to add items to pantry';
        res.status(500).json({success: false, message});
    }
};




