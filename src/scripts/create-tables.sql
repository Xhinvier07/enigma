-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create access_codes table
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  section TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  hints TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  access_code TEXT NOT NULL REFERENCES access_codes(code),
  section TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  points INTEGER DEFAULT 0,
  completed_puzzles UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(section);
CREATE INDEX IF NOT EXISTS idx_students_points ON students(points DESC);

-- Add comments to tables for better documentation
COMMENT ON TABLE access_codes IS 'Access codes for different sections';
COMMENT ON TABLE questions IS 'Questions for the CTF game';
COMMENT ON TABLE students IS 'Student participants in the CTF game';

-- Grant permissions to the authenticated and anon roles
GRANT SELECT, INSERT, UPDATE ON access_codes TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON questions TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON students TO authenticated, anon; 