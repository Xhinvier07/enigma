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
 * Check if a group with the given access code and team name already exists
 * @param {string} accessCode - The access code to check
 * @param {string} teamName - The team name to check
 * @returns {Promise<Object|null>} - The group data or null if not found
 */
export const checkExistingGroup = async (accessCode, teamName) => {
  try {
    console.log(`Checking for existing group with access code: ${accessCode} and team name: ${teamName}`);
    
    // First try the standard query with both access code and team name
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('access_code', accessCode)
      .eq('name', teamName)  // Match by team name
      .is('group_members', 'not.null')  // Only get records that have group members
      .order('created_at', { ascending: false })  // Get the most recent one first
      .limit(1);
    
    if (error) {
      console.error('Error in first query for existing group:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Found existing group with first query:', data[0]);
      return data[0];
    }
    
    // If no results, try a more lenient query without the group_members filter
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('students')
      .select('*')
      .eq('access_code', accessCode)
      .eq('name', teamName)  // Match by team name
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (fallbackError) {
      console.error('Error in fallback query for existing group:', fallbackError);
      return null;
    }
    
    if (fallbackData && fallbackData.length > 0) {
      console.log('Found existing group with fallback query:', fallbackData[0]);
      return fallbackData[0];
    }
    
    console.log('No existing group found for access code and team name:', accessCode, teamName);
    return null;
  } catch (error) {
    console.error('Error checking existing group:', error);
    return null;
  }
};

/**
 * Registers a group in the database
 * @param {Object} group - Group data (members, access_code, section)
 * @returns {Promise<Object|null>} - The created group data or null if error
 */
export const registerGroup = async (group) => {
  try {
    // Seed for question randomization based on access code
    // We'll use a simple hash of the access code to ensure consistent question ordering
    const accessCodeSeed = hashStringToInt(group.accessCode);
    
    const { data, error } = await supabase
      .from('students')
      .insert([{
        name: group.teamName,
        access_code: group.accessCode,
        section: group.section,
        start_time: new Date().toISOString(),
        group_members: group.members,
        question_seed: accessCodeSeed
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error registering group:', error);
    return null;
  }
};

/**
 * Add members to an existing group
 * @param {string} groupId - The ID of the group to update
 * @param {Array<string>} newMembers - Array of new member names to add
 * @returns {Promise<Object|null>} - The updated group data or null if error
 */
export const addGroupMembers = async (groupId, newMembers) => {
  try {
    // First get current group data
    const { data: currentGroup, error: fetchError } = await supabase
      .from('students')
      .select('group_members, name')
      .eq('id', groupId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Combine existing and new members without duplicates
    let currentMembers = currentGroup.group_members || [];
    
    // Filter out existing members to avoid duplicates
    const membersToAdd = newMembers.filter(
      newMember => !currentMembers.some(
        existingMember => existingMember.toLowerCase() === newMember.toLowerCase()
      )
    );
    
    if (membersToAdd.length === 0) {
      return currentGroup; // No new members to add
    }
    
    const updatedMembers = [...currentMembers, ...membersToAdd];
    
    // Update the group with new members
    const { data, error } = await supabase
      .from('students')
      .update({
        group_members: updatedMembers
      })
      .eq('id', groupId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding group members:', error);
    return null;
  }
};

/**
 * Create a simple hash from a string
 * @param {string} str - String to hash
 * @returns {number} - Integer hash value
 */
function hashStringToInt(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash); // Ensure positive value
}

/**
 * Registers a student in the database
 * @param {Object} student - Student data (name, access_code, section)
 * @returns {Promise<Object|null>} - The created student data or null if error
 * @deprecated Use registerGroup instead
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
        group_members: [student.name] // For compatibility with group system
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
 * @param {number} [seed] - Optional seed for consistent randomization
 * @returns {Promise<Array|null>} - Array of questions or null if error
 */
export const fetchQuestions = async (seed = null) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .order('difficulty', { ascending: true });
    
    if (error) throw error;
    
    if (seed !== null) {
      // If a seed is provided, we'll use it to ensure consistent randomization
      const seededRandom = createSeededRandom(seed);
      return shuffleArrayWithSeed(data, seededRandom);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return null;
  }
};

/**
 * Create a seeded random number generator
 * @param {number} seed - Seed for the random number generator
 * @returns {Function} - Seeded random number generator function
 */
function createSeededRandom(seed) {
  return function() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

/**
 * Shuffle array using a seeded random number generator
 * @param {Array} array - The array to shuffle
 * @param {Function} randomFunc - Seeded random function
 * @returns {Array} - Shuffled array
 */
function shuffleArrayWithSeed(array, randomFunc) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFunc() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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
 * @returns {Promise<Array|null>} - Array of teams with scores or null if error
 */
export const fetchLeaderboard = async (section) => {
  try {
    // First fetch all teams in this section
    const { data, error } = await supabase
      .from('students')
      .select('id, name, points, completed_puzzles, group_members')
      .eq('section', section)
      .order('points', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Group by team name and take the highest score for each team
    const teamScores = {};
    
    data.forEach(team => {
      const teamName = team.name;
      
      // If this team name hasn't been seen yet, or this instance has a higher score
      if (!teamScores[teamName] || team.points > teamScores[teamName].points) {
        teamScores[teamName] = team;
      }
    });
    
    // Convert back to array and sort by points
    const leaderboardData = Object.values(teamScores)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10); // Limit to top 10
    
    return leaderboardData;
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