-- Fix schema discrepancies between create-tables.sql and supabase-sql-functions.sql

-- First, ensure the end_time column exists in the students table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'end_time'
    ) THEN
        ALTER TABLE students ADD COLUMN end_time TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Ensure the points column exists in the questions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'points'
    ) THEN
        ALTER TABLE questions ADD COLUMN points INTEGER DEFAULT 10;
    END IF;
END $$;

-- Drop existing functions before recreating them
DROP FUNCTION IF EXISTS get_active_students(text);
DROP FUNCTION IF EXISTS stop_student_session(uuid);
DROP FUNCTION IF EXISTS stop_all_sessions(text);
DROP FUNCTION IF EXISTS set_timer_for_sessions(integer, text);

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
  end_time timestamptz,
  points integer,
  completed_puzzles uuid[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF section_filter IS NULL THEN
    RETURN QUERY
    SELECT s.id, s.name, s.section, s.start_time, s.end_time, s.points, s.completed_puzzles
    FROM students s
    WHERE s.start_time IS NOT NULL
    AND s.end_time IS NULL
    ORDER BY s.start_time DESC;
  ELSE
    RETURN QUERY
    SELECT s.id, s.name, s.section, s.start_time, s.end_time, s.points, s.completed_puzzles
    FROM students s
    WHERE s.section = section_filter
    AND s.start_time IS NOT NULL
    AND s.end_time IS NULL
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

-- Function to run a raw SQL query (useful for the SessionManager component)
CREATE OR REPLACE FUNCTION run_query(query_text text)
RETURNS SETOF json
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY EXECUTE query_text;
END;
$$; 