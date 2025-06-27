import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// For direct SQL queries, create a Pool using Supabase's connection string
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Supabase PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Supabase PostgreSQL connection error:', err);
});

// Initialize tables
const initializeDatabase = async (): Promise<void> => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS monthly_reports (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        total_spent DECIMAL(10,2) NOT NULL,
        top_category VARCHAR(100),
        overbudget_categories JSON,
        category_breakdown JSON,
        payment_method_stats JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, month, year)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_summaries (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        total_lifetime_spent DECIMAL(12,2) DEFAULT 0,
        most_used_category VARCHAR(100),
        most_used_payment_method VARCHAR(100),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Supabase PostgreSQL tables initialized');
  } catch (error) {
    console.error('❌ Error initializing Supabase PostgreSQL tables:', error);
  }
};

export { pool, supabase, initializeDatabase };