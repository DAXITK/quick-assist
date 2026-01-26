// Content script - runs on every page to detect and fill forms

// Content script - runs on every page to detect and fill forms

// Respond to ping from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ status: 'ready' });
    return true;
  }
  
  if (request.action === 'autofill') {
    performAutofill(request.highlightFilled)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === 'autofillSection') {
    performSectionAutofill(request.section, request.index, request.highlightFilled)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});


// Listen for autofill commands
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autofill') {
    performAutofill(request.highlightFilled)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === 'autofillSection') {
    performSectionAutofill(request.section, request.index, request.highlightFilled)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function performAutofill(highlightFilled) {
  const data = await chrome.storage.local.get('profileData');
  const profile = data.profileData;
  
  if (!profile) {
    throw new Error('No profile data found. Please set up your profile first.');
  }
  
  const fields = document.querySelectorAll('input, textarea, select');
  let fieldsFilledCount = 0;
  
  for (const field of fields) {
    if (field.type === 'hidden' || field.disabled || field.readOnly) continue;
    if (field.offsetParent === null) continue;
    
    const fieldType = window.FieldMatcher.detectFieldType(field);
    if (!fieldType) continue;
    
    let value = getFieldValue(profile, fieldType);
    if (!value) continue;
    
    const filled = fillField(field, value);
    if (filled) {
      fieldsFilledCount++;
      if (highlightFilled) highlightField(field);
    }
  }
  
  return { success: true, fieldsFilledCount };
}

async function performSectionAutofill(section, index, highlightFilled) {
  const data = await chrome.storage.local.get('profileData');
  const profile = data.profileData;
  
  if (!profile) {
    throw new Error('No profile data found.');
  }
  
  const fields = document.querySelectorAll('input, textarea, select');
  let fieldsFilledCount = 0;
  
  // Define which fields belong to which section
  const sectionFields = {
    personal: ['prefix', 'fullName', 'firstName', 'lastName', 'middleName', 'preferredName'],
    contact: ['email', 'phone', 'phoneDeviceType', 'countryPhoneCode', 'phoneExtension', 'linkedin', 'portfolio'],
    address: ['addressLine1', 'addressLine2', 'city', 'province', 'postalCode', 'country'],
    experience: ['currentTitle', 'currentCompany', 'companyLocation', 'yearsExperience', 'jobStartDate', 'jobEndDate', 'roleDescription'],
    education: ['university', 'degree', 'fieldOfStudy', 'gpa', 'eduStartYear', 'gradYear'],
    additional: ['skills', 'summary', 'hearAboutUs', 'socialMediaSource', 'workedBefore', 'coverLetter']
  };
  
  for (const field of fields) {
    if (field.type === 'hidden' || field.disabled || field.readOnly) continue;
    if (field.offsetParent === null) continue;
    
    const fieldType = window.FieldMatcher.detectFieldType(field);
    if (!fieldType) continue;
    
    // Check if this field belongs to the requested section
    if (section === 'experience' && index !== null) {
      // Fill specific experience entry
      if (sectionFields.experience.includes(fieldType)) {
        const exp = profile.experiences && profile.experiences[index];
        if (!exp) continue;
        
        let value;
        if (fieldType === 'currentTitle') value = exp.title;
        else if (fieldType === 'currentCompany') value = exp.company;
        else if (fieldType === 'companyLocation') value = exp.location;
        else if (fieldType === 'jobStartDate') value = exp.startDate;
        else if (fieldType === 'jobEndDate') value = exp.current ? '' : exp.endDate;
        else if (fieldType === 'roleDescription') value = exp.description;
        
        if (value && fillField(field, value)) {
          fieldsFilledCount++;
          if (highlightFilled) highlightField(field);
        }
      }
    } else if (section === 'education' && index !== null) {
      // Fill specific education entry
      if (sectionFields.education.includes(fieldType)) {
        const edu = profile.educations && profile.educations[index];
        if (!edu) continue;
        
        let value;
        if (fieldType === 'university') value = edu.school;
        else if (fieldType === 'degree') value = edu.degree;
        else if (fieldType === 'fieldOfStudy') value = edu.field;
        else if (fieldType === 'gpa') value = edu.gpa;
        else if (fieldType === 'eduStartYear') value = edu.startYear;
        else if (fieldType === 'gradYear') value = edu.gradYear;
        
        if (value && fillField(field, value)) {
          fieldsFilledCount++;
          if (highlightFilled) highlightField(field);
        }
      }
    } else if (sectionFields[section] && sectionFields[section].includes(fieldType)) {
      // Fill regular section field
      let value = getFieldValue(profile, fieldType);
      if (value && fillField(field, value)) {
        fieldsFilledCount++;
        if (highlightFilled) highlightField(field);
      }
    }
  }
  
  return { success: true, fieldsFilledCount };
}

function getFieldValue(profile, fieldType) {
  // Handle name splitting
  if (fieldType === 'firstName') {
    return profile.firstName || window.FieldMatcher.splitName(profile.fullName || '').firstName;
  } else if (fieldType === 'lastName') {
    return profile.lastName || window.FieldMatcher.splitName(profile.fullName || '').lastName;
  }
  
  // Handle experience fields (use most recent/first experience)
  if (['currentTitle', 'currentCompany', 'companyLocation', 'jobStartDate', 'jobEndDate', 'roleDescription', 'yearsExperience'].includes(fieldType)) {
    const exp = profile.experiences && profile.experiences[0];
    if (!exp) return profile[fieldType];
    
    if (fieldType === 'currentTitle') return exp.title;
    if (fieldType === 'currentCompany') return exp.company;
    if (fieldType === 'companyLocation') return exp.location;
    if (fieldType === 'jobStartDate') return exp.startDate;
    if (fieldType === 'jobEndDate') return exp.current ? '' : exp.endDate;
    if (fieldType === 'roleDescription') return exp.description;
    if (fieldType === 'yearsExperience') return profile.yearsExperience;
  }
  
  // Handle education fields (use most recent/first education)
  if (['university', 'degree', 'fieldOfStudy', 'gpa', 'eduStartYear', 'gradYear'].includes(fieldType)) {
    const edu = profile.educations && profile.educations[0];
    if (!edu) return profile[fieldType];
    
    if (fieldType === 'university') return edu.school;
    if (fieldType === 'degree') return edu.degree;
    if (fieldType === 'fieldOfStudy') return edu.field;
    if (fieldType === 'gpa') return edu.gpa;
    if (fieldType === 'eduStartYear') return edu.startYear;
    if (fieldType === 'gradYear') return edu.gradYear;
  }
  
  return profile[fieldType];
}

function fillField(field, value) {
  try {
    const originalValue = field.value;
    field.focus();
    
    if (field.type === 'checkbox') {
      if (typeof value === 'boolean') {
        field.checked = value;
      } else if (value === 'Yes' || value === 'yes' || value === '1' || value === 'true') {
        field.checked = true;
      } else {
        field.checked = false;
      }
    } else if (field.tagName === 'SELECT') {
      const options = Array.from(field.options);
      const normalizedValue = value.toLowerCase();
      
      const match = options.find(opt => 
        opt.value.toLowerCase() === normalizedValue ||
        opt.text.toLowerCase() === normalizedValue ||
        opt.value.toLowerCase().includes(normalizedValue) ||
        opt.text.toLowerCase().includes(normalizedValue)
      );
      
      if (match) {
        field.value = match.value;
      } else {
        return false;
      }
    } else {
      field.value = value;
    }
    
    const events = [
      new Event('input', { bubbles: true }),
      new Event('change', { bubbles: true }),
      new Event('blur', { bubbles: true })
    ];
    
    events.forEach(event => field.dispatchEvent(event));
    
    const keyupEvent = new KeyboardEvent('keyup', { bubbles: true });
    field.dispatchEvent(keyupEvent);
    
    return field.type === 'checkbox' || field.value !== originalValue;
  } catch (error) {
    console.error('Error filling field:', error);
    return false;
  }
}

function highlightField(field) {
  const originalBorder = field.style.border;
  const originalBackground = field.style.backgroundColor;
  
  field.style.border = '2px solid #34a853';
  field.style.backgroundColor = '#e6f4ea';
  
  setTimeout(() => {
    field.style.border = originalBorder;
    field.style.backgroundColor = originalBackground;
  }, 2000);
}

function addExtensionIndicator() {
  if (document.getElementById('autofill-indicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'autofill-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1a73e8;
    color: white;
    padding: 10px 16px;
    border-radius: 24px;
    font-size: 12px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s;
  `;
  indicator.innerHTML = '🚀 Quick Assist Ready';
  indicator.title = 'Click extension icon to fill this form';
  
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'scale(1.05)';
  });
  
  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'scale(1)';
  });
  
  document.body.appendChild(indicator);
  
  setTimeout(() => {
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
  }, 5000);
}

if (document.querySelector('form')) {
  addExtensionIndicator();
}
