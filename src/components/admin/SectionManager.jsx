import { useState, useEffect } from 'react';
import styled from 'styled-components';
import supabase from '../../services/supabase';

const SectionManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSection, setCurrentSection] = useState({
    id: null,
    section: '',
    code: '',
    is_active: true
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .order('section', { ascending: true });
      
      if (error) throw error;
      
      setSections(data || []);
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setCurrentSection({ ...currentSection, [name]: checked });
    } else {
      setCurrentSection({ ...currentSection, [name]: value });
    }
  };

  const generateAccessCode = () => {
    // Generate a random 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setCurrentSection({ ...currentSection, code });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare section data
      const sectionData = {
        section: currentSection.section,
        code: currentSection.code,
        is_active: currentSection.is_active
      };
      
      let result;
      
      if (isEditing) {
        // Update existing section
        result = await supabase
          .from('access_codes')
          .update(sectionData)
          .eq('id', currentSection.id);
      } else {
        // Create new section
        result = await supabase
          .from('access_codes')
          .insert([sectionData]);
      }
      
      if (result.error) throw result.error;
      
      // Reset form and refresh sections
      resetForm();
      fetchSections();
      
    } catch (err) {
      console.error('Error saving section:', err);
      setError('Failed to save section');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setIsEditing(true);
    setCurrentSection({
      id: section.id,
      section: section.section,
      code: section.code,
      is_active: section.is_active
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) {
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('access_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchSections();
    } catch (err) {
      console.error('Error deleting section:', err);
      setError('Failed to delete section');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentSection({
      id: null,
      section: '',
      code: '',
      is_active: true
    });
  };

  if (loading && sections.length === 0) {
    return <LoadingIndicator>Loading sections...</LoadingIndicator>;
  }

  return (
    <SectionManagerContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <FormSection>
        <SectionTitle>{isEditing ? 'Edit Section' : 'Add New Section'}</SectionTitle>
        <SectionForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Section Name</Label>
            <Input 
              type="text" 
              name="section" 
              value={currentSection.section}
              onChange={handleInputChange}
              placeholder="e.g. BSIT-3A"
              required
            />
          </FormGroup>
          
          <FormRow>
            <FormGroup style={{ flex: 1 }}>
              <Label>Access Code</Label>
              <Input 
                type="text" 
                name="code" 
                value={currentSection.code}
                onChange={handleInputChange}
                placeholder="e.g. XYZ123"
                required
              />
            </FormGroup>
            
            <GenerateButton type="button" onClick={generateAccessCode}>
              Generate Code
            </GenerateButton>
          </FormRow>
          
          <CheckboxLabel>
            <Checkbox 
              type="checkbox" 
              name="is_active"
              checked={currentSection.is_active}
              onChange={handleInputChange}
            />
            Active
          </CheckboxLabel>
          
          <ButtonGroup>
            <SaveButton type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Section' : 'Add Section'}
            </SaveButton>
            
            {isEditing && (
              <CancelButton type="button" onClick={resetForm}>
                Cancel
              </CancelButton>
            )}
          </ButtonGroup>
        </SectionForm>
      </FormSection>
      
      <SectionsListSection>
        <SectionTitle>
          Sections List
          <RefreshButton onClick={fetchSections}>↻ Refresh</RefreshButton>
        </SectionTitle>
        
        {sections.length === 0 ? (
          <EmptyState>No sections found. Create your first section using the form.</EmptyState>
        ) : (
          <SectionsList>
            {sections.map(section => (
              <SectionItem key={section.id} active={section.is_active}>
                <SectionHeader>
                  <SectionName>{section.section}</SectionName>
                  <StatusIndicator active={section.is_active} />
                </SectionHeader>
                
                <AccessCode>
                  Access Code: <strong>{section.code}</strong>
                </AccessCode>
                
                <ActionButtons>
                  <EditButton onClick={() => handleEdit(section)}>Edit</EditButton>
                  <DeleteButton onClick={() => handleDelete(section.id)}>Delete</DeleteButton>
                </ActionButtons>
              </SectionItem>
            ))}
          </SectionsList>
        )}
      </SectionsListSection>
    </SectionManagerContainer>
  );
};

// Styled Components
const SectionManagerContainer = styled.div`
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

const SectionsListSection = styled.section`
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

const SectionForm = styled.form`
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
  align-items: flex-end;
  
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

const GenerateButton = styled.button`
  padding: 0.7rem 1rem;
  background-color: var(--secondary-brown);
  color: var(--parchment-light);
  border: none;
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  margin-bottom: 1rem;
  
  &:hover {
    background-color: var(--accent-gold);
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

const RefreshButton = styled.button`
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
`;

const SectionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  max-height: 500px;
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

const SectionItem = styled.div`
  background-color: ${props => props.active ? 'rgba(245, 241, 227, 0.9)' : 'rgba(245, 241, 227, 0.5)'};
  border: 1px solid ${props => props.active ? 'var(--soft-edges)' : 'rgba(188, 143, 143, 0.3)'};
  border-radius: 6px;
  padding: 1rem;
  box-shadow: var(--shadow-light);
  opacity: ${props => props.active ? '1' : '0.7'};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const SectionName = styled.h4`
  margin: 0;
  font-family: 'Playfair Display', serif;
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#28a745' : '#dc3545'};
`;

const AccessCode = styled.p`
  font-family: 'Special Elite', cursive;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  
  strong {
    letter-spacing: 1px;
    color: var(--primary-dark-brown);
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

export default SectionManager;
