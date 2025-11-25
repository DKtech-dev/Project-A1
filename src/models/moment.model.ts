import { pool } from '../config/database';
import { 
  Moment, 
  CreateMomentData, 
  UpdateMomentData, 
  MomentWithUser, 
  MomentWithDistance,
  MomentFilters,
  NearbyFilters 
} from './moment.types';

export class MomentModel {
  static async create(data: CreateMomentData): Promise<Moment> {
    const query = `
      INSERT INTO moments (
        user_id, title, description, photo_url, mood, 
        latitude, longitude, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, 
        ST_SetSRID(ST_MakePoint($6, $7), 4326),
        NOW(), NOW()
      )
      RETURNING 
        id, user_id, title, description, photo_url, mood,
        ST_Y(location) as latitude, ST_X(location) as longitude,
        created_at, updated_at
    `;
    
    const values = [
      data.user_id,
      data.title,
      data.description,
      data.photo_url,
      data.mood,
      data.longitude,
      data.latitude
    ];
    
    const result = await pool.query(query, values);
    return this.mapRowToMoment(result.rows[0]);
  }

  static async findById(id: string): Promise<MomentWithUser | null> {
    const query = `
      SELECT 
        m.id, m.user_id, m.title, m.description, m.photo_url, m.mood,
        ST_Y(m.location) as latitude, ST_X(m.location) as longitude,
        m.created_at, m.updated_at,
        u.username, u.avatar_url
      FROM moments m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToMomentWithUser(result.rows[0]) : null;
  }

  static async update(id: string, userId: string, data: UpdateMomentData): Promise<Moment | null> {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      setClause.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      setClause.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.photo_url !== undefined) {
      setClause.push(`photo_url = $${paramIndex++}`);
      values.push(data.photo_url);
    }
    if (data.mood !== undefined) {
      setClause.push(`mood = $${paramIndex++}`);
      values.push(data.mood);
    }
    if (data.latitude !== undefined && data.longitude !== undefined) {
      setClause.push(`location = ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326)`);
      values.push(data.longitude, data.latitude);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push(`updated_at = NOW()`);
    values.push(id, userId);

    const query = `
      UPDATE moments 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING 
        id, user_id, title, description, photo_url, mood,
        ST_Y(location) as latitude, ST_X(location) as longitude,
        created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ? this.mapRowToMoment(result.rows[0]) : null;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const query = `
      DELETE FROM moments 
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  static async findMany(filters: MomentFilters = {}): Promise<MomentWithDistance[]> {
    const whereClause = [];
    const values = [];
    let paramIndex = 1;

    if (filters.moods && filters.moods.length > 0) {
      whereClause.push(`mood = ANY($${paramIndex++})`);
      values.push(filters.moods);
    }

    if (filters.start_date) {
      whereClause.push(`created_at >= $${paramIndex++}`);
      values.push(filters.start_date);
    }

    if (filters.end_date) {
      whereClause.push(`created_at <= $${paramIndex++}`);
      values.push(filters.end_date);
    }

    if (filters.user_id) {
      whereClause.push(`user_id = $${paramIndex++}`);
      values.push(filters.user_id);
    }

    const whereSQL = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';
    const limitClause = filters.limit ? `LIMIT $${paramIndex++}` : '';
    const offsetClause = filters.offset ? `OFFSET $${paramIndex++}` : '';

    if (filters.limit) values.push(filters.limit);
    if (filters.offset) values.push(filters.offset);

    const query = `
      SELECT 
        m.id, m.user_id, m.title, m.description, m.photo_url, m.mood,
        ST_Y(m.location) as latitude, ST_X(m.location) as longitude,
        m.created_at, m.updated_at,
        u.username, u.avatar_url,
        0 as distance_meters,
        COALESCE(reaction_counts.count, 0) as reaction_count,
        COALESCE(thread_counts.count, 0) as thread_count
      FROM moments m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN (
        SELECT moment_id, COUNT(*) as count
        FROM reactions
        GROUP BY moment_id
      ) reaction_counts ON m.id = reaction_counts.moment_id
      LEFT JOIN (
        SELECT moment_id, COUNT(*) as count
        FROM threads
        GROUP BY moment_id
      ) thread_counts ON m.id = thread_counts.moment_id
      ${whereSQL}
      ORDER BY m.created_at DESC
      ${limitClause} ${offsetClause}
    `;

    const result = await pool.query(query, values);
    return result.rows.map(row => this.mapRowToMomentWithDistance(row));
  }

  static async findNearby(filters: NearbyFilters): Promise<MomentWithDistance[]> {
    const whereClause = [];
    const values = [];
    let paramIndex = 1;

    whereClause.push(`ST_DWithin(
      location, 
      ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326), 
      $${paramIndex++}
    )`);
    values.push(filters.longitude, filters.latitude, filters.radius_meters);

    if (filters.moods && filters.moods.length > 0) {
      whereClause.push(`mood = ANY($${paramIndex++})`);
      values.push(filters.moods);
    }

    if (filters.start_date) {
      whereClause.push(`created_at >= $${paramIndex++}`);
      values.push(filters.start_date);
    }

    if (filters.end_date) {
      whereClause.push(`created_at <= $${paramIndex++}`);
      values.push(filters.end_date);
    }

    if (filters.user_id) {
      whereClause.push(`user_id = $${paramIndex++}`);
      values.push(filters.user_id);
    }

    const whereSQL = `WHERE ${whereClause.join(' AND ')}`;
    const limitClause = filters.limit ? `LIMIT $${paramIndex++}` : '';
    const offsetClause = filters.offset ? `OFFSET $${paramIndex++}` : '';

    if (filters.limit) values.push(filters.limit);
    if (filters.offset) values.push(filters.offset);

    const query = `
      SELECT 
        m.id, m.user_id, m.title, m.description, m.photo_url, m.mood,
        ST_Y(m.location) as latitude, ST_X(m.location) as longitude,
        m.created_at, m.updated_at,
        u.username, u.avatar_url,
        ST_Distance(
          location, 
          ST_SetSRID(ST_MakePoint($1, $2), 4326)
        ) * 111320 as distance_meters,
        COALESCE(reaction_counts.count, 0) as reaction_count,
        COALESCE(thread_counts.count, 0) as thread_count
      FROM moments m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN (
        SELECT moment_id, COUNT(*) as count
        FROM reactions
        GROUP BY moment_id
      ) reaction_counts ON m.id = reaction_counts.moment_id
      LEFT JOIN (
        SELECT moment_id, COUNT(*) as count
        FROM threads
        GROUP BY moment_id
      ) thread_counts ON m.id = thread_counts.moment_id
      ${whereSQL}
      ORDER BY distance_meters ASC
      ${limitClause} ${offsetClause}
    `;

    const result = await pool.query(query, values);
    return result.rows.map(row => this.mapRowToMomentWithDistance(row));
  }

  static async findByUserId(userId: string, filters: MomentFilters = {}): Promise<MomentWithDistance[]> {
    return this.findMany({ ...filters, user_id: userId });
  }

  private static mapRowToMoment(row: any): Moment {
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      description: row.description,
      photo_url: row.photo_url,
      mood: row.mood,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private static mapRowToMomentWithUser(row: any): MomentWithUser {
    const moment = this.mapRowToMoment(row);
    return {
      ...moment,
      username: row.username,
      avatar_url: row.avatar_url,
    };
  }

  private static mapRowToMomentWithDistance(row: any): MomentWithDistance {
    const moment = this.mapRowToMomentWithUser(row);
    return {
      ...moment,
      distance_meters: row.distance_meters ? Math.round(row.distance_meters) : undefined,
      reaction_count: parseInt(row.reaction_count) || 0,
      thread_count: parseInt(row.thread_count) || 0,
    };
  }
}