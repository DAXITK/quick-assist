// Field matching logic - identifies what type of data each field needs

const FieldMatcher = {
  // Patterns for matching field types
  patterns: {
    fullName: /\b(full[\s_-]?name|name|applicant[\s_-]?name|your[\s_-]?name)\b/i,
    firstName: /\b(first[\s_-]?name|fname|given[\s_-]?name|forename)\b/i,
    lastName: /\b(last[\s_-]?name|lname|surname|family[\s_-]?name)\b/i,
    email: /\b(email|e[\s_-]?mail|mail|contact[\s_-]?email)\b/i,
    phone: /\b(phone|telephone|mobile|cell|contact[\s_-]?(number|phone))\b/i,
    linkedin: /\b(linkedin|linked[\s_-]?in)\b/i,
    portfolio: /\b(portfolio|website|personal[\s_-]?site|url|web[\s_-]?page)\b/i,
    location: /\b(location|city|address|where[\s_-]?located|residence)\b/i,
    currentTitle: /\b(current[\s_-]?title|job[\s_-]?title|position|role|current[\s_-]?position)\b/i,
    currentCompany: /\b(current[\s_-]?company|employer|organization|company[\s_-]?name)\b/i,
    yearsExperience: /\b(years[\s_-]?(of[\s_-]?)?experience|experience[\s_-]?years|yoe)\b/i,
    summary: /\b(summary|about|bio|overview|profile|cover[\s_-]?letter|why[\s_-]?you|tell[\s_-]?us|describe[\s_-]?yourself)\b/i,
    degree: /\b(degree|education[\s_-]?level|highest[\s_-]?degree|qualification)\b/i,
    fieldOfStudy: /\b(major|field[\s_-]?of[\s_-]?study|study[\s_-]?area|specialization|concentration)\b/i,
    university: /\b(university|college|school|institution|alma[\s_-]?mater)\b/i,
    gradYear: /\b(graduation[\s_-]?year|grad[\s_-]?year|year[\s_-]?graduated|completion[\s_-]?year)\b/i,
    skills: /\b(skills|expertise|technologies|proficiencies|competencies)\b/i
  },

  // Detect field type based on various attributes
  detectFieldType(field) {
    // Check various attributes
    const name = (field.name || '').toLowerCase();
    const id = (field.id || '').toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    const label = this.getFieldLabel(field);
    const ariaLabel = (field.getAttribute('aria-label') || '').toLowerCase();
    
    const searchString = `${name} ${id} ${placeholder} ${label} ${ariaLabel}`;
    
    // Special handling for input types
    if (field.type === 'email') return 'email';
    if (field.type === 'tel') return 'phone';
    if (field.type === 'url') {
      if (/linkedin/i.test(searchString)) return 'linkedin';
      return 'portfolio';
    }
    
    // Match against patterns
    for (const [fieldType, pattern] of Object.entries(this.patterns)) {
      if (pattern.test(searchString)) {
        return fieldType;
      }
    }
    
    // Special cases for textareas (likely summary/cover letter)
    if (field.tagName === 'TEXTAREA') {
      return 'summary';
    }
    
    return null;
  },

  // Get associated label text
  getFieldLabel(field) {
    // Check for label element
    if (field.labels && field.labels.length > 0) {
      return field.labels[0].textContent.toLowerCase();
    }
    
    // Check for aria-labelledby
    const labelledBy = field.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent.toLowerCase();
    }
    
    // Check for nearby label
    const parent = field.parentElement;
    if (parent) {
      const label = parent.querySelector('label');
      if (label) return label.textContent.toLowerCase();
      
      // Check for text content in parent
      const text = parent.textContent.replace(field.value, '').trim();
      if (text.length > 0 && text.length < 100) return text.toLowerCase();
    }
    
    return '';
  },

  // Split full name into first and last
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
