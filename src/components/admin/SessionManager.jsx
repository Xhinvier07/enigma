import { useState, useEffect } from 'react';
import styled from 'styled-components';
import supabase from '../../services/supabase';

const SessionManager = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('all');
  const [timerSettings, setTimerSettings] = useState({
    minutes: 15,
    seconds: 0,
  });

  useEffect(() => {
    fetchActiveSessions();
    fetchSections();

    // Set up polling for active sessions
    const interval = setInterval(() => {
      fetchActiveSessions(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedSection]);

  const fetchActiveSessions = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      console.log('Fetching active sessions for section:', selectedSection);
      
      // Build query based on section filter
      let query = supabase
        .from('students')
        .select('*')
        .not('start_time', 'is', null); // Must have start_time
      
      // Add section filter if not "all"
      if (selectedSection !== 'all') {
        query = query.eq('section', selectedSection);
      }
      
      // Get sessions that either have no end_time or where end_time is in the future
      const now = new Date().toISOString();
      query = query.or(`end_time.is.null,end_time.gt.${now}`);
      
      // Order by most recent first
      query = query.order('start_time', { ascending: false });
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        console.error('Database query error:', fetchError);
        throw fetchError;
      }
      
      console.log('Active sessions found:', data?.length || 0);
      console.log('Session data:', data);
      
      setActiveSessions(data || []);
    } catch (err) {
      console.error('Error fetching active sessions:', err);
      setError('Failed to load active sessions. Please check the database schema.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('section, code')
        .eq('is_active', true)
        .order('section', { ascending: true });
      
      if (error) throw error;
      
      setSections(data || []);
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTimerSettings(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const startTimerForAll = async () => {
    try {
      if (!window.confirm(`Start a ${timerSettings.minutes} minute and ${timerSettings.seconds} second timer for ${selectedSection === 'all' ? 'all' : selectedSection} students?`)) {
        return;
      }
      
      setLoading(true);
      
      // Build query based on section filter
      let query = supabase
        .from('students')
        .select('id')
        .not('start_time', 'is', null); // Must have start_time
      
      // Add section filter if not "all"
      if (selectedSection !== 'all') {
        query = query.eq('section', selectedSection);
      }
      
      // Get sessions with no end_time
      query = query.is('end_time', null);
      
      const { data: activeStudents, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      if (!activeStudents || activeStudents.length === 0) {
        setError('No active students found to start timer for.');
        setLoading(false);
        return;
      }
      
      console.log(`Setting timer for ${activeStudents.length} students`);
      
      // Calculate end time
      const totalSeconds = timerSettings.minutes * 60 + timerSettings.seconds;
      const endTime = new Date(new Date().getTime() + totalSeconds * 1000).toISOString();
      
      // Update each student individually
      const updatePromises = activeStudents.map(student => 
        supabase
          .from('students')
          .update({ end_time: endTime })
          .eq('id', student.id)
      );
      
      await Promise.all(updatePromises);
      
      fetchActiveSessions();
    } catch (err) {
      console.error('Error starting timer for all:', err);
      setError('Failed to start timer for all students');
    } finally {
      setLoading(false);
    }
  };

  const stopSessionForStudent = async (studentId) => {
    try {
      if (!window.confirm('Are you sure you want to end this student\'s session?')) {
        return;
      }
      
      setLoading(true);
      
      // Set end time to now
      const endTime = new Date().toISOString();
      
      const { error } = await supabase
        .from('students')
        .update({ end_time: endTime })
        .eq('id', studentId);
      
      if (error) throw error;
      
      fetchActiveSessions();
    } catch (err) {
      console.error('Error stopping session:', err);
      setError('Failed to stop student session');
    } finally {
      setLoading(false);
    }
  };

  const stopAllSessions = async () => {
    try {
      if (!window.confirm(`Are you sure you want to end ${selectedSection === 'all' ? 'ALL' : selectedSection + '\'s'} active sessions? This will stop the game for these students.`)) {
        return;
      }
      
      setLoading(true);
      
      // Build query based on section filter
      let query = supabase
        .from('students')
        .select('id')
        .not('start_time', 'is', null); // Must have start_time
      
      // Add section filter if not "all"
      if (selectedSection !== 'all') {
        query = query.eq('section', selectedSection);
      }
      
      // Get sessions with no end_time
      query = query.is('end_time', null);
      
      const { data: activeStudents, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      if (!activeStudents || activeStudents.length === 0) {
        setError('No active students found to stop sessions for.');
        setLoading(false);
        return;
      }
      
      console.log(`Stopping ${activeStudents.length} sessions`);
      
      // Set end time to now
      const endTime = new Date().toISOString();
      
      // Update each student individually
      const updatePromises = activeStudents.map(student => 
        supabase
          .from('students')
          .update({ end_time: endTime })
          .eq('id', student.id)
      );
      
      await Promise.all(updatePromises);
      
      fetchActiveSessions();
    } catch (err) {
      console.error('Error stopping all sessions:', err);
      setError('Failed to stop all sessions');
    } finally {
      setLoading(false);
    }
  };

  // Format the elapsed time in hh:mm:ss
  const formatElapsedTime = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const elapsed = Math.floor((now - start) / 1000); // elapsed seconds
    
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  // Format the remaining time in hh:mm:ss
  const formatRemainingTime = (endTime) => {
    if (!endTime) return 'No timer set';
    
    const end = new Date(endTime);
    const now = new Date();
    
    // If end time is in the past, return "Ended"
    if (end <= now) return 'Ended';
    
    const remaining = Math.floor((end - now) / 1000); // remaining seconds
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  if (loading && activeSessions.length === 0) {
    return <LoadingIndicator>Loading sessions...</LoadingIndicator>;
  }

  return (
    <SessionManagerContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <ControlPanel>
        <SectionTitle>Session Controls</SectionTitle>
        
        <ControlGroup>
          <Label>Filter by Section</Label>
          <Select 
            value={selectedSection} 
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="all">All Sections</option>
            {sections.map((section) => (
              <option key={section.code} value={section.section}>
                {section.section} ({section.code})
              </option>
            ))}
          </Select>
        </ControlGroup>
        
        <ControlGroup>
          <Label>Timer Duration</Label>
          <TimerInputGroup>
            <TimerInput
              type="number"
              name="minutes"
              value={timerSettings.minutes}
              onChange={handleInputChange}
              min="0"
              max="60"
            /> 
            <TimerSeparator>minutes</TimerSeparator>
            <TimerInput
              type="number"
              name="seconds"
              value={timerSettings.seconds}
              onChange={handleInputChange}
              min="0"
              max="59"
            />
            <TimerSeparator>seconds</TimerSeparator>
          </TimerInputGroup>
        </ControlGroup>
        
        <ButtonGroup>
          <StartTimerButton 
            onClick={startTimerForAll} 
            disabled={loading || timerSettings.minutes === 0 && timerSettings.seconds === 0}
          >
            Start Timer For All
          </StartTimerButton>
          
          <StopAllButton onClick={stopAllSessions} disabled={loading}>
            Stop All Sessions
          </StopAllButton>
        </ButtonGroup>
        
        <RefreshButton onClick={() => fetchActiveSessions()} disabled={loading}>
          ↻ Refresh Sessions
        </RefreshButton>
      </ControlPanel>
      
      <SessionsPanel>
        <SectionTitle>
          Active Sessions
          <SessionsCount>
            {activeSessions.length} active {selectedSection !== 'all' ? `in ${selectedSection}` : ''}
          </SessionsCount>
        </SectionTitle>
        
        {activeSessions.length === 0 ? (
          <EmptyState>No active sessions found{selectedSection !== 'all' ? ` for ${selectedSection}` : ''}. Students need to log in first.</EmptyState>
        ) : (
          <SessionsList>
            {activeSessions.map(session => (
              <SessionItem key={session.id}>
                <SessionHeader>
                  <StudentName>{session.name}</StudentName>
                  <SectionBadge>{session.section}</SectionBadge>
                </SessionHeader>
                
                <SessionDetails>
                  <DetailItem>
                    <DetailLabel>Session Start:</DetailLabel>
                    <DetailValue>{new Date(session.start_time).toLocaleString()}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Time Elapsed:</DetailLabel>
                    <DetailValue>{formatElapsedTime(session.start_time)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Time Remaining:</DetailLabel>
                    <DetailValue>{formatRemainingTime(session.end_time)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Score:</DetailLabel>
                    <DetailValue>{session.points || 0} points</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Completed:</DetailLabel>
                    <DetailValue>{session.completed_puzzles ? session.completed_puzzles.length : 0} puzzles</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Team Name:</DetailLabel>
                    <DetailValue>{session.teamName || 'N/A'}</DetailValue>
                  </DetailItem>
                </SessionDetails>
                
                <StopSessionButton onClick={() => stopSessionForStudent(session.id)}>
                  Stop Session
                </StopSessionButton>
              </SessionItem>
            ))}
          </SessionsList>
        )}
      </SessionsPanel>
    </SessionManagerContainer>
  );
};

// Styled Components
const SessionManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ErrorMessage = styled.div`
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-family: 'Special Elite', cursive;
`;

const ControlPanel = styled.section`
  background-color: var(--parchment-light);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--soft-edges);
  position: relative;
`;

const SessionsPanel = styled.section`
  background-color: var(--parchment-light);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--soft-edges);
`;

const SectionTitle = styled.h3`
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--soft-edges);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SessionsCount = styled.span`
  font-size: 0.9rem;
  background-color: var(--primary-dark-brown);
  color: var(--parchment-light);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-family: 'Special Elite', cursive;
`;

const ControlGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Label = styled.label`
  display: block;
  font-family: 'Special Elite', cursive;
  margin-bottom: 0.5rem;
  color: var(--primary-dark-brown);
`;

const Select = styled.select`
  padding: 0.7rem;
  width: 100%;
  border: 1px solid var(--soft-edges);
  border-radius: 4px;
  font-family: 'Crimson Text', serif;
  background-color: var(--aged-paper);
  
  &:focus {
    outline: none;
    border-color: var(--accent-gold);
    box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
  }
`;

const TimerInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TimerInput = styled.input`
  width: 60px;
  padding: 0.7rem;
  border: 1px solid var(--soft-edges);
  border-radius: 4px;
  font-family: 'Crimson Text', serif;
  background-color: var(--aged-paper);
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: var(--accent-gold);
    box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
  }
  
  /* Hide spinner */
  &::-webkit-inner-spin-button, 
  &::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
  -moz-appearance: textfield;
`;

const TimerSeparator = styled.span`
  font-family: 'Special Elite', cursive;
  color: var(--primary-dark-brown);
`;

const StartTimerButton = styled.button`
  padding: 0.7rem 1.2rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex: 1;
  
  &:hover {
    background-color: #218838;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const StopAllButton = styled.button`
  padding: 0.7rem 1.2rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  
  &:hover {
    background-color: #c82333;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const RefreshButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: transparent;
  border: 1px solid var(--secondary-brown);
  color: var(--secondary-brown);
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Special Elite', cursive;
  
  &:hover {
    background-color: rgba(139, 69, 19, 0.1);
  }
  
  &:disabled {
    color: var(--pencil-gray);
    border-color: var(--pencil-gray);
    cursor: not-allowed;
  }
`;

const SessionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  max-height: 600px;
  overflow-y: auto;
  
  /* Scrollbar styles */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--parchment-dark);
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--primary-dark-brown);
    border-radius: 4px;
  }
`;

const SessionItem = styled.div`
  background-color: rgba(245, 241, 227, 0.9);
  border: 1px solid var(--soft-edges);
  border-radius: 6px;
  padding: 1rem;
  box-shadow: var(--shadow-light);
  position: relative;
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StudentName = styled.h4`
  margin: 0;
  font-family: 'Playfair Display', serif;
`;

const SectionBadge = styled.span`
  background-color: rgba(139, 69, 19, 0.1);
  color: var(--secondary-brown);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
`;

const SessionDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
  color: var(--pencil-gray);
`;

const DetailValue = styled.span`
  font-family: 'Crimson Text', serif;
  color: var(--primary-dark-brown);
`;

const StopSessionButton = styled.button`
  padding: 0.4rem 0.8rem;
  background-color: rgba(220, 53, 69, 0.1);
  color: #721c24;
  border: 1px solid rgba(220, 53, 69, 0.2);
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
  cursor: pointer;
  float: right;
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.2);
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-family: 'Special Elite', cursive;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--pencil-gray);
  font-family: 'Special Elite', cursive;
  font-style: italic;
`;

export default SessionManager;
