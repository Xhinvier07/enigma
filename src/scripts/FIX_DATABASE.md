# Database Schema Fix

There are some discrepancies between the database schema defined in `create-tables.sql` and the one used in the application. This document explains how to fix these issues.

## Issue 1: Missing `end_time` column in `students` table

The application code expects an `end_time` column in the `students` table, but it's missing in some of the schema definitions.

## Issue 2: Missing `points` column in `questions` table

The application code expects a `points` column in the `questions` table, but it's missing in some of the schema definitions.

## How to Fix

### Option 1: Run the Fix Script (Recommended)

1. Make sure you have Node.js installed
2. Make sure your `.env` file contains the correct Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Run the fix script:
   ```
   cd src/scripts
   node fix-database.js
   ```

### Option 2: Run SQL Commands Manually

If you prefer to run the SQL commands manually, you can execute the following in the Supabase SQL Editor:

```sql
-- Add end_time column to students table if it doesn't exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- Add points column to questions table if it doesn't exist
ALTER TABLE questions ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 10;

-- Create or update the get_active_students function
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
```

## Verifying the Fix

After running the fix, you should be able to:

1. See the `end_time` column in the `students` table
2. See the `points` column in the `questions` table
3. Use the `get_active_students` function without errors

If you're still experiencing issues, check the browser console for error messages and make sure your Supabase credentials are correct. 