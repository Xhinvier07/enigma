import { useState, useEffect } from 'react';
import styled from 'styled-components';
import supabase from '../../services/supabase';

const QuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [currentQuestion, setCurrentQuestion] = useState({
    id: null, //test
    question: '',
    answer: '',
    hints: ['', '', ''],
    difficulty: 'easy',
    points: 50,
    is_active: true,
    image_url: ''
  });

  // Difficulty options
  const difficultyOptions = [
    { value: 'easy', label: 'Easy', defaultPoints: 50 },
    { value: 'medium', label: 'Medium', defaultPoints: 100 },
    { value: 'hard', label: 'Hard', defaultPoints: 200 }
  ];

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Apply filters when questions or filter changes
  useEffect(() => {
    applyFilters();
  }, [questions, difficultyFilter]);

  const applyFilters = () => {
    let filtered = [...questions];
    
    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(q => q.difficulty === difficultyFilter);
    }
    
    setFilteredQuestions(filtered);
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setCurrentQuestion({ ...currentQuestion, [name]: checked });
    } else {
      setCurrentQuestion({ ...currentQuestion, [name]: value });
    }
  };

  const handleHintChange = (index, value) => {
    const updatedHints = [...currentQuestion.hints];
    updatedHints[index] = value;
    setCurrentQuestion({ ...currentQuestion, hints: updatedHints });
  };

  const handleDifficultyChange = (e) => {
    const difficulty = e.target.value;
    const defaultPoints = difficultyOptions.find(option => option.value === difficulty)?.defaultPoints || 10;
    
    setCurrentQuestion({ 
      ...currentQuestion, 
      difficulty, 
      points: defaultPoints 
    });
  };

  const handleFilterChange = (e) => {
    setDifficultyFilter(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare the question data
      const questionData = {
        question: currentQuestion.question,
        answer: currentQuestion.answer,
        hints: currentQuestion.hints.filter(hint => hint.trim() !== ''),
        difficulty: currentQuestion.difficulty,
        points: parseInt(currentQuestion.points) || getDefaultPointsByDifficulty(currentQuestion.difficulty),
        is_active: currentQuestion.is_active,
        image_url: currentQuestion.image_url || null
      };
      
      let result;
      
      if (isEditing) {
        // Update existing question
        result = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', currentQuestion.id);
      } else {
        // Create new question
        result = await supabase
          .from('questions')
          .insert([questionData]);
      }
      
      if (result.error) throw result.error;
      
      // Reset form and refresh questions
      resetForm();
      fetchQuestions();
      
    } catch (err) {
      console.error('Error saving question:', err);
      setError('Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setIsEditing(true);
    setCurrentQuestion({
      ...question,
      // Ensure hints is an array of length 3
      hints: Array.isArray(question.hints) && question.hints.length ? 
        [...question.hints, '', '', ''].slice(0, 3) : 
        ['', '', ''],
      // Add points if not present
      points: question.points || getDefaultPointsByDifficulty(question.difficulty),
      // Add image_url if not present
      image_url: question.image_url || ''
    });
  };

  const getDefaultPointsByDifficulty = (difficulty) => {
    const option = difficultyOptions.find(opt => opt.value === difficulty);
    return option ? option.defaultPoints : 10;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentQuestion({
      id: null,
      question: '',
      answer: '',
      hints: ['', '', ''],
      difficulty: 'easy',
      points: 50,
      is_active: true,
      image_url: ''
    });
  };

  if (loading && questions.length === 0) {
    return <LoadingIndicator>Loading questions...</LoadingIndicator>;
  }

  return (
    <QuestionManagerContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <FormSection>
        <SectionTitle>{isEditing ? 'Edit Question' : 'Add New Question'}</SectionTitle>
        <QuestionForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Question</Label>
            <Textarea 
              name="question" 
              value={currentQuestion.question}
              onChange={handleInputChange}
              placeholder="Enter the full question or riddle text"
              rows={4}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Answer</Label>
            <Input 
              type="text" 
              name="answer" 
              value={currentQuestion.answer}
              onChange={handleInputChange}
              placeholder="Correct answer to the question"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Image URL (Optional)</Label>
            <Input 
              type="url" 
              name="image_url" 
              value={currentQuestion.image_url}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </FormGroup>
          
          <FormRow>
            <FormGroup style={{ flex: 1 }}>
              <Label>Difficulty</Label>
              <Select 
                name="difficulty" 
                value={currentQuestion.difficulty}
                onChange={handleDifficultyChange}
                required
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormGroup style={{ flex: 1 }}>
              <Label>Points</Label>
              <Input 
                type="number" 
                name="points" 
                min="1"
                value={currentQuestion.points}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            
            <FormGroup style={{ flex: 1, alignItems: 'center', marginTop: '25px' }}>
              <CheckboxLabel>
                <Checkbox 
                  type="checkbox" 
                  name="is_active"
                  checked={currentQuestion.is_active}
                  onChange={handleInputChange}
                />
                Active
              </CheckboxLabel>
            </FormGroup>
          </FormRow>
          
          <HintsSection>
            <Label>Hints (up to 3)</Label>
            {[0, 1, 2].map(index => (
              <Input 
                key={index}
                type="text" 
                value={currentQuestion.hints[index] || ''}
                onChange={(e) => handleHintChange(index, e.target.value)}
                placeholder={`Hint ${index + 1}`}
                style={{ marginBottom: '0.5rem' }}
              />
            ))}
          </HintsSection>
          
          <ButtonGroup>
            <SaveButton type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Question' : 'Add Question'}
            </SaveButton>
            
            {isEditing && (
              <CancelButton type="button" onClick={resetForm}>
                Cancel
              </CancelButton>
            )}
          </ButtonGroup>
        </QuestionForm>
      </FormSection>
      
      <QuestionsListSection>
        <ListHeader>
          <ListTitle>Questions List</ListTitle>
          <ListControls>
            <FilterGroup>
              <FilterLabel>Filter:</FilterLabel>
              <FilterSelect value={difficultyFilter} onChange={handleFilterChange}>
                <option value="all">All Difficulties</option>
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} Only
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>
            <ActionButton onClick={fetchQuestions}>
              <span>↻</span> Refresh
            </ActionButton>
          </ListControls>
        </ListHeader>
        
        {filteredQuestions.length === 0 ? (
          <EmptyState>
            {questions.length === 0 
              ? "No questions found. Create your first question using the form." 
              : `No ${difficultyFilter !== 'all' ? difficultyFilter : ''} questions found.`}
          </EmptyState>
        ) : (
        <QuestionsList>
        {filteredQuestions.map((question, index) => (
            <QuestionItem key={question.id} active={question.is_active}>
            <QuestionHeader>
                <QuestionTitle>Question #{index + 1}</QuestionTitle>
                <DifficultyBadge difficulty={question.difficulty}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </DifficultyBadge>
            </QuestionHeader>
            
            <QuestionText>{question.question}</QuestionText>
            
            <QuestionMeta>
                <MetaItem>Answer: <strong>{question.answer}</strong></MetaItem>
                <MetaItem>Points: <strong>{question.points || getDefaultPointsByDifficulty(question.difficulty)}</strong></MetaItem>
                <MetaItem>Status: <StatusIndicator active={question.is_active} /></MetaItem>
                {question.image_url && (
                  <MetaItem>Image: <a href={question.image_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary-brown)' }}>View Image</a></MetaItem>
                )}
            </QuestionMeta>
            
            {question.hints && question.hints.length > 0 && (
                <HintsList>
                {question.hints.map((hint, idx) => 
                    hint ? <HintItem key={idx}>Hint {idx + 1}: {hint}</HintItem> : null
                )}
                </HintsList>
            )}
            
            <ActionButtons>
                <EditButton onClick={() => handleEdit(question)}>Edit</EditButton>
                <DeleteButton onClick={() => handleDelete(question.id)}>Delete</DeleteButton>
            </ActionButtons>
            </QuestionItem>
        ))}
        </QuestionsList>
        )}
      </QuestionsListSection>
    </QuestionManagerContainer>
  );
};

