import db from '../config/db.js';

class PantryItem {
    static async create(userId, itemData) {
        const {name, quantity, unit, category, expiration_date, is_running_low} = itemData;
        const result = await db.query(
            'INSERT INTO pantry_items (user_id, name, quantity, unit, category, expiration_date, is_running_low) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [userId, name, quantity, unit, category, expiration_date, is_running_low]
        );
        return result.rows[0];
    }   

    //Get all pantry items for a user
    static async findByUserId(userId, filters = {}) {
        let query = 'SELECT * FROM pantry_items WHERE user_id = $1';
        const params = [userId];
        let paramCount = 1;

        if (filters.category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            params.push(filters.category);
        }
        if (filters.is_running_low !== undefined) {
            paramCount++;
            query += ` AND is_running_low = $${paramCount}`;
            params.push(filters.is_running_low);
        }
        if(filters.search) {
            paramCount++;
            query += ` AND name ILIKE $${paramCount}`;
            params.push(`%${filters.search}%`);
        }

        query += ' ORDER BY created_at DESC';
        const result = await db.query(query, params);
        return result.rows;
    }

    //Get items expiring soon (within next 7 days)
    static async findExpiringSoon(userId, days = 7) {
        const result = await db.query(
            `SELECT * FROM pantry_items 
             WHERE user_id = $1 AND expiration_date IS NOT NULL AND expiration_date <= CURRENT_DATE + INTERVAL '${days} days' 
             AND expiration_date >= CURRENT_DATE
             ORDER BY expiration_date ASC`,
            [userId]
        );
        return result.rows;
    }

    //Get item by ID
    static async findById(id, userId) {
        const result = await db.query(
            'SELECT * FROM pantry_items WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        return result.rows[0];
    }

    //Update pantry item
    static async update(id, userId, updates) {
        const {name, quantity, unit, category, expiration_date, is_running_low} = updates;
        const result = await db.query(
            'UPDATE pantry_items SET name = COALESCE($1, name), quantity = COALESCE($2, quantity), unit = COALESCE($3, unit), category = COALESCE($4, category), expiration_date = COALESCE($5, expiration_date), is_running_low = COALESCE($6, is_running_low) WHERE id = $7 AND user_id = $8 RETURNING *',
            [name, quantity, unit, category, expiration_date, is_running_low, id, userId]
        );
        return result.rows[0];
    }

    //Get pantry stats
    static async getStats(userId) {
        const result = await db.query(
            `SELECT 
                COUNT(*) AS total_items,
                COUNT(DISTINCT category) AS total_categories,
                COUNT(*) FILTER (WHERE is_running_low = true) AS running_low_count,
                COUNT(*) FILTER (WHERE expiration_date <= CURRENT_DATE + INTERVAL '7 days' AND expiration_date >= CURRENT_DATE) AS expiring_soon_count
             FROM pantry_items 
             WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0];
    }
}

export default PantryItem;