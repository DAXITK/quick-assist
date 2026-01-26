// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Auto-parse Full Name into First Name and Last Name
document.getElementById('fullName').addEventListener('input', (e) => {
  const fullName = e.target.value.trim();
  
  if (fullName) {
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    document.getElementById('firstName').value = firstName;
    document.getElementById('lastName').value = lastName;
  } else {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
  }
});

// Allow manual edits to reconstruct Full Name
function updateFullNameFromParts() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  
  if (firstName || lastName) {
    const fullNameField = document.getElementById('fullName');
    const currentFullName = fullNameField.value.trim();
    const reconstructed = `${firstName} ${lastName}`.trim();
    
    if (!currentFullName || currentFullName === reconstructed) {
      fullNameField.value = reconstructed;
    }
  }
}

document.getElementById('firstName').addEventListener('input', updateFullNameFromParts);
document.getElementById('lastName').addEventListener('input', updateFullNameFromParts);

// Experience management
let experienceCount = 0;
let experiences = [];

function createExperienceCard(data = {}, index = null) {
  if (index === null) {
    index = experienceCount++;
  }
  
  const card = document.createElement('div');
  card.className = 'experience-card';
  card.dataset.index = index;
  
  card.innerHTML = `
    <div class="card-header">
      <div class="card-title">Experience #${index + 1}</div>
      <div class="card-actions">
        <button type="button" class="btn-fill-card" data-section="experience" data-index="${index}">
          🎯 Fill This Experience
        </button>
        <button type="button" class="btn-remove" data-index="${index}" data-type="experience">
          🗑️ Remove
        </button>
      </div>
    </div>
    <div class="card-fields">
      <label>Job Title *</label>
      <input type="text" class="exp-title" value="${data.title || ''}" placeholder="e.g., Software Developer" required>
      
      <label>Company *</label>
      <input type="text" class="exp-company" value="${data.company || ''}" placeholder="e.g., Tech Corp" required>
      
      <label>Location</label>
      <input type="text" class="exp-location" value="${data.location || ''}" placeholder="e.g., Toronto, ON">
      
      <div class="field-row">
        <div>
          <label>Start Date</label>
          <input type="month" class="exp-start" value="${data.startDate || ''}">
        </div>
        <div>
          <label>End Date</label>
          <input type="month" class="exp-end" value="${data.endDate || ''}" ${data.current ? 'disabled' : ''}>
        </div>
      </div>
      
      <div class="checkbox-field">
        <input type="checkbox" class="exp-current" ${data.current ? 'checked' : ''}>
        <label>I currently work here</label>
      </div>
      
      <label>Role Description</label>
      <textarea class="exp-description" rows="3" placeholder="Brief description of your responsibilities...">${data.description || ''}</textarea>
    </div>
  `;
  
  // Handle "currently work here" checkbox
  const currentCheckbox = card.querySelector('.exp-current');
  const endDateField = card.querySelector('.exp-end');
  
  currentCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      endDateField.value = '';
      endDateField.disabled = true;
      endDateField.style.opacity = '0.5';
    } else {
      endDateField.disabled = false;
      endDateField.style.opacity = '1';
    }
  });
  
  return card;
}

document.getElementById('add-experience').addEventListener('click', () => {
  const container = document.getElementById('experience-container');
  const emptyState = container.querySelector('.empty-state');
  if (emptyState) emptyState.remove();
  
  const card = createExperienceCard();
  container.appendChild(card);
  experiences.push({});
});

// Education management
let educationCount = 0;
let educations = [];

