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

-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION check_column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = check_column_exists.table_name
    AND column_name = check_column_exists.column_name
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$;

-- Function to add a column if it doesn't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  table_name text,
  column_name text,
  column_type text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT check_column_exists(table_name, column_name) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', 
                   table_name, column_name, column_type);
  END IF;
END;
$$;

-- Function to get active students
CREATE OR REPLACE FUNCTION get_active_students(section_filter text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  name text,
  section text,
  start_time timestamptz,
  points integer,
  completed_puzzles uuid[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF section_filter IS NULL THEN
    RETURN QUERY
    SELECT s.id, s.name, s.section, s.start_time, s.points, s.completed_puzzles
    FROM students s
    WHERE s.start_time IS NOT NULL
    AND (NOT check_column_exists('students', 'end_time') OR s.end_time IS NULL)
    ORDER BY s.start_time DESC;
  ELSE
    RETURN QUERY
    SELECT s.id, s.name, s.section, s.start_time, s.points, s.completed_puzzles
    FROM students s
    WHERE s.section = section_filter
    AND s.start_time IS NOT NULL
    AND (NOT check_column_exists('students', 'end_time') OR s.end_time IS NULL)
    ORDER BY s.start_time DESC;
  END IF;
END;
$$;

-- Function to stop a student session
CREATE OR REPLACE FUNCTION stop_student_session(student_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if end_time column exists, add it if it doesn't
  PERFORM add_column_if_not_exists('students', 'end_time', 'timestamptz');
  
  -- Update the student's end_time
  UPDATE students
  SET end_time = now()
  WHERE id = student_id;
END;
$$;

-- Function to stop all active sessions
CREATE OR REPLACE FUNCTION stop_all_sessions(section_filter text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  affected_rows integer;
BEGIN
  -- Check if end_time column exists, add it if it doesn't
  PERFORM add_column_if_not_exists('students', 'end_time', 'timestamptz');
  
  -- Update all active sessions
  IF section_filter IS NULL THEN
    UPDATE students
    SET end_time = now()
    WHERE end_time IS NULL
    AND start_time IS NOT NULL;
  ELSE
    UPDATE students
    SET end_time = now()
    WHERE section = section_filter
    AND end_time IS NULL
    AND start_time IS NOT NULL;
  END IF;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$;

-- Function to set a timer for active sessions
CREATE OR REPLACE FUNCTION set_timer_for_sessions(duration_seconds integer, section_filter text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  end_time timestamptz;
  affected_rows integer;
BEGIN
  -- Calculate end time
  end_time := now() + (duration_seconds * interval '1 second');
  
  -- Check if end_time column exists, add it if it doesn't
  PERFORM add_column_if_not_exists('students', 'end_time', 'timestamptz');
  
  -- Update all active sessions
  IF section_filter IS NULL THEN
    UPDATE students
    SET end_time = set_timer_for_sessions.end_time
    WHERE end_time IS NULL
    AND start_time IS NOT NULL;
  ELSE
    UPDATE students
    SET end_time = set_timer_for_sessions.end_time
    WHERE section = section_filter
    AND end_time IS NULL
    AND start_time IS NOT NULL;
  END IF;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$; 