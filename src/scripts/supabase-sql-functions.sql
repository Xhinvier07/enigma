-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to create access_codes table
CREATE OR REPLACE FUNCTION create_access_codes_table()
RETURNS VOID LANGUAGE plpgsql AS
$$
BEGIN
  -- Check if the table exists first
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'access_codes'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE access_codes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code TEXT UNIQUE NOT NULL,
      section TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Add comment to the table
    COMMENT ON TABLE access_codes IS 'Access codes for different sections';
  END IF;
END;
$$;

-- Function to create questions table
CREATE OR REPLACE FUNCTION create_questions_table()
RETURNS VOID LANGUAGE plpgsql AS
$$
BEGIN
  -- Check if the table exists first
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'questions'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE questions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
      hints TEXT[] NOT NULL DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Add comment to the table
    COMMENT ON TABLE questions IS 'Questions for the CTF game';
    
    -- Create an index on difficulty for faster filtering
    CREATE INDEX idx_questions_difficulty ON questions(difficulty);
  END IF;
END;
$$;

-- Function to create students table
CREATE OR REPLACE FUNCTION create_students_table()
RETURNS VOID LANGUAGE plpgsql AS
$$
BEGIN
  -- Check if the table exists first
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'students'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE students (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      access_code TEXT NOT NULL REFERENCES access_codes(code),
      section TEXT NOT NULL,
      start_time TIMESTAMP WITH TIME ZONE,
      points INTEGER DEFAULT 0,
      completed_puzzles UUID[] DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Add comment to the table
    COMMENT ON TABLE students IS 'Student participants in the CTF game';
    
    -- Create indexes for faster lookups
    CREATE INDEX idx_students_section ON students(section);
    CREATE INDEX idx_students_points ON students(points DESC);
  END IF;
END;
$$; 