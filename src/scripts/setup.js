#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to ask questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Helper to check if file exists
const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Main setup function
async function setup() {
  console.log('\n===== Enigma CTF Database Setup =====\n');
  
  // Check for .env file
  const envPath = path.join(process.cwd(), '.env');
  const envExists = fileExists(envPath);
  
  if (!envExists) {
    console.log('No .env file found. Let\'s create one.\n');
    
    const supabaseUrl = await askQuestion('Enter your Supabase URL: ');
    const supabaseKey = await askQuestion('Enter your Supabase Anon Key: ');
    
    const envContent = `VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_ANON_KEY=${supabaseKey}\n`;
    fs.writeFileSync(envPath, envContent);
    console.log('\n.env file created successfully!');
  } else {
    console.log('.env file exists. Using existing credentials.');
    // Load existing .env file
    dotenv.config();
  }
  
  // Check for SQL functions file
  const sqlFunctionsPath = path.join(process.cwd(), 'src', 'scripts', 'supabase-sql-functions.sql');
  if (!fileExists(sqlFunctionsPath)) {
    console.error('\nError: SQL functions file not found. Please make sure it exists at:', sqlFunctionsPath);
    process.exit(1);
  }
  
  console.log('\nNow, you need to create the SQL functions in your Supabase dashboard.');
  console.log('Please follow these steps:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to the SQL Editor');
  console.log('3. Create a new query');
  console.log('4. Copy and paste the contents of the SQL functions file');
  console.log('   (src/scripts/supabase-sql-functions.sql)');
  console.log('5. Run the query to create the database functions');
  
  const sqlConfirm = await askQuestion('\nHave you completed these steps? (yes/no): ');
  
  if (sqlConfirm.toLowerCase() !== 'yes') {
    console.log('\nPlease complete the SQL function setup before continuing.');
    process.exit(1);
  }
  
  // Run the initialization script
  console.log('\nRunning database initialization script...');
  try {
    // Use the environment variables from the .env file
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in .env file');
    }
    
    // We'll set environment variables for the child process
    const env = { ...process.env };
    
    // Run the initialization script
    const initScriptPath = path.join(process.cwd(), 'src', 'scripts', 'supabase-init.js');
    execSync(`node ${initScriptPath}`, { 
      stdio: 'inherit',
      env
    });
    
    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nYour Supabase database is now set up with:');
    console.log('- Access codes for different sections');
    console.log('- Questions with varying difficulty levels');
    console.log('- Table structure for tracking students and their progress');
    
    console.log('\nYou can now run your application and use these access codes:');
    console.log('- BSIT3A (for BSIT-3A section)');
    console.log('- BSCS4B (for BSCS-4B section)');
    console.log('- BSIS2C (for BSIS-2C section)');
    console.log('- BSCS1A (for BSCS-1A section)');
    console.log('- DEMO29 (for demo purposes)');
    
  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    console.log('Please check your Supabase credentials and try again.');
  } finally {
    rl.close();
  }
}

// Run the setup
setup(); 