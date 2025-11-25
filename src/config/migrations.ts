import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';
import Logger from '../utils/logger';

export class MigrationRunner {
  static async runMigrations(): Promise<void> {
    try {
      Logger.info('Running database migrations...');
      
      const migrationsDir = path.join(__dirname, '../../migrations');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(filePath, 'utf8');
        
        Logger.info(`Running migration: ${file}`);
        
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(migrationSQL);
          await client.query('COMMIT');
          Logger.info(`Migration ${file} completed successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          Logger.error(`Migration ${file} failed:`, error);
          throw error;
        } finally {
          client.release();
        }
      }
      
      Logger.info('All migrations completed successfully');
    } catch (error) {
      Logger.error('Migration failed:', error);
      throw error;
    }
  }

  static async resetDatabase(): Promise<void> {
    try {
      Logger.info('Resetting database...');
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Drop tables in reverse order of dependencies
        await client.query('DROP TABLE IF EXISTS threads CASCADE');
        await client.query('DROP TABLE IF EXISTS reactions CASCADE');
        await client.query('DROP TABLE IF EXISTS moments CASCADE');
        await client.query('DROP TABLE IF EXISTS users CASCADE');
        
        await client.query('COMMIT');
        Logger.info('Database reset completed');
      } catch (error) {
        await client.query('ROLLBACK');
        Logger.error('Database reset failed:', error);
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      Logger.error('Database reset failed:', error);
      throw error;
    }
  }
}