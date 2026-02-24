import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import pkg from 'pg';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname( __filename );

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { 
        rejectUnauthorized: false } : false
});

async function runMigrations() {
    const client = await pool.connect();

    try {
        console.log('Running database migrations...');

        //Read the schema file
        const schemaPath = path.join(__dirname, 'config', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        //Execute the schema SQL to create tables
        await client.query(schemaSql);
        
        console.log('Database schema created successfully');
        console.log('Tables created:');
        console.log('- users');
        console.log('- recipes');
        console.log('- recipe_ingredients');
        console.log('- pantry_items');
        console.log('- user_preferences');
        console.log('- meal_plans');
        console.log('- shopping_list_items');
        console.log('- recipe_nutrition');

    } catch (err) {
        console.error('Error running migrations:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}
      
runMigrations();