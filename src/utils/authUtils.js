import supabase from '../services/supabase';
import * as dbUtils from './dbUtils';

/**
 * Validates an access code against the database
 * 
 * @param {string} accessCode - Access code to validate
 * @param {string} teamName - Team name to check for existing group (optional)
 * @returns {Promise<{ valid: boolean, section: string|null, error: string|null, groupExists: boolean, groupId: string|null }>}
 */
export const validateAccessCode = async (accessCode, teamName = null) => {
  try {
    if (!accessCode || accessCode.trim() === '') {
      return { valid: false, section: null, error: 'Access code cannot be empty', groupExists: false, groupId: null };
    }

    // Use the dbUtils function to validate the access code
    const accessCodeData = await dbUtils.validateAccessCode(accessCode);

    if (!accessCodeData) {
      return { valid: false, section: null, error: 'Invalid access code', groupExists: false, groupId: null };
    }

    // Check if a group with this access code and team name already exists
    // Only check by team name if one is provided
    const existingGroup = teamName 
      ? await dbUtils.checkExistingGroup(accessCode, teamName)
      : await dbUtils.checkExistingGroup(accessCode);
    
    // Return information about existing group if found
    if (existingGroup) {
      return { 
        valid: true, 
        section: accessCodeData.section, 
        error: null,
        groupExists: true,
        groupId: existingGroup.id
      };
    }

    return { 
      valid: true, 
      section: accessCodeData.section, 
      error: null,
      groupExists: false,
      groupId: null
    };
  } catch (err) {
    console.error('Unexpected error during access code validation:', err);
    return { 
      valid: false, 
      section: null, 
      error: 'An unexpected error occurred',
      groupExists: false,
      groupId: null
    };
  }
};

/**
 * Registers a group with their access code and members
 * 
 * @param {Object} groupData - Group information
 * @param {Array<string>} groupData.members - Array of member names
 * @param {string} groupData.accessCode - Access code
 * @param {string} groupData.section - Section name
 * @param {string} groupData.teamName - Team name
 * @returns {Promise<{ success: boolean, groupId: string|null, error: string|null }>}
 */
export const registerGroup = async ({ members, accessCode, section, teamName }) => {
  try {
    console.log('Registering group with data:', { members, accessCode, section, teamName });
    
    if (!members || members.length === 0) {
      return { success: false, groupId: null, error: 'At least one member name is required' };
    }

    if (!teamName || teamName.trim() === '') {
      return { success: false, groupId: null, error: 'Team name is required' };
    }

    // First validate the access code and check for existing group with same team name
    const validationResult = await validateAccessCode(accessCode, teamName);
    console.log('Access code validation result:', validationResult);
    
    if (!validationResult.valid) {
      return { success: false, groupId: null, error: validationResult.error };
    }
    
    let groupId = null;

    // Check if a group with this access code and team name already exists
    if (validationResult.groupExists && validationResult.groupId) {
      console.log('Group exists with same access code and team name, joining session with ID:', validationResult.groupId);
      // Group exists, we'll join the existing session
      groupId = validationResult.groupId;
      
      // Update the group with new members if they don't already exist
      await dbUtils.addGroupMembers(groupId, members);
    } else {
      console.log('Creating new group with team name:', teamName);
      // Create a new group
      const groupData = await dbUtils.registerGroup({
        members,
        accessCode,
        section,
        teamName
      });

      if (!groupData) {
        console.error('Failed to register group - no data returned');
        return { success: false, groupId: null, error: 'Failed to register group' };
      }
      
      groupId = groupData.id;
      console.log('New group created with ID:', groupId);
    }

    // Store the group ID in local storage for session management
    console.log('Saving session data to localStorage:', {
      groupId,
      memberName: members[0],
      section,
      accessCode,
      teamName
    });
    
    localStorage.setItem('enigma_group_id', groupId);
    localStorage.setItem('enigma_member_name', members[0]); // Store first member as the current user
    localStorage.setItem('enigma_section', section);
    localStorage.setItem('enigma_access_code', accessCode);
    localStorage.setItem('enigma_team_name', teamName);

    // Verify localStorage was set correctly
    const storedGroupId = localStorage.getItem('enigma_group_id');
    if (storedGroupId !== groupId) {
      console.error(`LocalStorage validation failed: expected groupId ${groupId}, got ${storedGroupId}`);
    }

    return { success: true, groupId: groupId, error: null };
  } catch (err) {
    console.error('Unexpected error during group registration:', err);
    return { success: false, groupId: null, error: 'An unexpected error occurred' };
  }
};

/**
 * Checks if a user is already registered/logged in
 * 
 * @returns {Object} Group session information
 */
export const getStudentSession = () => {
  try {
    const groupId = localStorage.getItem('enigma_group_id');
    const memberName = localStorage.getItem('enigma_member_name');
    const section = localStorage.getItem('enigma_section');
    const accessCode = localStorage.getItem('enigma_access_code');
    const teamName = localStorage.getItem('enigma_team_name');

    console.log('Getting student session from localStorage:', {
      groupId,
      memberName,
      section,
      accessCode,
      teamName
    });

    if (!groupId || !memberName || !section || !accessCode) {
      console.log('Incomplete session data, returning isLoggedIn: false');
      return { isLoggedIn: false };
    }

    return {
      isLoggedIn: true,
      studentId: groupId, // For backward compatibility
      groupId,
      studentName: memberName, // For backward compatibility
      memberName,
      section,
      accessCode,
      teamName
    };
  } catch (err) {
    console.error('Error checking student session:', err);
    return { isLoggedIn: false };
  }
};

/**
 * Logs out the current student/group member
 */
export const logoutStudent = () => {
  localStorage.removeItem('enigma_group_id');
  localStorage.removeItem('enigma_member_name');
  localStorage.removeItem('enigma_section');
  localStorage.removeItem('enigma_access_code');
  localStorage.removeItem('enigma_team_name');
};

/**
 * Validates admin credentials against the admin_users table
 * 
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise<{ valid: boolean, error: string|null }>}
 */
export const validateAdmin = async (username, password) => {
  try {
    if (!username || username.trim() === '') {
      return { valid: false, error: 'Username cannot be empty' };
    }
    
    if (!password) {
      return { valid: false, error: 'Password cannot be empty' };
    }

    // Query the admin_users table to check credentials
    // Note: For simplicity in this demo, we're storing passwords as plain text
    // In a production environment, you should use a secure password hashing function
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username')
      .eq('username', username)
      .eq('password_hash', password) // Using plain text password for demo
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Admin validation error:', error);
      return { valid: false, error: 'Invalid credentials' };
    }

    if (!data) {
      return { valid: false, error: 'Invalid username or password' };
    }

    return { valid: true, error: null };
  } catch (err) {
    console.error('Admin validation error:', err);
    return { valid: false, error: 'An unexpected error occurred' };
  }
}; 