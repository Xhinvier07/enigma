import supabase from '../services/supabase';
import * as dbUtils from './dbUtils';

/**
 * Fetches game questions from the database
 * 
 * @param {number} [seed] - Optional seed for consistent randomization based on access code
 * @returns {Promise<Array>} Array of game questions
 */
export const fetchQuestions = async (seed = null) => {
  try {
    // Fetch all active questions with optional seed for consistent ordering
    const allQuestions = await dbUtils.fetchQuestions(seed);
    if (!allQuestions || allQuestions.length === 0) {
      return [];
    }
    
    // Separate questions by difficulty
    const easyQuestions = allQuestions.filter(q => q.difficulty === 'easy');
    const mediumQuestions = allQuestions.filter(q => q.difficulty === 'medium');
    const hardQuestions = allQuestions.filter(q => q.difficulty === 'hard');
    
    // If seed is provided, use seeded randomization for consistency across group members
    // Otherwise, use standard randomization
    const shuffleWithSeed = (questions) => {
      if (seed !== null) {
        // Create a seeded random function
        const seededRandom = (function() {
          let s = seed;
          return function() {
            s = Math.sin(s) * 10000;
            return s - Math.floor(s);
          };
        })();
        
        // Shuffle using the seeded random function
        const shuffled = [...questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(seededRandom() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      } else {
        return shuffleArray(questions);
      }
    };
    
    const shuffledEasy = shuffleWithSeed(easyQuestions);
    const shuffledMedium = shuffleWithSeed(mediumQuestions);
    const shuffledHard = shuffleWithSeed(hardQuestions);
    
    // Take the required number of questions from each difficulty
    // If not enough questions of a difficulty, take all available
    const selectedEasy = shuffledEasy.slice(0, 7);
    const selectedMedium = shuffledMedium.slice(0, 5);
    const selectedHard = shuffledHard.slice(0, 3);
    
    // Combine all selected questions
    let selectedQuestions = [
      ...selectedEasy,
      ...selectedMedium,
      ...selectedHard
    ];
    
    // Final shuffle to mix difficulties (using the same seed for consistency)
    if (seed !== null) {
      // Create another seeded random function with a slight variation of the seed
      const finalSeededRandom = (function() {
        let s = seed + 1000; // Add offset to create different shuffle pattern
        return function() {
          s = Math.sin(s) * 10000;
          return s - Math.floor(s);
        };
      })();
      
      // Shuffle using the seeded random function
      const shuffled = [...selectedQuestions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(finalSeededRandom() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      selectedQuestions = shuffled;
    } else {
      selectedQuestions = shuffleArray(selectedQuestions);
    }
    
    return selectedQuestions;
  } catch (err) {
    console.error('Unexpected error fetching questions:', err);
    return [];
  }
};

/**
 * Shuffles an array randomly
 * 
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Verifies if an answer is correct
 * 
 * @param {string} questionId - ID of the question
 * @param {string} answer - User's answer
 * @returns {Promise<{ correct: boolean, points: number }>}
 */
export const verifyAnswer = async (questionId, answer) => {
  try {
    // Use the dbUtils function to verify the answer
    const isCorrect = await dbUtils.verifyAnswer(questionId, answer);
    
    if (!isCorrect) {
      return { correct: false, points: 0 };
    }

    // Fetch the question to determine points based on difficulty
    const { data, error } = await supabase
      .from('questions')
      .select('difficulty')
      .eq('id', questionId)
      .single();

    if (error || !data) {
      console.error('Error fetching question difficulty:', error);
      return { correct: true, points: 50 }; // Default to 50 points if we can't determine difficulty
    }

    // Calculate points based on difficulty
    let points = 0;
    switch (data.difficulty) {
      case 'easy':
        points = 50;
        break;
      case 'medium':
        points = 100;
        break;
      case 'hard':
        points = 200;
        break;
      default:
        points = 50;
    }

    return { correct: true, points };
  } catch (err) {
    console.error('Unexpected error verifying answer:', err);
    return { correct: false, points: 0 };
  }
};

/**
 * Updates a student's score after answering a question
 * 
 * @param {string} studentId - ID of the student
 * @param {string} questionId - ID of the question
 * @param {number} points - Points earned
 * @returns {Promise<boolean>} Whether the update was successful
 */
export const updateStudentScore = async (studentId, questionId, points) => {
  try {
    // Use the dbUtils function to update the student's score
    const updatedStudent = await dbUtils.updateStudentScore(studentId, points, questionId);
    return !!updatedStudent;
  } catch (err) {
    console.error('Unexpected error updating student score:', err);
    return false;
  }
};

/**
 * Gets a hint for a specific question
 * 
 * @param {string} questionId - ID of the question
 * @param {number} hintIndex - Index of the hint (0, 1, or 2)
 * @returns {Promise<{ hint: string|null, error: string|null }>}
 */
export const getHint = async (questionId, hintIndex) => {
  try {
    if (hintIndex < 0 || hintIndex > 2) {
      return { hint: null, error: 'Invalid hint index' };
    }

    // Use the dbUtils function to fetch the hint
    const hint = await dbUtils.fetchHint(questionId, hintIndex);
    
    if (!hint) {
      return { hint: null, error: 'Hint not available' };
    }

    return { hint, error: null };
  } catch (err) {
    console.error('Unexpected error getting hint:', err);
    return { hint: null, error: 'An unexpected error occurred' };
  }
};

/**
 * Gets the current leaderboard, grouping by team name and showing only the highest score per team
 * 
 * @param {string} section - Optional section to filter by
 * @returns {Promise<Array>} Array of leaderboard entries
 */
export const getLeaderboard = async (section = null) => {
  try {
    console.log('Fetching leaderboard for section:', section);
    
    // Get all students data
    let query = supabase.from('students').select('id, name, section, points');
    
    // Filter by section if provided
    if (section) {
      query = query.eq('section', section);
    }
    
    // Get all data, sorted by points
    const { data, error } = await query.order('points', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    console.log(`Fetched ${data.length} leaderboard entries`);
    
    // Process the data to keep only the highest score for each team name
    const teamHighScores = new Map(); // Map to track highest score per team name
    
    data.forEach(student => {
      const teamName = student.name;
      
      // Skip entries without a team name
      if (!teamName) return;
      
      // If this team is not in the map yet, or this entry has a higher score, update the map
      if (!teamHighScores.has(teamName) || student.points > teamHighScores.get(teamName).points) {
        teamHighScores.set(teamName, student);
      }
    });
    
    // Convert the Map to an array
    const consolidatedLeaderboard = Array.from(teamHighScores.values());
    
    // Sort by points (highest first)
    consolidatedLeaderboard.sort((a, b) => b.points - a.points);
    
    // Limit to top 10 teams
    const limitedLeaderboard = consolidatedLeaderboard.slice(0, 10);
    
    console.log(`Consolidated leaderboard has ${limitedLeaderboard.length} unique teams`);
    console.log('Team leaderboard:', limitedLeaderboard);
    
    return limitedLeaderboard;
  } catch (err) {
    console.error('Unexpected error fetching leaderboard:', err);
    return [];
  }
};