// Styled Components
const QuestionManagerContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.section`
  background-color: var(--parchment-light);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--soft-edges);
`;

const QuestionsListSection = styled.section`
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
`;

const ListHeader = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--soft-edges);
`;

const ListTitle = styled.h3`
  margin-bottom: 0.5rem;
`;

const ListControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
`;

const FilterLabel = styled.span`
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  color: var(--primary-dark-brown);
  white-space: nowrap;
  margin-right: 0.5rem;
`;

const FilterSelect = styled.select`
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--secondary-brown);
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  font-size: 0.85rem;
  background-color: var(--aged-paper);
  min-width: 160px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--accent-gold);
    box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
  }
`;

const ActionButton = styled.button`
  background: transparent;
  border: 1px solid var(--secondary-brown);
  color: var(--secondary-brown);
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Special Elite', cursive;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background-color: rgba(139, 69, 19, 0.1);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    align-self: flex-end;
  }
`;

const QuestionForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Label = styled.label`
  font-family: 'Special Elite', cursive;
  margin-bottom: 0.3rem;
  color: var(--primary-dark-brown);
`;

const Input = styled.input`
  padding: 0.7rem;
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

const Textarea = styled.textarea`
  padding: 0.7rem;
  border: 1px solid var(--soft-edges);
  border-radius: 4px;
  font-family: 'Crimson Text', serif;
  background-color: var(--aged-paper);
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--accent-gold);
    box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.7rem;
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

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: 'Special Elite', cursive;
`;

const Checkbox = styled.input`
  cursor: pointer;
  width: 16px;
  height: 16px;
