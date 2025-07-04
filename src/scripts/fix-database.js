import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Fallback values for development - REPLACE THESE with actual values in .env file
const fallbackUrl = 'https://htirjwlupqtfjlpsbamu.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aXJqd2x1cHF0ZmpscHNiYW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzEyNDcsImV4cCI6MjA2NzA0NzI0N30.yj0qYDKBXZmjkyB5h2Kq5eADQSwNkqKTOIako99fKUc';

const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseKey || fallbackKey
);

/**
 * Check if a column exists in a table
 */
async function checkColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase.rpc('check_column_exists', {
      table_name: tableName,
      column_name: columnName
    });
    
    if (error) {
      console.error('Error checking if column exists:', error);
      // If the RPC function doesn't exist, create it
      await createCheckColumnFunction();
      // Try again
      const { data: retryData, error: retryError } = await supabase.rpc('check_column_exists', {
        table_name: tableName,
        column_name: columnName
      });
      
      if (retryError) {
        console.error('Failed to check if column exists after creating function:', retryError);
        return false;
      }
      
      return retryData;
    }
    
    return data;
  } catch (err) {
    console.error('Exception checking if column exists:', err);
    return false;
  }
}

/**
 * Create the check_column_exists function in the database
 */
async function createCheckColumnFunction() {
  try {
    const { error } = await supabase.rpc('create_check_column_function');
    
    if (error) {
      // Function doesn't exist, create it directly
      const { error: sqlError } = await supabase.from('_sql').select('*').execute(`
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
      `);
      
      if (sqlError) {
        console.error('Error creating check_column_exists function:', sqlError);
      } else {
        console.log('Created check_column_exists function');
      }
    }
  } catch (err) {
    console.error('Exception creating check_column_exists function:', err);
  }
}

/**
 * Add a column to a table if it doesn't exist
 */
async function addColumnIfNotExists(tableName, columnName, columnType) {
  try {
    const exists = await checkColumnExists(tableName, columnName);
    
    if (!exists) {
      console.log(`Adding ${columnName} column to ${tableName} table...`);
      
      const { error } = await supabase.from('_sql').select('*').execute(`
        ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${columnType};
      `);
      
      if (error) {
        console.error(`Error adding ${columnName} column:`, error);
        return false;
      }
      
      console.log(`Added ${columnName} column to ${tableName} table`);
      return true;
    } else {
      console.log(`${columnName} column already exists in ${tableName} table`);
      return true;
    }
  } catch (err) {
    console.error(`Exception adding ${columnName} column:`, err);
    return false;
  }
}

/**
 * Fix the database schema
 */
async function fixDatabaseSchema() {
  console.log('Starting database schema fix...');
  
  // Add end_time column to students table
  await addColumnIfNotExists('students', 'end_time', 'timestamp with time zone');
  
  // Add points column to questions table
  await addColumnIfNotExists('questions', 'points', 'integer DEFAULT 10');
  
  // Create or update the get_active_students function
  try {
    console.log('Updating get_active_students function...');
    
    const { error } = await supabase.from('_sql').select('*').execute(`
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
    `);
    
    if (error) {
      console.error('Error updating get_active_students function:', error);
    } else {
      console.log('Updated get_active_students function');
    }
  } catch (err) {
    console.error('Exception updating get_active_students function:', err);
  }
  
  console.log('Database schema fix completed');
}

// Run the fix
fixDatabaseSchema()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error fixing database schema:', err);
    process.exit(1);
  }); 