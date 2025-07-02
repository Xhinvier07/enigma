import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

/**
 * This script populates the Supabase database with sample data
 * for the Enigma CTF project.
 * 
 * IMPORTANT: Tables must be created manually first using the SQL Editor.
 * See DIRECT_INIT.md for the SQL commands to create tables.
 * 
 * To run: 
 * 1. Create a .env file with your Supabase URL and anon key
 * 2. Run with Node.js: node supabase-init.js
 */

// Load environment variables
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data for access codes
const accessCodes = [
  { code: 'BSIT3A', section: 'BSIT-3A', is_active: true },
  { code: 'BSCS4B', section: 'BSCS-4B', is_active: true },
  { code: 'BSIS2C', section: 'BSIS-2C', is_active: true },
  { code: 'BSCS1A', section: 'BSCS-1A', is_active: true },
  { code: 'DEMO29', section: 'DEMO', is_active: true },
];

// Sample data for questions
const questions = [
  {
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "echo",
    difficulty: "easy",
    is_active: true,
    hints: [
      "I'm something that repeats what you say.",
      "You can hear me in mountains and empty rooms.",
      "I'm a reflection of sound rather than light."
    ],
  },
  {
    question: "What has keys but no locks, space but no room, and you can enter but not go in?",
    answer: "keyboard",
    difficulty: "easy",
    is_active: true,
    hints: [
      "I'm something you use everyday on your computer.",
      "You press me to type letters and numbers.",
      "I have around 104 keys typically."
    ],
  },
  {
    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answer: "map",
    difficulty: "easy",
    is_active: true,
    hints: [
      "I help you navigate places.",
      "I show you where things are located.",
      "I can be digital or on paper."
    ],
  },
  {
    question: "The person who makes it, sells it. The person who buys it, never uses it. The person who uses it, never sees it. What is it?",
    answer: "coffin",
    difficulty: "medium",
    is_active: true,
    hints: [
      "It's related to a somber occasion.",
      "It's used in funerals.",
      "It's where the deceased are placed."
    ],
  },
  {
    question: "What is seen in the middle of March and April that can't be seen at the beginning or end of either month?",
    answer: "r",
    difficulty: "medium",
    is_active: true,
    hints: [
      "Think about the spelling of the month names.",
      "Look at the letters in the middle of both words.",
      "It's a single letter that appears in both names."
    ],
  },
  {
    question: "I am a five-letter word. I sound the same when you remove my first letter. I sound the same when you remove my third letter. I sound the same when you remove my last letter. What word am I?",
    answer: "empty",
    difficulty: "medium",
    is_active: true,
    hints: [
      "The word describes something that contains nothing.",
      "Think about how 'MT' sounds when spoken.",
      "E(M)P(T)Y - each parenthesized letter can be removed while keeping the same pronunciation."
    ],
  },
  {
    question: "A cryptic message was found at a crime scene: '13-1-14-25 20-8-9-14-7-19 3-1-14 2-5 6-15-21-14-4 9-14 20-8-5 4-1-18-11'. What does this message say?",
    answer: "many things can be found in the dark",
    difficulty: "hard",
    is_active: true,
    hints: [
      "Each number represents a letter's position in the alphabet.",
      "1=A, 2=B, 3=C, and so on.",
      "Spaces are represented by hyphens between words."
    ],
  },
  {
    question: "If you have me, you want to share me. If you share me, you don't have me. What am I?",
    answer: "secret",
    difficulty: "hard",
    is_active: true,
    hints: [
      "I'm something people keep to themselves.",
      "Once revealed, I lose my essential quality.",
      "People swear to keep me when told confidential information."
    ],
  },
  {
    question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
    answer: "m",
    difficulty: "hard",
    is_active: true,
    hints: [
      "Look at the spelling of each word mentioned.",
      "Count the occurrences of a specific letter.",
      "It's a single letter that appears in different frequencies."
    ],
  },
  {
    question: "What has 4 letters, sometimes 9 letters, but never has 5 letters?",
    answer: "correct",
    difficulty: "medium",
    is_active: true,
    hints: [
      "This is a statement of fact, not a traditional riddle.",
      "Count the letters in each word mentioned.",
      "The word 'what' has 4 letters, 'sometimes' has 9, and 'never' has 5."
    ],
  },
  {
    question: "I'm light as a feather, but even the strongest person can't hold me for more than a few minutes. What am I?",
    answer: "breath",
    difficulty: "easy",
    is_active: true,
    hints: [
      "I'm something everyone does automatically.",
      "You can't see me, but you can feel me.",
      "You can hold me in, but not for very long."
    ],
  },
  {
    question: "The more you take, the more you leave behind. What are they?",
    answer: "footsteps",
    difficulty: "medium",
    is_active: true,
    hints: [
      "Think about walking or running.",
      "Each one you make leaves a mark.",
      "They show where you've been."
    ],
  },
  {
    question: "Forward I am heavy, backward I am not. What am I?",
    answer: "ton",
    difficulty: "hard",
    is_active: true,
    hints: [
      "I'm a unit of measurement.",
      "Read me backwards to see the trick.",
      "'Ton' backwards is 'not' - heavy forward, not backward."
    ],
  },
  {
    question: "I have keys but open no locks. I have space but no room. You can enter, but you can't go inside. What am I?",
    answer: "keyboard",
    difficulty: "easy",
    is_active: true,
    hints: [
      "I'm used with computers.",
      "You press me to type.",
      "I have a space bar and enter key."
    ],
  },
  {
    question: "Decrypt this message: Wkh fdvh lv vroyhg",
    answer: "the case is solved",
    difficulty: "hard",
    is_active: true,
    hints: [
      "This is a Caesar cipher.",
      "Each letter is shifted by 3 positions in the alphabet.",
      "A → D, B → E, C → F, and so on."
    ],
  },
  {
    question: "What has a head and a tail, but no body?",
    answer: "coin",
    difficulty: "easy",
    is_active: true,
    hints: [
      "I'm something you can find in your pocket.",
      "I'm used in transactions.",
      "I have two sides with different designs."
    ],
  },
  {
    question: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
    answer: "fire",
    difficulty: "medium",
    is_active: true,
    hints: [
      "I provide heat and light.",
      "I consume things to grow bigger.",
      "Firefighters are called to extinguish me."
    ],
  },
  {
    question: "A detective investigating a murder receives three suspects' alibis: Adam says he was reading in his room; Ben says he was playing chess with Charlie; Charlie says he was playing chess with Ben. The detective immediately knows who the murderer is. Who is it?",
    answer: "adam",
    difficulty: "hard",
    is_active: true,
    hints: [
      "Two of the suspects have alibis that confirm each other.",
      "One suspect's alibi cannot be verified by anyone else.",
      "The detective has no other evidence besides these statements."
    ],
  },
];

