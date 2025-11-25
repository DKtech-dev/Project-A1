-- Create PostGIS extension if not exists
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create moments table with geospatial support
CREATE TABLE IF NOT EXISTS moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    mood VARCHAR(20) NOT NULL CHECK (mood IN ('happy', 'inspiring', 'thoughtful', 'excited', 'grateful', 'peaceful')),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reactions table for moment reactions
CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(moment_id, user_id) -- One reaction per user per moment
);

-- Create threads table for moment discussions
CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_thread_id UUID REFERENCES threads(id) ON DELETE CASCADE, -- For replies
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_moments_user_id ON moments(user_id);
CREATE INDEX IF NOT EXISTS idx_moments_mood ON moments(mood);
CREATE INDEX IF NOT EXISTS idx_moments_created_at ON moments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moments_location ON moments USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_reactions_moment_id ON reactions(moment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_threads_moment_id ON threads(moment_id);
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_parent_id ON threads(parent_thread_id);

-- Create index on users username for lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moments_updated_at BEFORE UPDATE ON moments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
INSERT INTO users (username, email, password_hash, avatar_url) VALUES 
('demo_user', 'demo@example.com', 'hashed_password', 'https://example.com/avatar1.jpg'),
('test_user', 'test@example.com', 'hashed_password', 'https://example.com/avatar2.jpg')
ON CONFLICT (username) DO NOTHING;

-- Sample moments for testing
INSERT INTO moments (user_id, title, description, photo_url, mood, location) VALUES 
(
    (SELECT id FROM users WHERE username = 'demo_user' LIMIT 1),
    'Beautiful Sunset',
    'Amazing sunset at the beach today. The colors were incredible!',
    'https://example.com/sunset.jpg',
    'happy',
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326) -- San Francisco
),
(
    (SELECT id FROM users WHERE username = 'demo_user' LIMIT 1),
    'Morning Coffee',
    'Perfect start to the day with this amazing coffee view',
    'https://example.com/coffee.jpg',
    'grateful',
    ST_SetSRID(ST_MakePoint(-74.0060, 40.7128), 4326) -- New York
),
(
    (SELECT id FROM users WHERE username = 'test_user' LIMIT 1),
    'Mountain Adventure',
    'Reached the summit! The view is breathtaking',
    'https://example.com/mountain.jpg',
    'excited',
    ST_SetSRID(ST_MakePoint(-118.2437, 34.0522), 4326) -- Los Angeles
)
ON CONFLICT DO NOTHING;