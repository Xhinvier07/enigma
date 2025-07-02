# Enigma 29: Capture the Clues

A vintage-styled detective mystery game for CS0029 Capture the Flag project.

## Overview

Enigma 29 is an interactive CTF (Capture The Flag) web application with a detective mystery theme. Students can enter access codes to start the game, solve puzzles, and earn points within a time limit.

## Features

- **Vintage Detective Theme**: Classic detective aesthetics with aged paper textures and typewriter fonts
- **Interactive Game Board**: 15 mystery cards with flipable animations
- **Puzzle System**: Questions with varying difficulties and point values
- **Hint System**: Players can use hints with point penalties
- **Timer**: Countdown timer adds urgency to solve puzzles
- **Responsive Design**: Works on desktop and mobile devices

## User Flow

1. Landing page with animated introduction
2. Access code verification for specific course sections
3. Game board with 15 puzzle cards
4. Interactive puzzle solving with hints
5. Score tracking and time limit
6. Results display at game completion

## Technologies Used

- React with Vite
- Supabase for backend (auth, database, real-time)
- React Router for navigation
- Styled Components for styling
- Framer Motion for animations
- Formik & Yup for form handling
- React Query for data fetching

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (for database and authentication)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/enigma-29.git
cd enigma-29
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Create a Supabase project if you don't already have one.

2. Run the database setup script:
```bash
npm run setup-db
```

3. Follow the prompts in the setup script. It will:
   - Create necessary tables in your Supabase database
   - Populate them with sample data including access codes and questions
   - Set up required database functions

4. After setup is complete, your database will be populated with:
   - 5 access codes (BSIT3A, BSCS4B, BSIS2C, BSCS1A, DEMO29)
   - 17 puzzle questions with varying difficulties
   - Required table structures

5. Start the development server
```bash
npm run dev
```

## Database Schema

### Tables
- **access_codes**: Stores section-specific access codes
- **students**: Tracks student information and scores
- **questions**: Stores all puzzles/questions with difficulties and hints

## Admin Panel (Coming Soon)

Future features will include:
- Admin login system
- Question management
- Access code generation
- Leaderboard viewing and management

## License

This project is licensed under the MIT License.