`;

const HintsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SaveButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-dark-brown);
  color: var(--parchment-light);
  border: none;
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--secondary-brown);
  }
  
  &:disabled {
    background-color: var(--pencil-gray);
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: transparent;
  color: var(--primary-dark-brown);
  border: 1px solid var(--primary-dark-brown);
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(92, 64, 51, 0.1);
  }
`;

const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  max-height: 750px;
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

const QuestionItem = styled.div`
  background-color: ${props => props.active ? 'rgba(245, 241, 227, 0.9)' : 'rgba(245, 241, 227, 0.5)'};
  border: 1px solid ${props => props.active ? 'var(--soft-edges)' : 'rgba(188, 143, 143, 0.3)'};
  border-radius: 6px;
  padding: 1rem;
  box-shadow: var(--shadow-light);
  opacity: ${props => props.active ? '1' : '0.7'};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const QuestionTitle = styled.h4`
  margin: 0;
  font-family: 'Playfair Display', serif;
`;

const DifficultyBadge = styled.span`
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: 'Special Elite', cursive;
  background-color: ${props => {
    switch(props.difficulty) {
      case 'easy': return 'rgba(40, 167, 69, 0.2)';
      case 'medium': return 'rgba(255, 193, 7, 0.2)';
      case 'hard': return 'rgba(220, 53, 69, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.difficulty) {
      case 'easy': return '#155724';
      case 'medium': return '#856404';
      case 'hard': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const QuestionText = styled.p`
  margin-bottom: 0.8rem;
  font-family: 'Crimson Text', serif;
  font-style: italic;
`;

const QuestionMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
`;

const MetaItem = styled.span`
  font-family: 'Special Elite', cursive;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#28a745' : '#dc3545'};
  margin-left: 4px;
`;

const HintsList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin: 0.5rem 0;
  background-color: rgba(210, 180, 140, 0.2);
  border-radius: 4px;
  padding: 0.5rem;
`;

const HintItem = styled.li`
  font-size: 0.9rem;
  font-family: 'Crimson Text', serif;
  margin-bottom: 0.3rem;
  padding-left: 1rem;
  position: relative;
  
  &:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--secondary-brown);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const EditButton = styled.button`
  padding: 0.4rem 0.8rem;
  background-color: rgba(0, 123, 255, 0.1);
  color: #0056b3;
  border: 1px solid rgba(0, 123, 255, 0.2);
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 123, 255, 0.2);
  }
`;

const DeleteButton = styled.button`
  padding: 0.4rem 0.8rem;
  background-color: rgba(220, 53, 69, 0.1);
  color: #721c24;
  border: 1px solid rgba(220, 53, 69, 0.2);
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
  cursor: pointer;
  
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

const ErrorMessage = styled.div`
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  grid-column: span 2;
  font-family: 'Special Elite', cursive;
  
  @media (max-width: 1200px) {
    grid-column: span 1;
  }
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--pencil-gray);
  font-family: 'Special Elite', cursive;
  font-style: italic;
`;

export default QuestionManager;