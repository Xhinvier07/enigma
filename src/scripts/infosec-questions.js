import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

/**
 * This script populates the Supabase database with information security and
 * Caesar cipher related questions for the Enigma CTF project.
 * 
 * To run: 
 * 1. Ensure you have a .env file with your Supabase URL and anon key
 * 2. Run with Node.js: node infosec-questions.js
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

// Information Security and Caesar Cipher Questions
const infoSecQuestions = [
  // Easy Questions (7)
  {
    question: "What is the term for a malicious software that encrypts your files and demands payment for the decryption key?",
    answer: "ransomware",
    difficulty: "easy",
    is_active: true,
    points: 50,
    hints: [
      "It combines the words 'ransom' and another computing term.",
      "It makes your files inaccessible until you pay.",
      "WannaCry is a famous example of this type of malware."
    ],
  },
  {
    question: "What is the name of the most basic and common authentication method that uses a username and password?",
    answer: "password authentication",
    difficulty: "easy",
    is_active: true,
    points: 50,
    hints: [
      "It's the simplest form of proving your identity online.",
      "It involves something you know, not something you have or are.",
      "It's what you use when you log into most websites."
    ],
  },
  {
    question: "What does 'SSL' stand for in web security?",
    answer: "secure sockets layer",
    difficulty: "easy",
    is_active: true,
    points: 50,
    hints: [
      "It's a protocol for establishing encrypted links.",
      "It's been largely replaced by TLS but the acronym is still commonly used.",
      "It's what the 'S' in HTTPS stands for."
    ],
  },
  {
    question: "What is the term for a security attack where the attacker pretends to be a trustworthy entity to obtain sensitive information?",
    answer: "phishing",
    difficulty: "easy",
    is_active: true,
    points: 50,
    hints: [
      "It's named after a similar-sounding activity involving hooks and water.",
      "It often comes in the form of deceptive emails.",
      "It tries to trick you into revealing passwords or credit card numbers."
    ],
  },
  {
    question: "In the Caesar cipher, if A becomes D, what does Z become?",
    answer: "c",
    difficulty: "easy",
    is_active: true,
    points: 50,
    hints: [
      "The Caesar cipher shifts letters by a fixed number of positions.",
      "In this case, each letter is shifted 3 positions forward.",
      "Think of the alphabet as circular, so after Z comes A again."
    ],
  },
  {
    question: "What is the name of the small data file that websites store on your computer to remember information about you?",
    answer: "cookie",
    difficulty: "easy",
    is_active: true,
    points: 50,
    hints: [
      "It shares its name with a baked treat.",
      "Websites use these to remember your login status or preferences.",
      "You can clear these from your browser settings."
    ],
  },
  {
    question: "What is the term for a security vulnerability that allows attackers to inject malicious code into web pages viewed by other users?",
    answer: "xss",
    difficulty: "easy",
    is_active: true,
    points: 50,
    hints: [
      "It stands for Cross-Site Scripting.",
      "It involves injecting JavaScript into web pages.",
      "It can steal cookies or redirect users to malicious sites."
    ],
  },
  
  // Medium Questions (5)
  {
    question: "Decrypt this Caesar cipher message (shift of 7): 'dptwaly pz aol ilza wvspjf'",
    answer: "secrecy is the best policy",
    difficulty: "medium",
    is_active: true,
    points: 100,
    hints: [
      "Each letter has been shifted 7 positions forward in the alphabet.",
      "To decrypt, shift each letter 7 positions backward.",
      "For example, 'd' shifted back 7 positions becomes 's'."
    ],
  },
  {
    question: "What is the name of the attack where an attacker intercepts communication between two parties without either party knowing?",
    answer: "man in the middle",
    difficulty: "medium",
    is_active: true,
    points: 100,
    hints: [
      "The attacker positions themselves between the sender and receiver.",
      "The name describes the physical position of the attacker in the communication flow.",
      "It's often abbreviated as MITM."
    ],
  },
  {
    question: "What encryption concept involves using one key to encrypt data and a different key to decrypt it?",
    answer: "asymmetric encryption",
    difficulty: "medium",
    is_active: true,
    points: 100,
    hints: [
      "It's also known as public-key cryptography.",
      "It uses a pair of keys: one public and one private.",
      "RSA is a common algorithm that uses this approach."
    ],
  },
  {
    question: "In a Caesar cipher with a shift of 13, what would 'SECURITY' become?",
    answer: "frphevgl",
    difficulty: "medium",
    is_active: true,
    points: 100,
    hints: [
      "Shift each letter 13 positions forward in the alphabet.",
      "S + 13 = F, E + 13 = R, and so on.",
      "This specific shift of 13 is also known as ROT13."
    ],
  },
  {
    question: "What is the term for a security testing method where ethical hackers attempt to find and exploit vulnerabilities in a system?",
    answer: "penetration testing",
    difficulty: "medium",
    is_active: true,
    points: 100,
    hints: [
      "It's often abbreviated as 'pen testing'.",
      "It involves authorized simulated attacks on a computer system.",
      "It's done to evaluate the security of the system."
    ],
  },
  
  // Hard Questions (2)
  {
    question: "Decrypt this message which uses a Caesar cipher with a different shift for each word: 'Ugdwtk (shift 2) ku (shift 4) ymj (shift 5) pnl (shift 11) epzepwxyt (shift 15)'. What is the decrypted message?",
    answer: "security is the key cornerstone",
    difficulty: "hard",
    is_active: true,
    points: 200,
    hints: [
      "Each word has its own shift value indicated in parentheses.",
      "Apply the reverse shift to each word separately.",
      "For example, to decrypt 'Ugdwtk' with shift 2, move each letter back 2 positions."
    ],
  },
  {
    question: "In information security, what is the CIA triad? (Answer with the three full words in correct order)",
    answer: "confidentiality integrity availability",
    difficulty: "hard",
    is_active: true,
    points: 200,
    hints: [
      "It's a model designed to guide policies for information security.",
      "The acronym CIA stands for three core principles of security.",
      "These three principles help organizations evaluate their security posture."
    ],
  },
];

// Function to add the questions to the database
async function addInfoSecQuestions() {
  console.log('Starting to add Information Security questions...');

  try {
    // Check if tables exist before trying to insert data
    const { data: tablesExist, error: checkError } = await supabase
      .from('questions')
      .select('count')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking tables:', checkError.message);
      console.log('\nIMPORTANT: Make sure the questions table exists!');
      process.exit(1);
    }

    // Populate questions
    console.log('Adding Information Security and Caesar cipher questions...');
    const { error: insertQuestionsError } = await supabase
      .from('questions')
      .upsert(infoSecQuestions);
    
    if (insertQuestionsError) {
      throw insertQuestionsError;
    } else {
      console.log('✅ Information Security questions added successfully!');
    }

    console.log('\nSummary of added questions:');
    console.log('- Easy questions: 7');
    console.log('- Medium questions: 5');
    console.log('- Hard questions: 2');
    console.log('- Total: 14 questions');

  } catch (error) {
    console.error('Error adding questions:', error);
  }
}

// Run the function
addInfoSecQuestions(); 