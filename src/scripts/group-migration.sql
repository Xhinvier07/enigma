-- Migration script to add group functionality to the students table

-- Add group_members column to store array of member names
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'group_members'
    ) THEN
        ALTER TABLE students ADD COLUMN group_members TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add question_seed column for consistent question randomization per access code
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'question_seed'
    ) THEN
        ALTER TABLE students ADD COLUMN question_seed INTEGER;
    END IF;
END $$;

-- Comment on the new columns
COMMENT ON COLUMN students.group_members IS 'Array of member names in the group';
COMMENT ON COLUMN students.question_seed IS 'Seed for consistent question randomization based on access code';

-- Create or replace a function to get all members of a group by access code
CREATE OR REPLACE FUNCTION get_group_members(access_code_param TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    access_code TEXT,
    section TEXT,
    group_members TEXT[],
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id, 
        s.name, 
        s.access_code, 
        s.section, 
        s.group_members,
        s.start_time,
        s.end_time
    FROM students s
    WHERE s.access_code = access_code_param
    AND s.group_members IS NOT NULL
    ORDER BY s.start_time DESC
    LIMIT 1;
END;
$$;

-- Create or replace a function to add members to a group
CREATE OR REPLACE FUNCTION add_group_member(
    group_id UUID,
    new_member TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    current_members TEXT[];
BEGIN
    -- Get current members
    SELECT group_members INTO current_members
    FROM students
    WHERE id = group_id;
    
    -- Add new member if not already in the group
    IF NOT new_member = ANY(current_members) THEN
        UPDATE students
        SET group_members = array_append(group_members, new_member)
        WHERE id = group_id;
    END IF;
END;
$$;

-- Drop the existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_active_students(text);

-- Update function to get active students to include group members
CREATE OR REPLACE FUNCTION get_active_students(section_filter text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  name text,
  section text,
  start_time timestamptz,
  end_time timestamptz,
  points integer,
  completed_puzzles uuid[],
  group_members text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF section_filter IS NULL THEN
    RETURN QUERY
    SELECT s.id, s.name, s.section, s.start_time, s.end_time, s.points, s.completed_puzzles, s.group_members
    FROM students s
    WHERE s.start_time IS NOT NULL
    AND s.end_time IS NULL
    ORDER BY s.start_time DESC;
  ELSE
    RETURN QUERY
    SELECT s.id, s.name, s.section, s.start_time, s.end_time, s.points, s.completed_puzzles, s.group_members
    FROM students s
    WHERE s.section = section_filter
    AND s.start_time IS NOT NULL
    AND s.end_time IS NULL
    ORDER BY s.start_time DESC;
  END IF;
END;
$$;

-- Update stop_all_sessions to include stopping sessions by access code
CREATE OR REPLACE FUNCTION stop_all_sessions_by_code(access_code_param text)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  affected_rows integer;
BEGIN
  -- Update all active sessions with matching access code
  UPDATE students
  SET end_time = now()
  WHERE access_code = access_code_param
  AND end_time IS NULL
  AND start_time IS NOT NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$;

-- Add an index on the access_code column for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_access_code ON students(access_code); 