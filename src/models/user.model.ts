import { pool } from '../config/database';
import { CustomError } from '../middleware/errorHandler';

export interface User {
  id: number;
  email: string;
  password: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  username: string;
}

export interface UpdateUserDTO {
  email?: string;
  username?: string;
}

export class UserModel {
  static async createUsersTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;
    await pool.query(query);
  }

  static async create(userData: CreateUserDTO): Promise<UserResponse> {
    const { email, password, username } = userData;
    
    const query = `
      INSERT INTO users (email, password, username)
      VALUES ($1, $2, $3)
      RETURNING id, email, username, created_at, updated_at
    `;
    
    try {
      const result = await pool.query(query, [email, password, username]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new CustomError('Email already exists', 409);
      }
      throw error;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password, username, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<UserResponse | null> {
    const query = `
      SELECT id, email, username, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async update(id: number, userData: UpdateUserDTO): Promise<UserResponse> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.email !== undefined) {
      fields.push(`email = $${paramCount}`);
      values.push(userData.email);
      paramCount++;
    }

    if (userData.username !== undefined) {
      fields.push(`username = $${paramCount}`);
      values.push(userData.username);
      paramCount++;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, username, created_at, updated_at
    `;

    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new CustomError('User not found', 404);
      }
      
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new CustomError('Email already exists', 409);
      }
      throw error;
    }
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0].exists;
  }
}
