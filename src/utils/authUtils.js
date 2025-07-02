import supabase from '../services/supabase';
import * as dbUtils from './dbUtils';

/**
 * Validates an access code against the database
 * 
 * @param {string} accessCode - Access code to validate
 * @returns {Promise<{ valid: boolean, section: string|null, error: string|null }>}
 */
export const validateAccessCode = async (accessCode) => {
  try {
    if (!accessCode || accessCode.trim() === '') {
      return { valid: false, section: null, error: 'Access code cannot be empty' };
    }

    // Use the dbUtils function to validate the access code
    const accessCodeData = await dbUtils.validateAccessCode(accessCode);

    if (!accessCodeData) {
      return { valid: false, section: null, error: 'Invalid access code' };
    }

    return { valid: true, section: accessCodeData.section, error: null };
  } catch (err) {
    console.error('Unexpected error during access code validation:', err);
    return { valid: false, section: null, error: 'An unexpected error occurred' };
  }
};

/**
 * Registers a student with their access code and name
 * 
 * @param {Object} studentData - Student information
 * @param {string} studentData.name - Student's name
 * @param {string} studentData.accessCode - Access code
 * @param {string} studentData.section - Section name
 * @returns {Promise<{ success: boolean, studentId: string|null, error: string|null }>}
 */
export const registerStudent = async ({ name, accessCode, section }) => {
  try {
    if (!name || name.trim() === '') {
      return { success: false, studentId: null, error: 'Name cannot be empty' };
    }

    // First validate the access code
    const validationResult = await validateAccessCode(accessCode);
    if (!validationResult.valid) {
      return { success: false, studentId: null, error: validationResult.error };
    }

    // Use the dbUtils function to register the student
    const studentData = await dbUtils.registerStudent({
      name,
      accessCode,
      section
    });

    if (!studentData) {
      return { success: false, studentId: null, error: 'Failed to register student' };
    }

    // Store the student ID in local storage for session management
    localStorage.setItem('enigma_student_id', studentData.id);
    localStorage.setItem('enigma_student_name', name);
    localStorage.setItem('enigma_section', section);

    return { success: true, studentId: studentData.id, error: null };
  } catch (err) {
    console.error('Unexpected error during student registration:', err);
    return { success: false, studentId: null, error: 'An unexpected error occurred' };
  }
};

/**
 * Checks if a student is already registered/logged in
 * 
 * @returns {Object} Student session information
 */
export const getStudentSession = () => {
  try {
    const studentId = localStorage.getItem('enigma_student_id');
    const studentName = localStorage.getItem('enigma_student_name');
    const section = localStorage.getItem('enigma_section');

    if (!studentId || !studentName || !section) {
      return { isLoggedIn: false };
    }

    return {
      isLoggedIn: true,
      studentId,
      studentName,
      section
    };
  } catch (err) {
    console.error('Error checking student session:', err);
    return { isLoggedIn: false };
  }
};

/**
 * Logs out the current student
 */
export const logoutStudent = () => {
  localStorage.removeItem('enigma_student_id');
  localStorage.removeItem('enigma_student_name');
  localStorage.removeItem('enigma_section');
};

/**
 * Validates admin credentials
 * 
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise<{ valid: boolean, error: string|null }>}
 */
export const validateAdmin = async (username, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });

    if (error || !data.user) {
      return { valid: false, error: 'Invalid credentials' };
    }

    return { valid: true, error: null };
  } catch (err) {
    console.error('Admin validation error:', err);
    return { valid: false, error: 'An unexpected error occurred' };
  }
}; 