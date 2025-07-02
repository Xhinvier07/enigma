import supabase from '../services/supabase';

/**
 * Database utility functions for the Enigma application
 */

/**
 * Validates an access code
 * @param {string} code - The access code to validate
 * @returns {Promise<Object|null>} - The access code data or null if invalid
 */
export const validateAccessCode = async (code) => {
  try {
    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error validating access code:', error);
    return null;
  }
};

/**
 * Registers a student in the database
 * @param {Object} student - Student data (name, access_code, section)
 * @returns {Promise<Object|null>} - The created student data or null if error
 */
export const registerStudent = async (student) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert([{
        name: student.name,
        access_code: student.accessCode,
        section: student.section,
        start_time: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error registering student:', error);
    return null;
  }
};

/**
 * Fetches all active questions from the database
 * @returns {Promise<Array|null>} - Array of questions or null if error
 */
export const fetchQuestions = async () => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .order('difficulty', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return null;
  }
};

/**
 * Verifies an answer for a specific question
 * @param {string} questionId - The question ID
 * @param {string} answer - The student's answer
 * @returns {Promise<boolean>} - True if answer is correct, false otherwise
 */
export const verifyAnswer = async (questionId, answer) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('answer')
      .eq('id', questionId)
      .single();
    
    if (error) throw error;
    
    // Case insensitive comparison
    return data.answer.toLowerCase() === answer.toLowerCase();
  } catch (error) {
    console.error('Error verifying answer:', error);
    return false;
  }
};

/**
 * Updates a student's score and completed puzzles
 * @param {string} studentId - The student ID
 * @param {number} pointsToAdd - Points to add to the student's score
 * @param {string} questionId - The ID of the completed question
 * @returns {Promise<Object|null>} - Updated student data or null if error
 */
export const updateStudentScore = async (studentId, pointsToAdd, questionId) => {
  try {
    // First get current student data
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('points, completed_puzzles')
      .eq('id', studentId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Check if puzzle already completed
    if (student.completed_puzzles.includes(questionId)) {
      return student; // Puzzle already completed, don't update score
    }
    
    // Update student with new score and add question to completed puzzles
    const { data, error } = await supabase
      .from('students')
      .update({
        points: student.points + pointsToAdd,
        completed_puzzles: [...student.completed_puzzles, questionId]
      })
      .eq('id', studentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating student score:', error);
    return null;
  }
};

/**
 * Fetches the leaderboard for a specific section
 * @param {string} section - The section code
 * @returns {Promise<Array|null>} - Array of students with scores or null if error
 */
export const fetchLeaderboard = async (section) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, name, points, completed_puzzles')
      .eq('section', section)
      .order('points', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return null;
  }
};

/**
 * Fetches a hint for a specific question
 * @param {string} questionId - The question ID
 * @param {number} hintIndex - The index of the hint to fetch (0, 1, or 2)
 * @returns {Promise<string|null>} - The hint text or null if error/not available
 */
export const fetchHint = async (questionId, hintIndex) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('hints')
      .eq('id', questionId)
      .single();
    
    if (error) throw error;
    
    // Check if hint exists at the requested index
    if (data.hints && data.hints[hintIndex]) {
      return data.hints[hintIndex];
    }
    return null;
  } catch (error) {
    console.error('Error fetching hint:', error);
    return null;
  }
}; 