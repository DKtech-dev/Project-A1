export interface Moment {
  id: string;
  user_id: string;
  title: string;
  description: string;
  photo_url: string;
  mood: 'happy' | 'inspiring' | 'thoughtful' | 'excited' | 'grateful' | 'peaceful';
  latitude: number;
  longitude: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMomentData {
  user_id: string;
  title: string;
  description: string;
  photo_url: string;
  mood: Moment['mood'];
  latitude: number;
  longitude: number;
}

export interface UpdateMomentData {
  title?: string;
  description?: string;
  photo_url?: string;
  mood?: Moment['mood'];
  latitude?: number;
  longitude?: number;
}

export interface MomentWithUser extends Moment {
  username?: string;
  avatar_url?: string;
}

export interface MomentWithDistance extends MomentWithUser {
  distance_meters?: number;
  reaction_count?: number;
  thread_count?: number;
}

export interface MomentFilters {
  moods?: Moment['mood'][];
  start_date?: Date;
  end_date?: Date;
  user_id?: string;
  limit?: number;
  offset?: number;
}

export interface NearbyFilters extends MomentFilters {
  latitude: number;
  longitude: number;
  radius_meters: number;
}