# Enigma CTF Database Setup Guide

Follow these steps to set up your Supabase database for the Enigma CTF application.

## Step 1: Create Tables in Supabase

You need to create the database tables manually first:

1. Go to your [Supabase Dashboard](https://app.supabase.io)
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire contents of the `create-tables.sql` file into the editor
6. Click "Run" to execute the SQL and create your tables

This will:
- Create the necessary tables (access_codes, questions, students)
- Set up indexes for better performance
- Grant the necessary permissions to the anon role

## Step 2: Set Up Environment Variables

Create a `.env` file in the root of your project with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To find these values:
1. In your Supabase dashboard, click on the gear icon (Settings)
2. Click on "API" in the settings menu
3. Copy the "Project URL" (this is your `VITE_SUPABASE_URL`)
4. Copy the "anon" key (this is your `VITE_SUPABASE_ANON_KEY`)

## Step 3: Populate the Database with Sample Data

After creating the tables, run:

```bash
npm run init-db
```

This script will:
- Check if the tables exist
- Insert 5 access codes for different sections
- Insert 17 puzzle questions with varying difficulties

## Troubleshooting

### "Permission denied for schema public"

If you see this error, it means:
1. You haven't created the tables yet, or
2. The permissions aren't set correctly

Solution:
- Make sure you've run the SQL commands from `create-tables.sql` in the Supabase SQL Editor
- Check that the GRANT statements were included in your SQL

### "Error checking tables"

If you see this error, it means:
1. Your tables don't exist yet, or
2. Your Supabase credentials are incorrect

Solution:
- Verify you've created the tables using the SQL Editor
- Double-check your environment variables in the .env file

### "Cannot insert null value into column"

This usually means there's an issue with the data format.

Solution:
- Check the console for details about which field is causing the error
- Make sure all required fields have values in your data objects

## Manual Verification

To verify your setup:

1. Go to your Supabase dashboard
2. Click on "Table Editor" in the left sidebar
3. You should see three tables: `access_codes`, `questions`, and `students`
4. Click on each table to verify they have the correct structure and data

## Access Codes for Testing

After setup, you can use these access codes to test your application:

- **BSIT3A**: For section BSIT-3A
- **BSCS4B**: For section BSCS-4B
- **BSIS2C**: For section BSIS-2C
- **BSCS1A**: For section BSCS-1A
- **DEMO29**: For section DEMO (for testing purposes) 