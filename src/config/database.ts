import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'moment_stack',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    // Verify PostGIS extension is available
    const result = await client.query(
      "SELECT PostGIS_Version() as version"
    );
    
    if (result.rows.length > 0) {
      console.log('PostGIS extension loaded:', result.rows[0].version);
    }
    
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};