function createEducationCard(data = {}, index = null) {
  if (index === null) {
    index = educationCount++;
  }
  
  const card = document.createElement('div');
  card.className = 'education-card';
  card.dataset.index = index;
  
  card.innerHTML = `
    <div class="card-header">
      <div class="card-title">Education #${index + 1}</div>
      <div class="card-actions">
        <button type="button" class="btn-fill-card" data-section="education" data-index="${index}">
          🎯 Fill This Education
        </button>
        <button type="button" class="btn-remove" data-index="${index}" data-type="education">
          🗑️ Remove
        </button>
      </div>
    </div>
    <div class="card-fields">
      <label>School or University *</label>
      <input type="text" class="edu-school" value="${data.school || ''}" placeholder="e.g., University of Toronto" required>
      
      <label>Degree / Education Level *</label>
      <select class="edu-degree">
        <option value="">Select...</option>
        <option value="High School" ${data.degree === 'High School' ? 'selected' : ''}>High School/GED/GCSE</option>
        <option value="Cégep/Certificate/A-level" ${data.degree === 'Cégep/Certificate/A-level' ? 'selected' : ''}>Cégep/Certificate/A-level</option>
        <option value="Apprenticeship" ${data.degree === 'Apprenticeship' ? 'selected' : ''}>Apprenticeship</option>
        <option value="College Diploma" ${data.degree === 'College Diploma' ? 'selected' : ''}>College Diploma/HNC</option>
        <option value="Associate Degree" ${data.degree === 'Associate Degree' ? 'selected' : ''}>Associate Degree/DEC/HND</option>
        <option value="Bachelor's" ${data.degree === "Bachelor's" ? 'selected' : ''}>Bachelor Degree</option>
        <option value="Master's" ${data.degree === "Master's" ? 'selected' : ''}>Master Degree</option>
        <option value="Doctorate" ${data.degree === 'Doctorate' ? 'selected' : ''}>Doctorate</option>
        <option value="Post-graduate certificate" ${data.degree === 'Post-graduate certificate' ? 'selected' : ''}>Post-graduate certificate/diploma</option>
        <option value="Professional Degree" ${data.degree === 'Professional Degree' ? 'selected' : ''}>Professional Degree (e.g., LLB, MD, JD)</option>
      </select>
      
      <label>Field of Study / Major</label>
      <select class="edu-field">
        <option value="">Select...</option>
        <option value="Accounting" ${data.field === 'Accounting' ? 'selected' : ''}>Accounting</option>
        <option value="Business" ${data.field === 'Business' ? 'selected' : ''}>Business/Management</option>
        <option value="Computer Science" ${data.field === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
        <option value="Engineering" ${data.field === 'Engineering' ? 'selected' : ''}>Engineering</option>
        <option value="Finance" ${data.field === 'Finance' ? 'selected' : ''}>Finance</option>
        <option value="Marketing" ${data.field === 'Marketing' ? 'selected' : ''}>Marketing</option>
        <option value="Economics" ${data.field === 'Economics' ? 'selected' : ''}>Economics</option>
        <option value="Mathematics" ${data.field === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
        <option value="Biology" ${data.field === 'Biology' ? 'selected' : ''}>Biology</option>
        <option value="Chemistry" ${data.field === 'Chemistry' ? 'selected' : ''}>Chemistry</option>
        <option value="Physics" ${data.field === 'Physics' ? 'selected' : ''}>Physics</option>
        <option value="Psychology" ${data.field === 'Psychology' ? 'selected' : ''}>Psychology</option>
        <option value="Communications" ${data.field === 'Communications' ? 'selected' : ''}>Communications/Media</option>
        <option value="Education" ${data.field === 'Education' ? 'selected' : ''}>Education</option>
        <option value="Other" ${data.field === 'Other' ? 'selected' : ''}>Other</option>
      </select>
      
      <label>GPA / Overall Result</label>
      <input type="text" class="edu-gpa" value="${data.gpa || ''}" placeholder="e.g., 3.8/4.0 or 85%">
      
      <div class="field-row">
        <div>
          <label>Start Year</label>
          <input type="number" class="edu-start" value="${data.startYear || ''}" min="1950" max="2030" placeholder="e.g., 2018">
        </div>
        <div>
          <label>Graduation Year</label>
          <input type="number" class="edu-grad" value="${data.gradYear || ''}" min="1950" max="2030" placeholder="e.g., 2022">
        </div>
      </div>
    </div>
  `;
  
  return card;
}

document.getElementById('add-education').addEventListener('click', () => {
  const container = document.getElementById('education-container');
  const emptyState = container.querySelector('.empty-state');
  if (emptyState) emptyState.remove();
  
  const card = createEducationCard();
  container.appendChild(card);
  educations.push({});
});

// Remove cards
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-remove') || e.target.closest('.btn-remove')) {
    const btn = e.target.classList.contains('btn-remove') ? e.target : e.target.closest('.btn-remove');
    const type = btn.dataset.type;
    const index = btn.dataset.index;
    
    if (confirm('Remove this entry?')) {
      const card = btn.closest(type === 'experience' ? '.experience-card' : '.education-card');
      card.remove();
      
      if (type === 'experience') {
        experiences = experiences.filter((_, i) => i !== parseInt(index));
        const container = document.getElementById('experience-container');
        if (container.children.length === 0) {
          container.innerHTML = '<div class="empty-state">No work experience added yet. Click "Add Work Experience" to get started.</div>';
        }
      } else {
        educations = educations.filter((_, i) => i !== parseInt(index));
        const container = document.getElementById('education-container');
        if (container.children.length === 0) {
          container.innerHTML = '<div class="empty-state">No education added yet. Click "Add Education" to get started.</div>';
        }
      }
    }
  }
});

