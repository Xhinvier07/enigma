# Supabase Database Setup for Enigma CTF

This directory contains scripts to set up and populate your Supabase database for the Enigma CTF project.

## Database Structure

The database consists of three main tables:

1. **access_codes** - Stores access codes for different class sections
   - `id`: UUID (primary key)
   - `code`: TEXT (unique, e.g., "BSIT3A")
   - `section`: TEXT (e.g., "BSIT-3A")
   - `is_active`: BOOLEAN
   - `created_at`: TIMESTAMP

2. **questions** - Stores CTF puzzle questions
   - `id`: UUID (primary key)
   - `question`: TEXT
   - `answer`: TEXT
   - `difficulty`: TEXT (enum: 'easy', 'medium', 'hard')
   - `hints`: TEXT[] (array of hint strings)
   - `is_active`: BOOLEAN
   - `created_at`: TIMESTAMP

3. **students** - Stores student participants
   - `id`: UUID (primary key)
   - `name`: TEXT
   - `access_code`: TEXT (foreign key to access_codes.code)
   - `section`: TEXT
   - `start_time`: TIMESTAMP
   - `points`: INTEGER
   - `completed_puzzles`: UUID[] (array of completed question IDs)
   - `created_at`: TIMESTAMP

## Setup Instructions

### Step 1: Create Database Functions in Supabase

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `supabase-sql-functions.sql` into the editor
5. Run the query to create the necessary database functions

### Step 2: Configure Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Run the Initialization Script

Run the database initialization script using Node.js:

```bash
node src/scripts/supabase-init.js
```

This will:
1. Create the necessary tables if they don't exist
2. Populate the tables with sample data including:
   - 5 access codes for different sections
   - 17 puzzle questions of varying difficulty

## Manually Verifying Setup

You can verify the database setup by checking the tables in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the "Table Editor" section
3. You should see the tables: access_codes, questions, and students
4. You can browse the data to ensure everything is populated correctly

## Access Codes

The following access codes are created by the script:

- **BSIT3A**: For section BSIT-3A
- **BSCS4B**: For section BSCS-4B
- **BSIS2C**: For section BSIS-2C
- **BSCS1A**: For section BSCS-1A
- **DEMO29**: For section DEMO (for testing purposes)

Use these codes to test the authentication flow in your application. 