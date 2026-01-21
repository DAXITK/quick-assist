// Field matching logic - identifies what type of data each field needs

const FieldMatcher = {
  // Patterns for matching field types (all case-insensitive)
  patterns: {
    fullName: /\b(full[\s_-]?name|fullname|name|applicant[\s_-]?name|your[\s_-]?name|complete[\s_-]?name)\b/i,
    firstName: /\b(first[\s_-]?name|firstname|fname|given[\s_-]?name|forename)\b/i,
    lastName: /\b(last[\s_-]?name|lastname|lname|surname|family[\s_-]?name)\b/i,
    email: /\b(email|e[\s_-]?mail|e-mail|mail|contact[\s_-]?email)\b/i,
    phone: /\b(phone|telephone|mobile|cell|contact[\s_-]?(number|phone)|phone[\s_-]?number)\b/i,
    linkedin: /\b(linkedin|linked[\s_-]?in)\b/i,
    portfolio: /\b(portfolio|website|personal[\s_-]?site|url|web[\s_-]?page|personal[\s_-]?website)\b/i,
    location: /\b(location|city|address|where[\s_-]?located|residence|current[\s_-]?location)\b/i,
    currentTitle: /\b(current[\s_-]?title|job[\s_-]?title|position|role|current[\s_-]?position|your[\s_-]?title)\b/i,
    currentCompany: /\b(current[\s_-]?company|employer|organization|company[\s_-]?name|current[\s_-]?employer)\b/i,
    yearsExperience: /\b(years[\s_-]?(of[\s_-]?)?experience|experience[\s_-]?years|yoe|work[\s_-]?experience[\s_-]?years)\b/i,
    summary: /\b(summary|about|bio|biography|overview|profile|cover[\s_-]?letter|why[\s_-]?you|tell[\s_-]?us|describe[\s_-]?yourself|about[\s_-]?yourself)\b/i,
    degree: /\b(degree|education[\s_-]?level|highest[\s_-]?degree|qualification|education[\s_-]?qualification)\b/i,
    fieldOfStudy: /\b(major|field[\s_-]?of[\s_-]?study|study[\s_-]?area|specialization|concentration|area[\s_-]?of[\s_-]?study)\b/i,
    university: /\b(university|college|school|institution|alma[\s_-]?mater|educational[\s_-]?institution)\b/i,
    gradYear: /\b(graduation[\s_-]?year|grad[\s_-]?year|year[\s_-]?graduated|completion[\s_-]?year|year[\s_-]?of[\s_-]?graduation)\b/i,
    skills: /\b(skills|expertise|technologies|proficiencies|competencies|technical[\s_-]?skills)\b/i
  },

  // Normalize text - remove extra spaces, convert to lowercase
  normalize(text) {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  },

  // Detect field type based on various attributes
  detectFieldType(field) {
    // Collect all possible identifiers
    const name = this.normalize(field.name || '');
    const id = this.normalize(field.id || '');
    const placeholder = this.normalize(field.placeholder || '');
    const label = this.normalize(this.getFieldLabel(field));
    const ariaLabel = this.normalize(field.getAttribute('aria-label') || '');
    const ariaDescribedBy = this.normalize(this.getAriaDescribedByText(field));
    
    // Combine all identifiers for searching
    const searchString = `${name} ${id} ${placeholder} ${label} ${ariaLabel} ${ariaDescribedBy}`;
    
    // Special handling for input types
    if (field.type === 'email') return 'email';
    if (field.type === 'tel') return 'phone';
    if (field.type === 'url') {
      if (/linkedin/i.test(searchString)) return 'linkedin';
      return 'portfolio';
    }
    
    // Priority matching - check first name and last name before full name
    // This prevents firstName field from matching "name" pattern
    if (this.patterns.firstName.test(searchString)) return 'firstName';
    if (this.patterns.lastName.test(searchString)) return 'lastName';
    
    // Match against all other patterns
    for (const [fieldType, pattern] of Object.entries(this.patterns)) {
      if (fieldType === 'firstName' || fieldType === 'lastName') continue; // Already checked
      if (pattern.test(searchString)) {
        return fieldType;
      }
    }
    
    // Special cases for textareas (likely summary/cover letter)
    if (field.tagName === 'TEXTAREA' && field.rows > 3) {
      return 'summary';
    }
    
    return null;
  },

  // Get associated label text
  getFieldLabel(field) {
    // Check for label element
    if (field.labels && field.labels.length > 0) {
      return field.labels[0].textContent;
    }
    
    // Check for aria-labelledby
    const labelledBy = field.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent;
    }
    
    // Check for nearby label
    const parent = field.parentElement;
    if (parent) {
      const label = parent.querySelector('label');
      if (label) return label.textContent;
      
      // Check for text content in parent
      const parentText = parent.textContent.replace(field.value, '').trim();
      if (parentText.length > 0 && parentText.length < 100) return parentText;
    }
    
    // Check previous sibling
    const prevSibling = field.previousElementSibling;
    if (prevSibling && prevSibling.tagName === 'LABEL') {
      return prevSibling.textContent;
    }
    
    return '';
  },

  // Get aria-describedby text
  getAriaDescribedByText(field) {
    const describedBy = field.getAttribute('aria-describedby');
    if (describedBy) {
      const descElement = document.getElementById(describedBy);
      if (descElement) return descElement.textContent;
    }
    return '';
  },

  // Split full name into first and last (used in contentScript)
  splitName(fullName) {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    };
  }
};

// Make available globally
window.FieldMatcher = FieldMatcher;