// Collect experience data from cards
function collectExperienceData() {
  const cards = document.querySelectorAll('.experience-card');
  return Array.from(cards).map(card => ({
    title: card.querySelector('.exp-title').value,
    company: card.querySelector('.exp-company').value,
    location: card.querySelector('.exp-location').value,
    startDate: card.querySelector('.exp-start').value,
    endDate: card.querySelector('.exp-end').value,
    current: card.querySelector('.exp-current').checked,
    description: card.querySelector('.exp-description').value
  }));
}

// Collect education data from cards
function collectEducationData() {
  const cards = document.querySelectorAll('.education-card');
  return Array.from(cards).map(card => ({
    school: card.querySelector('.edu-school').value,
    degree: card.querySelector('.edu-degree').value,
    field: card.querySelector('.edu-field').value,
    gpa: card.querySelector('.edu-gpa').value,
    startYear: card.querySelector('.edu-start').value,
    gradYear: card.querySelector('.edu-grad').value
  }));
}

// Load saved profile data
async function loadProfile() {
  const data = await chrome.storage.local.get('profileData');
  if (data.profileData) {
    const profile = data.profileData;
    
    // Load simple fields
    Object.keys(profile).forEach(key => {
      const element = document.getElementById(key);
      if (element && key !== 'experiences' && key !== 'educations') {
        element.value = profile[key] || '';
      }
    });
    
    // Trigger name parsing if fullName exists
    if (profile.fullName && !profile.firstName) {
      document.getElementById('fullName').dispatchEvent(new Event('input'));
    }
    
    // Load experiences
    const expContainer = document.getElementById('experience-container');
    expContainer.innerHTML = '';
    if (profile.experiences && profile.experiences.length > 0) {
      profile.experiences.forEach((exp, index) => {
        const card = createExperienceCard(exp, index);
        expContainer.appendChild(card);
        experienceCount = index + 1;
      });
      experiences = profile.experiences;
    } else {
      expContainer.innerHTML = '<div class="empty-state">No work experience added yet. Click "Add Work Experience" to get started.</div>';
    }
    
    // Load educations
    const eduContainer = document.getElementById('education-container');
    eduContainer.innerHTML = '';
    if (profile.educations && profile.educations.length > 0) {
      profile.educations.forEach((edu, index) => {
        const card = createEducationCard(edu, index);
        eduContainer.appendChild(card);
        educationCount = index + 1;
      });
      educations = profile.educations;
    } else {
      eduContainer.innerHTML = '<div class="empty-state">No education added yet. Click "Add Education" to get started.</div>';
    }
  } else {
    // Initialize empty states
    document.getElementById('experience-container').innerHTML = '<div class="empty-state">No work experience added yet. Click "Add Work Experience" to get started.</div>';
    document.getElementById('education-container').innerHTML = '<div class="empty-state">No education added yet. Click "Add Education" to get started.</div>';
  }
}

// Save profile
document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const profileData = {
    // Personal Information
    prefix: document.getElementById('prefix').value,
    fullName: document.getElementById('fullName').value,
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    middleName: document.getElementById('middleName').value,
    preferredName: document.getElementById('preferredName').value,
    
    // Contact Information
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    phoneDeviceType: document.getElementById('phoneDeviceType').value,
    countryPhoneCode: document.getElementById('countryPhoneCode').value,
    phoneExtension: document.getElementById('phoneExtension').value,
    linkedin: document.getElementById('linkedin').value,
    portfolio: document.getElementById('portfolio').value,
    
    // Address
    addressLine1: document.getElementById('addressLine1').value,
    addressLine2: document.getElementById('addressLine2').value,
    city: document.getElementById('city').value,
    province: document.getElementById('province').value,
    postalCode: document.getElementById('postalCode').value,
    country: document.getElementById('country').value,
    
    // Work Experience (array)
    experiences: collectExperienceData(),
    
    // Education (array)
    educations: collectEducationData(),
    
    // Skills & Additional
    skills: document.getElementById('skills').value,
    summary: document.getElementById('summary').value,
    hearAboutUs: document.getElementById('hearAboutUs').value,
    socialMediaSource: document.getElementById('socialMediaSource').value,
    workedBefore: document.getElementById('workedBefore').value,
    coverLetter: document.getElementById('coverLetter').value
  };
  
  await chrome.storage.local.set({ profileData });
  showStatus('Profile saved successfully!', 'success');
});

