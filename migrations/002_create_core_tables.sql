-- Migration: Create core Moment Stack tables
-- Description: Defines relational schema, constraints, and indexes for the application domain

BEGIN;

-- Users table stores core account information
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Moments created by users with optional media and geospatial context
CREATE TABLE IF NOT EXISTS moments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    photo_url TEXT,
    mood VARCHAR(50),
    location GEOGRAPHY(Point, 4326) NOT NULL,
    radius INTEGER NOT NULL DEFAULT 0 CHECK (radius >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User reactions (likes, emojis, etc.) tied to specific moments
CREATE TABLE IF NOT EXISTS reactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    moment_id BIGINT NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
    reaction_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Story threads extend a moment into longer-form narratives
CREATE TABLE IF NOT EXISTS story_threads (
    id BIGSERIAL PRIMARY KEY,
    moment_id BIGINT NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thread_title VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments within a thread
CREATE TABLE IF NOT EXISTS thread_comments (
    id BIGSERIAL PRIMARY KEY,
    thread_id BIGINT NOT NULL REFERENCES story_threads(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extended profile preferences for each user
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    favorite_moods TEXT[],
    search_radius INTEGER NOT NULL DEFAULT 50 CHECK (search_radius >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------
-- Indexes for performance & geo queries
-- ------------------------------------

-- Fast lookups by user ownership and timestamps
CREATE INDEX IF NOT EXISTS idx_moments_user_id ON moments (user_id);
CREATE INDEX IF NOT EXISTS idx_moments_created_at ON moments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions (user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_moment_id ON reactions (moment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON reactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_threads_user_id ON story_threads (user_id);
CREATE INDEX IF NOT EXISTS idx_story_threads_created_at ON story_threads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_comments_user_id ON thread_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_thread_comments_thread_id ON thread_comments (thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_comments_created_at ON thread_comments (created_at DESC);

-- Geospatial index for proximity searches
CREATE INDEX IF NOT EXISTS idx_moments_location ON moments USING GIST (location);

COMMIT;
