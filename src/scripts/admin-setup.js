import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

/**
 * This script creates an admin user in the admin_users table
 * for the Enigma CTF admin dashboard.
 * 
 * To run: 
 * 1. Create a .env file with your Supabase URL and anon key
 * 2. Run with Node.js: node src/scripts/admin-setup.js
 */

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load environment variables
dotenv.config();

// Function to get user input
const promptUser = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function createAdminUser() {
  console.log('\n📋 Enigma CTF Admin Setup Wizard 📋\n');
  console.log('This script will help you create an admin user for your Enigma CTF application.\n');
  
  // Get Supabase credentials
  let supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    supabaseUrl = await promptUser('Enter your Supabase Project URL: ');
  } else {
    console.log(`Using Supabase URL from environment: ${supabaseUrl}`);
  }
  
  let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseKey) {
    console.log('\nYou need your Supabase anon key for this operation.');
    supabaseKey = await promptUser('Enter your Supabase anon key: ');
  }
  
  try {
    // Initialize Supabase client
    console.log('\nConnecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if admin_users table exists
    const { error: tableCheckError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);
    
    if (tableCheckError) {
      console.error('\n❌ Error: The admin_users table does not exist.');
      console.log('\nPlease run the SQL commands in create-tables.sql first to create the necessary tables.');
      rl.close();
      return;
    }
    
    console.log('\n✅ Connected to Supabase and verified admin_users table exists.');
    
    // Check if default admin already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('username')
      .eq('username', 'xhinvier')
      .single();
    
    if (existingAdmin) {
      console.log('\n✅ Default admin user already exists:');
      console.log('   Username: xhinvier');
      console.log('   Password: password1412');
      
      const createAnother = await promptUser('\nDo you want to create another admin user? (y/n): ');
      if (createAnother.toLowerCase() !== 'y' && createAnother.toLowerCase() !== 'yes') {
        console.log('\nExiting setup. You can use the default admin credentials to log in.');
        rl.close();
        return;
      }
    }
    
    // Get admin user details
    console.log('\n👤 Let\'s create a new admin user:');
    const username = await promptUser('Username: ');
    const password = await promptUser('Password: ');
    
    if (password.length < 6) {
      console.error('\n❌ Password must be at least 6 characters long.');
      rl.close();
      return;
    }
    
    // Create admin user
    console.log('\nCreating admin user...');
    
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert([
        { username, password_hash: password } // Using plain text password for demo
      ]);
    
    if (insertError) {
      if (insertError.code === '23505') {
        console.error('\n❌ Error: This username already exists.');
      } else {
        console.error('\n❌ Error creating admin user:', insertError.message);
      }
      rl.close();
      return;
    }
    
    console.log('\n✅ Admin user created successfully!');
    console.log('\nAdmin login details:');
    console.log(`Username: ${username}`);
    console.log('Password: [your chosen password]');
    
    console.log('\nYou can now log in to the admin dashboard at /admin');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
createAdminUser(); 