// Section-specific fill buttons
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-fill-section, .btn-fill-card');
  if (!btn) return;
  
  const section = btn.dataset.section;
  const index = btn.dataset.index;
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Ensure content script is loaded
  const result = await chrome.runtime.sendMessage({ 
    action: 'ensureContentScript', 
    tabId: tab.id 
  });
  
  if (!result.success) {
    showStatus('Cannot autofill this page (try reloading the page)', 'error');
    return;
  }
  
  chrome.tabs.sendMessage(tab.id, {
    action: 'autofillSection',
    section: section,
    index: index ? parseInt(index) : null,
    highlightFilled: true
  }, (response) => {
    if (chrome.runtime.lastError) {
      showStatus('Error: Page needs to be reloaded', 'error');
      return;
    }
    
    if (response && response.success) {
      showStatus(`Filled ${response.fieldsFilledCount} fields!`, 'success');
    } else {
      showStatus('No matching fields found', 'error');
    }
  });
});

// Full form autofill button
document.getElementById('autofill-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Check if we can autofill this page
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    showStatus('Cannot autofill Chrome system pages', 'error');
    return;
  }
  
  const settings = await chrome.storage.local.get(['confirmFill', 'autoTrack', 'highlightFilled']);
  
  if (settings.confirmFill !== false) {
    if (!confirm('Fill the entire form on this page?')) return;
  }
  
  // Ensure content script is loaded
  const result = await chrome.runtime.sendMessage({ 
    action: 'ensureContentScript', 
    tabId: tab.id 
  });
  
  if (!result.success) {
    showStatus('Cannot autofill this page. Try reloading the page first.', 'error');
    return;
  }
  
  chrome.tabs.sendMessage(tab.id, {
    action: 'autofill',
    highlightFilled: settings.highlightFilled !== false
  }, (response) => {
    if (chrome.runtime.lastError) {
      showStatus('Error: Please reload the page and try again', 'error');
      return;
    }
    
    if (response && response.success) {
      showStatus(`Filled ${response.fieldsFilledCount} fields!`, 'success');
      
      if (settings.autoTrack !== false) {
        trackApplication(tab.url, tab.title, response.fieldsFilledCount);
      }
    } else {
      showStatus('No fields found to fill', 'error');
    }
  });
});


// Track application
async function trackApplication(url, pageTitle, fieldsFilled) {
  const application = {
    url,
    pageTitle,
    fieldsFilled,
    timestamp: Date.now(),
    company: extractCompany(url, pageTitle),
    position: extractPosition(pageTitle)
  };
  
  const data = await chrome.storage.local.get('applicationHistory');
  const history = data.applicationHistory || [];
  history.unshift(application);
  
  if (history.length > 500) history.length = 500;
  
  await chrome.storage.local.set({ applicationHistory: history });
  loadHistory();
}

function extractCompany(url, title) {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[parts.length - 2].charAt(0).toUpperCase() + 
             parts[parts.length - 2].slice(1);
    }
  } catch (e) {}
  
  const companyPatterns = [/at\s+([A-Z][a-zA-Z\s&]+)/i, /\|\s*([A-Z][a-zA-Z\s&]+)/];
  for (const pattern of companyPatterns) {
    const match = title.match(pattern);
    if (match) return match[1].trim();
  }
  
  return 'Unknown Company';
}

function extractPosition(title) {
  const positionPatterns = [
    /([A-Z][a-zA-Z\s]+(?:Engineer|Developer|Manager|Designer|Analyst|Specialist))/,
    /^([^|-]+)/
  ];
  
  for (const pattern of positionPatterns) {
    const match = title.match(pattern);
    if (match) return match[1].trim();
  }
  
  return 'Job Application';
}

// Load and display history
async function loadHistory() {
  const data = await chrome.storage.local.get('applicationHistory');
  const history = data.applicationHistory || [];
  
  document.getElementById('total-apps').textContent = history.length;
  
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const thisWeek = history.filter(app => app.timestamp > weekAgo).length;
  document.getElementById('this-week').textContent = thisWeek;
  
  const listContainer = document.getElementById('history-list');
  
  if (history.length === 0) {
    listContainer.innerHTML = '<div class="history-empty">No applications tracked yet</div>';
    return;
  }
  
  listContainer.innerHTML = history.map(app => `
    <div class="history-item">
      <div class="history-header">
        <div class="history-title">${escapeHtml(app.position)}</div>
        <div class="history-date">${formatDate(app.timestamp)}</div>
      </div>
      <div class="history-company">${escapeHtml(app.company)}</div>
      <a href="${escapeHtml(app.url)}" class="history-url" target="_blank" title="${escapeHtml(app.url)}">
        ${escapeHtml(app.url)}
      </a>
    </div>
  `).join('');
}