// Initialize and populate the database
async function populateDatabase() {
  console.log('Starting database population...');

  try {
    // Check if tables exist before trying to insert data
    const { data: tablesExist, error: checkError } = await supabase
      .from('access_codes')
      .select('count')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking tables:', checkError.message);
      console.log('\nIMPORTANT: You need to create the tables first!');
      console.log('Please run the SQL commands in the Supabase SQL Editor from DIRECT_INIT.md');
      process.exit(1);
    }

    // Populate access codes
    console.log('Populating access codes...');
    const { error: insertAccessCodesError } = await supabase
      .from('access_codes')
      .upsert(accessCodes, { onConflict: 'code' });
    
    if (insertAccessCodesError) {
      throw insertAccessCodesError;
    } else {
      console.log('✅ Access codes inserted successfully!');
    }

    // Populate questions
    console.log('Populating questions...');
    const { error: insertQuestionsError } = await supabase
      .from('questions')
      .upsert(questions);
    
    if (insertQuestionsError) {
      throw insertQuestionsError;
    } else {
      console.log('✅ Questions inserted successfully!');
    }

    console.log('\n✅ Database population complete!');
    console.log('\nYou can now run your application and use these access codes:');
    console.log('- BSIT3A (for BSIT-3A section)');
    console.log('- BSCS4B (for BSCS-4B section)');
    console.log('- BSIS2C (for BSIS-2C section)');
    console.log('- BSCS1A (for BSCS-1A section)');
    console.log('- DEMO29 (for demo purposes)');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

// Run the initialization
populateDatabase(); 