# Enigma CTF Database Quick Start Guide

This guide will help you quickly set up your Supabase database for the Enigma CTF application.

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://app.supabase.io) and sign in or create an account
2. Click "New Project" and create a new project
3. Give your project a name and set a secure database password
4. Select the region closest to you
5. Wait for your project to be created (this may take a few minutes)

## Step 2: Get Your API Keys

1. Once your project is created, go to the project dashboard
2. In the left sidebar, click on the gear icon (Settings)
3. Click on "API" in the settings menu
4. Copy the "Project URL" (this is your `VITE_SUPABASE_URL`)
5. Copy the "anon" key (this is your `VITE_SUPABASE_ANON_KEY`)

## Step 3: Set Up Your Environment

1. Create a `.env` file in the root of your project with these values:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Step 4: Run the Setup Script

1. Make sure you've installed the project dependencies with `npm install`
2. Run the setup script:
```bash
npm run setup-db
```
3. Follow the prompts in the terminal

## Step 5: Verify Your Setup

1. Go back to your Supabase dashboard
2. Click on "Table Editor" in the left sidebar
3. You should see three tables: `access_codes`, `questions`, and `students`
4. Click on the `access_codes` table to verify that it has data

## Access Codes for Testing

Use these access codes to test your application:

- **BSIT3A**: For section BSIT-3A
- **BSCS4B**: For section BSCS-4B
- **BSIS2C**: For section BSIS-2C
- **BSCS1A**: For section BSCS-1A
- **DEMO29**: For section DEMO (for testing purposes)

## Troubleshooting

If you encounter errors during setup:

1. **SQL Function Errors**: Make sure you've correctly copied the entire SQL file into the Supabase SQL Editor
2. **Authentication Errors**: Ensure your API keys are correctly entered in the .env file
3. **Database Errors**: Check the Supabase logs in the Dashboard under "Database" > "Logs"

For more detailed setup information, see the full README.md and documentation in `src/scripts/README.md`. 