// Export history to CSV
document.getElementById('export-history').addEventListener('click', async () => {
  const data = await chrome.storage.local.get('applicationHistory');
  const history = data.applicationHistory || [];
  
  if (history.length === 0) {
    showStatus('No history to export', 'error');
    return;
  }
  
  const csv = [
    ['Date', 'Position', 'Company', 'URL', 'Fields Filled'],
    ...history.map(app => [
      new Date(app.timestamp).toLocaleDateString(),
      app.position,
      app.company,
      app.url,
      app.fieldsFilled
    ])
  ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  downloadFile(csv, 'job-applications.csv', 'text/csv');
  showStatus('History exported!', 'success');
});

// Clear history
document.getElementById('clear-history').addEventListener('click', async () => {
  if (confirm('Delete all application history? This cannot be undone.')) {
    await chrome.storage.local.set({ applicationHistory: [] });
    loadHistory();
    showStatus('History cleared', 'info');
  }
});

// Search history
document.getElementById('search-history').addEventListener('input', async (e) => {
  const query = e.target.value.toLowerCase();
  const data = await chrome.storage.local.get('applicationHistory');
  const history = data.applicationHistory || [];
  
  const filtered = history.filter(app => 
    app.company.toLowerCase().includes(query) ||
    app.position.toLowerCase().includes(query) ||
    app.url.toLowerCase().includes(query)
  );
  
  const listContainer = document.getElementById('history-list');
  if (filtered.length === 0) {
    listContainer.innerHTML = '<div class="history-empty">No matching applications</div>';
    return;
  }
  
  listContainer.innerHTML = filtered.map(app => `
    <div class="history-item">
      <div class="history-header">
        <div class="history-title">${escapeHtml(app.position)}</div>
        <div class="history-date">${formatDate(app.timestamp)}</div>
      </div>
      <div class="history-company">${escapeHtml(app.company)}</div>
      <a href="${escapeHtml(app.url)}" class="history-url" target="_blank">
        ${escapeHtml(app.url)}
      </a>
    </div>
  `).join('');
});

// Export profile data
document.getElementById('export-btn').addEventListener('click', async () => {
  const data = await chrome.storage.local.get('profileData');
  if (!data.profileData) {
    showStatus('No profile data to export', 'error');
    return;
  }
  
  const json = JSON.stringify(data.profileData, null, 2);
  downloadFile(json, 'quick-assist-profile.json', 'application/json');
  showStatus('Profile exported!', 'success');
});

// Import profile data
document.getElementById('import-data').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const profileData = JSON.parse(text);
    
    await chrome.storage.local.set({ profileData });
    loadProfile();
    showStatus('Profile imported successfully!', 'success');
  } catch (error) {
    showStatus('Invalid file format', 'error');
  }
});

// Load settings
async function loadSettings() {
  const data = await chrome.storage.local.get(['autoTrack', 'confirmFill', 'highlightFilled']);
  
  document.getElementById('auto-track').checked = data.autoTrack !== false;
  document.getElementById('confirm-fill').checked = data.confirmFill !== false;
  document.getElementById('highlight-filled').checked = data.highlightFilled !== false;
}

// Save settings
['auto-track', 'confirm-fill', 'highlight-filled'].forEach(id => {
  document.getElementById(id).addEventListener('change', async (e) => {
    const key = id.replace('-', '');
    await chrome.storage.local.set({ [key]: e.target.checked });
    showStatus('Setting saved', 'success');
  });
});

// Delete all data
document.getElementById('delete-all').addEventListener('click', async () => {
  if (confirm('Delete ALL data including profile and history? This cannot be undone!')) {
    await chrome.storage.local.clear();
    loadProfile();
    loadHistory();
    showStatus('All data deleted', 'info');
  }
});

// Utility functions
function showStatus(message, type = 'info') {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type} show`;
  
  setTimeout(() => {
    status.classList.remove('show');
  }, 3000);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Initialize
loadProfile();
loadHistory();
loadSettings();
