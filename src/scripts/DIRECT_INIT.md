# Direct Database Initialization Guide

If you're having issues with the setup script, you can manually initialize your database using these steps:

## Step 1: Set Up SQL Functions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `supabase-sql-functions.sql` file
5. Run the query to create the database functions

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Run the Database Initialization

Run the following command to populate your database:

```bash
npm run init-db
```

This will:
1. Create the necessary tables if they don't exist
2. Populate the tables with sample data including:
   - 5 access codes for different sections
   - 17 puzzle questions with varying difficulties

## Troubleshooting

If you encounter any errors:

1. Check that your SQL functions were created successfully in Supabase
2. Verify your environment variables are correct in the `.env` file
3. Look at the error messages in the console for specific issues

## Manual SQL Setup (if all else fails)

If you're still having issues, you can run these SQL commands directly in the Supabase SQL Editor:

```sql
-- Enable UUID extension
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(section);
CREATE INDEX IF NOT EXISTS idx_students_points ON students(points DESC);
```

Then manually insert some sample data for testing. 