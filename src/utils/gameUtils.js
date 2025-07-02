import supabase from '../services/supabase';
import * as dbUtils from './dbUtils';

/**
 * Fetches game questions from the database
 * 
 * @returns {Promise<Array>} Array of game questions
 */
export const fetchQuestions = async () => {
  try {
    const questions = await dbUtils.fetchQuestions();
    return questions || [];
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
      return { correct: true, points: 10 }; // Default to 10 points if we can't determine difficulty
    }

    // Calculate points based on difficulty
    let points = 0;
    switch (data.difficulty) {
      case 'easy':
        points = 10;
        break;
      case 'medium':
        points = 20;
        break;
      case 'hard':
        points = 30;
        break;
      default:
        points = 15;
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
 * Gets the current leaderboard
 * 
 * @param {string} section - Optional section to filter by
 * @returns {Promise<Array>} Array of leaderboard entries
 */
export const getLeaderboard = async (section = null) => {
  try {
    if (!section) {
      // If no section specified, get all students
      let query = supabase
        .from('students')
        .select('id, name, section, points')
        .order('points', { ascending: false })
        .limit(20);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      return data || [];
    } else {
      // If section is specified, use the dbUtils function
      const leaderboard = await dbUtils.fetchLeaderboard(section);
      return leaderboard || [];
    }
  } catch (err) {
    console.error('Unexpected error fetching leaderboard:', err);
    return [];
  }
}; 